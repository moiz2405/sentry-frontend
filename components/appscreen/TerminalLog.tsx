"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { backendAPI, type Log } from "@/lib/api/backend-api";

interface TerminalLogProps {
  appId: string;
  userId: string;
}

type ViewMode = "clean" | "raw";

const LEVEL_COLORS: Record<string, string> = {
  INFO: "text-green-400",
  DEBUG: "text-blue-400",
  WARNING: "text-yellow-400",
  ERROR: "text-red-400",
  CRITICAL: "text-red-500",
};

const LEVEL_BG: Record<string, string> = {
  ERROR: "bg-red-950/40",
  CRITICAL: "bg-red-950/60",
  WARNING: "bg-yellow-950/30",
};

const POLL_MS = 3000;
const MAX_LOGS = 200;

export function TerminalLog({ appId, userId }: TerminalLogProps) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [mode, setMode] = useState<ViewMode>("clean");
  const seenIds = useRef<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const isAtBottom = useRef(true);

  const fetchLogs = useCallback(async () => {
    try {
      const { logs: incoming } = await backendAPI.getLogs(appId, userId, { limit: 50 });
      const newLogs = incoming.filter((l) => !seenIds.current.has(l.id));
      if (newLogs.length === 0) return;
      newLogs.forEach((l) => seenIds.current.add(l.id));
      setLogs((prev) => {
        const combined = [...prev, ...newLogs].sort(
          (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
        );
        return combined.slice(-MAX_LOGS);
      });
    } catch {
      // silently ignore fetch errors
    }
  }, [appId, userId]);

  useEffect(() => {
    fetchLogs();
    const id = setInterval(fetchLogs, POLL_MS);
    return () => clearInterval(id);
  }, [fetchLogs]);

  useEffect(() => {
    const el = containerRef.current;
    if (el && isAtBottom.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [logs]);

  function handleScroll() {
    const el = containerRef.current;
    if (!el) return;
    isAtBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
  }

  function formatTime(iso: string) {
    try {
      return new Date(iso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch {
      return iso;
    }
  }

  return (
    <div className="flex flex-col h-full px-4 pt-3 pb-2 gap-2">
      {/* header */}
      <div className="flex items-center justify-between shrink-0">
        <span className="text-sm font-semibold text-zinc-300">Live Logs</span>
        <div className="flex items-center gap-0.5 bg-zinc-900 border border-zinc-800 rounded-md p-0.5">
          <button
            type="button"
            onClick={() => setMode("clean")}
            className={`px-2.5 py-0.5 text-xs rounded font-medium transition-colors ${
              mode === "clean"
                ? "bg-zinc-700 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Clean
          </button>
          <button
            type="button"
            onClick={() => setMode("raw")}
            className={`px-2.5 py-0.5 text-xs rounded font-medium transition-colors ${
              mode === "raw"
                ? "bg-zinc-700 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Raw
          </button>
        </div>
      </div>

      {/* log body */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto font-mono text-xs bg-black/40 border border-zinc-800 rounded-lg p-3"
        style={{ scrollbarWidth: "none" }}
      >
        {logs.length === 0 ? (
          <span className="text-zinc-600">Waiting for logs…</span>
        ) : mode === "raw" ? (
          logs.map((log) => (
            <div key={log.id} className="leading-5 text-zinc-400 break-all">
              {log.raw || log.message}
            </div>
          ))
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`flex flex-row flex-wrap items-baseline gap-x-2 leading-5 rounded px-1 -mx-1 ${LEVEL_BG[log.level] ?? ""}`}
            >
              <span className="text-zinc-600 shrink-0">{formatTime(log.logged_at)}</span>
              <span className={`font-bold shrink-0 w-[4.5rem] ${LEVEL_COLORS[log.level] ?? "text-zinc-400"}`}>
                {log.level}
              </span>
              {log.service && (
                <span className="text-blue-400 shrink-0">[{log.service}]</span>
              )}
              <span className="text-zinc-200 break-all">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
