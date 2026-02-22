"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  IconAlertTriangle,
  IconAlertOctagon,
  IconInfoCircle,
  IconRefresh,
  IconLoader2,
  IconShieldCheck,
  IconFlame,
  IconChartBar,
  IconBug,
  IconGitMerge,
  IconEye,
  IconVolumeOff,
  IconMessageBolt,
  IconActivityHeartbeat
} from "@tabler/icons-react";
import { backendAPI, type Anomaly, type AnomalySeverity, type AnomalyType } from "@/lib/api/backend-api";
import Link from "next/link";

// ── Severity config ───────────────────────────────────────────────────────────

const SEVERITY: Record<AnomalySeverity, { label: string; badgeClass: string; dotClass: string }> = {
  critical: {
    label: "Critical",
    badgeClass: "bg-red-500/10 text-red-400 border-red-500/20",
    dotClass: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]",
  },
  high: {
    label: "High",
    badgeClass: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    dotClass: "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]",
  },
  medium: {
    label: "Medium",
    badgeClass: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    dotClass: "bg-yellow-500",
  },
  low: {
    label: "Low",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    dotClass: "bg-blue-500",
  },
};

// ── Type config ───────────────────────────────────────────────────────────────

const TYPE_META: Record<AnomalyType, { label: string; Icon: React.ElementType }> = {
  error_spike: { label: "Error Spike", Icon: IconFlame },
  volume_surge: { label: "Volume Surge", Icon: IconChartBar },
  new_error_pattern: { label: "New Signature", Icon: IconBug },
  cascade_failure: { label: "Cascade Failure", Icon: IconGitMerge },
};

// ── Time helper ───────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Advanced Mini Timeline ───────────────────────────────────────────────────

function MiniTimeline({ anomaly }: { anomaly: Anomaly }) {
  // Generate a contextual mini-graph based on anomaly type
  const bars = Array(20).fill(0).map((_, i) => {
    let h = Math.random() * 20 + 10;
    let isAnomalous = false;

    if (anomaly.type === 'error_spike' && i > 12) {
      h += 60 + Math.random() * 20;
      isAnomalous = true;
    } else if (anomaly.type === 'volume_surge' && i > 15) {
      h += 80;
      isAnomalous = true;
    } else if (anomaly.type === 'cascade_failure' && i > 10) {
      h = i < 15 ? h + (i - 10) * 15 : Math.max(10, h - (i - 15) * 20);
      isAnomalous = h > 40;
    }

    return { height: `${h}%`, isAnomalous };
  });

  return (
    <div className="flex items-end gap-[1px] h-8 w-32 mt-1 opacity-80 group-hover:opacity-100 transition-opacity px-2 pt-2 pb-1 bg-zinc-950 rounded-md border border-zinc-800">
      {bars.map((b, i) => (
        <div key={i} className={`flex-1 rounded-t-[1px] ${b.isAnomalous ? 'bg-red-500' : 'bg-zinc-600'}`} style={{ height: b.height }} />
      ))}
    </div>
  );
}

// ── Summary with inline bold rendering ───────────────────────────────────────

function InlineSummary({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**")
          ? <strong key={i} className="font-semibold text-zinc-100">{p.slice(2, -2)}</strong>
          : <span key={i}>{p}</span>
      )}
    </span>
  );
}

// ── Single anomaly card ───────────────────────────────────────────────────────

