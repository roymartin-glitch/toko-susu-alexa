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
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 transition-colors w-full">
      <div className="flex items-center justify-between px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 w-full">
        {/* Title - Hidden on Mobile, shown on MD+ */}
        <div className="hidden md:block">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{formatDate(today)}</p>
        </div>
        
        {/* Mobile Title - Shown only on mobile */}
        <div className="md:hidden ml-10 sm:ml-12">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate max-w-[180px]">{title}</h2>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={16} className="sm:w-5 sm:h-5" /> : <Moon size={16} className="sm:w-5 sm:h-5" />}
          </button>

          {/* Notifications - Hidden on small mobile */}
          <button className="hidden sm:block relative p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Bell size={16} className="sm:w-5 sm:h-5" />
            <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User Menu - Compact on mobile */}
          <div className="flex items-center gap-1 sm:gap-2 pl-1 sm:pl-2 md:pl-3 border-l border-gray-200 dark:border-gray-700">
            <div className="text-right hidden sm:block">
              <p className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">Admin</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">Administrator</p>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
