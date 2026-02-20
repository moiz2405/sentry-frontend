'use client'

import { useRouter } from 'next/navigation'

export default function Hero() {
    const router = useRouter()
    return (
        <div className="flex items-center min-h-screen px-2 ">
            <div className="max-w-4xl mx-auto text-center">
                {/* Main heading */}
                <h1 className="mb-6 text-4xl font-bold md:text-6xl text-zinc-100">
                    SENTRY
                </h1>
                
                {/* Subtitle */}
                <p className="max-w-3xl mx-auto mb-8 text-xl md:text-2xl text-zinc-300">
                    Intelligent Log Analysis & Classification System
                </p>
                
                {/* Description */}
                <p className="max-w-2xl mx-auto mb-12 text-lg leading-relaxed text-zinc-400">
                    Transform raw system logs into structured insights. Automatically detect anomalies, 
                    classify errors, and get actionable summaries for faster debugging.
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <button 
                    onClick={()=>router.push("/register")}
                    className="px-8 py-3 font-semibold transition-colors duration-200 bg-blue-700 rounded-lg shadow-lg hover:bg-blue-800 text-zinc-100 hover:shadow-xl">
                        Register Your App
                    </button>
                </div>
                
                {/* Feature highlights */}
                <div className="grid max-w-3xl grid-cols-1 gap-8 mx-auto mt-16 md:grid-cols-3">
                    <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-900 rounded-lg">
                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="mb-2 font-semibold text-zinc-100">Smart Classification</h3>
                        <p className="text-sm text-zinc-400">Automatically categorize errors by service, type, and severity</p>
                    </div>
                    
                    <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-900 rounded-lg">
                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="mb-2 font-semibold text-zinc-100">Fast Processing</h3>
                        <p className="text-sm text-zinc-400">Process large log files in seconds with intelligent filtering</p>
                    </div>
                    
                    <div className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-purple-900 rounded-lg">
                            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="mb-2 font-semibold text-zinc-100">Structured Output</h3>
                        <p className="text-sm text-zinc-400">Get clean JSON summaries ready for analysis and visualization</p>
                    </div>
                </div>
            </div>
        </div>
    )
}