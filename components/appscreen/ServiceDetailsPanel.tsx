import React, { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { ArrowLeftIcon } from "lucide-react";
import type { DashboardSummary } from "@/lib/api/backend-api";

interface ServiceDetailsPanelProps {
  service: string;
  summary: DashboardSummary | null;
  onBack: () => void;
}

const healthColor: Record<string, string> = {
  healthy: "text-green-400 font-bold",
  warning: "text-yellow-400 font-bold",
  unhealthy: "text-red-400 font-bold",
};

const riskColor: Record<string, string> = {
  low: "text-green-400 font-bold",
  medium: "text-yellow-300 font-bold",
  high: "text-orange-300 font-bold",
  critical: "text-red-400 font-bold",
};

const trendColor: Record<string, string> = {
  increasing: "text-red-300 font-bold",
  stable: "text-yellow-300 font-bold",
  decreasing: "text-green-300 font-bold",
  insufficient_data: "text-zinc-300 font-bold",
};

export function ServiceDetailsPanel({
  service,
  summary,
  onBack,
}: ServiceDetailsPanelProps) {
  const [storedSummary, setStoredSummary] = useState<any>(null);

  useEffect(() => {
    setStoredSummary(summary);
  }, [service, summary]);

  const health = storedSummary?.service_health?.[service] || "unknown";
  const riskScore = storedSummary?.service_risk_scores?.[service] ?? 0;
  const riskLevel = storedSummary?.service_risk_levels?.[service] || "low";
  const confidence = storedSummary?.service_risk_confidence?.[service] ?? 0;
  const trend = storedSummary?.service_risk_trend?.[service] || "insufficient_data";
  const etaMinutes = storedSummary?.service_failure_eta_minutes?.[service];
  const likelyToFail = Boolean(storedSummary?.service_failure_prediction?.[service]);
  const reasons: string[] = storedSummary?.service_risk_reasons?.[service] || [];
  const recommendations: string[] = storedSummary?.service_recommendations?.[service] || [];

  return (
    <div className="w-full h-[80vh] flex flex-col p-4 shadow-lg rounded-2xl bg-[oklch(0.205_0_0)] overflow-hidden">
      <div className="flex items-center justify-start shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 font-semibold transition-colors border shadow rounded-xl bg-[oklch(0.205_0_0)] text-zinc-100 hover:bg-zinc-800/90 border-zinc-800/60 backdrop-blur-md"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <Separator className="my-4 shrink-0" />

      <div className="flex-1 overflow-hidden">
        <div className="flex flex-col h-full max-w-2xl mx-2 border shadow-lg rounded-xl bg-[oklch(0.205_0_0)] text-zinc-100 border-zinc-800/60 backdrop-blur-md">
          <div className="flex-1 px-6 pt-6 pb-16 space-y-8 overflow-y-auto hide-scrollbar">
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-8 md:space-y-0">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold">Health:</span>
                <span className={healthColor[health] || "text-zinc-300 font-bold"}>{health}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold">Severity:</span>
                {storedSummary?.severity_distribution?.[service] ? (
                  <table className="ml-2 text-sm border-separate border-spacing-x-2">
                    <tbody>
                      {Object.entries(storedSummary.severity_distribution[service]).map(([level, count]) => (
                        <tr key={level}>
                          <td className="font-mono text-zinc-300">{level}</td>
                          <td className="font-bold text-zinc-100">{String(count)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <span className="ml-2 text-zinc-400">N/A</span>
                )}
              </div>
            </div>

            <Separator className="my-2" />

            <div className="p-4 rounded-lg bg-zinc-800/70">
              <span className="text-lg font-semibold">Failure Risk:</span>
              <div className="mt-2 text-sm text-zinc-300">
                <span className="font-semibold">Score:</span> {riskScore}
              </div>
              <div className="text-sm">
                <span className="font-semibold text-zinc-300">Level:</span>{" "}
                <span className={riskColor[riskLevel] || "text-zinc-200 font-bold"}>{riskLevel}</span>
              </div>
              <div className="text-sm text-zinc-300">
                <span className="font-semibold">Confidence:</span> {Math.round(confidence * 100)}%
              </div>
              <div className="text-sm">
                <span className="font-semibold text-zinc-300">Trend:</span>{" "}
                <span className={trendColor[trend] || "text-zinc-300 font-bold"}>{trend}</span>
              </div>
              <div className="text-sm text-zinc-300">
                <span className="font-semibold">Prediction:</span>{" "}
                {likelyToFail ? "Likely to fail soon" : "No imminent failure signal"}
              </div>
              <div className="text-sm text-zinc-300">
                <span className="font-semibold">Estimated failure window:</span>{" "}
                {etaMinutes ? `~${etaMinutes} minutes` : "Not predicted"}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-zinc-800/70">
              <span className="text-lg font-semibold">Most Common Error:</span>
              <div className="mt-1 font-mono text-base text-red-300">
                {storedSummary?.most_common_errors?.[service] || "None"}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-zinc-800/70">
              <span className="text-lg font-semibold">Why This Risk:</span>
              {reasons.length > 0 ? (
                <ul className="mt-2 space-y-1 text-sm text-zinc-300 list-disc list-inside">
                  {reasons.map((reason, idx) => (
                    <li key={`${service}-reason-${idx}`}>{reason}</li>
                  ))}
                </ul>
              ) : (
                <div className="mt-2 text-sm text-zinc-400">No risk factors yet.</div>
              )}
            </div>

            <div className="p-4 rounded-lg bg-zinc-800/70">
              <span className="text-lg font-semibold">Suggested Fixes:</span>
              {recommendations.length > 0 ? (
                <ul className="mt-2 space-y-1 text-sm text-zinc-300 list-disc list-inside">
                  {recommendations.map((recommendation, idx) => (
                    <li key={`${service}-recommendation-${idx}`}>{recommendation}</li>
                  ))}
                </ul>
              ) : (
                <div className="mt-2 text-sm text-zinc-400">No remediation suggestions yet.</div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-6 p-4 rounded-lg bg-zinc-800/70">
              <div>
                <span className="font-semibold">First Error:</span>{" "}
                <span className="font-mono text-zinc-300">
                  {storedSummary?.first_error_timestamp?.[service] || "N/A"}
                </span>
              </div>
              <div>
                <span className="font-semibold">Last Error:</span>{" "}
                <span className="font-mono text-zinc-300">
                  {storedSummary?.latest_error_timestamp?.[service] || "N/A"}
                </span>
              </div>
            </div>

            <div>
              <span className="text-lg font-semibold">Recent Errors:</span>
              <ul className="mt-3 space-y-3">
                {storedSummary?.recent_errors?.[service]?.length > 0 ? (
                  storedSummary.recent_errors[service].map((err: any, idx: number) => (
                    <li
                      key={idx}
                      className="p-3 border rounded-lg bg-zinc-900/80 border-zinc-800"
                    >
                      <div className="font-mono text-sm text-red-300 break-all">
                        {err.line || "No message"}
                      </div>
                      <div className="mt-1 text-xs text-zinc-400">
                        <span className="mr-2">
                          Type: <span className="font-mono text-zinc-300">{err.error_type || "N/A"}</span>
                        </span>
                        <span className="mr-2">
                          Severity: <span className="font-mono text-zinc-300">{err.severity_level || "N/A"}</span>
                        </span>
                        <span>
                          Time: <span className="font-mono text-zinc-300">{err.timestamp || "N/A"}</span>
                        </span>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-zinc-400">No recent errors.</li>
                )}
              </ul>
            </div>

            <div className="h-10" />
          </div>
        </div>
      </div>
    </div>
  );
}
