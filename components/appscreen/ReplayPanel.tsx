"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
    IconDeviceDesktop,
    IconLoader2,
    IconAlertCircle,
    IconClock,
    IconUser,
    IconChevronRight,
    IconTerminal2,
    IconActivity,
    IconRefresh,
    IconCopy,
    IconCheck,
    IconPlayerPlay,
} from "@tabler/icons-react";
import { backendAPI, type ReplaySession } from "@/lib/api/backend-api";

// Dynamically import the player to avoid SSR issues with rrweb-player
const ReplayPlayer = dynamic(
    () => import("./ReplayPlayer").then((mod) => ({ default: mod.ReplayPlayer })),
    { ssr: false, loading: () => <LoadingBlock text="Loading Player..." /> }
);

function LoadingBlock({ text }: { text: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 text-zinc-500 h-full min-h-[300px]">
            <IconLoader2 className="size-7 animate-spin text-blue-500" />
            <span className="text-xs font-bold uppercase tracking-widest">{text}</span>
        </div>
    );
}

interface ReplayPanelProps {
    appId: string;
}

export function ReplayPanel({ appId }: ReplayPanelProps) {
    const { data: session } = useSession();
    const userId = session?.user?.id;

    const [sessions, setSessions] = useState<ReplaySession[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(true);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [selectedSession, setSelectedSession] = useState<ReplaySession | null>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const loadSessions = useCallback(async () => {
        if (!userId) return;
        setLoadingSessions(true);
        setError(null);
        try {
            const result = await backendAPI.listReplaySessions(appId, userId);
            setSessions(result.sessions || []);
        } catch (e: any) {
            // If the endpoint returns 404, it means no sessions yet — that's fine
            if (!e.message?.includes("not found")) setError(e.message);
            setSessions([]);
        } finally {
            setLoadingSessions(false);
        }
    }, [appId, userId]);

    // Load a specific session's events into the player
    const handleSelectSession = async (s: ReplaySession) => {
        if (!userId) return;
        setSelectedSession(s);
        setLoadingEvents(true);
        setEvents([]);
        try {
            const result = await backendAPI.getReplayEvents(appId, s.session_id, userId);
            setEvents(result.events || []);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoadingEvents(false);
        }
    };

    useEffect(() => {
        loadSessions();
    }, [loadSessions]);

    // ─── Empty / Error state ────────────────────────────────────────────────────

    const noSessions = !loadingSessions && sessions.length === 0;

    return (
        <div className="flex h-[calc(100vh-200px)] min-h-[600px] w-full bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">

            {/* ── Left sidebar: session list ─────────────────────────────────────── */}
            <div className="w-72 shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-900/40">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                        <IconDeviceDesktop className="size-3.5" /> Sessions
                    </span>
                    <button
                        onClick={loadSessions}
                        className="size-6 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                        title="Refresh sessions"
                    >
                        <IconRefresh className="size-3.5" />
                    </button>
                </div>

                {/* Session list */}
                <div className="flex-1 overflow-y-auto">
                    {loadingSessions && <LoadingBlock text="Loading sessions..." />}

                    {error && !loadingSessions && (
                        <div className="p-4 text-xs text-red-400 flex items-center gap-2">
                            <IconAlertCircle className="size-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {noSessions && (() => {
                        const snippet = `import { initReplay } from 'sentry-replay';

initReplay({
  dsn: 'http://localhost:8002',
  appId: '${appId}',
});`;
                        return (
                            <div className="p-5 flex flex-col gap-4">
                                {/* Icon + title */}
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <div className="size-10 rounded-full bg-zinc-800 flex items-center justify-center">
                                        <IconPlayerPlay className="size-5 text-zinc-400" />
                                    </div>
                                    <p className="text-xs font-bold text-zinc-300">No Sessions Yet</p>
                                </div>

                                {/* Step-by-step guidance */}
                                <ol className="space-y-2 text-[11px] text-zinc-500">
                                    <li className="flex gap-2">
                                        <span className="text-blue-400 font-bold shrink-0">1.</span>
                                        <span>Install the SDK in your app</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-400 font-bold shrink-0">2.</span>
                                        <span>Copy the snippet below and paste it into your app's entry point</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-400 font-bold shrink-0">3.</span>
                                        <span>Sessions will appear here automatically as users browse</span>
                                    </li>
                                </ol>

                                {/* Copyable code block — no horizontal scroll */}
                                <div className="relative bg-zinc-950 border border-zinc-700 rounded-lg">
                                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800">
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">SDK Setup</span>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(snippet);
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 2000);
                                            }}
                                            className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-zinc-200 transition-colors"
                                        >
                                            {copied
                                                ? <><IconCheck className="size-3 text-emerald-400" /><span className="text-emerald-400">Copied!</span></>
                                                : <><IconCopy className="size-3" /><span>Copy</span></>}
                                        </button>
                                    </div>
                                    <pre className="p-3 text-[11px] font-mono text-emerald-400 whitespace-pre-wrap break-all leading-relaxed select-all">{snippet}</pre>
                                </div>
                            </div>
                        );
                    })()}

                    {sessions.map((s) => {
                        const isActive = selectedSession?.session_id === s.session_id;
                        return (
                            <button
                                key={s.session_id}
                                onClick={() => handleSelectSession(s)}
                                className={`w-full text-left px-4 py-3 border-b border-zinc-800/60 transition-colors hover:bg-zinc-800/40 flex items-center justify-between group ${isActive ? "bg-zinc-800 border-l-2 border-l-blue-500" : ""
                                    }`}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-zinc-200 truncate">
                                        {s.session_id.substring(0, 16)}...
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                                            <IconClock className="size-2.5" />
                                            {new Date(s.started_at).toLocaleTimeString()}
                                        </span>
                                        <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                                            <IconActivity className="size-2.5" />
                                            {s.event_count} events
                                        </span>
                                    </div>
                                </div>
                                <IconChevronRight className={`size-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0 ${isActive ? "text-blue-400" : ""}`} />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Main area: player + devtools ──────────────────────────────────── */}
            <div className="flex-1 flex min-w-0">
                {!selectedSession ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
                        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-48 bg-blue-500/5 blur-[90px] pointer-events-none rounded-full" />
                        <IconDeviceDesktop className="size-12 text-zinc-700" />
                        <div>
                            <p className="text-sm font-semibold text-zinc-300">Select a session to watch</p>
                            <p className="text-xs text-zinc-600 mt-1">
                                Click on any session in the sidebar to watch the DOM replay
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col min-w-0">
                        {/* Session meta header */}
                        <div className="h-11 shrink-0 flex items-center justify-between px-5 border-b border-zinc-800 bg-zinc-900/40">
                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                                <IconUser className="size-3.5" />
                                <span className="font-mono">{selectedSession.session_id.substring(0, 24)}...</span>
                                <span className="w-px h-3.5 bg-zinc-700" />
                                <span>{selectedSession.event_count} events captured</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
                                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Traceparent Linked
                            </div>
                        </div>

                        {/* Player + DevTools side by side */}
                        <div className="flex flex-1 min-h-0">
                            {/* Player area */}
                            <div className="flex-1 p-5 overflow-auto flex items-start justify-center bg-zinc-950">
                                {loadingEvents ? (
                                    <LoadingBlock text="Loading replay events..." />
                                ) : events.length < 2 ? (
                                    <div className="flex flex-col items-center justify-center gap-3 text-center h-full">
                                        <IconAlertCircle className="size-8 text-orange-400/60" />
                                        <p className="text-sm font-semibold text-zinc-400">Not enough events to render</p>
                                        <p className="text-xs text-zinc-600">This session has insufficient data for playback.</p>
                                    </div>
                                ) : (
                                    <ReplayPlayer events={events} width={740} height={460} />
                                )}
                            </div>

                            {/* DevTools mini panel */}
                            <div className="w-64 shrink-0 border-l border-zinc-800 flex flex-col bg-zinc-900/40">
                                <div className="flex border-b border-zinc-800">
                                    <div className="flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest text-orange-400 flex items-center justify-center gap-1.5 border-b-2 border-orange-500 bg-zinc-800/50">
                                        <IconTerminal2 className="size-3.5" /> Console
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-3 space-y-2 text-[10px] font-mono">
                                    {/* Derived console timeline from events */}
                                    {events
                                        .filter((e) => e.type === 5 && e.data?.tag === "network_request")
                                        .map((e, i) => (
                                            <div key={i} className="flex gap-2">
                                                <span className="text-zinc-600 shrink-0 w-10">
                                                    {((e.timestamp - events[0]?.timestamp) / 1000).toFixed(1)}s
                                                </span>
                                                <span className="text-blue-400 truncate">
                                                    fetch {e.data?.payload?.url ?? "unknown"}
                                                </span>
                                            </div>
                                        ))}
                                    {events.filter((e) => e.type === 5).length === 0 && (
                                        <p className="text-zinc-600 italic">No network calls captured in this session.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
