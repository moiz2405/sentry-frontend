import React, { useEffect, useRef, useState } from "react";

interface TerminalLogProps {
  url: string;
}

export function TerminalLog({ url }: TerminalLogProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    if (url) {
      const logUrl = url.endsWith("/") ? `${url}logs/stream` : `${url}/logs/stream`;
      console.log("TerminalLog streaming from:", logUrl); // Debug print
      eventSource = new EventSource(logUrl);
      eventSource.onmessage = (event) => {
        if (event.data && event.data.trim() !== "") {
          setLogs(prev => [...prev, event.data.replace(/^data:\s*/, "")]);
        }
      };
      eventSource.onerror = () => {
        setLogs(prev => [...prev, "Error streaming logs"]);
        eventSource?.close();
      };
    }
    return () => {
      if (eventSource) eventSource.close();
    };
  }, [url]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full h-full p-3">
      <p className="pb-2 text-lg font-bold leading-7 text-white">
        Streaming Logs
      </p>
      <div
        ref={logRef}
        className="w-full h-full p-4 overflow-y-auto font-mono text-xs bg-[oklch(0.205_0_0)] border rounded-lg shadow-inner border-zinc-700 custom-scrollbar"
        style={{ minHeight: "24rem", maxHeight: "100%" }}
      >
        {logs.length > 0
          ? logs.map((line, idx) => {
              // Regex to extract parts
              const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3})/);
              const levelMatch = line.match(/\[(INFO|WARNING|ERROR)\]/);
              const serviceMatch = line.match(/\[(\w+Service)\]/);
              const rest = line.replace(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}) /,"").replace(/\[(INFO|WARNING|ERROR)\]/,"").replace(/\[(\w+Service)\]/,"").trim();
              return (
                <div key={idx} className="flex flex-row flex-wrap items-baseline">
                  {timestampMatch && (
                    <span className="mr-2 text-zinc-500">{timestampMatch[1]}</span>
                  )}
                  {levelMatch && (
                    <span className={
                      levelMatch[1] === "INFO"
                        ? "text-green-500 font-bold mr-2"
                        : levelMatch[1] === "WARNING"
                        ? "text-yellow-400 font-bold mr-2"
                        : "text-red-500 font-bold mr-2"
                    }>
                      [{levelMatch[1]}]
                    </span>
                  )}
                  {serviceMatch && (
                    <span className="mr-2 font-semibold text-blue-400">[{serviceMatch[1]}]</span>
                  )}
                  <span className="text-zinc-200">{rest}</span>
                </div>
              );
            })
          : <span className="text-zinc-500">No logs yet.</span>}
      </div>
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
