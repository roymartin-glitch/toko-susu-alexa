'use client'

import Sidebar from './Sidebar'
import Header from './Header'

export default function MainLayout({ children, title = 'Dashboard' }) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 w-full overflow-hidden">
        {/* Header */}
        <Header title={title} />

        {/* Content */}
        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
