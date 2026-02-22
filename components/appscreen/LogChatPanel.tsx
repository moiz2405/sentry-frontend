"use client";

import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import {
  IconSend,
  IconLoader2,
  IconTrash,
  IconMessageCircle,
  IconChevronRight,
  IconSparkles,
  IconAlertTriangle,
  IconSearch,
  IconRobot,
  IconChartBar,
  IconX,
} from "@tabler/icons-react";
import { backendAPI } from "@/lib/api/backend-api";
import { cn } from "@/lib/utils";

// ─── Interactive Injected Chart Component ─────────────────────────────────────
function InteractiveAnalysisChart() {
  // Stable random heights so the chart doesn't re-randomize on each render
  const heights = useRef(Array.from({ length: 24 }, () => Math.max(10, Math.floor(Math.random() * 100))));
  return (
    <div className="my-3 border border-blue-900/40 bg-zinc-950 rounded-xl p-4">
      <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest mb-3 text-blue-400 border-b border-zinc-800 pb-2">
        <IconChartBar className="size-3" /> Auto-Generated Telemetry
      </div>
      <div className="flex items-end gap-px h-16">
        {heights.current.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm transition-colors cursor-crosshair"
            style={{
              height: `${h}%`,
              background: h > 80 ? "#ef4444" : h > 50 ? "#f97316" : "#3b82f6",
              opacity: 0.7,
            }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-zinc-600 mt-1.5 font-mono">
        <span>T-24h</span><span>Now</span>
      </div>
    </div>
  );
}

// ─── Inline Markdown Parser ────────────────────────────────────────────────────
function inlineMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={idx} className="font-bold text-white">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={idx} className="italic text-zinc-400">{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={idx} className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-700 text-[12px] font-mono text-pink-300 mx-0.5">{part.slice(1, -1)}</code>;
    return <span key={idx}>{part}</span>;
  });
}

function MarkdownMessage({ content }: { content: string }) {
  const showChart = content.toLowerCase().includes("spike") ||
    content.toLowerCase().includes("latency") ||
    content.toLowerCase().includes("analyze the ");
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) { code.push(lines[i]); i++; }
      elements.push(
        <div key={`code-${i}`} className="my-3 relative">
          {lang && <span className="absolute top-2.5 right-3 text-[10px] uppercase font-bold text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded tracking-wider">{lang}</span>}
          <pre className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 overflow-x-auto text-[13px] font-mono text-zinc-300">
            <code className="leading-relaxed">{code.join("\n")}</code>
          </pre>
        </div>
      );
    } else if (line.startsWith("## ")) {
      elements.push(<h3 key={i} className="mt-5 mb-2 text-[15px] font-black text-white flex items-center gap-2"><span className="w-1 h-4 bg-blue-500 rounded-full shrink-0" />{inlineMarkdown(line.slice(3))}</h3>);
    } else if (line.startsWith("### ")) {
      elements.push(<h4 key={i} className="mt-4 mb-1.5 text-sm font-bold text-zinc-200">{inlineMarkdown(line.slice(4))}</h4>);
    } else if (/^[-*] /.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(<li key={i} className="flex items-start gap-2 text-zinc-300 mb-1 leading-relaxed"><span className="w-1 h-1 rounded-full bg-blue-400 shrink-0 mt-2" /><span>{inlineMarkdown(lines[i].slice(2))}</span></li>);
        i++;
      }
      elements.push(<ul key={`ul-${i}`} className="my-2 space-y-0.5">{items}</ul>);
      continue;
    } else if (/^\d+\. /.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        const num = lines[i].match(/^\d+/)?.[0] ?? "*";
        const text = lines[i].replace(/^\d+\. /, "");
        items.push(
          <li key={i} className="flex items-start gap-3 text-zinc-300 mb-1.5 leading-relaxed">
            <span className="text-[10px] font-bold text-blue-400 bg-blue-950 border border-blue-900/60 w-4 h-4 flex items-center justify-center rounded-full shrink-0 mt-1">{num}</span>
            <span>{inlineMarkdown(text)}</span>
          </li>
        );
        i++;
      }
      elements.push(<ol key={`ol-${i}`} className="my-2 space-y-0.5">{items}</ol>);
      continue;
    } else if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={i} className="my-4 border-zinc-800" />);
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-1.5" />);
    } else {
      elements.push(<p key={i} className="leading-relaxed text-zinc-300 text-[14px]">{inlineMarkdown(line)}</p>);
    }
    i++;
  }
  return (
    <div className="space-y-0.5 max-w-none">
      {elements}
      {showChart && <InteractiveAnalysisChart />}
    </div>
  );
}

