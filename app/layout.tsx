import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// import ClientNavbarWrapper from "../components/common/ClientNavbarWrapper";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import DefaultLayout from "@/components/common/DefaultLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SENTRY",
  description: "Intelligent Log Analysis & Classification System",
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
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-900 text-zinc-100 min-h-screen`}
        >
          {/* <ClientNavbarWrapper /> */}
          <Toaster richColors position="top-right" theme="dark" />
          <DefaultLayout>{children}</DefaultLayout>
        </body>
      </SessionProvider>
    </html>
  );
}