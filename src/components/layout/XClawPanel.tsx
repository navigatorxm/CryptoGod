'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, X, Send, Trash2, Sparkles, Loader2, ChevronDown } from 'lucide-react';
import { useXClawStore, useWalletStore, useUIStore } from '@/store';
import toast from 'react-hot-toast';

const QUICK_PROMPTS = [
  'Analyze my portfolio and suggest strategies',
  'What are the current market conditions?',
  'Help me understand gas optimization',
  'Explain token liquidity depth',
  'How do I add liquidity to my token?',
];

export default function XClawPanel() {
  const { panelOpen, messages, togglePanel, addMessage, updateLastAssistantMessage, clearMessages } =
    useXClawStore();
  const { address, connected } = useWalletStore();
  const { activeNetwork } = useUIStore();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuick, setShowQuick] = useState(messages.length === 0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (panelOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setShowQuick(messages.length === 0);
    }
  }, [panelOpen, messages.length]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      setInput('');
      setShowQuick(false);
      addMessage({ role: 'user', content: trimmed });

      // Add placeholder for assistant
      addMessage({ role: 'assistant', content: '', streaming: true });
      setIsLoading(true);

      try {
        const res = await fetch('/api/xclaw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task: trimmed,
            context: {
              walletAddress: address ?? null,
              connected,
              activeNetwork,
              timestamp: new Date().toISOString(),
            },
          }),
          signal: AbortSignal.timeout(60000),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Request failed' }));
          updateLastAssistantMessage(
            (err as { error?: string }).error ?? 'Request failed',
            false
          );
          return;
        }

        const contentType = res.headers.get('content-type') ?? '';

        if (contentType.includes('text/event-stream') || res.body) {
          // Stream response token by token
          const reader = res.body!.getReader();
          const decoder = new TextDecoder();
          let accumulated = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            // Handle NDJSON or plain text chunks
            for (const line of chunk.split('\n')) {
              const l = line.trim();
              if (!l) continue;
              // SSE data prefix
              if (l.startsWith('data: ')) {
                const data = l.slice(6);
                if (data === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(data) as { text?: string; result?: string; output?: string };
                  accumulated += parsed.text ?? parsed.result ?? parsed.output ?? '';
                } catch {
                  accumulated += data;
                }
              } else {
                try {
                  const parsed = JSON.parse(l) as { text?: string; result?: string; output?: string };
                  accumulated += parsed.text ?? parsed.result ?? parsed.output ?? '';
                } catch {
                  accumulated += l;
                }
              }
            }
            updateLastAssistantMessage(accumulated, true);
          }
          updateLastAssistantMessage(accumulated || 'Done.', false);
        } else {
          const json = await res.json() as { result?: string; output?: string; response?: string; text?: string };
          const reply =
            json.result ?? json.output ?? json.response ?? json.text ?? JSON.stringify(json, null, 2);
          updateLastAssistantMessage(reply, false);
        }
      } catch (err) {
        const msg =
          err instanceof Error && err.name === 'TimeoutError'
            ? 'Request timed out. X-Claw may be offline.'
            : `Error: ${err instanceof Error ? err.message : 'Unknown error'}`;
        updateLastAssistantMessage(msg, false);
        toast.error('X-Claw connection failed');
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, address, connected, activeNetwork, addMessage, updateLastAssistantMessage]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={togglePanel}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl border shadow-2xl transition-all duration-300 hover:scale-105 ${
          panelOpen
            ? 'border-purple-400/40 bg-purple-500/20 text-purple-300 shadow-purple-500/20'
            : 'border-cyan-400/30 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 text-cyan-300 shadow-cyan-500/10 hover:border-cyan-300/50'
        }`}
        aria-label="Toggle X-Claw AI Assistant"
      >
        {panelOpen ? <X size={20} /> : <Bot size={22} />}
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
      </button>

      {/* Slide-in panel */}
      <div
        className={`fixed inset-y-0 right-0 z-40 flex w-full flex-col border-l border-white/10 shadow-2xl transition-transform duration-300 ease-in-out sm:w-[420px] ${
          panelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background:
            'linear-gradient(180deg, rgba(8,12,22,0.97) 0%, rgba(6,9,18,0.98) 100%)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 text-cyan-300">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">X-Claw AI</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {isLoading ? (
                  <span className="flex items-center gap-1 text-cyan-300">
                    <Loader2 size={10} className="animate-spin" />
                    Thinking...
                  </span>
                ) : (
                  'Executive Assistant'
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={() => { clearMessages(); setShowQuick(true); }}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 text-muted-foreground transition-colors hover:border-red-400/20 hover:text-red-300"
                title="Clear chat"
              >
                <Trash2 size={14} />
              </button>
            )}
            <button
              onClick={togglePanel}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 text-muted-foreground transition-colors hover:border-white/20 hover:text-white"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
          {messages.length === 0 && showQuick && (
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                <div className="mb-2 text-sm font-semibold text-white">
                  👋 Welcome to X-Claw AI
                </div>
                <p className="text-xs text-muted-foreground">
                  Your executive crypto assistant. Ask me about markets, token strategies, contract
                  analysis, DeFi opportunities, or anything blockchain-related.
                </p>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Quick prompts
              </div>
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="w-full rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-left text-xs text-white/80 transition-all hover:border-cyan-400/20 hover:bg-cyan-400/5 hover:text-white"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-sm ${
                    msg.role === 'user'
                      ? 'border-purple-400/20 bg-purple-400/10 text-purple-300'
                      : 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300'
                  }`}
                >
                  {msg.role === 'user' ? '👤' : <Bot size={14} />}
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'rounded-tr-sm border border-purple-400/20 bg-purple-500/10 text-white'
                      : 'rounded-tl-sm border border-white/5 bg-white/[0.03] text-white/90'
                  }`}
                >
                  {msg.streaming && !msg.content ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 size={12} className="animate-spin" />
                      <span className="text-xs">Analyzing...</span>
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {msg.content}
                      {msg.streaming && <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-cyan-400" />}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2 focus-within:border-cyan-400/30">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask X-Claw anything about crypto, markets, or your tokens..."
              rows={1}
              className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-white placeholder:text-muted-foreground/60 focus:outline-none"
              style={{ maxHeight: '120px' }}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = 'auto';
                t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 text-white shadow-lg transition-all hover:opacity-90 disabled:opacity-40"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
          <div className="mt-2 text-center text-[10px] text-muted-foreground/50">
            Powered by X-Claw · Press Enter to send · Shift+Enter for newline
          </div>
        </div>
      </div>

      {/* Backdrop on mobile */}
      {panelOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm sm:hidden"
          onClick={togglePanel}
          aria-hidden="true"
        />
      )}
    </>
  );
}
