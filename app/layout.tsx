'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const inter = Inter({ subsets: ['latin'] })

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const metadata = {
  title: 'DemandWork.AI',
  description: 'AI-powered job assistant platform',
  icons: {
    icon: '/favicon.ico'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/me`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          setIsLoggedIn(!!data.user)
          setUserEmail(data.user)
        }
      } catch (error) {
        console.error('Authentication check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/logout`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        setIsLoggedIn(false)
        setUserEmail(null)
        window.location.href = '/' // Refresh to update UI
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-white/30 dark:bg-black/30 border-b border-gray-300 dark:border-neutral-800">
          <div className="flex justify-between items-center px-6 py-4 max-w-5xl mx-auto">
            <Link 
              href="/" 
              className="text-xl font-bold text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <Image
                className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70]"
                src="/DW.svg"
                alt="DW Logo"
                width={60}
                height={50}
                priority
              />
            </Link>
            
            {!isLoading && (
              <div className="flex items-center gap-4">
                {isLoggedIn ? (
                  <>
                    <div className="hidden md:block text-sm text-gray-600 dark:text-gray-400">
                      Welcome, {userEmail}
                    </div>
                    <Link 
                      href="/dashboard" 
                      className="px-4 py-2 rounded-lg text-sm font-medium text-black dark:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/account" 
                      className="px-4 py-2 rounded-lg text-sm font-medium text-black dark:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      Account
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="px-4 py-2 rounded-lg text-sm font-medium text-black dark:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      Login
                    </Link>
                    <Link 
                      href="/signup" 
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
        
        {/* Main content with top padding to account for fixed navbar */}
        <main className="pt-24 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}