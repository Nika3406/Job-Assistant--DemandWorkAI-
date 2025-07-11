'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await fetch('http://localhost:3000/api/signup', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Signup failed')
    } else {
      router.push('/login')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-200 to-transparent dark:from-zinc-900 dark:to-black">
      <form 
        onSubmit={handleSignup} 
        className="relative backdrop-blur-2xl bg-white/30 dark:bg-black/30 p-8 rounded-xl border border-gray-300 dark:border-neutral-800 shadow-lg w-full max-w-md"
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/50 to-transparent dark:from-black/50 -z-10" />
        
        <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">Create Account</h1>
        
        {error && (
          <p className="text-red-500 mb-4 text-center bg-red-500/10 py-2 px-4 rounded-lg">
            {error}
          </p>
        )}
        
        <div className="space-y-4">
          <div>
            <input
              className="w-full p-3 bg-white/50 dark:bg-black/50 border border-gray-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
              placeholder="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <input
              className="w-full p-3 bg-white/50 dark:bg-black/50 border border-gray-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
              placeholder="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit"
            className="w-full bg-black text-white p-3 rounded-lg hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors font-medium"
          >
            Sign Up
          </button>
        </div>
        
        <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button 
            type="button"
            onClick={() => router.push('/login')}
            className="text-black dark:text-white hover:underline font-medium"
          >
            Log in
          </button>
        </p>
      </form>
    </main>
  )
}