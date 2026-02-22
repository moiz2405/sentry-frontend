"use client"

import { useState } from "react"
import { IconRocket, IconExternalLink } from "@tabler/icons-react"

export function TracesUI() {
    const [loading, setLoading] = useState(false)

    return (
        <div className="w-full max-w-6xl space-y-8 rounded-xl bg-zinc-900 border border-zinc-800 p-8 shadow-2xl">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                    <IconRocket className="size-8 text-violet-400" />
                    Distributed Tracing (Jaeger)
                </h2>
                <p className="text-lg text-zinc-400">
                    Analyze request waterfalls and pinpoint latency bottlenecks across your microservices.
                </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-6 flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
                <div className="bg-violet-500/10 p-4 rounded-full">
                    <IconExternalLink className="size-10 text-violet-400" />
                </div>
                <div className="space-y-2 max-w-md text-balance">
                    <h3 className="text-xl font-semibold text-white">Jaeger UI is running externally</h3>
                    <p className="text-zinc-400">
                        The full Jaeger Trace Explorer provides advanced waterfall visualizations, dependency graphs, and span analysis.
                    </p>
                </div>

                <a
                    href="http://localhost:16686"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center justify-center rounded-md bg-violet-600 px-8 text-sm font-medium text-white transition-colors hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                >
                    Open Jaeger UI
                    <IconExternalLink className="ml-2 size-4" />
                </a>
            </div>
        </div>
    )
}
