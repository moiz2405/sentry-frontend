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
} from "@tabler/icons-react";
import { backendAPI, type Anomaly, type AnomalySeverity, type AnomalyType } from "@/lib/api/backend-api";

// ── Severity config ───────────────────────────────────────────────────────────

const SEVERITY: Record<AnomalySeverity, { label: string; badgeClass: string; dotClass: string }> = {
  critical: {
    label: "Critical",
    badgeClass: "bg-red-500/20 text-red-400 border-red-500/30",
    dotClass:   "bg-red-400",
  },
  high: {
    label: "High",
    badgeClass: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    dotClass:   "bg-orange-400",
  },
  medium: {
    label: "Medium",
    badgeClass: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    dotClass:   "bg-yellow-400",
  },
  low: {
    label: "Low",
    badgeClass: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    dotClass:   "bg-blue-400",
  },
};

// ── Type config ───────────────────────────────────────────────────────────────

const TYPE_META: Record<AnomalyType, { label: string; Icon: React.ElementType }> = {
  error_spike:       { label: "Error Spike",         Icon: IconFlame },
  volume_surge:      { label: "Volume Surge",        Icon: IconChartBar },
  new_error_pattern: { label: "New Error Pattern",   Icon: IconBug },
  cascade_failure:   { label: "Cascade Failure",     Icon: IconGitMerge },
};

// ── Time helper ───────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)   return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
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

function AnomalyCard({ anomaly, expanded, onToggle }: {
  anomaly: Anomaly;
  expanded: boolean;
  onToggle: () => void;
}) {
  const sev  = SEVERITY[anomaly.severity] ?? SEVERITY.low;
  const meta = TYPE_META[anomaly.type]    ?? { label: anomaly.type, Icon: IconInfoCircle };
  const { Icon } = meta;

  return (
    <div className="rounded-xl border border-zinc-700/60 bg-zinc-800/50 overflow-hidden">
      {/* Card header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-zinc-800/80 transition-colors"
      >
        {/* Severity dot */}
        <div className="shrink-0 mt-1.5">
          <span className={`block w-2 h-2 rounded-full ${sev.dotClass}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Icon className="size-3.5 text-zinc-400 shrink-0" />
            <span className="text-xs text-zinc-500">{meta.label}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${sev.badgeClass}`}>
              {sev.label}
            </span>
            <span className="ml-auto text-xs text-zinc-500 shrink-0">{timeAgo(anomaly.detected_at)}</span>
          </div>
          <p className="mt-1 text-sm font-medium text-zinc-100 leading-snug">{anomaly.title}</p>
          <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
            <InlineSummary text={anomaly.summary} />
          </p>
        </div>
      </button>

      {/* Expanded evidence */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-zinc-700/40 pt-3 space-y-3">
          {anomaly.services_affected.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5">Affected services</p>
              <div className="flex flex-wrap gap-1.5">
                {anomaly.services_affected.map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-full bg-zinc-700/60 border border-zinc-600 text-xs text-zinc-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Evidence details */}
          {Object.keys(anomaly.evidence).length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5">Evidence</p>
              <EvidenceView evidence={anomaly.evidence} type={anomaly.type} />
            </div>
          )}
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
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Recent error rate" value={`${((e.recent_error_rate as number) * 100).toFixed(1)}%`} />
        <Stat label="Baseline rate"     value={`${((e.baseline_error_rate as number) * 100).toFixed(1)}%`} />
        <Stat label="Error count"       value={String(e.recent_error_count)} />
        {Array.isArray(e.sample_errors) && e.sample_errors.length > 0 && (
          <div className="col-span-2">
            <p className="text-[10px] text-zinc-500 mb-1">Sample errors</p>
            {(e.sample_errors as string[]).map((msg, i) => (
              <p key={i} className="text-xs text-zinc-400 font-mono truncate">{msg}</p>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (type === "volume_surge") {
    const e = evidence as Record<string, number>;
    return (
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Recent volume"  value={String(e.recent_volume)} />
        <Stat label="Normal avg"     value={String(e.baseline_avg)} />
        <Stat label="Surge ratio"    value={`${e.surge_ratio}×`} />
      </div>
    );
  }

  if (type === "new_error_pattern") {
    const e = evidence as { new_pattern_count: number; examples: { service: string; message: string }[] };
    return (
      <div className="space-y-1.5">
        <Stat label="New patterns" value={String(e.new_pattern_count)} />
        {e.examples?.map((ex, i) => (
          <div key={i} className="rounded bg-zinc-900/60 border border-zinc-700/40 px-2 py-1.5">
            {ex.service && <p className="text-[10px] text-zinc-500">{ex.service}</p>}
            <p className="text-xs text-zinc-300 font-mono truncate">{ex.message}</p>
          </div>
        ))}
      </div>
    );
  }

  if (type === "cascade_failure") {
    const e = evidence as { service_failure_order: Record<string, string>; total_span_seconds: number; root_service: string };
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Span" value={`${e.total_span_seconds}s`} />
          <Stat label="Root service" value={e.root_service} />
        </div>
        {e.service_failure_order && (
          <div>
            <p className="text-[10px] text-zinc-500 mb-1">Failure order</p>
            {Object.entries(e.service_failure_order).map(([svc, ts], i) => (
              <div key={svc} className="flex items-center gap-2 text-xs">
                <span className="w-4 h-4 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] text-zinc-400 shrink-0">{i + 1}</span>
                <span className="text-zinc-300 font-medium">{svc}</span>
                <span className="text-zinc-500 ml-auto">{new Date(ts).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return <pre className="text-xs text-zinc-400 overflow-auto">{JSON.stringify(evidence, null, 2)}</pre>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-zinc-900/60 border border-zinc-700/40 px-2.5 py-1.5">
      <p className="text-[10px] text-zinc-500">{label}</p>
      <p className="text-sm font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function AnomalyPanel({ appId }: { appId: string }) {
  const { data: session } = useSession();
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded]   = useState<string | null>(null);

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
  const highCount     = anomalies.filter((a) => a.severity === "high").length;

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-220px)] min-h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <IconAlertTriangle className="size-4 text-yellow-400" />
            <span className="text-sm font-semibold text-zinc-100">Anomalies</span>
          </div>
          {!loading && anomalies.length > 0 && (
            <div className="flex items-center gap-1.5">
              {criticalCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  {criticalCount} critical
                </span>
              )}
              {highCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  {highCount} high
                </span>
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => load(true)}
          disabled={refreshing || loading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors disabled:opacity-40"
        >
          {refreshing
            ? <IconLoader2 className="size-3.5 animate-spin" />
            : <IconRefresh className="size-3.5" />}
          Refresh
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-zinc-700">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <IconLoader2 className="size-5 text-zinc-600 animate-spin" />
          </div>
        ) : anomalies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <IconShieldCheck className="size-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">All clear</p>
              <p className="text-xs text-zinc-500 mt-0.5 max-w-xs">
                No anomalies detected. Anomalies are automatically found on each log batch and refresh every 30 s.
              </p>
            </div>
          </div>
        ) : (
          anomalies.map((a) => (
            <AnomalyCard
              key={a.id}
              anomaly={a}
              expanded={expanded === a.id}
              onToggle={() => setExpanded(expanded === a.id ? null : a.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
