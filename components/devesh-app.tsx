"use client";

import { useEffect, useMemo, useState } from 'react';
import { ModelSelector } from '@/components/model-selector';
import { ConversationSidebar } from '@/components/conversation-sidebar';
import { ChatPanel } from '@/components/chat-panel';
import { type Conversation, type Message, type ModelDefinition } from '@/lib/types';

const STORAGE_KEY = 'devesh-ai:conversations';
const USER_KEY = 'devesh-ai:user';
const FAVORITES_KEY = 'devesh-ai:favorites';

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

const defaultMode = 'auto';

export function DeveshApp() {
  const [authenticated, setAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('demo@devesh.ai');
  const [loginForm, setLoginForm] = useState({ email: 'demo@devesh.ai', password: 'demo123' });
  const [conversationSearch, setConversationSearch] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [models, setModels] = useState<ModelDefinition[]>([]);
  const [selectedModelId, setSelectedModelId] = useState('gpt-4o-mini');
  const [mode, setMode] = useState<'auto' | 'fast' | 'reasoning' | 'coding' | 'research' | 'creative' | 'vision'>(defaultMode);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentModels, setRecentModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) {
      const parsed = JSON.parse(savedUser) as { email?: string };
      if (parsed.email) {
        setUserEmail(parsed.email);
        setAuthenticated(true);
      }
    }

    const savedFavorites = localStorage.getItem(FAVORITES_KEY);
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    const savedConversations = localStorage.getItem(STORAGE_KEY);
    if (savedConversations) {
      const parsed = JSON.parse(savedConversations) as Conversation[];
      if (parsed.length > 0) {
        setConversations(parsed);
        setActiveConversationId(parsed[0].id);
      }
    }

    fetch('/api/models')
      .then((res) => res.json())
      .then((data) => {
        const list = data.models as ModelDefinition[];
        setModels(list);
        if (list.length > 0) {
          setSelectedModelId((current) => current || list[0].id);
        }
      })
      .finally(() => setIsLoadingModels(false));
  }, []);

  useEffect(() => {
    if (conversations.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    if (favorites.length) {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  }, [favorites]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [conversations, activeConversationId],
  );

  const filteredConversations = useMemo(
    () =>
      conversations.filter((conversation) => {
        const query = conversationSearch.toLowerCase();
        return conversation.title.toLowerCase().includes(query) || conversation.messages.some((msg) => msg.content.toLowerCase().includes(query));
      }),
    [conversations, conversationSearch],
  );

  function createNewChat() {
    const conversation: Conversation = {
      id: makeId('chat'),
      title: 'New chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pinned: false,
      archived: false,
      favorite: false,
      modelId: selectedModelId,
      mode,
      messages: [],
    };
    setConversations((prev) => [conversation, ...prev]);
    setActiveConversationId(conversation.id);
  }

  function renameConversation(id: string) {
    const title = window.prompt('Rename conversation', conversations.find((c) => c.id === id)?.title ?? 'New chat');
    if (!title) return;
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === id ? { ...conversation, title, updatedAt: Date.now() } : conversation,
      ),
    );
  }

  function deleteConversation(id: string) {
    setConversations((prev) => prev.filter((conversation) => conversation.id !== id));
    if (activeConversationId === id) {
      const next = conversations.find((conversation) => conversation.id !== id);
      setActiveConversationId(next?.id ?? null);
    }
  }

  function toggleFavorite(modelId: string) {
    setFavorites((prev) => (prev.includes(modelId) ? prev.filter((id) => id !== modelId) : [...prev, modelId]));
  }

  function toggleConversationPin(id: string) {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === id ? { ...conversation, pinned: !conversation.pinned, updatedAt: Date.now() } : conversation,
      ),
    );
  }

  function updateConversationMessages(conversationId: string, nextMessages: Message[]) {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, messages: nextMessages, updatedAt: Date.now() } : conversation,
      ),
    );
  }

  async function handleSendMessage(content: string) {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: makeId('msg'),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
      modelId: selectedModelId,
    };

    let conversationId = activeConversationId;
    if (!conversationId) {
      const fresh: Conversation = {
        id: makeId('chat'),
        title: content.slice(0, 38) || 'New chat',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pinned: false,
        archived: false,
        favorite: false,
        modelId: selectedModelId,
        mode,
        messages: [userMessage],
      };
      setConversations((prev) => [fresh, ...prev]);
      setActiveConversationId(fresh.id);
      conversationId = fresh.id;
      return;
    }

    const existing = conversations.find((conversation) => conversation.id === conversationId);
    const nextMessages = [...(existing?.messages ?? []), userMessage];
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              title: conversation.title === 'New chat' ? content.slice(0, 38) || 'New chat' : conversation.title,
              updatedAt: Date.now(),
              messages: nextMessages,
            }
          : conversation,
      ),
    );

    const requestMessages = nextMessages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    setIsStreaming(true);
    setRecentModels((prev) => (prev.includes(selectedModelId) ? prev : [selectedModelId, ...prev].slice(0, 5)));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: selectedModelId,
          mode,
          messages: requestMessages,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unable to generate response.' }));
        const errorMessage: Message = {
          id: makeId('assistant-error'),
          role: 'assistant',
          content: `Error: ${errorData.error ?? 'Unable to generate response.'}`,
          timestamp: Date.now(),
          modelId: selectedModelId,
        };
        updateConversationMessages(conversationId, [...nextMessages, errorMessage]);
        setIsStreaming(false);
        return;
      }

      const contentType = res.headers.get('content-type') ?? '';
      const assistantMessageId = makeId('assistant');
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        modelId: selectedModelId,
      };

      updateConversationMessages(conversationId, [...nextMessages, assistantMessage]);

      if (contentType.includes('application/json')) {
        const json = await res.json();
        const content = json.error ?? 'Unable to generate a response.';
        updateConversationMessages(conversationId, [
          ...nextMessages,
          { ...assistantMessage, content, timestamp: Date.now() },
        ]);
        setIsStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let streamContent = '';

      if (!reader) {
        throw new Error('No readable stream available');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const raw = decoder.decode(value, { stream: true });
        streamContent += raw;
        setConversations((prev) =>
          prev.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  messages: conversation.messages.map((message) =>
                    message.id === assistantMessageId ? { ...message, content: streamContent } : message,
                  ),
                  updatedAt: Date.now(),
                }
              : conversation,
          ),
        );
      }

      setIsStreaming(false);
    } catch (error) {
      const description = error instanceof Error ? error.message : 'Unknown error';
      const errorMessage: Message = {
        id: makeId('assistant-error'),
        role: 'assistant',
        content: `Error: ${description}`,
        timestamp: Date.now(),
        modelId: selectedModelId,
      };
      updateConversationMessages(conversationId, [...nextMessages, errorMessage]);
      setIsStreaming(false);
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-700/80 bg-slate-900/70 p-8 shadow-soft">
          <div className="mb-6">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-blue-300">DEVESH AI</div>
            <h1 className="text-3xl font-bold">One Chat. 20+ AI Minds.</h1>
          </div>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              localStorage.setItem(USER_KEY, JSON.stringify({ email: loginForm.email }));
              setUserEmail(loginForm.email);
              setAuthenticated(true);
            }}
          >
            <div>
              <label className="mb-1 block text-sm text-slate-300">Email</label>
              <input
                value={loginForm.email}
                onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none ring-0"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none ring-0"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-3 font-semibold text-white transition hover:opacity-95"
            >
              Sign in
            </button>

            <button
              type="button"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-medium text-slate-200"
              onClick={() => {
                const keyConfigured = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
                if (!keyConfigured) {
                  alert('Google login is not configured yet. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable it.');
                  return;
                }
                localStorage.setItem(USER_KEY, JSON.stringify({ email: 'google-user@devesh.ai' }));
                setUserEmail('google-user@devesh.ai');
                setAuthenticated(true);
              }}
            >
              Continue with Google
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-3 text-slate-50 md:p-5">
      <div className="mx-auto flex h-[calc(100vh-1.5rem)] max-w-[1800px] overflow-hidden rounded-[28px] border border-slate-700/80 bg-slate-900/70 shadow-soft">
        <aside className="hidden w-[300px] shrink-0 border-r border-slate-800 bg-slate-950/80 p-4 md:flex md:flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-300">DEVESH AI</div>
              <h2 className="mt-1 text-xl font-bold">Workspace</h2>
            </div>
            <button
              onClick={createNewChat}
              className="rounded-xl border border-blue-500/40 bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-200"
            >
              New Chat
            </button>
          </div>

          <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-900 p-2">
            <input
              value={conversationSearch}
              onChange={(event) => setConversationSearch(event.target.value)}
              placeholder="Search conversations"
              className="w-full bg-transparent px-2 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto pb-4">
            <ConversationSidebar
              conversations={filteredConversations}
              activeConversationId={activeConversationId}
              onSelect={(id) => setActiveConversationId(id)}
              onNewChat={createNewChat}
              onRename={renameConversation}
              onDelete={deleteConversation}
              onTogglePin={toggleConversationPin}
            />
          </div>

          <div className="border-t border-slate-800 pt-3">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Account</div>
            <div className="mt-2 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-2">
              <div>
                <div className="font-medium text-white">{userEmail}</div>
                <div className="text-xs text-slate-400">Demo session</div>
              </div>
              <button
                className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300"
                onClick={() => {
                  localStorage.removeItem(USER_KEY);
                  setAuthenticated(false);
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-4 py-3 md:px-5">
            <div className="flex items-center gap-3">
              <button
                className="rounded-xl border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200 md:hidden"
                onClick={createNewChat}
              >
                New
              </button>
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-blue-300">Devesh AI</div>
                <div className="text-lg font-semibold text-white">{activeConversation?.title ?? 'New chat'}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200">Projects</button>
              <button className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200">Favorites</button>
            </div>
          </header>

          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="border-b border-slate-800 bg-slate-950/40 px-4 py-3 md:px-5">
              <ModelSelector
                models={models}
                selectedModelId={selectedModelId}
                onSelectModel={setSelectedModelId}
                onToggleFavorite={toggleFavorite}
                favorites={favorites}
                recentModels={recentModels}
                mode={mode}
                setMode={setMode}
                isLoading={isLoadingModels}
              />
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4 md:px-5">
              <ChatPanel
                conversation={activeConversation}
                selectedModelId={selectedModelId}
                mode={mode}
                onSendMessage={handleSendMessage}
                isStreaming={isStreaming}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
