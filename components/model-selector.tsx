"use client";

import { useMemo, useState } from 'react';
import type { ModelDefinition } from '@/lib/types';

const modes = ['auto', 'fast', 'reasoning', 'coding', 'research', 'creative', 'vision'] as const;

type Mode = (typeof modes)[number];

export function ModelSelector({
  models,
  selectedModelId,
  onSelectModel,
  favorites,
  recentModels,
  onToggleFavorite,
  mode,
  setMode,
  isLoading,
}: {
  models: ModelDefinition[];
  selectedModelId: string;
  onSelectModel: (id: string) => void;
  favorites: string[];
  recentModels: string[];
  onToggleFavorite: (id: string) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
  isLoading: boolean;
}) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | string>('all');

  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      const matchesSearch = model.name.toLowerCase().includes(search.toLowerCase()) || model.provider.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'all' || model.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [category, models, search]);

  const categories = ['all', ...new Set(models.map((model) => model.category))];
  const currentModel = models.find((model) => model.id === selectedModelId) ?? models[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {modes.map((m) => (
          <button
            key={m}
            type="button"
            className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${
              mode === m ? 'bg-blue-500 text-white' : 'border border-slate-700 bg-slate-900 text-slate-300'
            }`}
            onClick={() => setMode(m)}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 gap-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search models"
            className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500"
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === 'all' ? 'All categories' : item}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200">
          <span className="font-medium">Selected:</span>
          <span>{currentModel ? `${currentModel.provider} / ${currentModel.name}` : 'No model selected'}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <span>Favorites</span>
        {favorites.length === 0 ? <span>No favorites yet</span> : favorites.map((modelId) => <span key={modelId}>{modelId}</span>)}
        <span className="mx-2">•</span>
        <span>Recent</span>
        {recentModels.length === 0 ? <span>None</span> : recentModels.map((modelId) => <span key={modelId}>{modelId}</span>)}
      </div>

      {isLoading ? (
        <div className="text-sm text-slate-400">Loading model registry…</div>
      ) : (
        <div className="grid max-h-[240px] grid-cols-1 gap-2 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
          {filteredModels.map((model) => {
            const isSelected = model.id === selectedModelId;
            const isFavorite = favorites.includes(model.id);
            return (
              <button
                key={model.id}
                type="button"
                onClick={() => onSelectModel(model.id)}
                className={`rounded-2xl border p-3 text-left transition ${
                  isSelected ? 'border-blue-400 bg-blue-500/10' : 'border-slate-700 bg-slate-900/80 hover:border-slate-500'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">{model.name}</div>
                    <div className="text-xs text-slate-400">{model.provider}</div>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleFavorite(model.id);
                    }}
                    className={`rounded-full px-2 py-1 text-[10px] ${isFavorite ? 'bg-yellow-500/20 text-yellow-200' : 'bg-slate-800 text-slate-400'}`}
                  >
                    {isFavorite ? '★' : '☆'}
                  </button>
                </div>

                <div className="mb-2 text-xs text-slate-300">{model.description}</div>

                <div className="flex flex-wrap gap-1 text-[10px] text-slate-300">
                  <span className="rounded-full bg-slate-800 px-2 py-1">{model.category}</span>
                  {model.contextLength ? <span className="rounded-full bg-slate-800 px-2 py-1">{model.contextLength}</span> : null}
                  {model.supportsVision ? <span className="rounded-full bg-slate-800 px-2 py-1">Vision</span> : null}
                  {model.supportsTools ? <span className="rounded-full bg-slate-800 px-2 py-1">Tools</span> : null}
                  {model.supportsWebSearch ? <span className="rounded-full bg-slate-800 px-2 py-1">Web</span> : null}
                  {model.supportsImageGeneration ? <span className="rounded-full bg-slate-800 px-2 py-1">Image</span> : null}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
