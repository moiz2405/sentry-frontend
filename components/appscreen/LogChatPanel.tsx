"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  IconSend,
  IconBolt,
  IconLoader2,
  IconTrash,
  IconMessageCircle,
  IconChevronRight,
  IconSparkles,
  IconAlertTriangle,
  IconClock,
  IconSearch,
} from "@tabler/icons-react";
import { backendAPI } from "@/lib/api/backend-api";
import { cn } from "@/lib/utils";

// ─── Lightweight inline markdown renderer ─────────────────────────────────────
function MarkdownMessage({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

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

    if (line.startsWith("## ")) {
      elements.push(
        <h3 key={i} className="mt-3 mb-1 text-sm font-bold text-zinc-100">
          {inlineMarkdown(line.slice(3))}
        </h3>
      );
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h4 key={i} className="mt-2 mb-0.5 text-sm font-semibold text-zinc-200">
          {inlineMarkdown(line.slice(4))}
        </h4>
      );
      i++;
      continue;
    }

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

    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={i} className="my-2 border-zinc-700" />);
      i++;
      continue;
    }

    if (line.trim() === "") {
      elements.push(<div key={i} className="h-1.5" />);
      i++;
      continue;
    }

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

// ─── Suggestion groups ────────────────────────────────────────────────────────
const SUGGESTION_GROUPS = [
  {
    label: "Health & Status",
    icon: IconSparkles,
    color: "text-blue-400",
    items: [
      "Is my app healthy right now?",
      "Which service is most at risk?",
      "Give me a health summary of all services",
    ],
  },
  {
    label: "Error Analysis",
    icon: IconAlertTriangle,
    color: "text-red-400",
    items: [
      "Why is my app throwing errors?",
      "What are the most common error types?",
      "Trace the root cause of the latest failure",
    ],
  },
  {
    label: "Recent Activity",
    icon: IconClock,
    color: "text-amber-400",
    items: [
      "What happened in the last hour?",
      "Show me the most recent critical events",
      "When did the last incident start?",
    ],
  },
  {
    label: "Patterns",
    icon: IconSearch,
    color: "text-emerald-400",
    items: [
      "Are there cascading failures between services?",
      "Do errors spike at certain times?",
      "Which errors keep repeating?",
    ],
  },
];

interface LogChatPanelProps { appId: string }

