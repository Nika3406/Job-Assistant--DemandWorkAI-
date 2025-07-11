'use client'

import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-24 px-6 bg-gradient-to-b from-zinc-200 to-transparent dark:from-zinc-900 dark:to-black">
      <div className="max-w-5xl mx-auto">
        <div className="relative backdrop-blur-2xl bg-white/30 dark:bg-black/30 p-8 rounded-xl border border-gray-300 dark:border-neutral-800 shadow-lg">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/50 to-transparent dark:from-black/50 -z-10" />
          
          <h1 className="text-3xl font-bold mb-6 text-black dark:text-white">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">DemandWork.ai</span>
          </h1>
          
          <div className="space-y-6 text-gray-700 dark:text-gray-300">
            <p>
              DemandWork.ai is a cutting-edge job assistance platform powered by AI to streamline your career growth and job search process.
            </p>
            
            <h2 className="text-xl font-semibold text-black dark:text-white mt-8">Our Mission</h2>
            <p>
              We're revolutionizing how job seekers and employers connect by leveraging artificial intelligence to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Match candidates with ideal opportunities</li>
              <li>Automate resume optimization</li>
              <li>Provide real-time interview coaching</li>
              <li>Analyze market demand for skills</li>
            </ul>

            <h2 className="text-xl font-semibold text-black dark:text-white mt-8">The Technology</h2>
            <p>
              Built on Next.js 14 and powered by machine learning algorithms, our platform offers:
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white/50 dark:bg-black/50 p-4 rounded-lg border border-gray-200 dark:border-neutral-700">
                <h3 className="font-medium mb-2">AI-Powered Matching</h3>
                <p className="text-sm">Advanced NLP to understand your skills and preferences</p>
              </div>
              <div className="bg-white/50 dark:bg-black/50 p-4 rounded-lg border border-gray-200 dark:border-neutral-700">
                <h3 className="font-medium mb-2">Real-Time Analytics</h3>
                <p className="text-sm">Dashboard with personalized job market insights</p>
              </div>
            </div>

            <div className="pt-6">
              <Link 
                href="/"
                className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}