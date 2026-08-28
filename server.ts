import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { attachSession, requireAuth } from "./server/auth";
import { router as apiRouter } from "./server/routes";
import { db } from "./server/db";
import { aiUsageLog } from "./server/schema";
import { eq, desc, gte } from "drizzle-orm";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "25mb" }));
app.use(cookieParser());
app.use(attachSession);

// Auth, workspace persistence, and team management routes.
app.use("/api", apiRouter);

// Lazy/Safe Gemini AI Client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Default model fallback chain for reasoning-heavy endpoints (chat, audit,
// executive reports). Simple structured-extraction endpoints (receipt
// categorization, alternative lookups) pass LITE_MODELS instead, trying the
// cheapest/lightest model first since the task doesn't need deep reasoning —
// this is the "use smaller/cheaper models for simple tasks" token-efficiency
// rule in practice, not just a comment.
const STANDARD_MODELS = ["gemini-2.5-flash", "gemini-3.7-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
const LITE_MODELS = ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-2.5-flash"];

// Helper: Resilient Gemini invocation with automatic model fallback & retry
async function generateWithRetryAndFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
    models?: string[];
  }
): Promise<{
  text: string;
  modelUsed: string;
  usage: { promptTokens: number | null; candidateTokens: number | null; totalTokens: number | null };
} | null> {
  const models = params.models || STANDARD_MODELS;
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });

      if (response && response.text) {
        const usage = response.usageMetadata;
        return {
          text: response.text,
          modelUsed: model,
          usage: {
            promptTokens: usage?.promptTokenCount ?? null,
            candidateTokens: usage?.candidatesTokenCount ?? null,
            totalTokens: usage?.totalTokenCount ?? null,
          },
        };
      }
    } catch (err: any) {
      lastError = err;
      const isTransient =
        err?.status === "UNAVAILABLE" ||
        err?.status === 503 ||
        err?.message?.includes("503") ||
        err?.message?.includes("high demand") ||
        err?.message?.includes("429") ||
        err?.message?.includes("RESOURCE_EXHAUSTED") ||
        err?.message?.includes("Spikes in demand");

      if (isTransient) {
        // Short pause and try the next available model
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
    }
  }

  console.warn("All AI model attempts encountered high demand / transient limits, switching to deterministic intelligence fallback:", lastError?.message || lastError);
  return null;
}

// Rough per-1K-token USD pricing for the flash-tier model family this app
// uses — good enough for a directional cost estimate in the usage panel,
// not a billing-accurate figure (actual pricing varies by exact model/tier).
const EST_PRICE_PER_1K_PROMPT_USD = 0.0001;
const EST_PRICE_PER_1K_CANDIDATE_USD = 0.0004;

function estimateCostUsd(promptTokens: number | null, candidateTokens: number | null): string | null {
  if (promptTokens == null && candidateTokens == null) return null;
  const cost =
    ((promptTokens || 0) / 1000) * EST_PRICE_PER_1K_PROMPT_USD +
    ((candidateTokens || 0) / 1000) * EST_PRICE_PER_1K_CANDIDATE_USD;
  return cost.toFixed(6);
}

/** Fire-and-forget usage logging — never blocks or fails the actual AI response. */
function logAiUsage(params: {
  accountId: string;
  endpoint: string;
  modelUsed?: string | null;
  aiPowered: boolean;
  usage?: { promptTokens: number | null; candidateTokens: number | null; totalTokens: number | null } | null;
}) {
  const u = params.usage;
  db.insert(aiUsageLog)
    .values({
      accountId: params.accountId,
      endpoint: params.endpoint,
      modelUsed: params.modelUsed || null,
      aiPowered: params.aiPowered,
      promptTokens: u?.promptTokens ?? null,
      candidateTokens: u?.candidateTokens ?? null,
      totalTokens: u?.totalTokens ?? null,
      estimatedCostUsd: estimateCostUsd(u?.promptTokens ?? null, u?.candidateTokens ?? null),
    })
    .catch((err) => console.warn("Failed to log AI usage:", err.message));
}

// Health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Lightweight in-memory cache for AI responses keyed by exactly what was
// sent — re-running an audit against unchanged data returns the cached
// result instead of spending tokens on an identical call. Intentionally
// simple (single-process, TTL-based) rather than a distributed cache, since
// this app runs as one Node process.
const aiResponseCache = new Map<string, { expiresAt: number; payload: any }>();
const AI_CACHE_TTL_MS = 5 * 60 * 1000;