export function LogChatPanel({ appId }: LogChatPanelProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [clearing, setClearing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const loadHistory = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) return;
    setLoadingHistory(true);
    try {
      const res = await backendAPI.getChat(appId, userId);
      setMessages(res.messages ?? []);
    } catch {
      // silently ignore
    } finally {
      setLoadingHistory(false);
    }
  }, [appId, session?.user?.id]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const userId = session?.user?.id;
    if (!userId) return;

    const userMsg: StoredMessage = { role: "user", content: trimmed, ts: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setStreamingContent("");

    try {
      const response = await backendAPI.streamChat(appId, userId, trimmed);
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setStreamingContent(accumulated);
      }
      accumulated += decoder.decode();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: accumulated, ts: new Date().toISOString() },
      ]);
    } catch (err: unknown) {
      const detail = err instanceof Error ? err.message : "Chat failed";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${detail}`, ts: new Date().toISOString() },
      ]);
    } finally {
      setStreamingContent("");
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  async function handleClear() {
    const userId = session?.user?.id;
    if (!userId || clearing) return;
    setClearing(true);
    try {
      await backendAPI.clearChat(appId, userId);
      setMessages([]);
    } finally {
      setClearing(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-[calc(100vh-160px)] min-h-0 border-t border-zinc-800">

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside className="w-60 shrink-0 hidden md:flex flex-col border-r border-zinc-800/80 bg-zinc-950">

        {/* Sidebar header */}
        <div className="px-4 pt-4 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-md bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
              <IconBolt className="size-3.5 text-blue-400" />
            </div>
            <span className="text-sm font-semibold text-zinc-100">Log Intelligence</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1.5 leading-relaxed">
            Ask anything about your app. Powered by your live log data.
          </p>
        </div>

        {/* Suggestion groups */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 min-h-0">
          {SUGGESTION_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="flex items-center gap-1.5 px-2 mb-1.5">
                <group.icon className={cn("size-3", group.color)} />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{group.label}</span>
              </div>
              <div className="space-y-0.5">
                {group.items.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    disabled={loading}
                    className="group w-full flex items-start gap-2 text-left px-2.5 py-2 rounded-lg hover:bg-zinc-800/70 transition-colors disabled:opacity-40"
                  >
                    <IconChevronRight className="size-3 text-zinc-600 group-hover:text-zinc-400 shrink-0 mt-0.5 transition-colors" />
                    <span className="text-xs text-zinc-400 group-hover:text-zinc-200 leading-snug transition-colors">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar footer: stats + clear */}
        <div className="px-3 py-3 border-t border-zinc-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <IconMessageCircle className="size-3.5 text-zinc-600" />
              <span className="text-xs text-zinc-600">
                {messages.length} {messages.length === 1 ? "message" : "messages"}
              </span>
            </div>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                disabled={clearing}
                className="flex items-center gap-1 text-xs text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-40 px-1.5 py-1 rounded hover:bg-red-950/30"
              >
                {clearing
                  ? <IconLoader2 className="size-3 animate-spin" />
                  : <IconTrash className="size-3" />
                }
                Clear
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main chat area ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 min-h-0">
          {loadingHistory ? (
            <div className="flex items-center justify-center h-full">
              <IconLoader2 className="size-5 text-zinc-600 animate-spin" />
            </div>
          ) : isEmpty ? (
            /* Empty state — no suggestions here, they're in the sidebar */
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="size-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <IconBolt className="size-7 text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-100">Ask your logs anything</h3>
                <p className="text-sm text-zinc-500 mt-1 max-w-xs">
                  Type a question or pick a suggestion from the sidebar to get started.
                </p>
              </div>
              {/* Mobile quick suggestions */}
              <div className="md:hidden flex flex-col gap-2 w-full max-w-sm mt-2">
                {SUGGESTION_GROUPS[0].items.concat(SUGGESTION_GROUPS[1].items).slice(0, 4).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="text-left px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-sm text-zinc-300 transition-colors"
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
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="shrink-0 size-7 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center mt-1">
                      <IconBolt className="size-3.5 text-blue-400" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[78%] rounded-2xl px-4 py-3",
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-sm"
                        : "bg-zinc-800/60 border border-zinc-700/80 rounded-tl-sm"
                    )}
                  >
                    {msg.role === "user" ? (
                      <span className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</span>
                    ) : (
                      <MarkdownMessage content={msg.content} />
                    )}
                    <p className={cn(
                      "text-[10px] mt-1.5",
                      msg.role === "user" ? "text-blue-200/70 text-right" : "text-zinc-600"
                    )}>
                      {new Date(msg.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Streaming bubble */}
              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="shrink-0 size-7 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center mt-1">
                    <IconBolt className="size-3.5 text-blue-400" />
                  </div>
                  <div className="max-w-[78%] bg-zinc-800/60 border border-zinc-700/80 rounded-2xl rounded-tl-sm px-4 py-3">
                    {streamingContent ? (
                      <span className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
                        {streamingContent}
                        <span className="inline-block w-0.5 h-[1em] ml-0.5 bg-blue-400 align-middle animate-pulse" />
                      </span>
                    ) : (
                      <div className="flex gap-1 items-center h-5">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:300ms]" />
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* ── Input bar ───────────────────────────────────────────── */}
        <div className="border-t border-zinc-800/80 px-4 py-3 bg-zinc-950/50">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about errors, root causes, anomalies…"
              rows={1}
              className="flex-1 resize-none rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/30 transition-colors max-h-32 overflow-y-auto"
              style={{ minHeight: "40px" }}
            />
            <button
              type="button"
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="shrink-0 size-10 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              {loading
                ? <IconLoader2 className="size-4 text-white animate-spin" />
                : <IconSend className="size-4 text-white" />
              }
            </button>
          </div>
          <p className="text-[11px] text-zinc-600 mt-1.5">
            Enter to send · Shift+Enter for newline
          </p>
        </div>
      </div>
    </div>
  );
}
