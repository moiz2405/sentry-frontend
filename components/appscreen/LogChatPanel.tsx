"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { IconSend, IconBolt, IconLoader2, IconTrash } from "@tabler/icons-react";
import { backendAPI } from "@/lib/api/backend-api";

// ─── Lightweight inline markdown renderer ─────────────────────────────────────
// Handles: ## headings, **bold**, `inline code`, ``` code blocks, - lists, line breaks
function MarkdownMessage({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={i} className="my-2 rounded-lg bg-zinc-950 border border-zinc-700 p-3 overflow-x-auto text-xs font-mono text-zinc-200">
          {lang && <span className="block text-zinc-500 mb-1 text-[10px] uppercase tracking-wider">{lang}</span>}
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      i++;
      continue;
    }

    // ## Heading
    if (line.startsWith("## ")) {
      elements.push(
        <h3 key={i} className="mt-3 mb-1 text-sm font-bold text-zinc-100">
          {inlineMarkdown(line.slice(3))}
        </h3>
      );
      i++;
      continue;
    }

    // ### Subheading
    if (line.startsWith("### ")) {
      elements.push(
        <h4 key={i} className="mt-2 mb-0.5 text-sm font-semibold text-zinc-200">
          {inlineMarkdown(line.slice(4))}
        </h4>
      );
      i++;
      continue;
    }

    // Bullet list item  (- or *)
    if (/^[\-\*] /.test(line)) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && /^[\-\*] /.test(lines[i])) {
        listItems.push(
          <li key={i} className="ml-4 list-disc text-zinc-200">
            {inlineMarkdown(lines[i].slice(2))}
          </li>
        );
        i++;
      }
      elements.push(<ul key={`ul-${i}`} className="my-1 space-y-0.5">{listItems}</ul>);
      continue;
    }

    // Numbered list
    if (/^\d+\. /.test(line)) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        const text = lines[i].replace(/^\d+\. /, "");
        listItems.push(
          <li key={i} className="ml-4 list-decimal text-zinc-200">
            {inlineMarkdown(text)}
          </li>
        );
        i++;
      }
      elements.push(<ol key={`ol-${i}`} className="my-1 space-y-0.5">{listItems}</ol>);
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={i} className="my-2 border-zinc-700" />);
      i++;
      continue;
    }

    // Empty line → spacing
    if (line.trim() === "") {
      elements.push(<div key={i} className="h-1.5" />);
      i++;
      continue;
    }

    // Normal paragraph
    elements.push(
      <p key={i} className="leading-relaxed text-zinc-200">
        {inlineMarkdown(line)}
      </p>
    );
    i++;
  }

  return <div className="text-sm space-y-0.5">{elements}</div>;
}

function inlineMarkdown(text: string): React.ReactNode[] {
  // Split on **bold**, *italic*, `code`
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={idx} className="font-semibold text-zinc-100">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={idx} className="italic text-zinc-300">{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={idx} className="px-1 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-xs font-mono text-blue-300">{part.slice(1, -1)}</code>;
    return <span key={idx}>{part}</span>;
  });
}
// ──────────────────────────────────────────────────────────────────────────────

type Role = "user" | "assistant";
interface StoredMessage { role: Role; content: string; ts: string }

const SUGGESTIONS = [
  "Why is my app throwing errors?",
  "Which service is most at risk right now?",
  "What happened in the last hour?",
  "Trace the root cause of the latest failure",
  "Are there any cascading failures between services?",
];

interface LogChatPanelProps { appId: string }

export function LogChatPanel({ appId }: LogChatPanelProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [logsAnalyzed, setLogsAnalyzed] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Load persisted history on mount ──────────────────────────────
  const loadHistory = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) return;
    setLoadingHistory(true);
    try {
      const res = await backendAPI.getChat(appId, userId);
      setMessages(res.messages ?? []);
    } catch {
      // silently ignore — first visit or table not created yet
    } finally {
      setLoadingHistory(false);
    }
  }, [appId, session?.user?.id]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ── Send message ──────────────────────────────────────────────────
  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const userId = session?.user?.id;
    if (!userId) return;

    // Optimistically add user message
    const userMsg: StoredMessage = { role: "user", content: trimmed, ts: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await backendAPI.chat(appId, userId, trimmed);
      const assistantMsg: StoredMessage = {
        role: "assistant",
        content: res.answer,
        ts: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setLogsAnalyzed(res.logs_analyzed);
    } catch (err: unknown) {
      const detail = err instanceof Error ? err.message : "Chat failed";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${detail}`, ts: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  // ── Clear history ─────────────────────────────────────────────────
  async function handleClear() {
    const userId = session?.user?.id;
    if (!userId || clearing) return;
    setClearing(true);
    try {
      await backendAPI.clearChat(appId, userId);
      setMessages([]);
      setLogsAnalyzed(null);
    } finally {
      setClearing(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-220px)] min-h-[500px]">
      {/* ── Header ────────────────────────────────────── */}
      {!isEmpty && (
        <div className="flex items-center justify-between px-1 pb-2 border-b border-zinc-800">
          <span className="text-xs text-zinc-500">
            {logsAnalyzed !== null && <>Analyzing <span className="text-zinc-400 font-medium">{logsAnalyzed}</span> log entries</>}
          </span>
          <button
            type="button"
            onClick={handleClear}
            disabled={clearing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded-md transition-colors disabled:opacity-40"
          >
            {clearing ? <IconLoader2 className="size-3 animate-spin" /> : <IconTrash className="size-3" />}
            Clear chat
          </button>
        </div>
      )}

      {/* ── Messages ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700">
        {loadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <IconLoader2 className="size-5 text-zinc-600 animate-spin" />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-5 pb-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 mb-3">
                <IconBolt className="size-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-100">Ask your logs</h3>
              <p className="text-sm text-zinc-400 mt-1 max-w-sm">
                Ask anything about your app's behavior. I'll analyze your recent logs and explain what's happening.
              </p>
            </div>
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
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="shrink-0 w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mt-0.5">
                    <IconBolt className="size-3.5 text-blue-400" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm text-sm"
                      : "bg-zinc-800/80 border border-zinc-700 rounded-bl-sm"
                  }`}
                >
                  {msg.role === "user" ? (
                    <span className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</span>
                  ) : (
                    <MarkdownMessage content={msg.content} />
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="shrink-0 w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <IconLoader2 className="size-3.5 text-blue-400 animate-spin" />
                </div>
                <div className="bg-zinc-800/80 border border-zinc-700 rounded-2xl rounded-bl-sm px-4 py-3">
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

      {/* ── Input ────────────────────────────────────── */}
      <div className="border-t border-zinc-800 pt-3 pb-1 space-y-2">
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
            {loading ? <IconLoader2 className="size-4 text-white animate-spin" /> : <IconSend className="size-4 text-white" />}
          </button>
        </div>
        <p className="text-xs text-zinc-600">Enter to send · Shift+Enter for newline · History saved automatically</p>
      </div>
    </div>
  );
}
