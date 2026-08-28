import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  ShieldCheck,
  RefreshCw,
  TrendingDown,
  Layers,
  Building,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile, CurrencyCode, Company } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AiChatAnalystProps {
  currentUser: UserProfile;
  company: Company;
  currency: CurrencyCode;
}

export const AiChatAnalyst: React.FC<AiChatAnalystProps> = ({
  currentUser,
  company,
  currency,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Hello ${currentUser.name}. I am your enterprise **Cost Intelligence & Optimization AI**. I have synthesized your company ledgers, SaaS utilization telemetry, cloud infrastructure usage, and real estate footprint under your authorized **${currentUser.role.replace('_', ' ')}** role.\n\nAsk me anything about where money is going, redundant software tools, cloud waste, or how to optimize operational cash flow.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    '🏨 Hotels: How do we reduce our ₹40.8L monthly OTA commission bleed & buffet food waste?',
    '🏗️ Construction: Analyze WBS cost code variance and heavy equipment idle fuel burn.',
    '🏥 Healthcare: Identify sterile surgical batches expiring in <60 days & locum vs FTE savings.',
    '💄 Beauty/Spas: How can smart scales cut backbar color overmixing waste by 40%?',
    '💻 Tech FinOps: Decommission idle GPU compute instances & recover 60d+ inactive SSO seats.',
    '🎓 Universities: Check restricted research grant allowable spending limits and lab instrument sharing.',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          userRole: currentUser.role,
          companyId: company.id,
          currency,
        }),
      });

      if (!res.ok) {
        throw new Error('AI service error');
      }

      const data = await res.json();
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'I analyzed your query but could not extract insights.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        content:
          "⚠️ I couldn't reach the AI service just now. Please check your connection and try again — I never fabricate figures when the request fails.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8.5rem)] flex-col rounded-xl border border-[#E5E7EB] bg-white shadow-xs overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-[#F9FAFB] px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-[#111827]">
                Ask Your Company AI (Financial Intelligence)
              </span>
              <span className="rounded bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 text-[9px] font-bold">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              Role Scope: <strong className="text-gray-700">{currentUser.role.replace('_', ' ')}</strong> • Company: <strong className="text-gray-700">{company.name}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-gray-600 font-medium bg-white border border-[#E5E7EB] rounded-md px-2.5 py-1 shadow-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Role-Based Data Isolation Active</span>
          </div>
        </div>
      </div>

      {/* Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 text-xs leading-relaxed ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-blue-600 text-white shadow-xs">
                <Sparkles className="h-4 w-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-xl p-4 shadow-xs space-y-2 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 border border-[#E5E7EB] text-gray-800'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              <div
                className={`text-[9px] ${
                  msg.role === 'user' ? 'text-blue-200 text-right' : 'text-gray-400 text-left'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.role === 'user' && (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-7 w-7 rounded-full object-cover border border-gray-300"
              />
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white animate-spin">
              <RefreshCw className="h-3.5 w-3.5" />
            </div>
            <div className="rounded-xl border border-[#E5E7EB] bg-gray-50 p-3.5 text-xs text-gray-600 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Analyzing company ledgers, SaaS usage & contract renewal terms...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Pill bar */}
      <div className="border-t border-[#E5E7EB] bg-gray-50/50 p-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-gray-600 scrollbar-none">
          <span className="font-semibold text-gray-400 flex items-center gap-1 flex-shrink-0">
            <HelpCircle className="h-3 w-3" /> Quick Prompts:
          </span>
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={isLoading}
              className="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors shadow-xs disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Bar */}
      <div className="border-t border-[#E5E7EB] p-3 sm:p-4 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything (e.g., 'What are our top 3 redundant SaaS tools?')..."
            className="flex-1 rounded-md border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors shadow-xs"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
