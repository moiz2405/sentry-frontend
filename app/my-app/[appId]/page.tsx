import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import React from "react";
import { AppScreen } from "@/components/appscreen/AppScreen";

export default async function AppDetailPage({ params }: { params: Promise<{ appId: string }> }) {
  const { appId } = await params;
  return (
    <div className="flex flex-col min-h-[60vh] items-stretch justify-center">
      {/* <div className="flex w-full max-w-2xl mx-2 my-2">
        <Link
          href="/" 
          className="inline-flex items-center gap-2 px-4 py-2 font-semibold transition-colors border shadow rounded-xl bg-zinc-900/80 text-zinc-100 hover:bg-zinc-800/90 border-zinc-800/60 backdrop-blur-md"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back</span>
        </Link>
      </div> */}
      <div className="w-full mt-2">
        <AppScreen appId={appId} />
      </div>
    </div>
  );
}
