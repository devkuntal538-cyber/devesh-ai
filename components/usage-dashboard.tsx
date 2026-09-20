"use client";

import { useMemo, useState } from 'react';
import type { ModelDefinition } from '@/lib/types';

const plans = [
  { id: 'free', label: 'Free', messages: 25, models: 4 },
  { id: 'plus', label: 'Plus', messages: 250, models: 12 },
  { id: 'pro', label: 'Pro', messages: 1500, models: 20 },
  { id: 'max', label: 'Max', messages: 5000, models: 'Unlimited' },
];

export function UsageDashboard({ conversationCount, modelCount, totalMessages }: { conversationCount: number; modelCount: number; totalMessages: number }) {
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const plan = plans.find((entry) => entry.id === selectedPlan) ?? plans[1];
  const usage = useMemo(
    () => ({
      messages: totalMessages,
      aiRequests: totalMessages + 20,
      modelsUsed: Math.min(modelCount, 8),
      remaining: Math.max(0, plan.messages - totalMessages),
    }),
    [modelCount, plan.messages, totalMessages],
  );

  return (
    <div className="space-y-5 rounded-3xl border border-slate-700 bg-slate-900/80 p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-blue-300">Usage</div>
          <h3 className="mt-1 text-2xl font-bold text-white">This month</h3>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200">Plan: {plan.label}</div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Messages" value={usage.messages.toString()} />
        <Stat label="AI requests" value={usage.aiRequests.toString()} />
        <Stat label="Models used" value={usage.modelsUsed.toString()} />
        <Stat label="Remaining" value={usage.remaining.toString()} />
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-slate-200">Plan selection</div>
        <div className="flex flex-wrap gap-2">
          {plans.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setSelectedPlan(entry.id)}
              className={`rounded-xl border px-3 py-2 text-sm ${
                selectedPlan === entry.id ? 'border-blue-500 bg-blue-500/10 text-blue-200' : 'border-slate-700 bg-slate-950 text-slate-200'
              }`}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
        <div className="mb-2 text-sm text-slate-300">Usage overview</div>
        <div className="h-2 rounded-full bg-slate-800">
          <div className="h-2 w-[72%] rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
        </div>
        <div className="mt-2 text-xs text-slate-400">72% of your current monthly allocation used.</div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <InfoCard label="Conversations" value={conversationCount.toString()} accent="blue" />
        <InfoCard label="Configured providers" value={modelCount.toString()} accent="indigo" />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

function InfoCard({ label, value, accent }: { label: string; value: string; accent: 'blue' | 'indigo' }) {
  return (
    <div className={`rounded-2xl border border-${accent}-500/30 bg-${accent}-500/5 p-4`}>
      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-bold text-white">{value}</div>
    </div>
  );
}
