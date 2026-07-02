'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
} from 'lucide-react'
import { useState } from 'react'
import { APP_NAME, APP_SUBTITLE } from '@/lib/constants'

const menuItems = [
  { 
    href: '/dash', 
    label: 'Dashboard', 
    icon: LayoutDashboard,
    bgColor: 'bg-emerald-500',
    shadowColor: 'shadow-emerald-500/30'
  },
  { 
    href: '/dash/pos', 
    label: 'Transaksi', 
    icon: ShoppingCart,
    bgColor: 'bg-blue-500',
    shadowColor: 'shadow-blue-500/30'
  },
  { 
    href: '/dash/products', 
    label: 'Barang', 
    icon: Package,
    bgColor: 'bg-orange-500',
    shadowColor: 'shadow-orange-500/30'
  },
  { 
    href: '/dash/customers', 
    label: 'Pelanggan', 
    icon: Users,
    bgColor: 'bg-purple-500',
    shadowColor: 'shadow-purple-500/30'
  },
  { 
    href: '/dash/reports', 
    label: 'Laporan', 
    icon: FileText,
    bgColor: 'bg-blue-700',
    shadowColor: 'shadow-blue-700/30'
  },
  { 
    href: '/dash/settings', 
    label: 'Pengaturan', 
    icon: Settings,
    bgColor: 'bg-gray-600',
    shadowColor: 'shadow-gray-600/30'
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (href) => {
    return pathname.startsWith(href)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-2 left-2 sm:top-3 sm:left-3 z-50 md:hidden p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-lg transition-colors"
      >
        {isOpen ? <X size={18} className="text-gray-900 dark:text-white" /> : <Menu size={18} className="text-gray-900 dark:text-white" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-[#0F172A] to-[#1E293B] border-r border-gray-800 transition-all duration-300 z-40 md:translate-x-0 shadow-2xl overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-4 sm:p-5 md:p-6 border-b border-gray-800">
          <Link href="/dash" className="flex items-center gap-2 sm:gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
              <Store size={20} className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg sm:text-xl text-white">{APP_NAME}</h1>
              <p className="text-xs text-gray-400">{APP_SUBTITLE}</p>
            </div>
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="p-3 sm:p-4 space-y-1.5 sm:space-y-2 overflow-y-auto h-[calc(100vh-200px)] no-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl transition-all group ${
                  active
                    ? 'bg-emerald-500/10 border-l-4 border-emerald-500'
                    : 'hover:bg-gray-800/50'
                }`}
              >
                {/* Icon Badge - Kotak rounded berwarna */}
                <div className={`w-8 h-8 sm:w-9 sm:h-9 ${item.bgColor} rounded-xl flex items-center justify-center shadow-lg ${item.shadowColor} group-hover:scale-110 transition-transform flex-shrink-0`}>
                  <Icon size={16} className="sm:w-[18px] sm:h-[18px] text-white" strokeWidth={2.5} />
                </div>
                <span className={`font-medium text-xs sm:text-sm ${active ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all group shadow-lg"
          >
            <LogOut size={18} className="sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" />
            <span className="font-medium text-sm sm:text-base">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