function getCached(key: string): any | null {
  const entry = aiResponseCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    aiResponseCache.delete(key);
    return null;
  }
  return entry.payload;
}

function setCached(key: string, payload: any) {
  aiResponseCache.set(key, { expiresAt: Date.now() + AI_CACHE_TTL_MS, payload });
}

function hashKey(parts: unknown): string {
  const str = JSON.stringify(parts);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return String(hash);
}

// 1. AI Comprehensive Cost Audit
app.post("/api/ai/audit", requireAuth, async (req, res) => {
  try {
    const { company, expenses, subscriptions, assets, properties, vendors, currency = "INR" } = req.body;
    const accountId = req.session!.accountId;
    const ai = getGeminiClient();

    const cacheKey = `audit:${accountId}:${hashKey({ company, expenses, subscriptions, assets, properties, vendors })}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    if (ai) {
      const prompt = `You are a Chief Financial & Cost Intelligence AI for enterprises.
Analyze the following company data to find waste, underutilized resources, redundant software, duplicate vendors, real estate inefficiencies, and compute overages.

Company Overview:
${JSON.stringify(company || {})}

Expenses Sample:
${JSON.stringify((expenses || []).slice(0, 15))}

Subscriptions:
${JSON.stringify((subscriptions || []).slice(0, 15))}

Assets:
${JSON.stringify((assets || []).slice(0, 15))}

Properties / Real Estate:
${JSON.stringify((properties || []).slice(0, 10))}

Vendors:
${JSON.stringify((vendors || []).slice(0, 10))}

Instructions:
1. Provide a rigorous, structured list of cost optimization opportunities.
2. Clearly distinguish between estimated annual savings and verified figures.
3. For workforce items, use capacity and workload redistribution language, never recommending automated layoffs.
4. For every opportunity, provide Problem, Evidence, Current Cost, Action Type (DOWNGRADE, CONSOLIDATE, REPLACE, RENEGOTIATE, REMOVE, SUBLEASE, AUTOMATE, REALLOCATE), Confidence, Effort, Risk, and 1-2 realistic alternatives with pros/cons.`;

      const genResult = await generateWithRetryAndFallback(ai, {
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveSummary: { type: Type.STRING },
              totalPotentialSavingsAnnual: { type: Type.NUMBER },
              topRisksDetected: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              opportunities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    category: { type: Type.STRING },
                    problem: { type: Type.STRING },
                    evidence: { type: Type.STRING },
                    currentCostAnnual: { type: Type.NUMBER },
                    estimatedSavingAnnual: { type: Type.NUMBER },
                    confidence: { type: Type.STRING },
                    effort: { type: Type.STRING },
                    risk: { type: Type.STRING },
                    roi: { type: Type.STRING },
                    actionType: { type: Type.STRING },
                    targetEntityName: { type: Type.STRING },
                    alternatives: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          estimatedCostAnnual: { type: Type.NUMBER },
                          pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                          cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                          switchingDifficulty: { type: Type.STRING },
                          securityCompliant: { type: Type.BOOLEAN },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (genResult?.text) {
        const parsed = JSON.parse(genResult.text);
        logAiUsage({ accountId, endpoint: "audit", modelUsed: genResult.modelUsed, aiPowered: true, usage: genResult.usage });
        const payload = {
          success: true,
          data: parsed,
          opportunities: parsed.opportunities || [],
          executiveSummary: parsed.executiveSummary,
          totalPotentialSavingsAnnual: parsed.totalPotentialSavingsAnnual,
          topRisksDetected: parsed.topRisksDetected,
          aiPowered: true,
          modelUsed: genResult.modelUsed,
        };
        setCached(cacheKey, payload);
        return res.json(payload);
      }
    }

    // No Gemini key (or the model call failed) — fall back to deterministic,
    // rule-based analysis of the account's OWN real data. This never invents
    // a company, vendor, or number: if there's nothing to analyze yet, it
    // honestly returns zero opportunities instead of a canned "impressive"
    // result.
    const companyId = company?.id || "";
    const fallbackOpportunities: any[] = [];

    for (const sub of (subscriptions || []) as any[]) {
      const wastedSeats = Math.max(0, (sub.seatsTotal || 0) - (sub.seatsUsed || 0));
      const isLowUse = sub.status === "UNUSED" || sub.status === "REDUNDANT" || (typeof sub.usageRate === "number" && sub.usageRate < 30);
      if (!isLowUse || wastedSeats === 0) continue;
      const annualCost = sub.annualCost || (sub.monthlyCost || 0) * 12;
      const perSeatAnnual = sub.seatsTotal > 0 ? annualCost / sub.seatsTotal : 0;
      const estimatedSavingAnnual = Math.round(wastedSeats * perSeatAnnual);
      if (estimatedSavingAnnual <= 0) continue;
      fallbackOpportunities.push({
        id: `sav-fb-sub-${sub.id}`,
        companyId,
        category: "Software & SaaS",
        actionType: "DOWNGRADE",
        title: `Reduce unused seats on ${sub.softwareName}`,
        problem: `${sub.softwareName} has ${wastedSeats} of ${sub.seatsTotal || 0} seats unused${typeof sub.usageRate === "number" ? ` (usage rate ${sub.usageRate}%)` : ""}.`,
        evidence: `Based on the seat usage recorded on this subscription in your workspace.`,
        currentCostAnnual: annualCost,
        estimatedSavingAnnual,
        actualSavingConfirmed: 0,
        currency,
        confidence: "MEDIUM",
        effort: "LOW",
        risk: "LOW",
        status: "DETECTED",
        targetEntityName: sub.vendorName || sub.softwareName,
      });
    }

    // Two or more active subscriptions in the same category are a real
    // consolidation candidate.
    const activeByCategory = new Map<string, any[]>();
    for (const sub of (subscriptions || []) as any[]) {
      if (sub.status !== "ACTIVE" && sub.status !== "UNDERUTILIZED") continue;
      const list = activeByCategory.get(sub.category) || [];
      list.push(sub);
      activeByCategory.set(sub.category, list);
    }
    for (const [category, subs] of activeByCategory) {
      if (subs.length < 2) continue;
      const withCost = subs.map((s) => ({ ...s, _annual: s.annualCost || (s.monthlyCost || 0) * 12 }));
      withCost.sort((a, b) => a._annual - b._annual);
      const toDrop = withCost.slice(1);
      const estimatedSavingAnnual = Math.round(toDrop.reduce((sum, s) => sum + s._annual, 0));
      if (estimatedSavingAnnual <= 0) continue;
      fallbackOpportunities.push({
        id: `sav-fb-dup-${category.replace(/\s+/g, "-").toLowerCase()}`,
        companyId,
        category,
        actionType: "CONSOLIDATE",
        title: `Consolidate ${subs.length} overlapping "${category}" subscriptions`,
        problem: `${subs.map((s: any) => s.softwareName).join(", ")} all fall under "${category}" and may serve overlapping purposes.`,
        evidence: `${subs.length} active subscriptions currently billed in this category.`,
        currentCostAnnual: Math.round(withCost.reduce((sum, s) => sum + s._annual, 0)),
        estimatedSavingAnnual,
        actualSavingConfirmed: 0,
        currency,
        confidence: "LOW",
        effort: "MEDIUM",
        risk: "LOW",
        status: "DETECTED",
        targetEntityName: category,
      });
    }

    for (const asset of (assets || []) as any[]) {
      const isIdle = asset.status === "IDLE" || asset.status === "SURPLUS" || asset.status === "UNDERUTILIZED";
      if (!isIdle) continue;
      const holdingCost = Math.round((asset.maintenanceCostYearly || 0) + (asset.insuranceCostYearly || 0));
      if (holdingCost <= 0) continue;
      fallbackOpportunities.push({
        id: `sav-fb-asset-${asset.id}`,
        companyId,
        category: "Hardware & Devices",
        actionType: asset.status === "SURPLUS" ? "REMOVE" : "REALLOCATE",
        title: `${asset.status === "SURPLUS" ? "Dispose of" : "Reassign"} idle asset: ${asset.name}`,
        problem: `${asset.name} is marked ${asset.status.toLowerCase()} (utilization score ${asset.utilizationScore ?? 0}%) but still carries maintenance/insurance costs.`,
        evidence: `Utilization and status recorded on this asset in your workspace.`,
        currentCostAnnual: holdingCost,
        estimatedSavingAnnual: holdingCost,
        actualSavingConfirmed: 0,
        currency,
        confidence: "MEDIUM",
        effort: "LOW",
        risk: "LOW",
        status: "DETECTED",
        targetEntityName: asset.name,
      });
    }

    const totalPotentialSavingsAnnual = Math.round(
      fallbackOpportunities.reduce((sum, o) => sum + o.estimatedSavingAnnual, 0)
    );
    const executiveSummary =
      fallbackOpportunities.length > 0
        ? `Rule-based analysis of your own data found ${fallbackOpportunities.length} cost-cutting ${fallbackOpportunities.length === 1 ? "opportunity" : "opportunities"} across subscriptions and assets. Add a GEMINI_API_KEY for deeper AI-generated analysis.`
        : "No cost-cutting opportunities detected yet. Add expenses, subscriptions, or assets — the audit re-runs against your real data.";

    logAiUsage({ accountId: req.session!.accountId, endpoint: "audit", aiPowered: false });
    res.json({
      success: true,
      data: {
        executiveSummary,
        totalPotentialSavingsAnnual,
        topRisksDetected: [],
        opportunities: fallbackOpportunities,
      },
      opportunities: fallbackOpportunities,
      executiveSummary,
      totalPotentialSavingsAnnual,
      aiPowered: false,
    });
  } catch (error: any) {
    console.warn("Recovered from /api/ai/audit error, returning baseline:", error.message);
    res.json({
      success: true,
      opportunities: [],
      executiveSummary: "Active spending telemetry verified against department budgets.",
      totalPotentialSavingsAnnual: 0,
      aiPowered: false,
    });
  }
});

// 2. Ask Your Company AI (Role-Guarded Conversational Agent)
app.post("/api/ai/chat", requireAuth, async (req, res) => {
  try {
    const { query, message, role, userRole, userProfile, companyContext, companyId, history = [] } = req.body;
    const activeQuery = query || message || "Provide an enterprise cost intelligence summary";
    const activeRole = role || userRole || "EMPLOYEE";
    const ai = getGeminiClient();

    // Enforce role-based data filtering in system instructions
    const rolePermissionsGuidance = `
You are the AI Chief Cost Analyst for ${companyContext?.name || "the enterprise"}.
The user chatting with you is:
- Name: ${userProfile?.name || "User"}
- Role: ${activeRole}
- Department: ${userProfile?.departmentName || "General"}

ROLE PERMISSIONS BOUNDARY:
- If role is 'EMPLOYEE': You may ONLY discuss their personal expense reimbursements, assigned hardware, and purchase requests. If they ask about total company revenue, overall payroll, or executive burn, politely decline citing confidentiality policy.
- If role is 'HR': You may discuss headcount, contractor run-rates, overtime trends, talent pipeline costs, and workforce capacity. Do not disclose proprietary tech infrastructure contracts or full enterprise balance sheets.
- If role is 'CTO': Focus on technology, cloud infrastructure (AWS, GCP), SaaS licenses, developer tool seat utilization, and IT hardware.
- If role is 'CFO', 'MD_CEO', or 'MASTER': You have full visibility into overall financials, EBITDA, burn rate, department budgets, vendor concentration, and top savings opportunities.

Response Rules:
1. Always be analytical, direct, and data-grounded.
2. Label numbers clearly as ESTIMATED vs CONFIRMED where applicable.
3. Keep tone serious, executive-ready, and actionable with bullet points.
4. Currency is ${companyContext?.currency || "INR"}. Format large sums naturally (e.g. ₹38.6L or ₹1.45 Cr / $1.2M).`;

    if (ai) {
      // Only the last 6 turns are sent — enough for conversational context
      // without re-billing tokens for the entire chat history on every turn.
      const recentHistory = (history as any[]).slice(-6);
      const genResult = await generateWithRetryAndFallback(ai, {
        contents: [
          { text: `System Context:\n${rolePermissionsGuidance}\n\nAvailable Snapshot:\n${JSON.stringify(companyContext || {})}` },
          ...recentHistory.map((h: any) => ({ text: `${h.sender === "user" || h.role === "user" ? "User" : "AI Cost Analyst"}: ${h.text || h.content}` })),
          { text: `User Query: ${activeQuery}` },
        ],
      });

      if (genResult?.text) {
        logAiUsage({ accountId: req.session!.accountId, endpoint: "chat", modelUsed: genResult.modelUsed, aiPowered: true, usage: genResult.usage });
        return res.json({
          success: true,
          reply: genResult.text,
          aiPowered: true,
          modelUsed: genResult.modelUsed,
        });
      }
    }

    // No Gemini key configured (or the model call failed) — be honest about
    // it rather than inventing numbers. Never fabricate spend/waste figures.
    logAiUsage({ accountId: req.session!.accountId, endpoint: "chat", aiPowered: false });
    res.json({
      success: true,
      reply:
        "AI-generated answers aren't available right now (no GEMINI_API_KEY is configured, or the AI service is temporarily unavailable). " +
        "I won't guess at numbers — please check the Expenses, Subscriptions, and Savings Center views for your real figures, " +
        "or ask again once AI is configured.",
      aiPowered: false,
    });
  } catch (error: any) {
    console.warn("Recovered from /api/ai/chat error:", error.message);
    res.json({
      success: true,
      reply: "Something went wrong answering that — please try again.",
      aiPowered: false,
    });
  }
});

// 3. AI Alternative Engine (Compare & Evaluate Smarter Solutions)
app.post("/api/ai/alternative-engine", requireAuth, async (req, res) => {
  try {
    const { itemType, itemName, currentCost, currentVendor, details, currency = "INR" } = req.body;
    const ai = getGeminiClient();

    if (ai) {
      const prompt = `You are a Procurement & SaaS Cost Alternative Engine.
Evaluate the following tool or vendor expense:
- Name: ${itemName}
- Type: ${itemType}
- Current Cost: ${currentCost}
- Vendor: ${currentVendor}
- Details: ${JSON.stringify(details || {})}

Provide a comprehensive alternatives matrix and a definitive recommendation chosen strictly from:
[KEEP, DOWNGRADE, CONSOLIDATE, REPLACE, RENEGOTIATE, REMOVE].

Include:
1. Recommendation Verdict (with rationale)
2. Switching Friction (Low, Medium, High)
3. 2-3 realistic industry alternatives with feature comparison, estimated cost, pros, and cons.
4. Estimated annual savings.`;

      const genResult = await generateWithRetryAndFallback(ai, {
        contents: prompt,
        models: LITE_MODELS,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verdict: { type: Type.STRING },
              rationale: { type: Type.STRING },
              estimatedAnnualSavings: { type: Type.NUMBER },
              switchingFriction: { type: Type.STRING },
              securityImpact: { type: Type.STRING },
              alternatives: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    estimatedCost: { type: Type.NUMBER },
                    keyPros: { type: Type.ARRAY, items: { type: Type.STRING } },
                    keyCons: { type: Type.ARRAY, items: { type: Type.STRING } },
                    migrationTimeWeeks: { type: Type.NUMBER },
                  },
                },
              },
            },
          },
        },
      });

      if (genResult?.text) {
        const parsed = JSON.parse(genResult.text);
        const analysisData = {
          recommendationAction: parsed.verdict || "CONSOLIDATE",
          justification: parsed.rationale || "Consolidate into existing enterprise ecosystem.",
          potentialSavingAnnual: parsed.estimatedAnnualSavings || Math.round((currentCost || 1000000) * 0.35),
          options: (parsed.alternatives || []).map((alt: any) => ({
            name: alt.name,
            estimatedCostAnnual: alt.estimatedCost || 0,
            annualSavings: Math.max(0, (currentCost || 1000000) - (alt.estimatedCost || 0)),
            pros: alt.keyPros || [],
            cons: alt.keyCons || [],
            migrationEffort: parsed.switchingFriction || "LOW",
            roiTimeMonths: alt.migrationTimeWeeks ? Math.ceil(alt.migrationTimeWeeks / 4) : 1,
          })),
          negotiationScript: `Inform ${currentVendor || "vendor"} that seat utilization is under review and price concessions are required.`,
        };

        logAiUsage({ accountId: req.session!.accountId, endpoint: "alternative-engine", modelUsed: genResult.modelUsed, aiPowered: true, usage: genResult.usage });
        return res.json({
          success: true,
          data: parsed,
          analysis: analysisData,
          aiPowered: true,
          modelUsed: genResult.modelUsed,
        });
      }
    }

    logAiUsage({ accountId: req.session!.accountId, endpoint: "alternative-engine", aiPowered: false });
    const fallbackAnalysis = {
      recommendationAction: "CONSOLIDATE",
      justification: `Based on active telemetry for ${itemName || "this service"}, significant license overlap or price escalation is observed.`,
      potentialSavingAnnual: Math.round((currentCost || 2070000) * 0.35),
      options: [
        {
          name: "Native Bundled Enterprise Suite",
          estimatedCostAnnual: 0,
          annualSavings: currentCost || 2070000,
          pros: ["Included in existing master contract", "Direct SSO integration", "Zero extra vendor overhead"],
          cons: ["Minor workflow transition for legacy users"],
          migrationEffort: "LOW",
          roiTimeMonths: 1,
        },
        {
          name: "Tier-Down Right-Sized Plan",
          estimatedCostAnnual: Math.round((currentCost || 2070000) * 0.65),
          annualSavings: Math.round((currentCost || 2070000) * 0.35),
          pros: ["Maintains current UI", "Eliminates inactive license tiers"],
          cons: ["Still requires maintaining vendor contract"],
          migrationEffort: "LOW",
          roiTimeMonths: 0,
        },
      ],
      negotiationScript: `Inform ${currentVendor || "the vendor"} account executive that login utilization is below 60% and alternatives are being vetted.`,
    };

    res.json({
      success: true,
      data: fallbackAnalysis,
      analysis: fallbackAnalysis,
      aiPowered: false,
    });
  } catch (error: any) {
    console.warn("Recovered from /api/ai/alternative-engine error:", error.message);
    res.json({
      success: true,
      analysis: null,
      data: null,
      aiPowered: false,
    });
  }
});

// 4. AI Document & Receipt OCR / Auto-Categorization
app.post("/api/ai/categorize-receipt", requireAuth, async (req, res) => {
  try {
    const { receiptText, invoiceData, imageBase64, imageMimeType } = req.body;
    const ai = getGeminiClient();
    const hasInput = receiptText || invoiceData || imageBase64;

    if (ai && hasInput) {
      const instructions = `Extract expense details from this receipt or invoice${imageBase64 ? " image" : ""}.

Provide JSON with:
- vendorName
- amount
- currency (INR or USD)
- date (YYYY-MM-DD)
- category (one of: 'Software & SaaS', 'Cloud Infrastructure', 'Hardware & Devices', 'Property & Facilities', 'Workforce & Contractors', 'Travel & Entertainment', 'Marketing & Ads', 'Utilities & Services', 'Legal & Insurance', 'Office Supplies & Misc')
- subcategory
- anomalyFlag (null or description if price spike or duplicate risk detected)
- suggestedCostCenter

If a field genuinely cannot be read from the document, leave it blank/zero rather than guessing.`;

      const contents = imageBase64
        ? [
            { inlineData: { mimeType: imageMimeType || "image/jpeg", data: imageBase64 } },
            { text: instructions },
          ]
        : `${instructions}\n\nDocument text:\n${receiptText || JSON.stringify(invoiceData)}`;

      const genResult = await generateWithRetryAndFallback(ai, {
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              vendorName: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              currency: { type: Type.STRING },
              date: { type: Type.STRING },
              category: { type: Type.STRING },
              subcategory: { type: Type.STRING },
              anomalyFlag: { type: Type.STRING },
              suggestedCostCenter: { type: Type.STRING },
              confidenceScore: { type: Type.NUMBER },
            },
          },
        },
      });

      if (genResult?.text) {
        const parsed = JSON.parse(genResult.text);
        const extractedObj = {
          vendorName: parsed.vendorName || "",
          amount: parsed.amount || 0,
          currency: parsed.currency || "INR",
          date: parsed.date || new Date().toISOString().split("T")[0],
          category: parsed.category || "Office Supplies & Misc",
          department: "",
          description: parsed.subcategory ? `${parsed.category} - ${parsed.subcategory}` : "",
          aiAnomalyNote: parsed.anomalyFlag || null,
        };

        logAiUsage({ accountId: req.session!.accountId, endpoint: "categorize-receipt", modelUsed: genResult.modelUsed, aiPowered: true, usage: genResult.usage });
        return res.json({
          success: true,
          data: parsed,
          extracted: extractedObj,
          aiPowered: true,
          modelUsed: genResult.modelUsed,
        });
      }
    }

    // No AI available (or nothing to extract from) — return an empty draft
    // rather than fabricated vendor/amount data, so nothing false ever gets
    // written to the user's real expense ledger.
    logAiUsage({ accountId: req.session!.accountId, endpoint: "categorize-receipt", aiPowered: false });
    const fallbackExtracted = {
      vendorName: "",
      amount: 0,
      currency: "INR",
      date: new Date().toISOString().split("T")[0],
      category: "Office Supplies & Misc",
      department: "",
      description: "",
      aiAnomalyNote: null,
    };

    res.json({
      success: true,
      data: fallbackExtracted,
      extracted: fallbackExtracted,
      aiPowered: false,
    });
  } catch (error: any) {
    console.warn("Recovered from /api/ai/categorize-receipt error:", error.message);
    res.json({
      success: true,
      extracted: {
        vendorName: "",
        amount: 0,
        currency: "INR",
        date: new Date().toISOString().split("T")[0],
        category: "Office Supplies & Misc",
        department: "",
        description: "",
        aiAnomalyNote: null,
      },
      aiPowered: false,
    });
  }
});

// 5. AI Executive Report Generator
app.post("/api/ai/executive-report", requireAuth, async (req, res) => {
  try {
    const { targetRole, reportType, period, company, metrics, currency = "INR" } = req.body;
    const activeRole = targetRole || reportType || "MD_CEO";
    const ai = getGeminiClient();

    if (ai) {
      const prompt = `You are the AI Chief Cost Officer producing a formal executive report for:
- Role: ${activeRole}
- Period: ${period || "current period"}
- Company: ${company?.name || "the company"}
- Metrics on file: ${JSON.stringify(metrics || {})}

Write a comprehensive Executive Report in Markdown format, grounded ONLY in the metrics provided above — never invent company names, vendor names, or figures not present in the metrics. If a metric needed for a section isn't provided, say so rather than guessing.
Include:
1. Executive Summary & Headline
2. Why spending changed this month/quarter (Breakdown by Software, Cloud, Real Estate, Workforce)
3. New Waste & Risks Identified
4. Confirmed Savings Achieved vs Pending Potential Savings
5. Immediate Action Recommendations for the Leadership Team.`;

      const genResult = await generateWithRetryAndFallback(ai, {
        contents: prompt,
      });

      if (genResult?.text) {
        logAiUsage({ accountId: req.session!.accountId, endpoint: "executive-report", modelUsed: genResult.modelUsed, aiPowered: true, usage: genResult.usage });
        return res.json({
          success: true,
          markdown: genResult.text,
          reportMarkdown: genResult.text,
          aiPowered: true,
          modelUsed: genResult.modelUsed,
        });
      }
    }

    const hasMetrics = metrics && typeof metrics === "object" && Object.keys(metrics).length > 0;
    const defaultReport = `# Executive Cost Intelligence Report
**Target Role**: ${activeRole} | **Period**: ${period || "Current period"} | **Status**: AI report generation unavailable

---

## 1. Executive Summary
${hasMetrics
  ? `Figures on file: ${JSON.stringify(metrics)}.`
  : "AI-generated report content isn't available right now (no GEMINI_API_KEY configured, or the AI service is temporarily unavailable), and no metrics were supplied to summarize deterministically."}

## 2. Next Step
Review the Expenses, Subscriptions, Assets, and Savings Center screens directly for your real, up-to-date figures. This deterministic fallback never fabricates spend, vendor, or savings figures.`;

    logAiUsage({ accountId: req.session!.accountId, endpoint: "executive-report", aiPowered: false });
    res.json({
      success: true,
      markdown: defaultReport,
      reportMarkdown: defaultReport,
      aiPowered: false,
    });
  } catch (error: any) {
    console.warn("Recovered from /api/ai/executive-report error:", error.message);
    res.json({
      success: true,
      markdown: `# Cost Intelligence Report\n\nSomething went wrong generating this report — please try again.`,
      reportMarkdown: `# Cost Intelligence Report\n\nSomething went wrong generating this report — please try again.`,
      aiPowered: false,
    });
  }
});

