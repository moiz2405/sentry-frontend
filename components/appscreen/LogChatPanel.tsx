"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { IconSend, IconBolt, IconLoader2 } from "@tabler/icons-react";
import { backendAPI } from "@/lib/api/backend-api";

type Role = "user" | "assistant";
interface Message {
  role: Role;
  content: string;
}

const SUGGESTIONS = [
  "Why is my app throwing errors?",
  "Which service is most at risk right now?",
  "What happened in the last hour?",
  "Trace the root cause of the latest failure",
  "Are there any cascading failures?",
];

interface LogChatPanelProps {
  appId: string;
}

export function LogChatPanel({ appId }: LogChatPanelProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [logsAnalyzed, setLogsAnalyzed] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const userId = session?.user?.id;
    if (!userId) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await backendAPI.chat(appId, userId, trimmed, messages);
      setMessages([...next, { role: "assistant", content: res.answer }]);
      setLogsAnalyzed(res.logs_analyzed);
    } catch (err: unknown) {
      const detail = err instanceof Error ? err.message : "Chat failed";
      setMessages([
        ...next,
        { role: "assistant", content: `⚠️ ${detail}` },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-220px)] min-h-[500px]">
      {/* ── Messages area ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 pb-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 mb-3">
                <IconBolt className="size-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-100">Ask your logs</h3>
              <p className="text-sm text-zinc-400 mt-1 max-w-sm">
                Ask anything about your app's behavior. I analyze your recent logs and explain what's happening.
              </p>
            </div>
            {/* Quick suggestions */}
            <div className="flex flex-col gap-2 w-full max-w-lg">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="text-left px-4 py-2.5 rounded-lg border border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800 hover:border-zinc-600 text-sm text-zinc-300 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="shrink-0 w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mt-0.5">
                    <IconBolt className="size-3.5 text-blue-400" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="shrink-0 w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <IconLoader2 className="size-3.5 text-blue-400 animate-spin" />
                </div>
                <div className="bg-zinc-800 border border-zinc-700 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* ── Footer: log count + input ─────────────────── */}
      <div className="border-t border-zinc-800 px-4 pt-3 pb-4 space-y-2">
        {logsAnalyzed !== null && (
          <p className="text-xs text-zinc-500">
            Analyzing <span className="text-zinc-400 font-medium">{logsAnalyzed}</span> recent log entries
          </p>
        )}
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about errors, root causes, anomalies…"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-colors max-h-32 overflow-y-auto"
            style={{ minHeight: "44px" }}
          />
          <button
            type="button"
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="shrink-0 w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            {loading ? (
              <IconLoader2 className="size-4 text-white animate-spin" />
            ) : (
              <IconSend className="size-4 text-white" />
            )}
          </button>
        </div>
        <p className="text-xs text-zinc-600">Enter to send · Shift+Enter for newline</p>
      </div>
    </div>
  );
}
