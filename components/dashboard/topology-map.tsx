"use client"

import { IconRocket } from "@tabler/icons-react"

export function TopologyMap() {
    return (
        <div className="w-full max-w-6xl space-y-8 rounded-xl bg-zinc-900 border border-zinc-800 p-8 shadow-2xl">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                    <IconRocket className="size-8 text-emerald-400" />
                    Service Topology Map
                </h2>
                <p className="text-lg text-zinc-400">
                    Visualize real-time interconnectivity between your application services.
                </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-6 flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
                <div className="p-8 border border-dashed border-emerald-500/30 rounded-xl bg-emerald-500/5">
                    <p className="text-emerald-400 font-medium tracking-wide">
                        TOPOLOGY RENDERING ENGINE INITIALIZING...
                    </p>
                    <p className="text-sm text-emerald-500/60 mt-2">
                        Waiting for sufficient trace data to generate the dependency graph.
                    </p>
                </div>
            </div>
        </div>
    )
}