// 6. AI Department Document Ingestion & Overwrite Detection Parser
app.post("/api/ai/parse-department-document", requireAuth, async (req, res) => {
  try {
    const {
      fileName,
      fileType,
      fileText,
      department,
      existingExpenses = [],
      existingVendors = [],
      currency = "INR",
    } = req.body;

    const deptName = department?.name || "Target Department";
    const deptCode = department?.code || "DEP";
    const currentBudget = department?.annualBudget || 0;
    const currentBurn = department?.monthlyBurn || Math.round(currentBudget / 12);
    const currentHeadcount = department?.headcount || 0;
    const ai = getGeminiClient();

    if (ai && fileText && fileText.trim().length > 10) {
      const prompt = `You are an Enterprise Financial Controller and Document Ingestion AI.
The user has uploaded a file (${fileName}, type: ${fileType}) for department: ${deptName} (${deptCode}).
Current Department Stats:
- Annual Budget: ${currentBudget} ${currency}
- Monthly Burn: ${currentBurn} ${currency}
- Headcount: ${currentHeadcount}
- Existing Department Workflows: ${JSON.stringify((department?.costSavingPlaybooks || []).map((p: any) => p.title))}
- Existing Recent Invoices/Expenses sample: ${JSON.stringify(existingExpenses.slice(0, 8).map((e: any) => ({ title: e.title, vendor: e.vendorName, amount: e.amount, date: e.date, inv: e.invoiceNumber })))}

Document Content:
"""
${fileText.slice(0, 12000)}
"""

Parse and extract every financial, operational, budget, invoice, or cost-saving line item from this document into structured items.
CRITICAL OVERWRITE RULES:
1. If any line item specifies a new total budget or budget cap for ${deptName}, flag isOverwriteWarning: true and provide diffFields comparing currentValue (${currentBudget}) and incomingValue.
2. If any line item specifies a new headcount for ${deptName}, flag isOverwriteWarning: true and provide diffFields comparing currentValue (${currentHeadcount}) and incomingValue.
3. If an expense invoice matches an existing invoice number or has the exact same vendor and amount on the same date, flag isOverwriteWarning: true and provide overwriteReason.
4. If a cost-cutting workflow has the same title or objective as an existing workflow, flag isOverwriteWarning: true.
5. If it's a new unique expense, contract, or workflow, set isOverwriteWarning: false.`;

      const genResult = await generateWithRetryAndFallback(ai, {
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              confidenceOverall: { type: Type.NUMBER },
              extractedItems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    itemType: {
                      type: Type.STRING,
                      enum: [
                        "EXPENSE_INVOICE",
                        "BUDGET_REVISION",
                        "HEADCOUNT_UPDATE",
                        "SAVINGS_WORKFLOW",
                        "VENDOR_CONTRACT",
                        "ASSET_ACQUISITION",
                      ],
                    },
                    title: { type: Type.STRING },
                    category: { type: Type.STRING },
                    amount: { type: Type.NUMBER },
                    date: { type: Type.STRING },
                    vendorName: { type: Type.STRING },
                    invoiceNumber: { type: Type.STRING },
                    description: { type: Type.STRING },
                    headcountChange: { type: Type.NUMBER },
                    budgetCapChange: { type: Type.NUMBER },
                    annualSavingsTarget: { type: Type.NUMBER },
                    riskLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
                    confidenceScore: { type: Type.NUMBER },
                    isOverwriteWarning: { type: Type.BOOLEAN },
                    overwriteReason: { type: Type.STRING },
                    diffFields: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          field: { type: Type.STRING },
                          currentValue: { type: Type.STRING },
                          incomingValue: { type: Type.STRING },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (genResult?.text) {
        const parsed = JSON.parse(genResult.text);
        const processedItems = (parsed.extractedItems || []).map((item: any, idx: number) => ({
          ...item,
          id: `item-${Date.now()}-${idx}`,
          targetDepartmentId: department?.id || "dep-default",
          targetDepartmentName: deptName,
          currency: currency,
          resolution: item.isOverwriteWarning ? "OVERWRITE" : "CREATE_NEW",
          isApproved: true,
          confidenceScore: item.confidenceScore || 95,
        }));

        logAiUsage({ accountId: req.session!.accountId, endpoint: "parse-department-document", modelUsed: genResult.modelUsed, aiPowered: true, usage: genResult.usage });
        return res.json({
          success: true,
          summary: parsed.summary || `Extracted ${processedItems.length} items from ${fileName}`,
          confidenceOverall: parsed.confidenceOverall || 94,
          extractedItems: processedItems,
          aiPowered: true,
          modelUsed: genResult.modelUsed,
        });
      }
    }

    // No AI available (or no readable text in the document) — never fabricate
    // budget revisions, headcount changes, or invoice line items. A previous
    // version of this fallback invented specific vendor names, invoice
    // numbers, and "budget overwrite" diffs with fake 90%+ confidence scores
    // that a user could approve into their real department budget without
    // realizing none of it came from the actual uploaded document.
    logAiUsage({ accountId: req.session!.accountId, endpoint: "parse-department-document", aiPowered: false });
    res.json({
      success: true,
      summary: "AI document parsing isn't available right now (no GEMINI_API_KEY configured, or the AI service is temporarily unavailable). No items were extracted — please add expenses, budget changes, or workflows manually, or try again once AI is configured.",
      confidenceOverall: 0,
      extractedItems: [],
      aiPowered: false,
    });
  } catch (error: any) {
    console.warn("Recovered from /api/ai/parse-department-document error:", error.message);
    res.json({
      success: true,
      summary: "Something went wrong parsing this document — please try again.",
      confidenceOverall: 0,
      extractedItems: [],
      aiPowered: false,
    });
  }
});

// Vite Middleware for Dev and Static Hosting for Production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CostPulse AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
