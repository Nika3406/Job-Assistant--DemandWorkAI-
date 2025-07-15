'use client'

import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      })
      
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <button 
      onClick={handleLogout}
      className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
    >
      Logout
    </button>
  )
}