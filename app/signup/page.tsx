'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://job-assistant-demandworkai.onrender.com"

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/api/signup`, {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email: formData.email, 
          password: formData.password 
        }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Signup failed')
      }

      const data = await res.json()
      router.push('/login?signup=success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
      console.error('Signup error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-200 to-transparent dark:from-zinc-900 dark:to-black">
      <form 
        onSubmit={handleSignup}
        className="relative backdrop-blur-2xl bg-white/30 dark:bg-black/30 p-8 rounded-xl border border-gray-300 dark:border-neutral-800 shadow-lg w-full max-w-md"
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/50 to-transparent dark:from-black/50 -z-10" />
        
        <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
          Create Your Account
        </h1>
        
        {error && (
          <div className="mb-4 p-3 text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full p-3 bg-white/50 dark:bg-black/50 border border-gray-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="w-full p-3 bg-white/50 dark:bg-black/50 border border-gray-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="w-full p-3 bg-white/50 dark:bg-black/50 border border-gray-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
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
                Creating account...
              </span>
            ) : 'Sign Up'}
          </button>
        </div>
        
        <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button 
            type="button"
            onClick={() => router.push('/login')}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Log in
          </button>
        </p>
      </form>
    </main>
  )
}