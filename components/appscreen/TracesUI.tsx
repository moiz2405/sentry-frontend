"use client"
import { useState, useMemo } from "react"
import { IconActivity, IconSearch, IconList, IconFlame, IconTimeline, IconNetwork } from "@tabler/icons-react"

// Advanced realistic mock traces
const MOCK_TRACES = [
    {
        traceId: "a1b2c3d4e5f6g7h8",
        name: "POST /api/checkout",
        durationMs: 2450,
        timestamp: new Date().toISOString(),
        services: ["api-gateway", "auth-service", "order-service", "payment-service", "postgres-db", "stripe-api"],
        errors: 1,
        spans: [
            { id: "s1", service: "api-gateway", name: "POST /api/checkout", startMs: 0, durationMs: 2450, error: true },
            { id: "s2", parent: "s1", service: "auth-service", name: "verify_token", startMs: 10, durationMs: 45, error: false },
            { id: "s3", parent: "s1", service: "order-service", name: "create_order", startMs: 60, durationMs: 2380, error: true },
            { id: "s4", parent: "s3", service: "postgres-db", name: "INSERT INTO orders", startMs: 65, durationMs: 35, error: false },
            { id: "s5", parent: "s3", service: "payment-service", name: "charge_card", startMs: 105, durationMs: 2335, error: true },
            { id: "s6", parent: "s5", service: "stripe-api", name: "POST /v1/charges", startMs: 120, durationMs: 2320, error: true, tag: "timeout" },
        ]
    },
    {
        traceId: "x9y8z7w6v5u4t3s2",
        name: "GET /api/user/profile",
        durationMs: 142,
        timestamp: new Date(Date.now() - 50000).toISOString(),
        services: ["api-gateway", "user-service", "postgres-db", "redis-cache"],
        errors: 0,
        spans: [
            { id: "s1", service: "api-gateway", name: "GET /api/user/profile", startMs: 0, durationMs: 142, error: false },
            { id: "s2", parent: "s1", service: "user-service", name: "get_profile", startMs: 5, durationMs: 135, error: false },
            { id: "s3", parent: "s2", service: "redis-cache", name: "GET user:123", startMs: 10, durationMs: 5, error: false, tag: "cache miss" },
            { id: "s4", parent: "s2", service: "postgres-db", name: "SELECT FROM users", startMs: 15, durationMs: 125, error: false },
        ]
    },
    {
        traceId: "k1m2n3p4q5r6s7t8",
        name: "POST /webhook/stripe",
        durationMs: 320,
        timestamp: new Date(Date.now() - 150000).toISOString(),
        services: ["api-gateway", "payment-service", "email-service", "postgres-db"],
        errors: 0,
        spans: [
            { id: "s1", service: "api-gateway", name: "POST /webhook/stripe", startMs: 0, durationMs: 320, error: false },
            { id: "s2", parent: "s1", service: "payment-service", name: "process_webhook", startMs: 15, durationMs: 300, error: false },
            { id: "s3", parent: "s2", service: "postgres-db", name: "UPDATE transactions", startMs: 20, durationMs: 40, error: false },
            { id: "s4", parent: "s2", service: "email-service", name: "send_receipt", startMs: 65, durationMs: 250, error: false },
        ]
    },
    {
        traceId: "p9o8i7u6y5t4r3e2",
        name: "GET /api/products",
        durationMs: 85,
        timestamp: new Date(Date.now() - 300000).toISOString(),
        services: ["api-gateway", "product-service", "redis-cache"],
        errors: 0,
        spans: [
            { id: "s1", service: "api-gateway", name: "GET /api/products", startMs: 0, durationMs: 85, error: false },
            { id: "s2", parent: "s1", service: "product-service", name: "list_products", startMs: 10, durationMs: 70, error: false },
            { id: "s3", parent: "s2", service: "redis-cache", name: "GET products:list", startMs: 15, durationMs: 65, error: false, tag: "cache hit" },
        ]
    }
]

const SERVICE_COLORS: Record<string, string> = {
    "api-gateway": "bg-indigo-500",
    "auth-service": "bg-pink-500",
    "order-service": "bg-amber-500",
    "payment-service": "bg-rose-600",
    "postgres-db": "bg-blue-600",
    "stripe-api": "bg-slate-500",
    "user-service": "bg-cyan-500",
    "redis-cache": "bg-red-500",
    "email-service": "bg-emerald-500",
    "product-service": "bg-violet-500"
};

