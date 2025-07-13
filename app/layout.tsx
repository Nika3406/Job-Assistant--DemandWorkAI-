import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { cookies } from 'next/headers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DemandWork.AI',
  description: 'AI-powered job assistant platform',
  icons: {
    icon: '/favicon.ico'
  }
}

async function getAuthData() {
  const API_BASE_URL = process.env.API_BASE_URL || "https://job-assistant-demandworkai.onrender.com"
  try {
    const cookieStore = cookies()
    const res = await fetch(`${API_BASE_URL}/api/me`, {
      headers: {
        Cookie: cookieStore.toString()
      },
      credentials: 'include',
      cache: 'no-store' // Important for auth checks
    })
    return res.ok ? await res.json() : null
  } catch (error) {
    console.error('Auth check failed:', error)
    return null
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authData = await getAuthData()
  const isLoggedIn = !!authData?.user
  const userEmail = authData?.user || null

  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-white/30 dark:bg-black/30 border-b border-gray-300 dark:border-neutral-800">
          <div className="flex justify-between items-center px-6 py-4 max-w-5xl mx-auto">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <Image
                src="/DW.svg"
                alt="DemandWork.AI Logo"
                width={70}
                height={70}
                priority
              />
            </Link>
            
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <div className="hidden md:block text-sm text-gray-600 dark:text-gray-400">
                    Welcome, {userEmail}
                  </div>
                  <Link href="/dashboard" className="px-4 py-2 rounded-lg text-sm font-medium text-black dark:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/account" className="px-4 py-2 rounded-lg text-sm font-medium text-black dark:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors">
                    Account
                  </Link>
                  <Link 
                    href="/api/logout" // This will hit your backend directly
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    Logout
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-black dark:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors">
                    Login
                  </Link>
                  <Link href="/signup" className="px-4 py-2 rounded-lg text-sm font-medium bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        <main className="pt-24 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}