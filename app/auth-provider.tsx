'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useCookies } from 'next-client-cookies'

const AuthContext = createContext<{ userEmail: string | null }>({ userEmail: null })

export function AuthProvider({ 
  children,
  userEmail: initialUserEmail 
}: { 
  children: React.ReactNode,
  userEmail: string | null 
}) {
  const cookies = useCookies()
  const [userEmail, setUserEmail] = useState(initialUserEmail)

  useEffect(() => {
    const email = cookies.get('user_email') || null
    setUserEmail(email)
  }, [cookies])

  return (
    <AuthContext.Provider value={{ userEmail }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}