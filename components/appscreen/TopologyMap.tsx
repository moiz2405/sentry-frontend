"use client"
import { useState, useEffect, useMemo, useRef } from "react"
import { IconNetwork, IconServer, IconDatabase, IconCloud, IconZoomIn, IconZoomOut, IconFocusCentered, IconActivity, IconAlertTriangle } from "@tabler/icons-react"

// Advanced Mock dependency topology
const INITIAL_NODES = [
    { id: "api-gateway", type: "gateway", status: "healthy", x: 100, y: 250, rpm: 4200, errorRate: 0.1, latency: 45 },
    { id: "auth-service", type: "service", status: "healthy", x: 350, y: 150, rpm: 1200, errorRate: 0.0, latency: 12 },
    { id: "user-service", type: "service", status: "healthy", x: 350, y: 350, rpm: 800, errorRate: 0.2, latency: 25 },
    { id: "payment-service", type: "service", status: "error", x: 400, y: 550, rpm: 150, errorRate: 14.2, latency: 2400 },
    { id: "postgres-db", type: "database", status: "warning", x: 650, y: 350, rpm: 2100, errorRate: 0.5, latency: 150 },
    { id: "stripe-api", type: "external", status: "healthy", x: 700, y: 550, rpm: 150, errorRate: 0.0, latency: 400 },
    { id: "redis-cache", type: "database", status: "healthy", x: 650, y: 150, rpm: 8500, errorRate: 0.0, latency: 2 },
    { id: "email-service", type: "service", status: "healthy", x: 350, y: 50, rpm: 50, errorRate: 0.0, latency: 800 },
]

const EDGES = [
    { source: "api-gateway", target: "auth-service", label: "gRPC", protocol: "grpc" },
    { source: "api-gateway", target: "user-service", label: "HTTP", protocol: "http" },
    { source: "api-gateway", target: "payment-service", label: "gRPC", protocol: "grpc" },
    { source: "auth-service", target: "redis-cache", label: "TCP/6379", protocol: "tcp" },
    { source: "user-service", target: "postgres-db", label: "TCP/5432", protocol: "tcp" },
    { source: "payment-service", target: "postgres-db", label: "TCP/5432", protocol: "tcp" },
    { source: "payment-service", target: "stripe-api", label: "HTTPS", protocol: "https" },
    { source: "user-service", target: "email-service", label: "Kafka", protocol: "kafka" },
]

