/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure API route rewrites
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:5000/api/:path*' // Local Flask backend
            : 'https://job-assistant-demandworkai.onrender.com/api/:path*' // Production Render backend
      },
    ]
  },
  
  // Configure images
  images: {
    domains: [
      'job-assistant-demandworkai.onrender.com',
      'localhost' // For development
    ],
  },

  // Enable React Strict Mode
  reactStrictMode: true,

  // Configure CORS headers for API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' }
        ]
      }
    ]
  }
}

module.exports = nextConfig