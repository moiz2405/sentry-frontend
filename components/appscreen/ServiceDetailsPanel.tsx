import React from "react";
import {
  IconArrowLeft,
  IconShieldCheck,
  IconAlertTriangle,
  IconAlertCircle,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconClock,
  IconBug,
  IconBulb,
  IconActivityHeartbeat,
} from "@tabler/icons-react";
import type { DashboardSummary } from "@/lib/api/backend-api";

interface Props {
  service: string;
  summary: DashboardSummary | null;
  onBack: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const HEALTH_CFG: Record<string, { label: string; text: string; bg: string; border: string; icon: React.ElementType }> = {
  healthy:   { label: "Healthy",   text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: IconShieldCheck   },
  warning:   { label: "Warning",   text: "text-yellow-400",  bg: "bg-yellow-500/10",  border: "border-yellow-500/20",  icon: IconAlertCircle   },
  unhealthy: { label: "Unhealthy", text: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20",     icon: IconAlertTriangle },
};
const HEALTH_FALLBACK = { label: "Unknown", text: "text-zinc-500", bg: "bg-zinc-800/40", border: "border-zinc-700", icon: IconActivityHeartbeat };

const RISK_CFG: Record<string, { label: string; text: string; bar: string }> = {
  low:      { label: "Low",      text: "text-emerald-400", bar: "bg-emerald-500" },
  medium:   { label: "Medium",   text: "text-yellow-400",  bar: "bg-yellow-500"  },
  high:     { label: "High",     text: "text-orange-400",  bar: "bg-orange-500"  },
  critical: { label: "Critical", text: "text-red-400",     bar: "bg-red-500"     },
};

const TREND_CFG: Record<string, { label: string; text: string; icon: React.ElementType }> = {
  increasing:        { label: "Increasing",        text: "text-red-400",     icon: IconTrendingUp   },
  stable:            { label: "Stable",            text: "text-yellow-400",  icon: IconMinus        },
  decreasing:        { label: "Decreasing",        text: "text-emerald-400", icon: IconTrendingDown },
  insufficient_data: { label: "Insufficient data", text: "text-zinc-500",    icon: IconMinus        },
};

const SEVERITY_TEXT: Record<string, string> = {
  INFO: "text-blue-400", DEBUG: "text-zinc-400", WARNING: "text-yellow-400",
  ERROR: "text-red-400", CRITICAL: "text-red-500",
};

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString([], {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
    });
  } catch { return iso; }
}

function StatCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3">
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <div className="text-sm font-semibold">{children}</div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="size-3.5 text-zinc-500 shrink-0" />
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{title}</h4>
      </div>
      {children}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ServiceDetailsPanel({ service, summary, onBack }: Props) {
  const health     = summary?.service_health?.[service] ?? "unknown";
  const riskScore  = summary?.service_risk_scores?.[service] ?? 0;
  const riskLevel  = summary?.service_risk_levels?.[service] ?? "low";
  const confidence = summary?.service_risk_confidence?.[service] ?? 0;
  const trend      = summary?.service_risk_trend?.[service] ?? "insufficient_data";
  const etaMins    = summary?.service_failure_eta_minutes?.[service];
  const willFail   = Boolean(summary?.service_failure_prediction?.[service]);
  const reasons    = summary?.service_risk_reasons?.[service] ?? [];
  const recs       = summary?.service_recommendations?.[service] ?? [];
  const recentErrs = summary?.recent_errors?.[service] ?? [];
  const severDist  = summary?.severity_distribution?.[service];
  const topError   = summary?.most_common_errors?.[service];
  const firstErr   = summary?.first_error_timestamp?.[service];
  const lastErr    = summary?.latest_error_timestamp?.[service];

  const hCfg  = HEALTH_CFG[health]   ?? HEALTH_FALLBACK;
  const rCfg  = RISK_CFG[riskLevel]  ?? RISK_CFG.low;
  const tCfg  = TREND_CFG[trend]     ?? TREND_CFG.insufficient_data;
  const HIcon = hCfg.icon;
  const TIcon = tCfg.icon;

  return (
    <div className="flex flex-col h-full">
      {/* ── Back button ── */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-200 transition-colors mb-4 group w-fit"
      >
        <IconArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
        All services
      </button>

      {/* ── Service header ── */}
      <div className="flex items-center gap-3 mb-5">
        <div className={`flex-shrink-0 p-2 rounded-lg border ${hCfg.bg} ${hCfg.border}`}>
          <HIcon className={`size-4 ${hCfg.text}`} />
        </div>
        <div>
          <h3 className="text-base font-bold text-zinc-100 leading-tight">{service}</h3>
          <span className={`text-xs font-medium ${hCfg.text}`}>{hCfg.label}</span>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1">

        {/* Risk metrics grid */}
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="Risk level">
            <span className={rCfg.text}>{rCfg.label}</span>
          </StatCard>
          <StatCard label="Risk score">
            <div className="flex items-center gap-2">
              <span className="text-zinc-100">{riskScore}</span>
              <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div className={`h-full rounded-full ${rCfg.bar}`} style={{ width: `${Math.min(riskScore, 100)}%` }} />
              </div>
            </div>
          </StatCard>
          <StatCard label="Trend">
            <span className={`flex items-center gap-1 ${tCfg.text}`}>
              <TIcon className="size-3.5" />{tCfg.label}
            </span>
          </StatCard>
          <StatCard label="Confidence">
            <span className="text-zinc-100">{Math.round(confidence * 100)}%</span>
          </StatCard>
        </div>

        {/* Failure prediction */}
        {willFail && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <IconAlertTriangle className="size-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-300">Failure predicted</p>
              <p className="text-xs text-red-400/80 mt-0.5">
                {etaMins ? `Estimated within ~${etaMins} minutes` : "Imminent — no ETA available"}
              </p>
            </div>
          </div>
        )}

        {/* Severity distribution */}
        {severDist && Object.keys(severDist).length > 0 && (
          <Section title="Severity distribution" icon={IconActivityHeartbeat}>
            <div className="flex flex-wrap gap-2">
              {Object.entries(severDist).map(([lvl, cnt]) => (
                <div key={lvl} className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1">
                  <span className={`text-xs font-mono font-bold ${SEVERITY_TEXT[lvl] ?? "text-zinc-400"}`}>{lvl}</span>
                  <span className="text-xs text-zinc-400">{String(cnt)}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Most common error */}
        {topError && (
          <Section title="Most common error" icon={IconBug}>
            <div className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2.5 font-mono text-xs text-red-300 break-all">
              {topError}
            </div>
          </Section>
        )}

        {/* Risk factors */}
        {reasons.length > 0 && (
          <Section title="Why this risk" icon={IconAlertCircle}>
            <ul className="space-y-1.5">
              {reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                  <span className="mt-1.5 size-1.5 rounded-full bg-orange-400 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Recommendations */}
        {recs.length > 0 && (
          <Section title="Suggested fixes" icon={IconBulb}>
            <ul className="space-y-1.5">
              {recs.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                  <span className="mt-1.5 size-1.5 rounded-full bg-blue-400 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Timestamps */}
        {(firstErr || lastErr) && (
          <Section title="Error window" icon={IconClock}>
            <div className="grid grid-cols-1 gap-1.5 text-xs text-zinc-400 font-mono">
              {firstErr && <span><span className="text-zinc-600">First: </span>{fmt(firstErr)}</span>}
              {lastErr  && <span><span className="text-zinc-600">Last:  </span>{fmt(lastErr)}</span>}
            </div>
          </Section>
        )}

        {/* Recent errors */}
        <Section title={`Recent errors${recentErrs.length ? ` (${recentErrs.length})` : ""}`} icon={IconBug}>
          {recentErrs.length === 0 ? (
            <p className="text-sm text-zinc-600">No recent errors.</p>
          ) : (
            <ul className="space-y-2">
              {recentErrs.map((err, i) => (
                <li key={i} className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2.5">
                  <p className="font-mono text-xs text-red-300 break-all leading-relaxed">
                    {err.line || "No message"}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-zinc-500">
                    {err.error_type    && <span>type: <span className="text-zinc-400 font-mono">{err.error_type}</span></span>}
                    {err.severity_level && <span>severity: <span className="text-zinc-400 font-mono">{err.severity_level}</span></span>}
                    {err.timestamp     && <span>{fmt(err.timestamp)}</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <div className="h-4" />
      </div>
    </div>
  );
}
