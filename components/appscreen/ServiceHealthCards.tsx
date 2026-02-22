import React from "react";
import {
  IconChevronRight,
  IconAlertTriangle,
  IconShieldCheck,
  IconAlertCircle,
  IconCircleDashed,
  IconTrendingUp,
  IconTrendingDown,
  IconActivity,
} from "@tabler/icons-react";

interface ServiceHealthCardsProps {
  services: string[];
  serviceHealth: Record<string, string>;
  atRiskServices?: string[];
  onServiceClick?: (service: string) => void;
  loading?: boolean;
}

const HEALTH_CONFIG: Record<string, {
  label: string;
  dot: string;
  text: string;
  border: string;
  bg: string;
  icon: React.ElementType;
}> = {
  healthy: {
    label: "Healthy",
    dot: "bg-emerald-400",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5",
    icon: IconShieldCheck,
  },
  warning: {
    label: "Warning",
    dot: "bg-yellow-400",
    text: "text-yellow-400",
    border: "border-yellow-500/40",
    bg: "bg-yellow-500/5",
    icon: IconAlertCircle,
  },
  unhealthy: {
    label: "Critical",
    dot: "bg-red-500",
    text: "text-red-400",
    border: "border-red-500/50",
    bg: "bg-red-500/10",
    icon: IconAlertTriangle,
  },
};

const FALLBACK_CONFIG = {
  label: "Unknown",
  dot: "bg-zinc-500",
  text: "text-zinc-500",
  border: "border-zinc-700",
  bg: "bg-zinc-800/30",
  icon: IconCircleDashed,
};

// Fake realistic metrics generator for the mock advanced UI
function generateRealisticMetrics(serviceName: string, health: string) {
  // Generate deterministic pseudo-random values based on service name characters
  const hash = serviceName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Base healthy values
  let apdex = 0.95 + (hash % 50) / 1000;
  let p95 = 20 + (hash % 80);
  let trend = (hash % 10) - 4; // -4 to +5
  let healthScore = 95 + (hash % 5);

  if (health === "warning") {
    apdex -= 0.15;
    p95 += 150;
    trend -= 8;
    healthScore -= 18;
  } else if (health === "unhealthy" || health === "critical") {
    apdex -= 0.4;
    p95 += 800;
    trend -= 15;
    healthScore -= 40;
  }

  return {
    apdex: Math.max(0.1, apdex).toFixed(2),
    p95: Math.floor(p95),
    trend,
    healthScore,
  };
}

function ServiceCard({
  service,
  health,
  isAtRisk,
  onClick,
}: {
  service: string;
  health: string;
  isAtRisk: boolean;
  onClick?: () => void;
}) {
  const cfg = HEALTH_CONFIG[health] ?? FALLBACK_CONFIG;
  const metrics = generateRealisticMetrics(service, health);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full text-left rounded-xl border ${cfg.border} ${cfg.bg}
        hover:bg-zinc-800 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5
        transition-all duration-200 overflow-hidden flex flex-col
        ${isAtRisk ? "ring-2 ring-red-500/50 bg-red-950/20" : ""}
      `}
    >
      {/* Dynamic top health bar */}
      <div className={`absolute top-0 left-0 h-1 w-full ${cfg.dot} opacity-80`} />

      {/* ── Service Name Row ─────────────────────────── */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-2 bg-zinc-900/40">
        <span className={`inline-flex size-2 rounded-full shrink-0 ${cfg.dot} ${health !== "healthy" ? "animate-pulse shadow-[0_0_8px_currentColor]" : ""}`} />
        <p
          className="text-[13px] font-bold text-zinc-100 leading-snug capitalize"
          title={service}
        >
          {service.replace(/[-_]service$/i, "").replace(/[-_]/g, " ")}
        </p>
      </div>

      {/* ── Status + Health Score Row ─────────────────── */}
      <div className="px-4 pb-3 flex items-center justify-between gap-2 border-b border-zinc-800/60 bg-zinc-900/40">
        {/* Left: status badge */}
        <div className="flex items-center gap-1.5">
          <span className={`text-[11px] uppercase tracking-wider font-bold ${cfg.text} px-2 py-0.5 rounded-md bg-black/30 border border-current/20`}>
            {cfg.label}
          </span>
          {isAtRisk && (
            <span className="text-[10px] font-bold text-red-100 bg-red-600 rounded-md px-1.5 py-0.5 animate-pulse uppercase tracking-widest border border-red-400/30">
              Action Req
            </span>
          )}
        </div>

        {/* Right: health score */}
        <div className="flex flex-col items-end shrink-0">
          <span className="text-[9px] text-zinc-600 font-semibold uppercase tracking-widest leading-none mb-0.5">Score</span>
          <div className="flex items-center gap-0.5">
            <span className={`text-lg font-black font-mono leading-none ${metrics.healthScore < 70 ? "text-red-400" : metrics.healthScore < 90 ? "text-yellow-400" : "text-emerald-400"}`}>
              {metrics.healthScore}
            </span>
            {metrics.trend > 0
              ? <IconTrendingUp className="size-3.5 text-emerald-500 shrink-0" strokeWidth={3} />
              : <IconTrendingDown className="size-3.5 text-red-500 shrink-0" strokeWidth={3} />
            }
          </div>
        </div>
      </div>


      {/* Advanced KPI Metrics Overlay */}
      <div className="px-4 py-3 bg-zinc-950/40 grid grid-cols-2 gap-y-2 gap-x-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-1"><IconActivity className="size-3" /> Apdex Score</span>
          <span className="text-sm font-mono text-zinc-300">{metrics.apdex}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">p95 Latency</span>
          <span className={`text-sm font-mono ${metrics.p95 > 500 ? 'text-red-400 font-bold' : 'text-zinc-300'}`}>{metrics.p95}ms</span>
        </div>
      </div>

      {/* Hover action indicator */}
      <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-200">
        <div className="bg-blue-600 rounded-full p-1.5 shadow-lg shadow-blue-900/50">
          <IconChevronRight className="size-4 text-white" strokeWidth={3} />
        </div>
      </div>
    </button>
  );
}

export function ServiceHealthCards({
  services,
  serviceHealth,
  atRiskServices = [],
  onServiceClick,
  loading = false,
}: ServiceHealthCardsProps) {
  if (loading || !services) {
    return (
      <div className="w-full grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {Array(6).fill(null).map((_, i) => (
          <div key={i} className="h-[120px] rounded-xl border border-zinc-800 bg-zinc-900/40 animate-pulse" />
        ))}
      </div>
    );
  }

  const atRiskSet = new Set(atRiskServices);
  const ordered = [...services].sort((a, b) => {
    const aR = atRiskSet.has(a) ? 1 : 0;
    const bR = atRiskSet.has(b) ? 1 : 0;
    if (bR !== aR) return bR - aR;
    const healthOrder: Record<string, number> = { unhealthy: 0, critical: 0, warning: 1, healthy: 2 };
    return (healthOrder[serviceHealth[a]] ?? 3) - (healthOrder[serviceHealth[b]] ?? 3);
  });

  return (
    <div className="w-full grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 pb-8">
      {ordered.map((service) => (
        <ServiceCard
          key={service}
          service={service}
          health={serviceHealth[service] ?? "unknown"}
          isAtRisk={atRiskSet.has(service)}
          onClick={() => onServiceClick?.(service)}
        />
      ))}
    </div>
  );
}
