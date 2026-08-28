import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "./db";
import { accounts, users } from "./schema";
import { createId } from "./id";
import {
  hashPassword,
  verifyPassword,
  signSession,
  setSessionCookie,
  clearSessionCookie,
  requireAuth,
  requireAdmin,
} from "./auth";
import { INFRA_39_DEPARTMENTS_TEMPLATE } from "../src/data/departmentData";
import { ensureDepartmentsHaveUsersAndRules } from "../src/data/departmentUserData";

export const router = Router();

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

/** Builds a clean, empty-ledger starter workspace for a brand-new account. */
function buildStarterWorkspace(companyName: string, industry: string, currency: string) {
  const companyId = `comp-${createId()}`;
  const baseDepartments = INFRA_39_DEPARTMENTS_TEMPLATE.map((dept: any) => ({
    ...dept,
    companyId,
    spentYearToDate: 0,
    achievedSavingsAnnual: 0,
    monthlyBurn: Math.round(dept.annualBudget / 12),
  }));
  const departments = ensureDepartmentsHaveUsersAndRules(baseDepartments as any);

  return {
    companies: [
      {
        id: companyId,
        name: companyName,
        industry,
        isGroup: false,
        size: "51-200",
        headquarters: "",
        currency,
        annualRevenue: 0,
        monthlyBurn: 0,
        totalExpensesYear: 0,
        fiscalYear: "FY26",
      },
    ],
    selectedCompanyId: companyId,
    currency,
    expenses: [],
    subscriptions: [],
    assets: [],
    vendors: [],
    savings: [],
    properties: [],
    budgets: [],
    procurements: [],
    auditLogs: [
      {
        id: `log-init-${createId()}`,
        companyId,
        userName: "System",
        userRole: "MASTER",
        action: "ACCOUNT_CREATED",
        entityType: "SYSTEM",
        details: `Account "${companyName}" was created.`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        ipAddress: "",
      },
    ],
    departments,
  };
}

function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  departmentId: string | null;
  departmentName: string | null;
  avatar: string | null;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId || undefined,
    departmentName: user.departmentName || undefined,
    avatar: user.avatar || undefined,
  };
}

/* ------------------------------- AUTH ------------------------------- */

router.post("/auth/signup", async (req, res) => {
  try {
    const { companyName, industry, currency, adminName, email, password } = req.body || {};

    if (!companyName || !adminName || !email || !password) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ success: false, error: "Password must be at least 8 characters" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const [existing] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
    if (existing) {
      return res.status(409).json({ success: false, error: "An account with this email already exists" });
    }

    const workspace = buildStarterWorkspace(companyName, industry || "Technology & Business Services", currency || "INR");
    const passwordHash = await hashPassword(password);

    const [account] = await db
      .insert(accounts)
      .values({ name: companyName, currency: currency || "INR", workspace })
      .returning();

    const [user] = await db
      .insert(users)
      .values({
        accountId: account.id,
        email: normalizedEmail,
        passwordHash,
        name: adminName,
        role: "MD_CEO",
        departmentName: "Executive Management",
        avatar: DEFAULT_AVATAR,
        lastLoginAt: new Date(),
      })
      .returning();

    const token = signSession({ userId: user.id, accountId: account.id, email: user.email, role: user.role });
    setSessionCookie(res, token);

    res.json({ success: true, user: toPublicUser(user), workspace: account.workspace });
  } catch (error: any) {
    console.error("signup error:", error.message);
    res.status(500).json({ success: false, error: "Failed to create account" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    const [account] = await db.select().from(accounts).where(eq(accounts.id, user.accountId)).limit(1);
    if (!account) {
      return res.status(500).json({ success: false, error: "Account not found" });
    }

    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

    const token = signSession({ userId: user.id, accountId: account.id, email: user.email, role: user.role });
    setSessionCookie(res, token);

    res.json({ success: true, user: toPublicUser(user), workspace: account.workspace });
  } catch (error: any) {
    console.error("login error:", error.message);
    res.status(500).json({ success: false, error: "Failed to sign in" });
  }
});

router.post("/auth/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ success: true });
});

router.get("/auth/me", requireAuth, async (req, res) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.session!.userId)).limit(1);
    if (!user) return res.status(401).json({ success: false, error: "Session invalid" });
    const [account] = await db.select().from(accounts).where(eq(accounts.id, user.accountId)).limit(1);
    if (!account) return res.status(401).json({ success: false, error: "Session invalid" });
    res.json({ success: true, user: toPublicUser(user), workspace: account.workspace });
  } catch (error: any) {
    console.error("me error:", error.message);
    res.status(500).json({ success: false, error: "Failed to load session" });
  }
});

