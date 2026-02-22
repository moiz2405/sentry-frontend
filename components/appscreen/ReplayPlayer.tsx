"use client";

import { useEffect, useRef, useState } from "react";
import { IconDeviceDesktop, IconLoader2, IconAlertCircle } from "@tabler/icons-react";

interface ReplayPlayerProps {
    events: any[];
    width?: number;
    height?: number;
}

// CDN URLs — completely bypass webpack, zero build-time resolution needed
const RRWEB_PLAYER_JS = "https://cdn.jsdelivr.net/npm/rrweb-player@1.0.0/dist/index.js";
const RRWEB_PLAYER_CSS = "https://cdn.jsdelivr.net/npm/rrweb-player@1.0.0/dist/style.css";

function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
        const el = document.createElement("script");
        el.src = src;
        el.onload = () => resolve();
        el.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(el);
    });
}

function loadCSS(href: string): void {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const el = document.createElement("link");
    el.rel = "stylesheet";
    el.href = href;
    document.head.appendChild(el);
}

export function ReplayPlayer({ events, width = 800, height = 450 }: ReplayPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!containerRef.current || events.length < 2) {
            if (events.length > 0 && events.length < 2) {
                setError("Not enough interaction data to render replay.");
            }
            return;
        }

        let cancelled = false;

        // Load the CSS immediately (non-blocking)
        loadCSS(RRWEB_PLAYER_CSS);

        // Load the JS from CDN — webpack never sees this import
        loadScript(RRWEB_PLAYER_JS)
            .then(() => {
                if (cancelled || !containerRef.current) return;

                const RrwebPlayer = (window as any).RrwebPlayer;
                if (!RrwebPlayer) {
                    throw new Error("rrweb-player did not attach to window.RrwebPlayer");
                }

                containerRef.current.innerHTML = "";
                setError(null);

                playerRef.current = new RrwebPlayer({
                    target: containerRef.current,
                    props: {
                        events,
                        width,
                        height,
                        autoPlay: true,
                        showController: true,
                    },
                });

                setReady(true);
            })
            .catch((err: any) => {
                if (!cancelled) {
                    console.error("[ReplayPlayer] Load error:", err);
                    setError("Failed to load replay engine. Check your network connection.");
                }
            });

        return () => {
            cancelled = true;
            try { playerRef.current?.pause?.(); } catch (_) { }
        };
    }, [events, width, height]);

    if (error) {
        return (
            <div
                className="flex flex-col items-center justify-center gap-3 bg-zinc-950 border border-red-900/30 rounded-xl"
                style={{ width, height }}
            >
                <IconAlertCircle className="size-8 text-red-500 opacity-80" />
                <p className="text-sm font-semibold text-red-400 text-center px-4">{error}</p>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div
                className="flex flex-col gap-3 items-center justify-center bg-zinc-950 border border-zinc-800 rounded-xl"
                style={{ width, height }}
            >
                <IconLoader2 className="size-8 text-blue-500 animate-spin" />
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Loading Session...</span>
            </div>
        );
    }

    return (
        <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl relative group">
            <div className="absolute top-0 left-0 right-0 h-8 bg-zinc-900/90 border-b border-zinc-800 flex items-center px-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <IconDeviceDesktop className="size-3.5" /> Client Session Replay
                </div>
            </div>

            {/* Shimmer while CDN script loads */}
            {!ready && (
                <div className="absolute inset-0 flex flex-col gap-3 items-center justify-center bg-zinc-950 z-20">
                    <IconLoader2 className="size-7 text-blue-500 animate-spin" />
                    <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Loading Player...</span>
                </div>
            )}

            <div ref={containerRef} className="flex items-center justify-center bg-zinc-950 mt-8" />

            <style jsx global>{`
        .replayer-wrapper { border-radius: 0 0 8px 8px; }
        .rr-controller { background: #18181b !important; border-top: 1px solid #27272a !important; }
        .rr-progress { background: #27272a !important; }
        .rr-progress.played { background: #3b82f6 !important; }
        .rr-controller__btns button { color: #a1a1aa !important; }
        .rr-controller__btns button:hover { color: #fff !important; }
      `}</style>
        </div>
    );
}
