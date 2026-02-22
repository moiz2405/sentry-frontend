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
import { IconFolderCode, IconActivity, IconChartBar, IconNetwork, IconCode, IconTerminal2, IconArrowRight, IconSettings2 } from "@tabler/icons-react";
import { backendAPI, type DashboardSummary } from "@/lib/api/backend-api";
import { TerminalLog } from "@/components/appscreen/TerminalLog";

interface AppScreenProps {
  appId: string;
}

const POLL_INTERVAL_MS = 5000;

type ChartMode = "live" | "history";

export function AppScreen({ appId }: AppScreenProps) {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<ChartMode>("live");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Live chart accumulation — only appended when backend reports a new generated_at
  const lastGeneratedAt = useRef<string | null>(null);
  const lastNewDataAt = useRef<number>(Date.now());  // wall-clock ms of last real batch
  const [liveErrorRates, setLiveErrorRates] = useState<number[]>([]);
  const [liveAvgRate, setLiveAvgRate] = useState(0);

  // Idle decay: when no new log batch has arrived for IDLE_DECAY_MS, append
  // a 0-rate point every POLL_INTERVAL_MS so the chart gracefully trends down.
  const IDLE_DECAY_MS = 5 * 60 * 1000;   // 5 min silence → start decaying

  useEffect(() => {
    if (status === "loading") return;  // still authenticating — wait
    const userId = session?.user?.id;
    if (!userId) { setLoading(false); return; }  // no id — unblock

    setLoading(true);
    function fetchSummary() {
      backendAPI
        .getSummary(appId, userId!)
        .then(({ summary: s }) => {
          if (s) {
            setSummary(s);
            const genAt = (s as DashboardSummary & { generated_at?: string }).generated_at ?? null;
            if (genAt && genAt !== lastGeneratedAt.current) {
              // Genuine new batch — append its error rates
              lastGeneratedAt.current = genAt;
              lastNewDataAt.current = Date.now();
              const rates: number[] = s.errors_per_10_logs ?? [];
              if (rates.length > 0) {
                setLiveErrorRates(prev => [...prev, ...rates]);
                setLiveAvgRate(s.avg_errors_per_10_logs ?? 0);
              }
            } else if (Date.now() - lastNewDataAt.current > IDLE_DECAY_MS) {
              // No new batch for 5 min → append a 0 so the chart decays
              setLiveErrorRates(prev => {
                if (prev.length === 0) return prev;
                // Only append 0 if the last value wasn't already 0
                const last = prev[prev.length - 1];
                return last === 0 ? prev : [...prev, 0];
              });
            }
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }

    // Reset live chart data when switching apps
    lastGeneratedAt.current = null;
    lastNewDataAt.current = Date.now();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                <div className="flex items-center justify-center h-full min-h-[400px] p-6">
                  <div className="max-w-sm w-full space-y-5">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="size-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <IconActivity className="size-6 text-blue-400" />
                      </div>
                      <h3 className="text-base font-black text-zinc-100 tracking-tight">Waiting for your first log</h3>
                      <p className="text-[12px] text-zinc-500 leading-relaxed">
                        Once logs arrive, this Dashboard shows live service health, error rates, and performance metrics across all your services.
                      </p>
                    </div>

                    {/* Steps */}
                    <div className="space-y-2">
                      {[
                        { icon: IconSettings2, step: "1", text: "Go to Settings → copy your API key" },
                        { icon: IconTerminal2, step: "2", text: "pip install sentry-logger-sdk" },
                        { icon: IconCode, step: "3", text: "Call init(api_key=\"...\") in your app" },
                      ].map(({ icon: Icon, step, text }) => (
                        <div key={step} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                          <span className="size-5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-black flex items-center justify-center shrink-0">{step}</span>
                          <Icon className="size-3.5 text-zinc-500 shrink-0" />
                          <span className="text-[12px] text-zinc-400 font-medium">{text}</span>
                        </div>
                      ))}
                    </div>

                    <a
                      href="?tab=settings"
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-bold transition-colors shadow-lg shadow-blue-500/20"
                    >
                      Go to Settings <IconArrowRight className="size-4" />
                    </a>
                  </div>
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
                      className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${chartMode === "live"
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
                      className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${chartMode === "history"
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