export function TopologyMap({ appId }: { appId: string }) {
    const [nodes, setNodes] = useState(INITIAL_NODES)
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
    const [isDragging, setIsDragging] = useState(false)
    const svgRef = useRef<SVGSVGElement>(null)

    // Pan & Zoom handlers
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault()
        const scaleBy = 1.1
        const newScale = e.deltaY > 0 ? transform.scale / scaleBy : transform.scale * scaleBy
        setTransform(t => ({ ...t, scale: Math.max(0.2, Math.min(newScale, 3)) }))
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target !== svgRef.current) return // Only drag background
        setIsDragging(true)
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return
        setTransform(t => ({
            ...t,
            x: t.x + e.movementX,
            y: t.y + e.movementY
        }))
    }

    const handleMouseUp = () => setIsDragging(false)

    // Highlight connecting edges when a node is selected
    const getEdgeStyle = (edge: typeof EDGES[0]) => {
        if (!selectedNodeId) return { stroke: "#3f3f46", opacity: 0.6, width: 2 }
        if (edge.source === selectedNodeId || edge.target === selectedNodeId) {
            return { stroke: "#60a5fa", opacity: 1, width: 3 }
        }
        return { stroke: "#27272a", opacity: 0.2, width: 1 }
    }

    const selectedNode = nodes.find(n => n.id === selectedNodeId)

    return (
        <div className="flex flex-col h-full min-h-[600px] max-h-[calc(100vh-220px)] w-full bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden font-mono text-sm relative">
            <div className="flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-900 z-20 shadow-md">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 text-zinc-300">
                        <IconNetwork className="size-4 text-blue-400" />
                        <span className="font-bold text-[14px] tracking-tight text-zinc-100">Service Map</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-none">See how your services depend on each other — spot the blast radius of any failure instantly</p>
                </div>
                <div className="flex items-center gap-4 bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-800">
                    <div className="flex items-center gap-1.5 text-xs"><span className="size-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> Healthy</div>
                    <div className="flex items-center gap-1.5 text-xs"><span className="size-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]"></span> Warning</div>
                    <div className="flex items-center gap-1.5 text-xs"><span className="size-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span> Critical</div>
                </div>
            </div>

            {/* Canvas Area */}
            <div
                className="flex-1 relative overflow-hidden bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:20px_20px] cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
            >
                {/* Floating Controls */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 bg-zinc-900/80 p-1.5 rounded-lg border border-zinc-800 backdrop-blur-sm shadow-xl">
                    <button onClick={() => setTransform(t => ({ ...t, scale: t.scale * 1.2 }))} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"><IconZoomIn className="size-4" /></button>
                    <button onClick={() => setTransform(t => ({ ...t, scale: t.scale / 1.2 }))} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"><IconZoomOut className="size-4" /></button>
                    <div className="h-px bg-zinc-800 my-0.5" />
                    <button onClick={() => setTransform({ x: 0, y: 0, scale: 1 })} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"><IconFocusCentered className="size-4" /></button>
                </div>

                {/* SVG Graph rendering */}
                <svg
                    ref={svgRef}
                    className="absolute inset-0 w-full h-full"
                    style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0' }}
                >
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#52525b" />
                        </marker>
                        <marker id="arrowhead-highlight" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#60a5fa" />
                        </marker>
                    </defs>

                    {/* Edges */}
                    {EDGES.map((edge, i) => {
                        const src = nodes.find(n => n.id === edge.source)
                        const tgt = nodes.find(n => n.id === edge.target)
                        if (!src || !tgt) return null

                        const style = getEdgeStyle(edge)
                        const isHighlighted = style.opacity === 1

                        // Calculate arrow positions around borders instead of centers ideally, but centers are okay for a mock
                        const x1 = src.x + 80
                        const y1 = src.y + 40
                        const x2 = tgt.x - 5
                        const y2 = tgt.y + 40

                        return (
                            <g key={i} className="transition-opacity duration-300">
                                <line
                                    x1={x1} y1={y1}
                                    x2={x2} y2={y2}
                                    stroke={style.stroke}
                                    strokeWidth={style.width}
                                    opacity={style.opacity}
                                    strokeDasharray={tgt.status === "error" ? "5,5" : "none"}
                                    markerEnd={`url(#${isHighlighted ? 'arrowhead-highlight' : 'arrowhead'})`}
                                    className={tgt.status === "error" ? "animate-[dash_1s_linear_infinite]" : ""}
                                />
                                <rect
                                    x={(x1 + x2) / 2 - 30}
                                    y={(y1 + y2) / 2 - 10}
                                    width="60"
                                    height="20"
                                    fill="#18181b"
                                    rx="4"
                                    opacity={style.opacity}
                                    className="stroke-zinc-800 stroke-1"
                                />
                                <text
                                    x={(x1 + x2) / 2}
                                    y={(y1 + y2) / 2 + 3}
                                    fill={isHighlighted ? "#93c5fd" : "#71717a"}
                                    fontSize="10"
                                    textAnchor="middle"
                                    opacity={style.opacity}
                                    className="font-medium"
                                >
                                    {edge.label}
                                </text>
                            </g>
                        )
                    })}

                    {/* Nodes HTML Overlay (rendered inside SVG foreignObject for perfect scaling) */}
                    {nodes.map(node => {
                        const isError = node.status === 'error';
                        const isWarning = node.status === 'warning';
                        const isSelected = selectedNodeId === node.id;
                        const isFaded = selectedNodeId && !isSelected && !EDGES.some(e => (e.source === selectedNodeId && e.target === node.id) || (e.target === selectedNodeId && e.source === node.id));

                        return (
                            <foreignObject key={node.id} x={node.x} y={node.y} width="160" height="80" className="overflow-visible">
                                <div
                                    onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                                    className={`relative flex flex-col p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none shadow-xl w-[150px] h-[75px] group
                                        ${isError ? 'bg-red-950/40 border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                            : isWarning ? 'bg-yellow-950/40 border-yellow-500/80 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                                                : 'bg-zinc-900/80 border-zinc-700/80 hover:border-blue-500/50 hover:bg-zinc-800'}
                                        ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-105 z-10' : ''}
                                        ${isFaded ? 'opacity-30' : 'opacity-100'}
                                        backdrop-blur-md
                                    `}
                                >
                                    {/* Pulse effect for errors */}
                                    {isError && <div className="absolute inset-0 rounded-xl border-2 border-red-500 animate-ping opacity-20" />}

                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`p-1.5 rounded-md ${isError ? 'bg-red-500/20 text-red-400' : isWarning ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                            {node.type === 'database' ? <IconDatabase className="size-4" />
                                                : node.type === 'gateway' ? <IconCloud className="size-4" />
                                                    : <IconServer className="size-4" />}
                                        </div>
                                        <span className={`font-bold tracking-tight truncate flex-1 text-xs ${isError ? 'text-red-200' : 'text-zinc-100'}`}>{node.id}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px]">
                                        <div className="flex flex-col">
                                            <span className="text-zinc-500">Latency</span>
                                            <span className={`font-mono font-medium ${isError || isWarning ? 'text-yellow-400' : 'text-zinc-300'}`}>{node.latency}ms</span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-zinc-500">Errors</span>
                                            <span className={`font-mono font-medium ${isError ? 'text-red-400' : 'text-green-400'}`}>{node.errorRate}%</span>
                                        </div>
                                    </div>
                                </div>
                            </foreignObject>
                        )
                    })}
                </svg>

                {/* Advanced Side Panel for Selected Node */}
                {selectedNode && (
                    <div className="absolute top-0 right-0 w-96 h-full bg-zinc-950/95 border-l border-zinc-800 shadow-2xl p-5 transform transition-transform animate-in slide-in-from-right backdrop-blur-xl z-30 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${selectedNode.status === 'error' ? 'bg-red-500/20 text-red-500' : selectedNode.status === 'warning' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                    {selectedNode.type === 'database' ? <IconDatabase className="size-6" /> : selectedNode.type === 'gateway' ? <IconCloud className="size-6" /> : <IconServer className="size-6" />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white tracking-tight">{selectedNode.id}</h3>
                                    <p className="text-xs text-zinc-400 uppercase tracking-widest">{selectedNode.type}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedNodeId(null)} className="text-zinc-500 hover:text-white bg-zinc-900 rounded-full p-1 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                            {/* Live Metrics Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/20" />
                                    <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><IconActivity className="size-3" /> Throughput</p>
                                    <p className="text-2xl font-bold text-zinc-100 font-mono">{selectedNode.rpm.toLocaleString()}</p>
                                    <p className="text-[10px] text-zinc-500 mt-1">req/min</p>
                                </div>
                                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl relative overflow-hidden">
                                    <div className={`absolute top-0 left-0 w-full h-1 ${selectedNode.status === 'error' ? 'bg-red-500/50' : 'bg-green-500/20'}`} />
                                    <p className="text-xs text-zinc-500 mb-1 items-center flex gap-1"><svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg> Error Rate</p>
                                    <p className={`text-2xl font-bold font-mono ${selectedNode.status === 'error' ? 'text-red-400' : 'text-green-400'}`}>{selectedNode.errorRate}%</p>
                                    <p className="text-[10px] text-zinc-500 mt-1">last 5m avg</p>
                                </div>
                                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl col-span-2 relative overflow-hidden flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">p95 Latency</p>
                                        <p className="text-xl font-bold text-zinc-100 font-mono">{selectedNode.latency}ms</p>
                                    </div>
                                    <div className="w-32 h-8 flex items-end gap-0.5">
                                        {/* Fake sparkline */}
                                        {[40, 35, 42, 60, 45, selectedNode.latency > 1000 ? 100 : 30].map((h, i) => (
                                            <div key={i} className={`flex-1 rounded-t-sm ${selectedNode.latency > 1000 && i > 3 ? 'bg-red-500/80 animate-pulse' : 'bg-blue-500/40'}`} style={{ height: `${h}%` }} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Intelligent Insights */}
                            {selectedNode.status === 'error' ? (
                                <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl">
                                    <p className="flex items-center gap-2 text-red-500 font-bold mb-2">
                                        <IconAlertTriangle className="size-4" /> AI Diagnostics
                                    </p>
                                    <p className="text-sm text-red-200/90 leading-relaxed mb-4">
                                        The <strong className="text-red-100">database connection pool is exhausted</strong>. This is causing latency to spike to {selectedNode.latency}ms, resulting in cascading timeouts upstream to the API Gateway.
                                    </p>
                                    <div className="flex gap-2">
                                        <button className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg text-xs transition-colors shadow-lg shadow-red-900/20">
                                            View Logs
                                        </button>
                                        <button className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-lg text-xs transition-colors border border-zinc-700">
                                            View Traces
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                                    <h4 className="text-sm font-semibold text-zinc-300 mb-3 border-b border-zinc-800 pb-2">Downstream Dependencies</h4>
                                    <div className="space-y-3">
                                        {EDGES.filter(e => e.source === selectedNode.id).map(e => (
                                            <div key={e.target} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${nodes.find(n => n.id === e.target)?.status === 'error' ? 'bg-red-500' : 'bg-green-500'}`} />
                                                    <span className="text-sm text-zinc-400 font-medium">{e.target}</span>
                                                </div>
                                                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-500">{e.label}</span>
                                            </div>
                                        ))}
                                        {EDGES.filter(e => e.source === selectedNode.id).length === 0 && (
                                            <p className="text-xs text-zinc-600 italic">No downstream dependencies.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
