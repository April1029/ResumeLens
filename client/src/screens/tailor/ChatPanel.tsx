import { useEffect, useRef, useState } from 'react';
import type { Fact, Requirement } from '../../types';
import { Button, Chip, PRESSABLE } from '../../components/ui';

export interface ChatMessage {
  role: 'assistant' | 'user';
  text: string;
  fact?: Fact;
  suggestionId?: string;
}

interface Props {
  req: Requirement | undefined;
  messages: ChatMessage[];
  quickReplies: string[];
  onSend: (text: string) => void;
  onOpenSuggestion: (id: string) => void;
}

export function ChatPanel({ req, messages, quickReplies, onSend, onOpenSuggestion }: Props) {
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const send = (t: string) => {
    if (!t.trim()) return;
    onSend(t.trim());
    setText('');
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b-2 border-ink bg-blue-soft px-4 py-2.5 text-sm">
        {req ? (
          <span>
            About: <strong>{req.short}</strong>
          </span>
        ) : (
          <span className="text-slate-500">Select a requirement on the left to chat about it</span>
        )}
        <p className="text-xs text-slate-700">Chat can save facts and create suggestion cards. It never edits your resume directly.</p>
      </div>
      <div className="flex-1 space-y-3 overflow-auto p-4" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : ''}>
            <div className={`max-w-[90%] rounded-2xl border-2 border-ink px-3 py-2 text-sm ${m.role === 'user' ? 'rounded-br-md bg-accent-soft' : 'rounded-bl-md bg-paper'}`}>
              {m.text}
              {m.fact && (
                <div className="mt-2 rounded-xl border-2 border-ink bg-bank-soft p-2 text-ink">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Chip className="bg-bank">{m.fact.id}</Chip> Saved to your fact bank
                  </div>
                  <p className="mt-1 text-sm font-medium">{m.fact.title}</p>
                  <ul className="ml-4 list-disc text-xs text-slate-600">
                    {m.fact.details.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
              {m.suggestionId && (
                <Button size="sm" variant="primary" className="mt-2" onClick={() => onOpenSuggestion(m.suggestionId!)}>
                  Review the new suggestion →
                </Button>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="border-t border-ink p-3">
        {quickReplies.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {quickReplies.map((q) => (
              <button key={q} className={`rounded-full bg-accent-soft px-3 py-1 text-left text-xs font-bold ${PRESSABLE}`} onClick={() => send(q)}>
                Demo: “{q}”
              </button>
            ))}
          </div>
        )}
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(text);
          }}
        >
          <input
            aria-label="Message"
            className="flex-1 rounded-lg border border-ink px-3 py-2 text-sm"
            placeholder={req ? `Tell me about real experience with ${req.short}…` : 'Select a requirement first'}
            value={text}
            disabled={!req}
            onChange={(e) => setText(e.target.value)}
          />
          <Button type="submit" variant="primary" disabled={!req || !text.trim()}>Send</Button>
        </form>
      </div>
    </div>
  );
}
