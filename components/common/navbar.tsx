'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <nav className="fixed z-50 border shadow-lg top-4 left-90 right-90 backdrop-blur-lg bg-zinc-900/40 border-zinc-700 rounded-2xl">
  <div className="max-w-6xl px-6 mx-auto lg:px-8">
    <div className="flex items-center justify-between h-16">
      {/* Logo */}
      <div className="flex-shrink-0">
        <button
          onClick={() => router.push('/')}
          className="text-xl font-bold transition-colors duration-200 cursor-pointer text-zinc-100 hover:text-blue-400"
        >
          S.E.N.T.R.Y
        </button>
      </div>

      {/* Desktop Navigation */}
      <div>
        <div className="flex items-baseline ml-10 space-x-8">
          {pathname === '/' && (
            <>
              <Link
                href="/dashboard"
                className="relative px-4 py-2 font-medium transition-all duration-300 text-zinc-300 hover:text-blue-400 group"
              >
                Dashboard
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <button
                onClick={() => router.push('/register')}
                className="px-6 py-2 ml-4 font-semibold transition-all duration-300 bg-blue-700/70 hover:bg-blue-800 text-zinc-100 rounded-xl hover:shadow-lg hover:scale-105 backdrop-blur-sm"
              >
                Register
              </button>
            </>
          )}
          {pathname === '/dashboard' && (
            <>
              <Link
                href="/"
                className="relative px-4 py-2 font-medium transition-all duration-300 text-zinc-300 hover:text-blue-400 group"
              >
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <button
                onClick={() => router.push('/register')}
                className="px-6 py-2 ml-4 font-semibold transition-all duration-300 bg-blue-700/70 hover:bg-blue-800 text-zinc-100 rounded-xl hover:shadow-lg hover:scale-105 backdrop-blur-sm"
              >
                Register
              </button>
            </>
          )}
          {pathname === '/register' && (
            <>
              <Link
                href="/"
                className="relative px-4 py-2 font-medium transition-all duration-300 text-zinc-300 hover:text-blue-400 group"
              >
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="/dashboard"
                className="relative px-4 py-2 font-medium transition-all duration-300 text-zinc-300 hover:text-blue-400 group"
              >
                Dashboard
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  </div>
</nav>

  )
}
