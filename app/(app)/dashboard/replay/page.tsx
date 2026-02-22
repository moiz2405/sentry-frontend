"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
    IconDeviceDesktop,
    IconAlertCircle,
    IconClock,
    IconUser,
    IconBrowser,
    IconActivity,
    IconTerminal2,
    IconLoader2,
} from "@tabler/icons-react";

const ReplayPlayer = dynamic(
    () => import("@/components/appscreen/ReplayPlayer").then(m => ({ default: m.ReplayPlayer })),
    { ssr: false, loading: () => <div className="flex items-center justify-center" style={{ width: 800, height: 500 }}><IconLoader2 className="size-7 animate-spin text-blue-500" /></div> }
);

// Mock rrweb events for a simple page load, click, and input
const mockRrwebEvents = [
    { "type": 4, "data": { "href": "http://localhost:3000/", "width": 800, "height": 600 }, "timestamp": 1700000000000 },
    {
        "type": 2,
        "data": {
            "node": {
                "type": 0,
                "childNodes": [
                    {
                        "type": 2,
                        "tagName": "html",
                        "attributes": { "lang": "en" },
                        "childNodes": [
                            {
                                "type": 2,
                                "tagName": "head",
                                "attributes": {},
                                "childNodes": [],
                                "id": 3
                            },
                            {
                                "type": 2,
                                "tagName": "body",
                                "attributes": { "style": "margin: 0; padding: 20px; font-family: monospace; background: #09090b; color: #fff;" },
                                "childNodes": [
                                    {
                                        "type": 2,
                                        "tagName": "h1",
                                        "attributes": { "style": "color: #3b82f6;" },
                                        "childNodes": [{ "type": 3, "textContent": "Checkout Page", "id": 6 }],
                                        "id": 5
                                    },
                                    {
                                        "type": 2,
                                        "tagName": "button",
                                        "attributes": { "id": "pay-btn", "style": "padding: 10px 20px; background: #3b82f6; border: none; border-radius: 4px; color: white; cursor: pointer; margin-top: 20px;" },
                                        "childNodes": [{ "type": 3, "textContent": "Complete Purchase", "id": 8 }],
                                        "id": 7
                                    }
                                ],
                                "id": 4
                            }
                        ],
                        "id": 2
                    }
                ],
                "id": 1
            },
            "initialOffset": { "left": 0, "top": 0 }
        },
        "timestamp": 1700000000100
    },
    { "type": 3, "data": { "source": 2, "positions": [{ "x": 100, "y": 100, "id": 4, "timeOffset": 0 }] }, "timestamp": 1700000002000 },
    { "type": 3, "data": { "source": 2, "positions": [{ "x": 150, "y": 150, "id": 4, "timeOffset": 0 }] }, "timestamp": 1700000002500 },
    { "type": 3, "data": { "source": 2, "positions": [{ "x": 180, "y": 80, "id": 4, "timeOffset": 0 }] }, "timestamp": 1700000003000 },
    { "type": 3, "data": { "source": 2, "positions": [{ "x": 120, "y": 110, "id": 4, "timeOffset": 0 }] }, "timestamp": 1700000003500 },
    { "type": 3, "data": { "source": 2, "positions": [{ "x": 130, "y": 120, "id": 4, "timeOffset": 0 }] }, "timestamp": 1700000003800 },
    // Move to button
    { "type": 3, "data": { "source": 2, "positions": [{ "x": 80, "y": 90, "id": 7, "timeOffset": 0 }] }, "timestamp": 1700000004500 },
    // Click button
    { "type": 3, "data": { "source": 1, "id": 7, "x": 80, "y": 90 }, "timestamp": 1700000005000 },
    // 500 error happens here roughly in the video
    { "type": 3, "data": { "source": 2, "positions": [{ "x": 85, "y": 95, "id": 7, "timeOffset": 0 }] }, "timestamp": 1700000006000 },
];

