'use client'

import Sidebar from './Sidebar'
import Header from './Header'

export default function MainLayout({ children, title = 'Dashboard' }) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors overflow-hidden w-full">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 w-full overflow-hidden">
        {/* Header */}
        <Header title={title} />

        {/* Content */}
        <main className="flex-1 overflow-auto p-2 sm:p-3 md:p-4 lg:p-6 w-full">
          <div className="max-w-full w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
