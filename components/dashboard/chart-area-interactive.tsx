"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "An interactive area chart"

export function ChartAreaInteractive({ errorRates, avgErrorRate }: { errorRates: number[]; avgErrorRate: number }) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  // errorRates is already the fully accumulated series from AppScreen
  let chartData = errorRates.map((rate, idx) => ({
    batch: idx + 1,
    errorRate: rate,
    avgErrorRate: avgErrorRate,
  }));

  // Only prepend 0 point if there is at least one real data point
  if (chartData.length > 0) {
    chartData = [{ batch: 0, errorRate: 0, avgErrorRate: 0 }, ...chartData];
  }

  // Optionally filter by timeRange (show last N batches)
  let filteredData = chartData;
  if (timeRange === "30d") {
    filteredData = chartData.slice(-30);
  } else if (timeRange === "7d") {
    filteredData = chartData.slice(-7);
  }

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  // Chart config for error rate
  const chartConfig = {
    errorRate: {
      label: "Error Rate",
      color: "#22d3ee",
    },
  };

  return (
    <Card className="@container/card bg-[oklch(0.205_0_0)]">
      <CardHeader>
        <CardTitle>Error Rate per 10 Logs</CardTitle>
        <CardDescription>
          <span className="font-semibold text-green-400">Avg: {avgErrorRate.toFixed(2)}</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">All</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">All</SelectItem>
              <SelectItem value="30d" className="rounded-lg">Last 30</SelectItem>
              <SelectItem value="7d" className="rounded-lg">Last 7</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData.length === 0 ? [{ batch: 0, errorRate: 0, avgErrorRate: 0 }] : filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fff" stopOpacity={1.0} />
                <stop offset="95%" stopColor="#fff" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fff" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#fff" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="batch"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={8}
              label={{ value: "Batch", position: "insideBottomRight", offset: -5 }}
            />
            <ChartTooltip
              cursor={false}
              content={({ label, payload }) => (
                <div className="p-2 text-xs rounded shadow bg-zinc-900">
                  <div>Batch: {label}</div>
                  <div>Error Rate: {payload?.[0]?.value}</div>
                </div>
              )}
            />
            <Area
              dataKey="errorRate"
              type="monotone"
              fill="url(#fillDesktop)"
              stroke="#fff"
              strokeWidth={2}
              dot={{ r: 2 }}
            />
            <Area
              dataKey="avgErrorRate"
              type="monotone"
              fill="none"
              stroke="#f59e42"
              strokeWidth={2}
              dot={false}
              strokeDasharray="4 2"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