export function TracesUI({ appId }: { appId: string }) {
    const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    const filteredTraces = useMemo(() => {
        return MOCK_TRACES.filter(t =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.traceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    }, [searchQuery])

    const selectedTrace = useMemo(() => MOCK_TRACES.find(t => t.traceId === selectedTraceId), [selectedTraceId])

    return (
        <div className="flex flex-col h-full min-h-[600px] max-h-[calc(100vh-220px)] w-full bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden font-mono text-sm shadow-xl relative">

            {/* Top Toolbar */}
            <div className="flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-900 z-10">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 text-zinc-300">
                        <IconList className="size-4 text-violet-400" />
                        <span className="font-bold text-[14px] tracking-tight text-zinc-100">Distributed Traces</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-none">Follow a request end-to-end across every service it touched — pinpoint exactly where time was lost or errors occurred</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <IconSearch className="absolute left-2.5 top-2 size-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Filter by Trace ID, Service, Endpoint..."
                            className="pl-8 pr-4 py-1.5 bg-zinc-950 border border-zinc-700 rounded-md text-sm text-zinc-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-80 transition-all placeholder:text-zinc-600"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-1 min-h-0 overflow-hidden relative">

                {/* Master List (Left Panel) */}
                <div className="w-1/3 min-w-[320px] max-w-[400px] border-r border-zinc-800 overflow-y-auto bg-zinc-900/50 flex flex-col custom-scrollbar">
                    {filteredTraces.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500">No traces found matching criteria.</div>
                    ) : (
                        filteredTraces.map(trace => (
                            <div
                                key={trace.traceId}
                                onClick={() => setSelectedTraceId(trace.traceId)}
                                className={`p-4 border-b border-zinc-800/60 cursor-pointer transition-all ${selectedTraceId === trace.traceId ? 'bg-blue-900/10 border-l-4 border-l-blue-500 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]' : 'hover:bg-zinc-800 border-l-4 border-l-transparent'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`font-bold truncate pr-2 ${trace.errors > 0 ? 'text-red-400' : 'text-blue-400'}`}>{trace.name}</span>
                                    <span className={`text-xs font-mono font-medium whitespace-nowrap px-2 py-0.5 rounded ${trace.errors > 0 ? 'bg-red-500/10 text-red-400' : 'bg-zinc-800 text-zinc-300'}`}>
                                        {trace.durationMs}ms
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs mb-3">
                                    <span className="text-zinc-500 font-mono tracking-tight">{trace.traceId.substring(0, 10)}...</span>
                                    <span className="text-zinc-600 tabular-nums">{new Date(trace.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <div className="flex gap-1.5 flex-wrap">
                                    {trace.services.slice(0, 4).map(s => (
                                        <span key={s} className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-white tracking-wider flex items-center gap-1 shadow-sm" style={{ backgroundColor: SERVICE_COLORS[s] || '#52525b' }}>
                                            {s.split('-')[0]}
                                        </span>
                                    ))}
                                    {trace.services.length > 4 && <span className="text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded font-bold">+{trace.services.length - 4}</span>}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Detail/Waterfall View (Right Panel) */}
                <div className="flex-1 bg-zinc-950 overflow-y-auto relative flex flex-col custom-scrollbar">
                    {!selectedTrace ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-4 opacity-70">
                            <IconTimeline className="size-16 opacity-30" />
                            <p className="text-lg">Select a trace to view deep waterfall analysis</p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full animate-in fade-in duration-200">
                            {/* Trace Header Info */}
                            <div className="p-6 border-b border-zinc-800 bg-zinc-900/30 shrink-0">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
                                            {selectedTrace.errors > 0 && <IconFlame className="size-6 text-red-500 animate-pulse" />}
                                            {selectedTrace.name}
                                        </h2>
                                        <p className="text-sm text-zinc-500 mt-1 font-mono">{selectedTrace.traceId}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black font-mono tracking-tighter text-zinc-200">{selectedTrace.durationMs}<span className="text-lg text-zinc-500">ms</span></p>
                                        <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1 font-bold">{selectedTrace.spans.length} Spans</p>
                                    </div>
                                </div>

                                {/* Intelligent Summary if errors */}
                                {selectedTrace.errors > 0 && (
                                    <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-red-950/50 to-red-900/20 border border-red-900/50 shadow-inner flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-red-400 font-bold">
                                            <IconActivity className="size-4" /> AI Diagnostics Root Cause
                                        </div>
                                        <p className="text-sm text-red-200/90 leading-relaxed">
                                            Major bottleneck in <strong>stripe-api</strong> POST /v1/charges causing a {selectedTrace.spans.find(s => s.tag === "timeout")?.durationMs}ms block.
                                            This cascaded to the payment-service and ultimately caused the API gateway to return a 504 Timeout.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Waterfall Canvas */}
                            <div className="flex-1 p-6 overflow-y-auto">
                                <div className="relative">
                                    {/* Timeline Header Ruler */}
                                    <div className="flex border-b border-zinc-700 pb-2 mb-4 text-xs font-bold text-zinc-500 uppercase tracking-widest sticky top-0 bg-zinc-950 z-10 pt-2">
                                        <div className="w-[30%] shrink-0">Service & Span</div>
                                        <div className="w-[70%] flex justify-between relative px-2">
                                            <span>0ms</span>
                                            <span>{selectedTrace.durationMs}ms</span>

                                            {/* Ruler Grid Lines Background Overlay */}
                                            <div className="absolute inset-0 pointer-events-none opacity-20">
                                                {[0, 25, 50, 75, 100].map(pct => (
                                                    <div key={pct} className="absolute top-8 bottom-[-1000px] w-px bg-zinc-600" style={{ left: `${pct}%` }} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Spans Rendering */}
                                    <div className="flex flex-col gap-[2px]">
                                        {selectedTrace.spans.map((span, index) => {
                                            // Calculate indent based on parent structure (mocked via simple depth calculation)
                                            let depth = 0;
                                            let current = span;
                                            while (current.parent) {
                                                depth++;
                                                current = selectedTrace.spans.find(s => s.id === current.parent) || current;
                                                if (!current.parent) break; // Infinite loop safety
                                            }

                                            const leftPct = (span.startMs / selectedTrace.durationMs) * 100;
                                            const widthPct = Math.max((span.durationMs / selectedTrace.durationMs) * 100, 0.5); // Min visual width
                                            const serviceColor = SERVICE_COLORS[span.service] || "bg-zinc-600";

                                            return (
                                                <div key={span.id} className="group flex text-xs hover:bg-zinc-900/80 rounded py-1 transition-colors relative z-0">

                                                    {/* Span Identification */}
                                                    <div className="w-[30%] shrink-0 pr-4 flex flex-col justify-center border-r border-zinc-800/50" style={{ paddingLeft: `${depth * 16}px` }}>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${serviceColor} shadow-[0_0_8px_currentColor] opacity-50 group-hover:opacity-100 transition-opacity`} />
                                                            <span className="font-bold text-zinc-300 truncate">{span.service}</span>
                                                        </div>
                                                        <span className={`truncate mt-0.5 text-[10px] ${span.error ? 'text-red-400 font-bold' : 'text-zinc-500'}`}>{span.name}</span>
                                                    </div>

                                                    {/* Span Bar Chart */}
                                                    <div className="w-[70%] relative flex items-center px-2">
                                                        <div
                                                            className={`h-5 rounded-[3px] relative ${span.error ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : serviceColor} hover:brightness-125 transition-all cursor-crosshair overflow-hidden`}
                                                            style={{
                                                                width: `${widthPct}%`,
                                                                marginLeft: `${leftPct}%`
                                                            }}
                                                        >
                                                            {/* Micro details inside bar */}
                                                            {widthPct > 15 && (
                                                                <span className="absolute inset-0 flex items-center px-2 text-[10px] font-bold text-white truncate drop-shadow-md">
                                                                    {span.durationMs}ms
                                                                </span>
                                                            )}
                                                            {widthPct > 50 && span.tag && (
                                                                <span className="absolute inset-y-0 right-0 flex items-center px-2 text-[9px] font-black uppercase text-white/50 bg-black/20">
                                                                    {span.tag}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Details tooltip on short bars */}
                                                        {widthPct <= 15 && (
                                                            <span className="text-[10px] text-zinc-500 ml-2 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                                                                {span.durationMs}ms {span.tag && `(${span.tag})`}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Scrollbar CSS (Global to this component scope) */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3f3f46; border-radius: 20px; }
            `}</style>
        </div>
    )
}
