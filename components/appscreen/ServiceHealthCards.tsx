import React from "react";
import {
  IconChevronRight,
  IconAlertTriangle,
  IconShieldCheck,
  IconAlertCircle,
  IconCircleDashed,
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
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/5",
    icon: IconShieldCheck,
  },
  warning: {
    label: "Warning",
    dot: "bg-yellow-400",
    text: "text-yellow-400",
    border: "border-yellow-500/20",
    bg: "bg-yellow-500/5",
    icon: IconAlertCircle,
  },
  unhealthy: {
    label: "Unhealthy",
    dot: "bg-red-400",
    text: "text-red-400",
    border: "border-red-500/20",
    bg: "bg-red-500/5",
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
  const Icon = cfg.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full text-left rounded-xl border ${cfg.border} ${cfg.bg}
        hover:bg-zinc-800/60 hover:border-zinc-600
        transition-all duration-150 overflow-hidden
        ${isAtRisk ? "ring-1 ring-red-500/40" : ""}
      `}
    >
      {/* Thin health-colored top strip */}
      <div className={`h-[2px] w-full ${cfg.dot}`} />

      <div className="px-4 py-3.5 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Service name */}
          <p className="text-sm font-semibold text-zinc-100 truncate">{service}</p>

          {/* Status row */}
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className={`inline-flex size-1.5 rounded-full shrink-0 ${cfg.dot} ${health !== "healthy" ? "animate-pulse" : ""}`} />
            <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
            {isAtRisk && (
              <span className="ml-1 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2 py-0.5">
                at risk
              </span>
            )}
          </div>
        </div>

        {/* Health icon + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <Icon className={`size-4 ${cfg.text} opacity-70`} />
          <IconChevronRight className="size-3.5 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
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
  if (loading) {
    return (
      <div className="w-full grid grid-cols-1 gap-2 sm:grid-cols-2">
        {Array(4).fill(null).map((_, i) => (
          <div key={i} className="h-[68px] rounded-xl border border-zinc-800 bg-zinc-900/40 animate-pulse" />
        ))}
      </div>
    );
  }

  const atRiskSet = new Set(atRiskServices);
  const ordered = [...services].sort((a, b) => {
    const aR = atRiskSet.has(a) ? 1 : 0;
    const bR = atRiskSet.has(b) ? 1 : 0;
    if (bR !== aR) return bR - aR;
    const healthOrder: Record<string, number> = { unhealthy: 0, warning: 1, healthy: 2 };
    return (healthOrder[serviceHealth[a]] ?? 3) - (healthOrder[serviceHealth[b]] ?? 3);
  });

  return (
    <div className="w-full grid grid-cols-1 gap-2 sm:grid-cols-2">
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