export default function ReplayPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    return (
        <div className="flex h-screen w-full bg-zinc-950 font-sans text-zinc-100">
            {/* The sidebar is inherited if we placed this correctly, but currently we are building a standalone page to verify the feature before integrating into the main nav. */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Header */}
                <div className="h-[72px] shrink-0 border-b border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center">
                            <IconDeviceDesktop className="size-5 text-orange-400" />
                        </div>
                        <div>
                            <h1 className="text-[17px] font-bold tracking-tight text-white flex items-center gap-2">
                                Session Replay <span className="text-[10px] uppercase font-bold text-orange-400 bg-orange-950 px-2 py-0.5 rounded-full ring-1 ring-orange-500/50">BETA</span>
                            </h1>
                            <p className="text-xs text-zinc-400 mt-0.5">user-bd8f72 • Unhandled Promise Rejection (500)</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 text-[11px] font-medium text-zinc-400">
                        <div className="flex items-center gap-1.5"><IconClock className="size-3.5" /> 6s Duration</div>
                        <div className="flex items-center gap-1.5"><IconUser className="size-3.5" /> Chrome 120 (Mac OS)</div>
                        <div className="flex items-center gap-1.5"><IconBrowser className="size-3.5" /> 1920x1080</div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex min-h-0 bg-zinc-950">

                    {/* Player Area (Center) */}
                    <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center justify-start relative">
                        {/* Decorative Background Glow */}
                        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/5 blur-[120px] pointer-events-none rounded-full" />

                        <div className="w-full max-w-4xl relative z-10">
                            {mounted && <ReplayPlayer events={mockRrwebEvents} width={800} height={500} />}
                        </div>
                    </div>

                    {/* Right Context Panel (DevTools Simulation) */}
                    <div className="w-[400px] border-l border-zinc-800 flex flex-col bg-zinc-900/30 shrink-0">
                        {/* Tabs */}
                        <div className="flex border-b border-zinc-800">
                            <button className="flex-1 py-3 text-xs font-bold text-orange-400 border-b-2 border-orange-500 flex items-center justify-center gap-2 bg-zinc-800/50">
                                <IconTerminal2 className="size-4" /> Console (1)
                            </button>
                            <button className="flex-1 py-3 text-xs font-bold text-zinc-500 hover:text-zinc-300 border-b-2 border-transparent flex items-center justify-center gap-2 transition-colors">
                                <IconActivity className="size-4" /> Network (4)
                            </button>
                        </div>

                        {/* Console List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            <div className="flex gap-3 text-xs font-mono">
                                <span className="text-zinc-500 shrink-0">00:01</span>
                                <span className="text-blue-400">Info: App hydrated successfully.</span>
                            </div>
                            <div className="flex gap-3 text-xs font-mono">
                                <span className="text-zinc-500 shrink-0">00:03</span>
                                <span className="text-zinc-300">Log: Attempting to fetch cart details...</span>
                            </div>
                            <div className="flex gap-3 text-xs font-mono">
                                <span className="text-zinc-500 shrink-0">00:05</span>
                                <span className="text-zinc-300">Log: User initiation `purchase_intent`</span>
                            </div>

                            {/* Error Row */}
                            <div className="flex gap-3 text-xs font-mono bg-red-950/20 active-glow border border-red-900/50 p-2.5 rounded shadow-lg shadow-red-900/10 mt-4 relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                                <span className="text-red-400 shrink-0 pt-0.5 w-10">00:06</span>
                                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                    <div className="flex items-start gap-1.5 text-red-300 font-bold">
                                        <IconAlertCircle className="size-3.5 shrink-0 mt-0.5" />
                                        <span className="break-words">POST /api/checkout 500 (Internal Server Error)</span>
                                    </div>
                                    <div className="text-red-400/80 text-[10px] pl-5 overflow-x-auto whitespace-pre custom-scrollbar pb-1">
                                        {`AxiosError: Request failed with status code 500
    at settle (axios.js:1234)
    at XMLHttpRequest.onloadend (axios.js:987)
    at invokeFunc (lodash.js:123)`}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Link to Trace Header */}
                        <div className="p-4 border-t border-zinc-800 bg-zinc-950">
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                                Traceparent Correlated <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                            </p>
                            <button className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-bold text-zinc-200 shadow-sm transition-colors">
                                View Backend Trace in DB
                            </button>
                        </div>
                    </div>

                </div>
            </div>
            {/* Custom Scrollbar */}
            <style jsx>{`
               .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
               .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
               .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3f3f46; border-radius: 20px; }
            `}</style>
        </div>
    );
}
