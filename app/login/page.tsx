'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://job-assistant-demandworkai.onrender.com"

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        credentials: 'include', // Important for session cookies
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Login failed. Please try again.')
      }

      const data = await res.json()
      
      // Option 1: Store in localStorage (less secure)
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_email', data.user?.email || email)
      }
      
      // Option 2: Use a client-side context/provider (recommended)
      // You would typically update your auth context here
      
      // Redirect to account page
      router.push('/account')
      router.refresh()

    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-200 to-transparent dark:from-zinc-900 dark:to-black">
      <form 
        onSubmit={handleLogin} 
        className="relative backdrop-blur-2xl bg-white/30 dark:bg-black/30 p-8 rounded-xl border border-gray-300 dark:border-neutral-800 shadow-lg w-full max-w-md"
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/50 to-transparent dark:from-black/50 -z-10" />
        
        <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">Welcome Back</h1>
        
        {error && (
          <div className="mb-4 p-3 text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              className="w-full p-3 bg-white/50 dark:bg-black/50 border border-gray-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              placeholder="your@email.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              className="w-full p-3 bg-white/50 dark:bg-black/50 border border-gray-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              minLength={8}
            />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full p-3 rounded-lg font-medium transition-colors ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed dark:bg-gray-600' 
                : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : 'Log In'}
          </button>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <button 
            type="button"
            onClick={() => router.push('/forgot-password')}
            className="hover:underline text-gray-600 dark:text-gray-400"
          >
            Forgot password?
          </button>
        </div>
        
        <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <button 
            type="button"
            onClick={() => router.push('/signup')}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Sign up
          </button>
        </p>
      </form>
    </main>
  )
}