/* ----------------------------- WORKSPACE ----------------------------- */

// The entire operational ledger is read/written as one JSON document scoped
// strictly to the authenticated user's accountId — a client can never read or
// write another tenant's data because accountId always comes from the signed
// session cookie, never from the request body.

router.get("/workspace", requireAuth, async (req, res) => {
  try {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, req.session!.accountId)).limit(1);
    if (!account) return res.status(404).json({ success: false, error: "Workspace not found" });
    res.json({ success: true, workspace: account.workspace });
  } catch (error: any) {
    console.error("get workspace error:", error.message);
    res.status(500).json({ success: false, error: "Failed to load workspace" });
  }
});

router.put("/workspace", requireAuth, async (req, res) => {
  try {
    const { workspace } = req.body || {};
    if (!workspace || typeof workspace !== "object") {
      return res.status(400).json({ success: false, error: "Invalid workspace payload" });
    }
    const [account] = await db
      .update(accounts)
      .set({ workspace, currency: workspace.currency || undefined, updatedAt: new Date() })
      .where(eq(accounts.id, req.session!.accountId))
      .returning();
    res.json({ success: true, workspace: account.workspace });
  } catch (error: any) {
    console.error("put workspace error:", error.message);
    res.status(500).json({ success: false, error: "Failed to save workspace" });
  }
});

/* -------------------------------- TEAM -------------------------------- */

router.get("/team", requireAuth, async (req, res) => {
  try {
    const rows = await db.select().from(users).where(eq(users.accountId, req.session!.accountId));
    res.json({ success: true, users: rows.map(toPublicUser) });
  } catch (error: any) {
    console.error("list team error:", error.message);
    res.status(500).json({ success: false, error: "Failed to load team" });
  }
});

router.post("/team", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, email, role, departmentId, departmentName, password } = req.body || {};
    if (!name || !email || !role || !password) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ success: false, error: "Password must be at least 8 characters" });
    }
    const normalizedEmail = String(email).toLowerCase().trim();
    const [existing] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
    if (existing) {
      return res.status(409).json({ success: false, error: "A user with this email already exists" });
    }
    const passwordHash = await hashPassword(password);
    const [user] = await db
      .insert(users)
      .values({
        accountId: req.session!.accountId,
        email: normalizedEmail,
        passwordHash,
        name,
        role,
        departmentId: departmentId || null,
        departmentName: departmentName || null,
        avatar: DEFAULT_AVATAR,
      })
      .returning();
    res.json({ success: true, user: toPublicUser(user) });
  } catch (error: any) {
    console.error("create team member error:", error.message);
    res.status(500).json({ success: false, error: "Failed to create team member" });
  }
});

router.delete("/team/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const [target] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, req.params.id), eq(users.accountId, req.session!.accountId)))
      .limit(1);
    if (!target) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    if (target.id === req.session!.userId) {
      return res.status(400).json({ success: false, error: "You cannot remove your own account" });
    }
    await db.delete(users).where(eq(users.id, target.id));
    res.json({ success: true });
  } catch (error: any) {
    console.error("delete team member error:", error.message);
    res.status(500).json({ success: false, error: "Failed to remove team member" });
  }
});
