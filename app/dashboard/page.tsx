'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCookies } from 'next-client-cookies'

interface Job {
  id: string
  title: string
  company: string | null
  location: string
  description: string
  salary: string | null
  contract_type: string | null
  created: string
  redirect_url: string
  requirements?: string[]
  responsibilities?: string[]
}

interface SearchParams {
  keywords: string
  location: string
}

export default function DashboardPage() {
  const cookies = useCookies()
  const router = useRouter()
  const userEmail = cookies.get('user_email') || 'user@example.com'
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useState<SearchParams>({
    keywords: 'developer',
    location: 'new york'
  })
  const [resumeScore, setResumeScore] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Initial load
  useEffect(() => {
    fetchJobs()
  }, [])

  // Fetch when search params change
  useEffect(() => {
    if (searchParams.keywords || searchParams.location) {
      fetchJobs()
    }
  }, [searchParams])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(
        `/api/jobs?keywords=${encodeURIComponent(searchParams.keywords)}&location=${encodeURIComponent(searchParams.location)}`
      )

      // Handle non-JSON responses
      if (!response.ok) {
        const errorText = await response.text()
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.error || 'Failed to fetch jobs')
        } catch {
          throw new Error(errorText || 'Failed to fetch jobs')
        }
      }

      const data = await response.json()
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid jobs data received')
      }

      setJobs(data)
      if (data.length > 0) {
        setSelectedJob(data[0])
        fetchResumeScore(data[0].description)
      } else {
        setSelectedJob(null)
      }
    } catch (error) {
      console.error('Fetch jobs error:', error)
      setError(error instanceof Error ? error.message : 'Failed to load jobs')
      setJobs([])
      setSelectedJob(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchResumeScore = async (jobDescription: string) => {
    try {
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ job_description: jobDescription })
      })
      
      if (!response.ok) throw new Error('Failed to analyze resume')
      
      const { score } = await response.json()
      setResumeScore(score)
    } catch (error) {
      console.error('Error analyzing resume:', error)
      setError('Failed to analyze resume match')
    }
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setSearchParams({
      keywords: formData.get('keywords')?.toString() || 'developer',
      location: formData.get('location')?.toString() || 'new york'
    })
  }

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job)
    setResumeScore(null)
    fetchResumeScore(job.description)
  }

  if (loading && jobs.length === 0) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <main className="pt-24 min-h-screen px-6 max-w-7xl mx-auto">
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="px-3 py-1 text-sm bg-red-200 dark:bg-red-800/50 hover:bg-red-300 dark:hover:bg-red-700/50 rounded"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search Form */}
      <form onSubmit={handleSearch} className="backdrop-blur-2xl bg-white/30 dark:bg-black/30 rounded-xl border border-gray-300 dark:border-neutral-800 shadow-lg p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2 text-black dark:text-white">Find Your Next Opportunity, {userEmail.split('@')[0]}!</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Discover jobs that match your skills and preferences</p>
        
        <div className="flex flex-col md:flex-row gap-4">
          <input
            name="keywords"
            type="text"
            placeholder="Job title or keywords"
            defaultValue={searchParams.keywords}
            className="flex-1 p-3 bg-white/50 dark:bg-black/50 border border-gray-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          />
          <input
            name="location"
            type="text"
            placeholder="Location"
            defaultValue={searchParams.location}
            className="flex-1 p-3 bg-white/50 dark:bg-black/50 border border-gray-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          />
          <button 
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      
      {/* Job Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Job List Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="sticky top-28 space-y-4">
            <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
              {jobs.length === 0 && !loading ? (
                <div className="p-4 rounded-lg border border-gray-300 dark:border-neutral-700">
                  <p className="text-gray-600 dark:text-gray-400">
                    No jobs found. Try different search terms.
                  </p>
                </div>
              ) : (
                jobs.map(job => (
                  <div 
                    key={job.id} 
                    onClick={() => handleJobSelect(job)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedJob?.id === job.id 
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
                        : 'border-gray-300 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                  >
                    <h3 className="font-bold text-lg text-black dark:text-white">{job.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {job.company || 'Unknown company'} • {job.location}
                    </p>
                    {job.salary && (
                      <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">{job.salary}</p>
                    )}
                    <p className="text-sm mt-2 text-gray-500 dark:text-gray-500">
                      Posted {new Date(job.created).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Job Detail Column */}
        {selectedJob ? (
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <div className="backdrop-blur-2xl bg-white/30 dark:bg-black/30 rounded-xl border border-gray-300 dark:border-neutral-800 shadow-lg p-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-black dark:text-white">{selectedJob.title}</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      {selectedJob.company || 'Unknown company'} • {selectedJob.location}
                    </p>
                    {selectedJob.salary && (
                      <p className="mt-2 text-gray-700 dark:text-gray-300">{selectedJob.salary}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {selectedJob.contract_type && (
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {selectedJob.contract_type}
                      </span>
                    )}
                    <a 
                      href={selectedJob.redirect_url} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors whitespace-nowrap"
                    >
                      Apply Now
                    </a>
                  </div>
                </div>
                
                <div className="mt-8 space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-black dark:text-white mb-4">Job Description</h3>
                    <div 
                      className="text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none" 
                      dangerouslySetInnerHTML={{ __html: selectedJob.description }}
                    />
                  </div>
                  
                  <div className="pt-4 border-t border-gray-300 dark:border-neutral-800">
                    <h3 className="text-xl font-semibold text-black dark:text-white mb-4">Resume Match Score</h3>
                    {resumeScore !== null ? (
                      <>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full" 
                            style={{ width: `${resumeScore}%` }}
                          />
                        </div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                          Your resume matches {resumeScore}% of the job requirements
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">
                        Analyzing resume match...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 flex items-center justify-center">
            <div className="text-center p-8 rounded-xl border border-gray-300 dark:border-neutral-700">
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                Select a job to view details
              </h3>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}