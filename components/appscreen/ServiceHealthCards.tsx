import React from "react";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ServiceHealthCardsProps {
  services: string[];
  serviceHealth: Record<string, string>;
  atRiskServices?: string[];
  onServiceClick?: (service: string) => void;
  loading?: boolean;
}

const healthColor: Record<string, string> = {
  healthy: "bg-green-500 text-white",
  warning: "bg-yellow-500 text-black",
  unhealthy: "bg-red-500 text-white",
};

export function ServiceHealthCards({
  services,
  serviceHealth,
  atRiskServices = [],
  onServiceClick,
  loading = false,
}: ServiceHealthCardsProps) {
  if (loading) {
    return (
      <div className="w-full">
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          {Array(4)
            .fill(null)
            .map((_, idx) => (
              <Card key={idx} className="@container/card bg-[oklch(0.205_0_0)] border-zinc-800 shadow animate-pulse">
                <CardHeader>
                  <Skeleton className="w-2/3 h-4 mb-2" />
                  <Skeleton className="w-1/2 h-8" />
                </CardHeader>
                <CardFooter>
                  <Skeleton className="w-20 h-6 rounded" />
                </CardFooter>
              </Card>
            ))}
        </div>
      </div>
    );
  }

  const atRiskSet = new Set(atRiskServices);
  const orderedServices = [...services].sort((a, b) => {
    const aRisk = atRiskSet.has(a) ? 1 : 0;
    const bRisk = atRiskSet.has(b) ? 1 : 0;
    return bRisk - aRisk;
  });

  return (
    <div className="w-full">
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        {orderedServices.map((service) => {
          const isAtRisk = atRiskSet.has(service);
          return (
            <Card
              key={service}
              className={`@container/card bg-[oklch(0.205_0_0)] border-zinc-800 cursor-pointer shadow transition hover:ring-2 hover:ring-primary/40 hover:bg-[oklch(0.22_0_0)] hover:shadow-lg ${isAtRisk ? "ring-2 ring-red-500/50 border-red-500/40" : ""}`}
              onClick={() => onServiceClick?.(service)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2 text-lg font-semibold">
                  <span className="truncate">{service}</span>
                  {isAtRisk ? <Badge className="bg-red-600 text-white">at risk</Badge> : null}
                </CardTitle>
              </CardHeader>
              <CardFooter>
                <Badge className={healthColor[serviceHealth[service]] || "bg-gray-400 text-white"}>
                  {serviceHealth[service] || "unknown"}
                </Badge>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
