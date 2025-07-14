'use client'

import { useState, useEffect } from 'react'
import { useCookies } from 'next-client-cookies'
import { useRouter } from 'next/navigation'

export default function AccountPage() {
  const cookies = useCookies()
  const router = useRouter()
  const userEmail = cookies.get('user_email') || 'user@example.com'
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    currentPassword: '',
    newPassword: ''
  })
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch user data including resume URL on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/profile', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setProfileData({
            firstName: data.user.first_name || '',
            lastName: data.user.last_name || '',
            currentPassword: '',
            newPassword: ''
          })
          setResumeUrl(data.user.resume_url || null)
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err)
      }
    }
    fetchUserData()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0])
    }
  }

  const handleUploadResume = async () => {
    if (!resumeFile) return
    
    setIsLoading(true)
    setError('')
    
    try {
      const formData = new FormData()
      formData.append('resume', resumeFile)

      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setResumeUrl(data.user.resume_url)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to upload resume')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
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
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          current_password: profileData.currentPassword,
          new_password: profileData.newPassword
        }),
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update profile')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData(prev => ({
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
          {/* Profile Section */}
          <div className="md:col-span-2 space-y-6">
            <form onSubmit={handleProfileUpdate}>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-black dark:text-white">Profile Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      className="w-full p-3 bg-white/50 dark:bg-black/50 border border-gray-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                      value={profileData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      className="w-full p-3 bg-white/50 dark:bg-black/50 border border-gray-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                      value={profileData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
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
                    value={profileData.currentPassword}
                    onChange={handleInputChange}
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
                    value={profileData.newPassword}
                    onChange={handleInputChange}
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

            {/* Resume Upload Section */}
            <div className="space-y-4 pt-6 border-t border-gray-300 dark:border-neutral-800">
              <h2 className="text-xl font-semibold text-black dark:text-white">Resume</h2>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Upload Resume (PDF/DOC)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-medium
                      file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/20 dark:file:text-blue-300
                      hover:file:bg-blue-100 dark:hover:file:bg-blue-800/30
                      transition-colors"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={handleUploadResume}
                  disabled={!resumeFile || isLoading}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    !resumeFile || isLoading
                      ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
                  }`}
                >
                  {isLoading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
              
              {resumeUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current resume:</p>
                  <a 
                    href={resumeUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View Resume
                  </a>
                </div>
              )}
            </div>
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
              
              <button 
                type="button"
                className="w-full px-4 py-3 text-left rounded-lg font-medium text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-800/30 transition-colors"
              >
                Export Data
              </button>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-gray-300 dark:border-neutral-800">
              <h2 className="text-xl font-semibold text-black dark:text-white">Preferences</h2>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Dark Mode</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Email Notifications</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}