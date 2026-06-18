'use client'

import { Bell, User, Moon, Sun } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useState, useEffect } from 'react'

export default function Header({ title = 'Dashboard' }) {
  const today = new Date()
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 transition-colors">
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 md:py-4">
        {/* Title - Hidden on Mobile, shown on MD+ */}
        <div className="hidden md:block">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{formatDate(today)}</p>
        </div>
        
        {/* Mobile Title - Shown only on mobile */}
        <div className="md:hidden ml-12">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} className="sm:w-5 sm:h-5" /> : <Moon size={18} className="sm:w-5 sm:h-5" />}
          </button>

          {/* Notifications - Hidden on small mobile */}
          <button className="hidden sm:block relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Bell size={18} className="sm:w-5 sm:h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User Menu - Compact on mobile */}
          <div className="flex items-center gap-2 pl-2 sm:pl-3 md:pl-4 border-l border-gray-200 dark:border-gray-700">
            <div className="text-right hidden sm:block">
              <p className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">Admin</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">Administrator</p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
              <User size={16} className="sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
