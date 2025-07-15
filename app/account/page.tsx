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
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/profile', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          setResumeUrl(data.user?.resume_url || null)
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err)
      }
    }

    fetchUserData()
  }, [])

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0])
      setUploadError('')
    }
  }

  const handleResumeUpload = async () => {
    if (!resumeFile) return
    
    try {
      setUploadError('')
      setUploadProgress(0)
      
      // Validate file size (max 5MB)
      if (resumeFile.size > 5 * 1024 * 1024) {
        throw new Error('File size exceeds 5MB limit')
      }
      
      const formData = new FormData()
      formData.append('resume', resumeFile)
      
      // Create progress interval
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          // Don't go to 100% until the upload is actually complete
          return Math.min(prev + 10, 90)
        })
      }, 200)
      
      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })
      
      clearInterval(progressInterval)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }
      
      setUploadProgress(100)
      
      const result = await response.json()
      setResumeUrl(result.user.resume_url)
      
      // Reset after successful upload
      setTimeout(() => {
        setUploadProgress(0)
        setResumeFile(null)
      }, 1000)
      
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed')
      setUploadProgress(0)
    }
  }

  const handleDeleteResume = async () => {
    try {
      const response = await fetch('/api/upload-resume', {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete resume')
      }
      
      setResumeUrl(null)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Delete failed')
    }
  }

  return (
    <main className="pt-24 min-h-screen px-6 max-w-5xl mx-auto">
      <div className="backdrop-blur-2xl bg-white/30 dark:bg-black/30 rounded-xl border border-gray-300 dark:border-neutral-800 shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-black dark:text-white">Account Settings</h1>
        
        {(error || uploadError) && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
            {error || uploadError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
          
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-black dark:text-white">Resume</h2>
              
              {resumeUrl ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your resume is uploaded
                  </p>
                  <a 
                    href={resumeUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View Current Resume
                  </a>
                  <button
                    onClick={handleDeleteResume}
                    className="w-full px-4 py-2 text-left rounded-lg font-medium text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800/30 transition-colors"
                  >
                    Delete Resume
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Upload Resume (PDF, DOC, DOCX)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100
                      dark:file:bg-blue-900/30 dark:file:text-blue-300
                      dark:hover:file:bg-blue-800/30"
                  />
                  {resumeFile && (
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={handleResumeUpload}
                        disabled={uploadProgress > 0}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors disabled:opacity-50"
                      >
                        {uploadProgress > 0 ? 'Uploading...' : 'Upload Resume'}
                      </button>
                      {uploadProgress > 0 && (
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

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