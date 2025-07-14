'use client'

import { useState, useEffect } from 'react'
import { useCookies } from 'next-client-cookies'
import { useRouter } from 'next/navigation'

export default function AccountPage() {
  const cookies = useCookies()
  const router = useRouter()
  const userEmail = cookies.get('user_email') || 'user@example.com'
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
  })

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword
        }),
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update password')
      } else {
        setPasswordData({
          currentPassword: '',
          newPassword: ''
        })
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <main className="pt-24 min-h-screen px-6 max-w-5xl mx-auto">
      <div className="backdrop-blur-2xl bg-white/30 dark:bg-black/30 rounded-xl border border-gray-300 dark:border-neutral-800 shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-black dark:text-white">Account Settings</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Password Section */}
          <div className="md:col-span-2 space-y-6">
            <form onSubmit={handlePasswordUpdate}>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-black dark:text-white">Account Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full p-3 bg-white/50 dark:bg-black/50 border border-gray-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    value={userEmail}
                    readOnly
                  />
                </div>
              </div>
              
              <div className="space-y-4 mt-6">
                <h2 className="text-xl font-semibold text-black dark:text-white">Change Password</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    className="w-full p-3 bg-white/50 dark:bg-black/50 border border-gray-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    placeholder="Enter current password"
                    value={passwordData.currentPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    className="w-full p-3 bg-white/50 dark:bg-black/50 border border-gray-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    placeholder="At least 8 characters"
                    value={passwordData.newPassword}
                    onChange={handleInputChange}
                    minLength={8}
                    required
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={isLoading}
                className={`mt-6 px-6 py-3 rounded-lg font-medium transition-colors ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                }`}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
          
          {/* Account Actions */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-black dark:text-white">Account Actions</h2>
              
              <button 
                type="button"
                className="w-full px-4 py-3 text-left rounded-lg font-medium text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800/30 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}