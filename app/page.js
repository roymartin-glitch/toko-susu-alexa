'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Milk, Sparkles } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    try {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        if (user && user.loggedIn) {
          router.push('/dash')
          return
        }
      }
    } catch (error) {
      console.error('Error checking user:', error)
    }
    
    // If not logged in, go to login
    router.push('/login')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-blue-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="text-center relative z-10">
        {/* Logo with animation */}
        <div className="mb-6 relative">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-emerald-500/40 animate-smooth-bounce">
            <Milk className="text-white" size={48} strokeWidth={2.5} />
          </div>
          <div className="absolute -top-2 -right-2 animate-pulse">
            <Sparkles className="text-yellow-500" size={24} />
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Kasgo</h1>
        <p className="text-gray-600 mb-8">Kasir Toko Susu Modern</p>

        {/* Loading spinner */}
        <div className="flex justify-center items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>

        <p className="text-sm text-gray-500 mt-4">Memuat aplikasi...</p>
      </div>
    </div>
  )
}
