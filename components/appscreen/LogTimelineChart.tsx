"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { IconLoader2, IconRefresh } from "@tabler/icons-react";
import { backendAPI, type TimelineBucket } from "@/lib/api/backend-api";

type Window = "1h" | "6h" | "24h" | "7d";

const WINDOWS: { value: Window; label: string }[] = [
  { value: "1h",  label: "1h"  },
  { value: "6h",  label: "6h"  },
  { value: "24h", label: "24h" },
  { value: "7d",  label: "7d"  },
];

// ── Custom tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs shadow-lg">
      <p className="mb-1.5 font-medium text-zinc-300">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-zinc-400 capitalize">{p.name}:</span>
          <span className="font-semibold text-zinc-100">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface LogTimelineChartProps {
  appId: string;
}

export function LogTimelineChart({ appId }: LogTimelineChartProps) {
  const { data: session } = useSession();
  const [window, setWindow]     = useState<Window>("1h");
  const [buckets, setBuckets]   = useState<TimelineBucket[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch = useCallback(async (silent = false) => {
    const userId = session?.user?.id;
    if (!userId) return;
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const res = await backendAPI.getTimeline(appId, userId, window);
      setBuckets(res.buckets ?? []);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [appId, session?.user?.id, window]);

  // Refetch when window changes
  useEffect(() => { fetch(); }, [fetch]);

  // Auto-refresh every 30 s
  useEffect(() => {
    timerRef.current = setInterval(() => fetch(true), 30_000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [fetch]);

  // Summary stats
  const totalLogs   = buckets.reduce((s, b) => s + b.total, 0);
  const totalErrors = buckets.reduce((s, b) => s + b.errors, 0);
  const peakErrors  = Math.max(...buckets.map((b) => b.errors), 0);
  const errorRate   = totalLogs ? ((totalErrors / totalLogs) * 100).toFixed(1) : "0.0";

  const hasData = buckets.some((b) => b.total > 0);

  return (
    <div className="flex flex-col h-full bg-[oklch(0.205_0_0)] rounded-xl border border-zinc-800 p-4 gap-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold text-zinc-200">Log Timeline</h3>
          {!loading && hasData && (
            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <span><span className="text-zinc-300 font-medium">{totalLogs}</span> logs</span>
              <span><span className="text-red-400 font-medium">{totalErrors}</span> errors</span>
              <span><span className="text-zinc-400 font-medium">{errorRate}%</span> error rate</span>
              {peakErrors > 0 && (
                <span><span className="text-orange-400 font-medium">{peakErrors}</span> peak</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Window selector */}
          <div className="flex items-center rounded-lg border border-zinc-700 bg-zinc-800/60 overflow-hidden text-xs">
            {WINDOWS.map((w) => (
              <button
                key={w.value}
                type="button"
                onClick={() => setWindow(w.value)}
                className={`px-2.5 py-1.5 transition-colors ${
                  window === w.value
                    ? "bg-zinc-700 text-zinc-100 font-medium"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => fetch(true)}
            disabled={refreshing || loading}
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors disabled:opacity-40"
          >
            {refreshing
              ? <IconLoader2 className="size-3.5 animate-spin" />
              : <IconRefresh className="size-3.5" />}
          </button>
        </div>
      </div>

      {/* Chart area */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <IconLoader2 className="size-5 text-zinc-600 animate-spin" />
          </div>
        ) : !hasData ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-zinc-600">No logs in this window yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={buckets} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#71717a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#71717a" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="gradWarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="gradErrors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f87171" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0}   />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} stroke="#27272a" strokeDasharray="3 3" />

              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "#52525b" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#52525b" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={28}
              />

              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#3f3f46", strokeWidth: 1 }} />

              {/* Total — dimmest, furthest back */}
              <Area
                dataKey="total"
                name="total"
                type="monotone"
                stroke="#71717a"
                strokeWidth={1.5}
                fill="url(#gradTotal)"
                dot={false}
                activeDot={{ r: 3, fill: "#a1a1aa" }}
              />

              {/* Warnings */}
              <Area
                dataKey="warnings"
                name="warnings"
                type="monotone"
                stroke="#f59e0b"
                strokeWidth={1.5}
                fill="url(#gradWarnings)"
                dot={false}
                activeDot={{ r: 3, fill: "#fbbf24" }}
              />

              {/* Errors — most prominent */}
              <Area
                dataKey="errors"
                name="errors"
                type="monotone"
                stroke="#f87171"
                strokeWidth={2}
                fill="url(#gradErrors)"
                dot={false}
                activeDot={{ r: 4, fill: "#ef4444" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      {!loading && hasData && (
        <div className="flex items-center gap-4 text-[10px] text-zinc-500 shrink-0">
          <LegendDot color="#71717a" label="Total" />
          <LegendDot color="#f59e0b" label="Warnings" />
          <LegendDot color="#f87171" label="Errors" />
        </div>
      )}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
