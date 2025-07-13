import { cookies } from 'next/headers'

const jobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "TechCorp",
    location: "San Francisco, CA",
    salary: "$120,000 - $150,000",
    type: "Full-time",
    posted: "2 days ago",
    description: "We're looking for a skilled frontend developer with React experience to join our team."
  },
  {
    id: 2,
    title: "UX Designer",
    company: "DesignHub",
    location: "Remote",
    salary: "$90,000 - $110,000",
    type: "Contract",
    posted: "1 week ago",
    description: "Join our design team to create beautiful user experiences for our clients."
  },
  {
    id: 3,
    title: "Backend Engineer",
    company: "DataSystems",
    location: "New York, NY",
    salary: "$130,000 - $160,000",
    type: "Full-time",
    posted: "3 days ago",
    description: "Looking for a backend engineer with Python and database experience."
  }
]

export default function DashboardPage() {
  const cookieStore = cookies()
  const userEmail = cookieStore.get('user_email')?.value || 'user@example.com'

  return (
    <main className="pt-24 min-h-screen px-6 max-w-5xl mx-auto">
      <div className="backdrop-blur-2xl bg-white/30 dark:bg-black/30 rounded-xl border border-gray-300 dark:border-neutral-800 shadow-lg p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2 text-black dark:text-white">Welcome back!</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Here are your job matches, {userEmail.split('@')[0]}</p>
        
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Job title or keywords"
            className="flex-1 p-3 bg-white/50 dark:bg-black/50 border border-gray-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          />
          <input
            type="text"
            placeholder="Location"
            className="flex-1 p-3 bg-white/50 dark:bg-black/50 border border-gray-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          />
          <button className="px-6 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors">
            Search
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Filters Sidebar */}
        <div className="backdrop-blur-2xl bg-white/30 dark:bg-black/30 rounded-xl border border-gray-300 dark:border-neutral-800 shadow-lg p-6 h-fit">
          <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Filters</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Job Type</h3>
              <div className="space-y-2">
                {['Full-time', 'Part-time', 'Contract', 'Internship'].map(type => (
                  <label key={type} className="flex items-center">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400" />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Salary Range</h3>
              <select className="w-full p-2 bg-white/50 dark:bg-black/50 border border-gray-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all text-sm">
                {['Any', '$50k+', '$80k+', '$100k+', '$120k+'].map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Experience Level</h3>
              <div className="space-y-2">
                {['Entry Level', 'Mid Level', 'Senior', 'Executive'].map(level => (
                  <label key={level} className="flex items-center">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400" />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{level}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Job Listings */}
        <div className="md:col-span-2 space-y-6">
          {jobs.map(job => (
            <div key={job.id} className="backdrop-blur-2xl bg-white/30 dark:bg-black/30 rounded-xl border border-gray-300 dark:border-neutral-800 shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-black dark:text-white">{job.title}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{job.company} • {job.location}</p>
                </div>
                <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {job.type}
                </span>
              </div>
              
              <div className="mt-4">
                <p className="text-gray-700 dark:text-gray-300">{job.description}</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{job.salary} • {job.posted}</p>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors">
                  Apply Now
                </button>
                <button className="px-4 py-2 rounded-lg font-medium text-black dark:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors border border-gray-300 dark:border-neutral-700">
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}