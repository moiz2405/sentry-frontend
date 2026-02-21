"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ServiceHealthCards } from "@/components/appscreen/ServiceHealthCards";
import { LogTimelineChart } from "@/components/appscreen/LogTimelineChart";
import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive";
import { ServiceDetailsPanel } from "@/components/appscreen/ServiceDetailsPanel";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { IconFolderCode, IconActivity, IconChartBar } from "@tabler/icons-react";
import { backendAPI, type DashboardSummary } from "@/lib/api/backend-api";
import { TerminalLog } from "@/components/appscreen/TerminalLog";

interface AppScreenProps {
  appId: string;
}

const POLL_INTERVAL_MS = 5000;

type ChartMode = "live" | "history";

export function AppScreen({ appId }: AppScreenProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<ChartMode>("live");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Live chart accumulation — only appended when backend reports a new generated_at
  const lastGeneratedAt = useRef<string | null>(null);
  const [liveErrorRates, setLiveErrorRates] = useState<number[]>([]);
  const [liveAvgRate, setLiveAvgRate] = useState(0);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    setLoading(true);
    function fetchSummary() {
      backendAPI
        .getSummary(appId, userId!)
        .then(({ summary: s }) => {
          if (s) {
            setSummary(s);
            // Only append to live chart when a genuinely new batch arrived
            const genAt = (s as DashboardSummary & { generated_at?: string }).generated_at ?? null;
            if (genAt && genAt !== lastGeneratedAt.current) {
              lastGeneratedAt.current = genAt;
              const rates: number[] = s.errors_per_10_logs ?? [];
              if (rates.length > 0) {
                setLiveErrorRates(prev => [...prev, ...rates]);
                setLiveAvgRate(s.avg_errors_per_10_logs ?? 0);
              }
            }
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }

    // Reset live chart data when switching apps
    lastGeneratedAt.current = null;
    setLiveErrorRates([]);
    setLiveAvgRate(0);

    fetchSummary();
    pollRef.current = setInterval(fetchSummary, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [appId, session?.user?.id]);

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
          <div className="flex flex-col h-[600px] md:h-[705px] p-5 gap-3">
            {/* Panel header */}
            {!selectedService && (
              <div className="flex items-center justify-between shrink-0">
                <h2 className="text-sm font-semibold text-zinc-300">Services</h2>
                {atRiskCount > 0 && (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2.5 py-0.5">
                    <span className="size-1.5 rounded-full bg-red-400 animate-pulse" />
                    {atRiskCount} at risk
                  </span>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {selectedService ? (
                <ServiceDetailsPanel
                  service={selectedService}
                  summary={summary}
                  onBack={() => setSelectedService(null)}
                />
              ) : !summary ? (
                <div className="flex items-center justify-center h-full">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <IconFolderCode />
                      </EmptyMedia>
                      <EmptyTitle>Waiting for logs</EmptyTitle>
                      <EmptyDescription>
                        Install the SDK and send logs. Your dashboard will update automatically.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </div>
              ) : Array.isArray(summary.services) ? (
                <ServiceHealthCards
                  services={summary.services}
                  serviceHealth={summary.service_health}
                  atRiskServices={summary.at_risk_services ?? []}
                  onServiceClick={setSelectedService}
                />
              ) : null}
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={55} minSize={20}>
          <ResizablePanelGroup direction="vertical" className="h-full">
            <ResizablePanel defaultSize={40} minSize={15}>
              {session?.user?.id && (
                <TerminalLog appId={appId} userId={session.user.id} />
              )}
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={60} minSize={20}>
              <div className="flex flex-col w-full h-full p-4 gap-2">
                {/* Mode toggle */}
                <div className="flex items-center gap-1 self-end shrink-0">
                  <div className="flex items-center rounded-lg border border-zinc-700 bg-zinc-800/60 overflow-hidden text-xs">
                    <button
                      type="button"
                      onClick={() => setChartMode("live")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                        chartMode === "live"
                          ? "bg-zinc-700 text-zinc-100 font-medium"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <IconActivity className="size-3" />
                      Live
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartMode("history")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                        chartMode === "history"
                          ? "bg-zinc-700 text-zinc-100 font-medium"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <IconChartBar className="size-3" />
                      History
                    </button>
                  </div>
                </div>

                {/* Chart */}
                <div className="flex-1 min-h-0">
                  {chartMode === "live" ? (
                    <ChartAreaInteractive
                      errorRates={liveErrorRates}
                      avgErrorRate={liveAvgRate}
                    />
                  ) : (
                    <LogTimelineChart appId={appId} />
                  )}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