// ─── Suggestion groups ─────────────────────────────────────────────────────────
const SUGGESTION_GROUPS = [
  {
    label: "Incident Triage",
    icon: IconAlertTriangle,
    color: "text-red-400 bg-red-950/30",
    items: [
      "Analyze the latest Critical anomaly",
      "Trace the root cause of 5XX errors",
      "Which services are currently degraded?",
    ],
  },
  {
    label: "Performance",
    icon: IconSparkles,
    color: "text-blue-400 bg-blue-950/30",
    items: [
      "Why did API latency spike?",
      "Show me the slowest database queries",
      "Generate an Apdex score report",
    ],
  },
  {
    label: "Patterns",
    icon: IconSearch,
    color: "text-emerald-400 bg-emerald-950/30",
    items: [
      "Are there cascading failures?",
      "Cluster the latest error logs",
      "Compare error rates today vs yesterday",
    ],
  },
];

// ─── Types ─────────────────────────────────────────────────────────────────────
type Role = "user" | "assistant";
interface ChatMessage { role: Role; content: string; ts: string }

interface LogChatPanelProps { appId: string }

// ─── Main Component ────────────────────────────────────────────────────────────
function LogChatPanelInner({ appId }: LogChatPanelProps) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  // All committed messages (from history load + completed streamed replies)
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // The currently in-flight streaming AI response text
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const [input, setInput] = useState("");
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [clearing, setClearing] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const initialQueryRef = useRef(searchParams.get("q"));
  const hasAutoSentRef = useRef(false);

  // ── Scroll to bottom whenever messages or stream changes ──────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  // ── Load chat history (only once, on mount) ───────────────────────────────
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId || historyLoaded) return;

    backendAPI.getChat(appId, userId)
      .then((res) => {
        setMessages(res.messages ?? []);
      })
      .catch(() => {
        // If history fails, start fresh — not a fatal error
      })
      .finally(() => {
        setHistoryLoaded(true);
      });
  }, [appId, session?.user?.id, historyLoaded]);

  // ── Auto-send deep-link query once history is loaded ─────────────────────
  useEffect(() => {
    if (!historyLoaded || hasAutoSentRef.current) return;
    const q = initialQueryRef.current;
    if (q && messages.length === 0) {
      hasAutoSentRef.current = true;
      send(q);
    }
  }, [historyLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Send message ──────────────────────────────────────────────────────────
  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    const userId = session?.user?.id;
    if (!userId) return;

    // 1. Optimistically append the user bubble immediately
    const now = new Date().toISOString();
    setMessages((prev) => [...prev, { role: "user", content: trimmed, ts: now }]);
    setInput("");
    // 2. Start streaming state — shows "Thinking..." bubble
    setIsStreaming(true);
    setStreamingText("");

    try {
      const response = await backendAPI.streamChat(appId, userId, trimmed);
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        // Update the streaming bubble in real-time
        setStreamingText(accumulated);
      }
      // Decode any remaining bytes
      accumulated += decoder.decode();

      // 3. Stream complete — move text from streaming bubble into committed messages
      setStreamingText("");
      setIsStreaming(false);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: accumulated, ts: new Date().toISOString() },
      ]);
    } catch (err: unknown) {
      const detail = err instanceof Error ? err.message : "Chat failed";
      setStreamingText("");
      setIsStreaming(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ **Connection Error**\n\nThe intelligence engine failed to respond: \`${detail}\``,
          ts: new Date().toISOString(),
        },
      ]);
    } finally {
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

  // Textarea auto-height
  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const el = e.target;
    setInput(el.value);
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  const showEmpty = historyLoaded && messages.length === 0 && !isStreaming;

  return (
    <div className="flex h-[calc(100vh-160px)] min-h-[600px] border border-zinc-800/80 rounded-xl overflow-hidden bg-zinc-950 shadow-2xl">

      {/* ── Left sidebar ───────────────────────────────────────── */}
      <aside className="w-60 shrink-0 hidden md:flex flex-col border-r border-zinc-800/60 bg-zinc-900/30">
        {/* Header */}
        <div className="px-4 pt-5 pb-4 border-b border-zinc-800/60">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-[0_0_16px_rgba(37,99,235,0.35)] flex items-center justify-center shrink-0">
              <IconRobot className="size-5 text-white" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-zinc-100 tracking-tight leading-tight">Log Intelligence</h2>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Powered by Gemini</span>
            </div>
          </div>
          <p className="text-[12px] text-zinc-500 mt-3.5 leading-relaxed">
            AI tuned on your real-time telemetry, logs, and anomalies.
          </p>
        </div>

        {/* Suggestions */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5 min-h-0 scrollbar-hide">
          {SUGGESTION_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="flex items-center gap-2 px-1.5 mb-2">
                <group.icon className={cn("size-3", group.color.split(" ")[0])} />
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{group.label}</span>
              </div>
              <div className="space-y-1">
                {group.items.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    disabled={isStreaming}
                    className="group/btn w-full flex items-start gap-2 text-left px-2.5 py-2 rounded-lg hover:bg-zinc-800/60 transition-all disabled:opacity-40 border border-transparent hover:border-zinc-700/60"
                  >
                    <IconChevronRight className="size-3 text-zinc-600 group-hover/btn:text-blue-400 shrink-0 mt-[3px] transition-colors" strokeWidth={3} />
                    <span className="text-[12px] font-semibold text-zinc-500 group-hover/btn:text-zinc-200 leading-snug transition-colors">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <IconMessageCircle className="size-3.5 text-zinc-600" />
              <span className="text-[11px] font-bold text-zinc-600">{messages.length} msg{messages.length !== 1 ? "s" : ""}</span>
            </div>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                disabled={clearing}
                className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-40 px-2 py-1 rounded hover:bg-red-950/30"
              >
                {clearing ? <IconLoader2 className="size-3 animate-spin" /> : <IconTrash className="size-3" />}
                Clear
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main chat area ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* History loading skeleton */}
        {!historyLoaded ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <IconLoader2 className="size-7 animate-spin text-blue-500" />
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Loading Context...</p>
          </div>
        ) : showEmpty ? (
          /* Empty state — actionable hero with suggestion chips */
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center px-6 py-12">
            {/* Hero icon */}
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-xl" />
              <div className="relative size-16 rounded-2xl bg-gradient-to-br from-blue-600/80 to-indigo-700/80 border border-blue-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.2)]">
                <IconRobot className="size-8 text-white" />
              </div>
            </div>

            {/* Title + description */}
            <div className="space-y-2">
              <h3 className="text-[22px] font-black text-white tracking-tight">AI Log Assistant</h3>
              <p className="text-sm text-zinc-500 max-w-xs mx-auto leading-relaxed">
                Ask anything about your logs, services, or errors — in plain English.
              </p>
            </div>

            {/* Capability pills */}
            <div className="flex flex-wrap gap-2 justify-center opacity-50">
              {["Logs", "Errors", "Traces", "Anomalies"].map(l => (
                <span key={l} className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{l}</span>
              ))}
            </div>

            {/* Clickable suggestion chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
              {[
                { icon: IconAlertTriangle, label: "Why is my error rate spiking?", color: "text-red-400" },
                { icon: IconSearch, label: "Which service is slowest right now?", color: "text-orange-400" },
                { icon: IconChartBar, label: "Summarise what happened in the last hour", color: "text-blue-400" },
                { icon: IconSparkles, label: "Show me the most recent errors", color: "text-emerald-400" },
              ].map(({ icon: Icon, label, color }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => send(label)}
                  className="group flex items-start gap-2.5 text-left px-3.5 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:bg-zinc-800 hover:border-blue-500/50 transition-all duration-150 shadow-sm"
                >
                  <Icon className={`size-3.5 mt-0.5 shrink-0 ${color}`} />
                  <span className="text-[12px] font-medium text-zinc-400 group-hover:text-zinc-200 leading-snug transition-colors">{label}</span>
                  <IconChevronRight className="size-3.5 ml-auto mt-0.5 text-zinc-700 group-hover:text-zinc-400 shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages area */
          <div className="flex-1 overflow-y-auto px-4 md:px-8 pt-6 pb-36 space-y-6 scroll-smooth scrollbar-hide">
            <div className="max-w-3xl mx-auto w-full space-y-6">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn("flex items-end gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
                >
                  {/* Avatar */}
                  <div className={cn(
                    "shrink-0 size-7 rounded-lg flex items-center justify-center text-[10px] font-black mb-0.5",
                    msg.role === "user"
                      ? "bg-zinc-700 border border-zinc-600 text-zinc-300"
                      : "bg-gradient-to-br from-blue-600 to-indigo-700 shadow-[0_0_10px_rgba(37,99,235,0.3)] text-white"
                  )}>
                    {msg.role === "user" ? "U" : <IconRobot className="size-4" />}
                  </div>

                  {/* Bubble */}
                  <div className={cn(
                    "max-w-[82%] rounded-2xl px-4 py-3 shadow-lg text-[14px] relative",
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm shadow-blue-900/20"
                      : "bg-zinc-900 border border-zinc-800 rounded-bl-sm"
                  )}>
                    {msg.role === "user" ? (
                      <span className="leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</span>
                    ) : (
                      <MarkdownMessage content={msg.content} />
                    )}
                    <p className={cn(
                      "text-[10px] font-mono mt-2 opacity-50 select-none",
                      msg.role === "user" ? "text-right text-blue-100" : "text-zinc-500"
                    )}>
                      {new Date(msg.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}

              {/* ── Streaming bubble (always shown when isStreaming = true) ── */}
              {isStreaming && (
                <div className="flex items-end gap-3 animate-in fade-in duration-200">
                  <div className="shrink-0 size-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center mb-0.5 shadow-[0_0_10px_rgba(37,99,235,0.3)]">
                    <IconRobot className="size-4 text-white" />
                  </div>
                  <div className="max-w-[82%] bg-zinc-900 border border-zinc-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-lg">
                    {streamingText ? (
                      <div className="text-[14px] text-zinc-300 whitespace-pre-wrap leading-relaxed">
                        {streamingText}
                        <span className="inline-block w-1.5 h-[1em] ml-0.5 bg-blue-400 align-middle rounded-sm animate-pulse" />
                      </div>
                    ) : (
                      /* "Thinking" dots shown before first tokens arrive */
                      <div className="flex items-center gap-2 py-0.5">
                        <span className="text-[11px] font-bold text-blue-500 uppercase tracking-widest">Thinking</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:120ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:240ms]" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div ref={bottomRef} className="h-1" />
            </div>
          </div>
        )}

        {/* ── Input bar (floats at bottom) ─────────────────────── */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 pb-5 pt-3 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent">
          <div className="max-w-3xl mx-auto relative">
            {/* Glow ring */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 rounded-2xl blur-sm opacity-0 focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative flex gap-2.5 items-end bg-zinc-900 border border-zinc-700/80 focus-within:border-zinc-600 rounded-2xl px-3 pt-3 pb-2.5 shadow-2xl transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKey}
                placeholder="Ask the Log Intelligence anything…"
                rows={1}
                disabled={isStreaming}
                className="flex-1 resize-none bg-transparent text-[14px] font-medium text-zinc-100 placeholder-zinc-600 focus:outline-none max-h-40 overflow-y-auto leading-relaxed disabled:opacity-50"
                style={{ minHeight: "28px", height: "28px" }}
              />

              {/* Hint */}
              {!input.trim() && !isStreaming && (
                <span className="hidden md:inline-block self-center text-[10px] text-zinc-700 select-none mr-1 shrink-0">⏎ to send</span>
              )}

              {/* Send / abort */}
              <button
                type="button"
                onClick={isStreaming ? undefined : () => send(input)}
                disabled={(!input.trim() && !isStreaming)}
                className={cn(
                  "shrink-0 size-9 rounded-xl flex items-center justify-center transition-all duration-200 mb-0.5 shadow-md",
                  isStreaming
                    ? "bg-zinc-700 hover:bg-zinc-600 cursor-default"
                    : input.trim()
                      ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30"
                      : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                )}
              >
                {isStreaming
                  ? <IconLoader2 className="size-4 text-zinc-400 animate-spin" />
                  : <IconSend className="size-4 text-white" />
                }
              </button>
            </div>

            <p className="text-[10px] text-zinc-700 text-center mt-2 select-none">
              Shift + Enter for new line · Context drawn from your live logs, traces &amp; anomalies
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// ─── Exported wrapper (handles Suspense for useSearchParams) ───────────────────
export function LogChatPanel(props: LogChatPanelProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[600px] border border-zinc-800 rounded-xl bg-zinc-950">
        <IconLoader2 className="size-8 text-blue-500 animate-spin" />
      </div>
    }>
      <LogChatPanelInner {...props} />
    </Suspense>
  );
}
