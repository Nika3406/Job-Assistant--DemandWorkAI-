'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Use environment variable for API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://job-assistant-demandworkai.onrender.com"

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Redirect to dashboard after successful login
      router.push('/dashboard')
      router.refresh() // Ensure client-side state updates

    } catch (err) {
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
          <p className="text-red-500 mb-4 text-center bg-red-500/10 py-2 px-4 rounded-lg">
            {error}
          </p>
        )}
        
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              className="w-full p-3 bg-white/50 dark:bg-black/50 border border-gray-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
              placeholder="your@email.com"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
              className="w-full p-3 bg-white/50 dark:bg-black/50 border border-gray-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
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
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200'
            }`}
          >
            {isLoading ? 'Logging in...' : 'Log In'}
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
            className="text-black dark:text-white hover:underline font-medium"
          >
            Sign up
          </button>
        </p>
      </form>
    </main>
  )
}