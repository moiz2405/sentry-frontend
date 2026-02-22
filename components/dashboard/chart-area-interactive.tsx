"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  IconActivity,
  IconChartLine,
  IconTrendingUp,
} from "@tabler/icons-react"

export function ChartAreaInteractive({ errorRates, avgErrorRate }: { errorRates: number[]; avgErrorRate: number }) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  // Generate fake throughput data that correlates roughly with error spikes to make the chart look like a real APM
  const chartData = React.useMemo(() => {
    let data = errorRates.map((rate, idx) => {
      // base rpm + some noise. spike throughput when there are errors
      const baseRpm = 1200 + Math.sin(idx / 5) * 400 + Math.random() * 200;
      const rpmSurge = rate > avgErrorRate ? rate * 50 : 0;

      return {
        batch: idx + 1,
        timeLabel: new Date(Date.now() - (errorRates.length - idx) * 30000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        errorRate: rate,
        avgErrorRate: avgErrorRate,
        throughput: Math.floor(baseRpm + rpmSurge)
      }
    });

    if (data.length > 0) {
      data = [{ batch: 0, timeLabel: new Date(Date.now() - (errorRates.length + 1) * 30000).toLocaleTimeString(), errorRate: 0, avgErrorRate: 0, throughput: 1200 }, ...data];
    }
    return data;
  }, [errorRates, avgErrorRate]);

  // Windowing
  let filteredData = chartData;
  if (timeRange === "30d") {
    filteredData = chartData.slice(-30);
  } else if (timeRange === "7d") {
    filteredData = chartData.slice(-7);
  }

  React.useEffect(() => {
    if (isMobile) setTimeRange("7d");
  }, [isMobile]);

  return (
    <Card className="bg-zinc-950/50 border-zinc-800/80 shadow-2xl relative overflow-hidden backdrop-blur-xl h-full flex flex-col">
      {/* Decorative top gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 opacity-80" />

      <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0 border-b border-zinc-800/50 bg-zinc-900/20">
        <div>
          <CardTitle className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <IconActivity className="size-5 text-blue-400" />
            Live Telemetry Stream
          </CardTitle>
          <CardDescription className="text-zinc-500 mt-1 flex items-center gap-2">
            <span>Real-time aggregation from 12 instances</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          </CardDescription>
        </div>

        {/* Metric summary boxes inline with header */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Avg Error Rate</span>
            <span className="text-xl font-mono font-black text-red-400">{avgErrorRate.toFixed(2)}%</span>
          </div>
          <div className="w-px h-8 bg-zinc-800" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Latest Throughput</span>
            <span className="text-xl font-mono font-black text-blue-400">
              {chartData.length > 0 ? chartData[chartData.length - 1].throughput.toLocaleString() : 0} <span className="text-xs text-zinc-500 font-sans">rpm</span>
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 min-h-0 relative">
        <div className="absolute top-4 right-6 z-10 flex items-center gap-4 bg-zinc-900/80 border border-zinc-800 py-1.5 px-3 rounded-full shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-xs font-medium text-blue-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500/50 border border-blue-500" /> Throughput
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-red-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500/50 border border-red-500" /> Error Rate
          </div>
        </div>

        {filteredData.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-zinc-600">
            <IconChartLine className="size-12 mb-2 opacity-50" />
            <p>Awaiting telemetry data stream...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{ top: 40, right: 0, left: -20, bottom: 0 }}
              onMouseMove={(e) => {
                if (e.activeTooltipIndex !== undefined) {
                  setActiveIndex(e.activeTooltipIndex);
                }
              }}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <defs>
                <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorError" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.4} />
              <XAxis
                dataKey="timeLabel"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#71717a', fontSize: 11, fontWeight: 500 }}
                tickMargin={12}
                minTickGap={30}
                height={40}
              />
              <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }}
                tickFormatter={(val) => `${val}rpm`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }}
                tickFormatter={(val) => `${val}%`}
              />

              {/* Custom Dual Tooltip */}
              <RechartsTooltip
                cursor={{ stroke: '#52525b', strokeWidth: 1, strokeDasharray: '4 4' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl overflow-hidden min-w-[200px] animate-in zoom-in-95 duration-100">
                        <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 text-xs font-mono font-medium text-zinc-400">
                          Time: {label}
                        </div>
                        <div className="p-3 space-y-3">
                          <div className="flex justify-between items-center bg-blue-950/20 px-2 py-1.5 rounded-lg">
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-400">
                              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_currentColor]" /> Throughput
                            </span>
                            <span className="font-mono text-sm font-bold text-zinc-100">
                              {payload[0]?.value?.toLocaleString()} <span className="text-[10px] text-zinc-500 font-sans font-normal">rpm</span>
                            </span>
                          </div>
                          <div className="flex justify-between items-center bg-red-950/20 px-2 py-1.5 rounded-lg">
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400">
                              <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_currentColor]" /> Error Rate
                            </span>
                            <span className="font-mono text-sm font-bold text-zinc-100 flex items-center gap-2">
                              {/* Sparkline trend indicator */}
                              {Number(payload[1]?.value) > avgErrorRate && <IconTrendingUp className="size-3 text-red-500" />}
                              {payload[1]?.value}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <ReferenceLine yAxisId="right" y={avgErrorRate} stroke="#fb923c" strokeDasharray="3 3" opacity={0.5} />

              <Area
                yAxisId="left"
                type="monotone"
                dataKey="throughput"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorThroughput)"
                activeDot={{ r: 6, fill: "#3b82f6", stroke: "#000", strokeWidth: 2 }}
                animationDuration={1500}
              />
              <Area
                yAxisId="right"
                type="stepAfter"
                dataKey="errorRate"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorError)"
                activeDot={{ r: 6, fill: "#ef4444", stroke: "#000", strokeWidth: 2 }}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
