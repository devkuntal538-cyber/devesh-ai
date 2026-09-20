import type { Conversation } from '@/lib/types';

export function ConversationSidebar({
  conversations,
  activeConversationId,
  onSelect,
  onNewChat,
  onRename,
  onDelete,
  onTogglePin,
}: {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onNewChat}
        className="w-full rounded-xl bg-blue-500/10 px-3 py-2 text-left text-sm font-medium text-blue-200"
      >
        + New Chat
      </button>

      {conversations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">No conversations yet.</div>
      ) : (
        conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`rounded-xl border p-2 ${
              conversation.id === activeConversationId ? 'border-blue-500/50 bg-slate-800' : 'border-slate-800 bg-slate-900/70'
            }`}
          >
            <button type="button" onClick={() => onSelect(conversation.id)} className="w-full text-left">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-slate-100">{conversation.title}</span>
                {conversation.pinned ? <span className="text-xs text-yellow-300">📌</span> : null}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">{new Date(conversation.updatedAt).toLocaleString()}</div>
            </button>

            <div className="mt-2 flex gap-2">
              <button type="button" onClick={() => onTogglePin(conversation.id)} className="text-[11px] text-slate-400">
                {conversation.pinned ? 'Unpin' : 'Pin'}
              </button>
              <button type="button" onClick={() => onRename(conversation.id)} className="text-[11px] text-slate-400">
                Rename
              </button>
              <button type="button" onClick={() => onDelete(conversation.id)} className="text-[11px] text-red-300">
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
