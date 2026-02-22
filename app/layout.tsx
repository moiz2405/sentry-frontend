import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sentry — Intelligent Log Monitoring",
  description: "AI-powered log analysis and service health monitoring for Python developers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <SessionProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100 min-h-screen`}
        >
          <Toaster richColors position="top-right" theme="dark" />
          {children}
          {/* Inject Sentry Session Replay Native Browser SDK for tracking */}
          <script src="/sdk/sentry-replay.min.js" defer></script>
          <script dangerouslySetInnerHTML={{
            __html: `
            window.addEventListener('load', function() {
              if (window.SentryReplay && window.SentryReplay.initReplay) {
                 window.SentryReplay.initReplay({
                    dsn: 'http://localhost:8002',
                    appId: 'frontend-service'
                 });
                 console.log("[SentryReplay] Injected into Layout successfully");
              }
            });
          `}} />
        </body>
      </SessionProvider>
    </html>
  );
}