import type { Conversation, Message } from '@/lib/types';

function renderMarkdownText(content: string) {
  const escaped = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const withCode = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');
  const withHeadings = withCode.replace(/^### (.*)$/gm, '<h3>$1</h3>').replace(/^## (.*)$/gm, '<h2>$1</h2>').replace(/^# (.*)$/gm, '<h1>$1</h1>');
  const withLists = withHeadings.replace(/(?:^|\n)- (.*)/g, '<li>$1</li>').replace(/<li>(.*)<\/li>/g, '<ul><li>$1</li></ul>');
  const withParagraphs = withLists.replace(/\n{2,}/g, '</p><p>');
  return `<p>${withParagraphs}</p>`;
}

export function ChatPanel({
  conversation,
  selectedModelId,
  mode,
  onSendMessage,
  isStreaming,
}: {
  conversation: Conversation | null;
  selectedModelId: string;
  mode: string;
  onSendMessage: (content: string) => Promise<void> | void;
  isStreaming: boolean;
}) {
  const messages = conversation?.messages ?? [];

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto pb-4">
        {messages.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center">
            <div className="mb-2 text-4xl">✨</div>
            <h3 className="text-xl font-semibold text-white">Open Devesh AI</h3>
            <p className="mt-2 text-slate-300">Choose a model or Auto mode, then ask your first question.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl p-4 ${
                  message.role === 'user' ? 'bg-blue-500 text-white' : 'border border-slate-700 bg-slate-900 text-slate-50'
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.2em] opacity-80">
                  <span>{message.role === 'user' ? 'You' : message.modelId ?? 'Devesh AI'}</span>
                  <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div
                  className="message-markdown text-sm leading-7"
                  dangerouslySetInnerHTML={{ __html: renderMarkdownText(message.content || '…') }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-slate-800 bg-slate-950/70 p-3 md:p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-300">
          <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-1">Model: {selectedModelId}</span>
          <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-1">Mode: {mode}</span>
          {isStreaming ? <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-200">Streaming…</span> : null}
        </div>

        <Composer onSendMessage={onSendMessage} disabled={isStreaming} />
      </div>
    </div>
  );
}

function Composer({
  onSendMessage,
  disabled,
}: {
  onSendMessage: (content: string) => Promise<void> | void;
  disabled: boolean;
}) {
  const [value, setValue] = useState('');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!value.trim() || disabled) return;
    onSendMessage(value);
    setValue('');
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-700 bg-slate-900 p-2 md:p-3">
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={4}
        placeholder="Ask Devesh to build, research, write, or reason…"
        className="w-full resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-500"
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-xs text-slate-400">
          <button type="button" className="rounded-lg border border-slate-700 px-2 py-1">Attach file</button>
          <button type="button" className="rounded-lg border border-slate-700 px-2 py-1">Upload image</button>
          <button type="button" className="rounded-lg border border-slate-700 px-2 py-1">Compare</button>
        </div>

        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disabled ? 'Generating…' : 'Send'}
        </button>
      </div>
    </form>
  );
}