function AnomalyCard({ anomaly, expanded, onToggle, appId }: {
  anomaly: Anomaly;
  expanded: boolean;
  onToggle: () => void;
  appId: string;
}) {
  const sev = SEVERITY[anomaly.severity] ?? SEVERITY.low;
  const meta = TYPE_META[anomaly.type] ?? { label: anomaly.type, Icon: IconInfoCircle };
  const { Icon } = meta;

  return (
    <div className={`group rounded-xl border transition-all duration-300 ${expanded ? 'bg-zinc-900 border-zinc-700 shadow-xl' : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-800 hover:border-zinc-700'}`}>

      {/* Card Header (Clickable) */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-start gap-4"
      >
        {/* Animated Severity Orb */}
        <div className="shrink-0 mt-1 relative">
          <div className={`absolute inset-0 rounded-full ${sev.dotClass} blur-md opacity-40 group-hover:opacity-80 transition-opacity`} />
          <span className={`relative block w-3 h-3 rounded-full ${sev.dotClass} border-2 border-zinc-900`} />
        </div>

        <div className="flex-1 min-w-0 flex justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded border ${sev.badgeClass}`}>
                {sev.label}
              </span>
              <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5 bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700">
                <Icon className="size-3 text-zinc-300" /> {meta.label}
              </span>
              <span className="text-[10px] text-zinc-500 ml-2 font-mono">{timeAgo(anomaly.detected_at)}</span>
            </div>
            <p className="text-[15px] font-bold text-zinc-100 tracking-tight leading-snug mb-1">{anomaly.title}</p>
            <p className="text-sm text-zinc-400 leading-relaxed font-medium line-clamp-2 pr-4">
              <InlineSummary text={anomaly.summary} />
            </p>
          </div>

          <div className="hidden lg:block shrink-0">
            <MiniTimeline anomaly={anomaly} />
          </div>
        </div>
      </button>

      {/* Expanded evidence and Blast Radius area */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-zinc-800 pt-4 bg-zinc-950/50 rounded-b-xl animate-in slide-in-from-top-2 duration-200">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Col: Evidence Data */}
            <div className="col-span-2 space-y-5">
              {/* Evidence details */}
              {Object.keys(anomaly.evidence).length > 0 && (
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                  <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
                    <IconActivityHeartbeat className="size-4 text-blue-400" /> Evidence Logs
                  </h4>
                  <EvidenceView evidence={anomaly.evidence} type={anomaly.type} />
                </div>
              )}
            </div>

            {/* Right Col: Blast Radius & Actions */}
            <div className="flex flex-col gap-4">
              {anomaly.services_affected.length > 0 && (
                <div className="bg-red-950/20 border border-red-900/30 p-4 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50" />
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-2">Blast Radius</h4>
                  <div className="flex flex-col gap-1.5">
                    {anomaly.services_affected.map((s) => (
                      <div key={s} className="flex items-center justify-between bg-zinc-950/50 border border-red-900/20 px-2.5 py-1.5 rounded-lg">
                        <span className="text-xs font-mono font-medium text-red-100 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                          {s}
                        </span>
                        <span className="text-[10px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded font-bold">DOWN</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 mt-auto">
                <Link
                  href={`/my-app/${appId}?tab=ask&q=${encodeURIComponent(`Analyze the ${anomaly.type} anomaly: ${anomaly.title}`)}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-all shadow-lg shadow-blue-900/20 border border-blue-500"
                >
                  <IconMessageBolt className="size-4" /> Deep Dive with Ask UI
                </Link>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg border border-zinc-700 transition-colors">
                    <IconEye className="size-3.5" /> View Traces
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg border border-zinc-700 transition-colors">
                    <IconVolumeOff className="size-3.5 opacity-60" /> Mute Rules
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// ── Evidence renderer ─────────────────────────────────────────────────────────

function EvidenceView({ evidence, type }: { evidence: Record<string, unknown>; type: AnomalyType }) {
  if (type === "error_spike") {
    const e = evidence as Record<string, number | string[]>;
    return (
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Live Error Rate" value={`${((e.recent_error_rate as number) * 100).toFixed(1)}%`} isCritical />
        <Stat label="Baseline Normal" value={`${((e.baseline_error_rate as number) * 100).toFixed(1)}%`} />
        {Array.isArray(e.sample_errors) && e.sample_errors.length > 0 && (
          <div className="col-span-2 mt-2">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Error Signatures</p>
            <div className="space-y-1.5">
              {(e.sample_errors as string[]).map((msg, i) => (
                <div key={i} className="px-3 py-2 bg-zinc-950 border border-red-900/30 rounded-lg shadow-inner">
                  <p className="text-xs text-red-200 font-mono break-all leading-relaxed">{msg}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (type === "volume_surge") {
    const e = evidence as Record<string, number>;
    return (
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Surge Ratio" value={`${e.surge_ratio}×`} isCritical />
        <Stat label="Live RPM" value={String(e.recent_volume)} />
        <Stat label="Normal RPM" value={String(e.baseline_avg)} />
      </div>
    );
  }

  if (type === "new_error_pattern") {
    const e = evidence as { new_pattern_count: number; examples: { service: string; message: string }[] };
    return (
      <div className="space-y-3">
        <Stat label="New Signatures Found" value={String(e.new_pattern_count)} isCritical />
        <div className="space-y-2">
          {e.examples?.map((ex, i) => (
            <div key={i} className="flex flex-col gap-1 rounded-lg bg-zinc-950 border border-zinc-800 p-3 shadow-inner">
              {ex.service && <span className="inline-block px-2 py-0.5 rounded bg-zinc-900 text-[10px] font-bold text-zinc-400 w-fit font-mono">{ex.service}</span>}
              <p className="text-xs text-red-300 font-mono break-all">{ex.message}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "cascade_failure") {
    const e = evidence as { service_failure_order: Record<string, string>; total_span_seconds: number; root_service: string };
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Root Cause Service" value={e.root_service} isCritical />
          <Stat label="Failure Span" value={`${e.total_span_seconds}s`} />
        </div>
        {e.service_failure_order && (
          <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-3 shadow-inner">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-3">Chronological Propagation</p>
            <div className="space-y-2 relative">
              <div className="absolute top-2 bottom-2 left-[9px] w-px bg-zinc-800" />
              {Object.entries(e.service_failure_order).map(([svc, ts], i) => (
                <div key={svc} className="flex items-center gap-3 relative z-10 text-xs">
                  <span className="w-5 h-5 rounded-full bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300 shadow-md shrink-0">{i + 1}</span>
                  <span className="text-zinc-100 font-mono font-bold bg-zinc-800/80 px-2 py-0.5 rounded">{svc}</span>
                  <span className="text-zinc-500 font-mono ml-auto tracking-tighter">{new Date(ts).toISOString().split('T')[1].replace('Z', '')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return <pre className="text-xs text-zinc-400 overflow-auto bg-zinc-950 p-4 rounded-lg border border-zinc-800">{JSON.stringify(evidence, null, 2)}</pre>;
}

function Stat({ label, value, isCritical }: { label: string; value: string; isCritical?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 flex flex-col justify-center ${isCritical ? 'bg-red-950/20 border-red-900/50' : 'bg-zinc-950/50 border-zinc-800/80'}`}>
      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-xl font-black font-mono tracking-tighter ${isCritical ? 'text-red-400' : 'text-zinc-100'}`}>{value}</p>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function AnomalyPanel({ appId }: { appId: string }) {
  const { data: session } = useSession();
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    const userId = session?.user?.id;
    if (!userId) return;
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const res = await backendAPI.getAnomalies(appId, userId);
      setAnomalies(res.anomalies ?? []);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [appId, session?.user?.id]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 30 s
  useEffect(() => {
    const id = setInterval(() => load(true), 30_000);
    return () => clearInterval(id);
  }, [load]);

  const criticalCount = anomalies.filter((a) => a.severity === "critical").length;
  const highCount = anomalies.filter((a) => a.severity === "high").length;

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-220px)] min-h-[500px]">
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-zinc-800 mb-6 px-1">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <IconAlertOctagon className="size-5 text-red-500" strokeWidth={1.5} />
              <h2 className="text-lg font-black text-zinc-100 tracking-tight">Anomaly Detection</h2>
            </div>
            {/* Severity counts — always visible when data loaded */}
            {!loading && anomalies.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {(["critical", "high", "medium", "low"] as const)
                  .map(sev => {
                    const count = anomalies.filter(a => a.severity === sev).length;
                    if (!count) return null;
                    const cls = { critical: "bg-red-500/10 text-red-400 border-red-500/20", high: "bg-orange-500/10 text-orange-400 border-orange-500/20", medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", low: "bg-blue-500/10 text-blue-400 border-blue-500/20" }[sev];
                    return (
                      <span key={sev} className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${cls}`}>
                        {sev === "critical" && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                        {count} {sev}
                      </span>
                    );
                  })}
              </div>
            )}
            {!loading && anomalies.length === 0 && (
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                <IconShieldCheck className="size-3" /> All Clear
              </span>
            )}
          </div>
          <p className="text-[12px] text-zinc-500 leading-relaxed">
            Your logs are analysed continuously — unusual patterns, error spikes, and cascading failures surface here automatically.
          </p>
        </div>
        <button
          type="button"
          onClick={() => load(true)}
          disabled={refreshing || loading}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all shadow-sm disabled:opacity-40"
        >
          {refreshing
            ? <IconLoader2 className="size-4 animate-spin text-blue-400" />
            : <IconRefresh className="size-4" />}
          Refresh Stream
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-zinc-700 pb-10">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4 text-zinc-500">
              <IconLoader2 className="size-8 text-blue-500 animate-spin" />
              <span className="text-sm font-semibold tracking-wider uppercase">Running Heuristics</span>
            </div>
          </div>
        ) : anomalies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-6 text-center animate-in fade-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center relative z-10 backdrop-blur-sm">
                <IconShieldCheck className="size-10 text-emerald-400" strokeWidth={1.5} />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-white tracking-tight">System Optimal</p>
              <p className="text-sm font-medium text-emerald-400/80 mt-1 uppercase tracking-widest">No Anomalies Detected</p>
            </div>
            <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
              Our ML models continuously analyze log throughput, error frequencies, and execution traces in real-time. Everything looks good.
            </p>
          </div>
        ) : (
          anomalies.map((a) => (
            <AnomalyCard
              key={a.id}
              anomaly={a}
              expanded={expanded === a.id}
              onToggle={() => setExpanded(expanded === a.id ? null : a.id)}
              appId={appId}
            />
          ))
        )}
      </div>
    </div>
  );
}
