"use client";

import { useState } from 'react';
import type { ModelDefinition } from '@/lib/types';

export function AdminPanel({ models }: { models: ModelDefinition[] }) {
  const [savedModels, setSavedModels] = useState(models);
  const [featureFlags, setFeatureFlags] = useState({
    researchMode: true,
    compareMode: true,
    memory: true,
    fileUpload: true,
    webSearch: false,
  });

  const toggleFeature = (key: keyof typeof featureFlags) => {
    setFeatureFlags((current) => ({ ...current, [key]: !current[key] }));
  };

  const toggleModel = (id: string) => {
    setSavedModels((current) =>
      current.map((model) => (model.id === id ? { ...model, configured: !(model.configured ?? true) } : model)),
    );
  };

  return (
    <div className="space-y-5 rounded-3xl border border-slate-700 bg-slate-900/80 p-5">
      <div>
        <div className="text-xs uppercase tracking-[0.25em] text-blue-300">Admin</div>
        <h3 className="mt-1 text-2xl font-bold text-white">Platform controls</h3>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
          <div className="mb-3 text-sm font-medium text-slate-200">AI providers</div>
          <div className="space-y-2">
            {savedModels.slice(0, 8).map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={() => toggleModel(model.id)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left ${
                  model.configured ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : 'border-slate-700 bg-slate-900 text-slate-300'
                }`}
              >
                <div>
                  <div className="text-sm font-medium">{model.provider}</div>
                  <div className="text-xs opacity-80">{model.name}</div>
                </div>
                <span className="text-xs">{model.configured ? 'Enabled' : 'Disabled'}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
          <div className="mb-3 text-sm font-medium text-slate-200">Feature flags</div>
          <div className="space-y-2">
            {Object.entries(featureFlags).map(([key, enabled]) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleFeature(key as keyof typeof featureFlags)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left ${
                  enabled ? 'border-blue-500/40 bg-blue-500/10 text-blue-200' : 'border-slate-700 bg-slate-900 text-slate-300'
                }`}
              >
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="text-xs">{enabled ? 'On' : 'Off'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
        <div className="mb-2 text-sm font-medium text-slate-200">System health</div>
        <div className="grid gap-3 md:grid-cols-3">
          <HealthCard label="API status" value="Ready" tone="good" />
          <HealthCard label="Rate limit" value="High" tone="warn" />
          <HealthCard label="Errors" value="0" tone="good" />
        </div>
      </div>
    </div>
  );
}

function HealthCard({ label, value, tone }: { label: string; value: string; tone: 'good' | 'warn' }) {
  return (
    <div className={`rounded-xl border p-3 ${tone === 'good' ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-200' : 'border-amber-500/30 bg-amber-500/5 text-amber-200'}`}>
      <div className="text-[10px] uppercase tracking-[0.2em]">{label}</div>
      <div className="mt-2 text-lg font-semibold">{value}</div>
    </div>
  );
}
