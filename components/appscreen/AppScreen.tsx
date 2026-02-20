"use client";
import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ServiceHealthCards } from "@/components/appscreen/ServiceHealthCards";
import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive";
import { ResponsiveChartWrapper } from "./chartWrapper";
import { Separator } from "@/components/ui/separator";
import { ServiceDetailsPanel } from "@/components/appscreen/ServiceDetailsPanel";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { IconFolderCode } from "@tabler/icons-react";
import { backendAPI, type App, type DashboardSummary } from "@/lib/api/backend-api";

interface AppScreenProps {
  appId: string;
}

const POLL_INTERVAL_MS = 5000;

export function AppScreen({ appId }: AppScreenProps) {
  const { data: session } = useSession();
  const [appData, setAppData] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState("");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    setLoading(true);
    setError("");
    backendAPI
      .getApp(appId, userId)
      .then((data) => setAppData(data))
      .catch(() => setError("Failed to fetch app details"))
      .finally(() => setLoading(false));
  }, [appId, session?.user?.id]);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    function fetchSummary() {
      backendAPI
        .getSummary(appId, userId!)
        .then(({ summary: s }) => {
          if (s) setSummary(s);
        })
        .catch(() => {});
    }

    fetchSummary();
    pollRef.current = setInterval(fetchSummary, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [appId, session?.user?.id]);

  if (loading || error) {
    return (
      <div className="w-full max-w-[1440px] px-2">
        {error ? (
          <div className="p-6 text-red-500">{error}</div>
        ) : (
          <div className="p-6 text-zinc-400">Loading...</div>
        )}
      </div>
    );
  }

  const atRiskCount = Array.isArray(summary?.at_risk_services)
    ? summary!.at_risk_services.length
    : 0;

  return (
    <div className="w-full max-w-[1440px] px-2">
      <ResizablePanelGroup
        direction="horizontal"
        className="rounded-xl border bg-[oklch(0.205_0_0)] shadow-xl min-h-[540px]"
      >
        <ResizablePanel defaultSize={45} minSize={20}>
          <div className="relative flex flex-col h-[600px] md:h-[705px] items-start justify-start p-6 gap-4">
            <h2 className="w-full text-3xl font-semibold tracking-tight text-left scroll-m-20 first:mt-0">
              {appData?.name ?? "App Dashboard"}
            </h2>
            {atRiskCount > 0 ? (
              <div className="text-sm text-red-300">
                {atRiskCount} service{atRiskCount > 1 ? "s" : ""} at risk of failure
              </div>
            ) : null}
            <Separator className="my-2" />
            <div className="w-full">
              {selectedService ? (
                <div className="w-full h-full">
                  <ServiceDetailsPanel
                    service={selectedService}
                    summary={summary}
                    onBack={() => setSelectedService(null)}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center flex-1 w-full">
                  {!summary ? (
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <IconFolderCode />
                        </EmptyMedia>
                        <EmptyTitle>Waiting for logs</EmptyTitle>
                        <EmptyDescription>
                          Install the SDK in your app and send logs. Your dashboard will update automatically.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ) : Array.isArray(summary.services) ? (
                    <ServiceHealthCards
                      services={summary.services}
                      serviceHealth={summary.service_health}
                      atRiskServices={summary.at_risk_services ?? []}
                      onServiceClick={setSelectedService}
                    />
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={55} minSize={20}>
          <div className="flex items-stretch justify-center flex-1 w-full h-full p-6">
            <ResponsiveChartWrapper>
              <ChartAreaInteractive
                errorRates={summary?.errors_per_10_logs ?? []}
                avgErrorRate={summary?.avg_errors_per_10_logs ?? 0}
              />
            </ResponsiveChartWrapper>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
