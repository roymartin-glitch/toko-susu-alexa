'use client'

import { useTransactions, useProducts, useCustomers } from '@/lib/hooks'
import { formatCurrency, formatDateIndonesian } from '@/lib/utils'
import { 
  ShoppingCart, 
  Package, 
  Users, 
  FileText, 
  Settings,
  TrendingUp,
  Archive,
  ClipboardList,
  ShoppingBag,
  Grid3x3,
  ShoppingBasket,
  Wallet,
  DollarSign,
  Bell,
  Database,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Receipt
} from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import QuickActions from '@/app/components/dashboard/QuickActions'
import RecentActivity from '@/app/components/dashboard/RecentActivity'
import TopProducts from '@/app/components/dashboard/TopProducts'
import TodaySales from '@/app/components/dashboard/TodaySales'

// Menu Items - KASGO Style dengan icon colorful (hanya fitur relevan untuk kasir toko susu offline)
const menuItems = [
  { 
    href: '/dash/pos', 
    label: 'Kasir', 
    icon: ShoppingCart, 
    bgColor: 'bg-emerald-500',
    hoverColor: 'hover:bg-emerald-600',
    shadowColor: 'shadow-emerald-500/30'
  },
  { 
    href: '/dash/products', 
    label: 'Produk', 
    icon: Package, 
    bgColor: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
    shadowColor: 'shadow-orange-500/30'
  },
  { 
    href: '/dash/products', 
    label: 'Kategori', 
    icon: Grid3x3, 
    bgColor: 'bg-pink-500',
    hoverColor: 'hover:bg-pink-600',
    shadowColor: 'shadow-pink-500/30'
  },
  { 
    href: '/dash/products', 
    label: 'Stok', 
    icon: Archive, 
    bgColor: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    shadowColor: 'shadow-blue-500/30'
  },
  { 
    href: '/dash/customers', 
    label: 'Pelanggan', 
    icon: Users, 
    bgColor: 'bg-indigo-500',
    hoverColor: 'hover:bg-indigo-600',
    shadowColor: 'shadow-indigo-500/30'
  },
  
  { 
    href: '/dash/reports', 
    label: 'Pembelian', 
    icon: ShoppingBasket, 
    bgColor: 'bg-cyan-500',
    hoverColor: 'hover:bg-cyan-600',
    shadowColor: 'shadow-cyan-500/30'
  },

  { 
    href: '/dash/reports', 
    label: 'Laporan', 
    icon: FileText, 
    bgColor: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
    shadowColor: 'shadow-blue-600/30'
  },
  { 
    href: '/dash/reports', 
    label: 'Analisis', 
    icon: PieChart, 
    bgColor: 'bg-indigo-600',
    hoverColor: 'hover:bg-indigo-700',
    shadowColor: 'shadow-indigo-600/30'
  },
  { 
    href: '/dash/reports', 
    label: 'Backup', 
    icon: Database, 
    bgColor: 'bg-slate-500',
    hoverColor: 'hover:bg-slate-600',
    shadowColor: 'shadow-slate-500/30'
  },
  { 
    href: '/dash/reports', 
    label: 'Notifikasi', 
    icon: Bell, 
    bgColor: 'bg-purple-600',
    hoverColor: 'hover:bg-purple-700',
    shadowColor: 'shadow-purple-600/30'
  },
  { 
    href: '/dash/settings', 
    label: 'Pengaturan', 
    icon: Settings, 
    bgColor: 'bg-gray-600',
    hoverColor: 'hover:bg-gray-700',
    shadowColor: 'shadow-gray-600/30'
  },
]

export default function DashboardPage() {
  const { data: transactions = [] } = useTransactions()
  const { data: products = [] } = useProducts()
  const { data: customers = [] } = useCustomers()

  // Real-time clock state
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Calculate KPIs
  const kpis = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const todayTransactions = transactions.filter((tx) => {
      const txDate = new Date(tx.created_at)
      txDate.setHours(0, 0, 0, 0)
      return txDate.getTime() === today.getTime()
    })

    const yesterdayTransactions = transactions.filter((tx) => {
      const txDate = new Date(tx.created_at)
      txDate.setHours(0, 0, 0, 0)
      return txDate.getTime() === yesterday.getTime()
    })

    const totalRevenue = todayTransactions.reduce((sum, tx) => sum + (tx.total || 0), 0)
    const yesterdayRevenue = yesterdayTransactions.reduce((sum, tx) => sum + (tx.total || 0), 0)
    const revenueChange = yesterdayRevenue > 0 
      ? ((totalRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1)
      : 0

    const totalTransactions = todayTransactions.length
    const transactionChange = yesterdayTransactions.length > 0
      ? ((totalTransactions - yesterdayTransactions.length) / yesterdayTransactions.length * 100).toFixed(1)
      : 0

    const lowStockProducts = products.filter((p) => p.stock <= 2).length

    return {
      totalRevenue,
      revenueChange,
      totalTransactions,
      transactionChange,
      totalProducts: products.length,
      lowStockProducts,
      totalCustomers: customers.length,
    }
  }, [transactions, products, customers])

  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      {/* Header dengan Gradient Modern */}
      <div className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 px-4 pt-6 pb-10 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Kasgo</h1>
            <p className="text-sm text-emerald-100">{formatDateIndonesian(currentTime)}</p>
            <p className="text-xs text-emerald-100 font-mono mt-0.5">
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Bell className="text-white" size={20} />
            </div>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Users className="text-white" size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-3 -mt-6">
        {/* Quick Stats - Enhanced */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-2 shadow-lg shadow-emerald-500/30">
              <TrendingUp className="text-white" size={20} />
            </div>
            <p className="text-xs text-gray-500 mb-1">Saldo</p>
            <p className="text-base sm:text-xl font-bold text-gray-900 truncate mb-1">{formatCurrency(kpis.totalRevenue)}</p>
            {kpis.revenueChange !== 0 && (
              <div className={`flex items-center gap-1 ${parseFloat(kpis.revenueChange) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {parseFloat(kpis.revenueChange) >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <span className="text-xs font-semibold">{Math.abs(kpis.revenueChange)}%</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-2 shadow-lg shadow-blue-500/30">
              <Receipt className="text-white" size={20} />
            </div>
            <p className="text-xs text-gray-500 mb-1">Transaksi</p>
            <p className="text-base sm:text-xl font-bold text-gray-900 mb-1">{kpis.totalTransactions}</p>
            {kpis.transactionChange !== 0 && (
              <div className={`flex items-center gap-1 ${parseFloat(kpis.transactionChange) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {parseFloat(kpis.transactionChange) >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <span className="text-xs font-semibold">{Math.abs(kpis.transactionChange)}%</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-2 shadow-lg shadow-orange-500/30">
              <Package className="text-white" size={20} />
            </div>
            <p className="text-xs text-gray-500 mb-1">Produk</p>
            <p className="text-base sm:text-xl font-bold text-gray-900 mb-1">{kpis.totalProducts}</p>
            <div className="flex items-center gap-1 text-gray-500">
              <Users size={12} />
              <span className="text-xs">{kpis.totalCustomers} member</span>
            </div>
          </div>
        </div>

        {/* Menu Utama Label */}
        <div className="pt-3 pb-1">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">Menu Utama</h2>
        </div>
      </div>

      {/* Menu Grid - KASGO Style Enhanced */}
      <div className="px-3 sm:px-4 pb-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                href={item.href}
                className="group"
              >
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  {/* Icon Container - Large & Colorful dengan shadow yang menarik */}
                  <div className={`
                    w-16 h-16 sm:w-20 sm:h-20 
                    ${item.bgColor} ${item.hoverColor}
                    rounded-[1.25rem] sm:rounded-[1.5rem]
                    flex items-center justify-center 
                    shadow-lg ${item.shadowColor}
                    group-hover:shadow-2xl 
                    group-hover:scale-105
                    group-active:scale-95 
                    transition-all duration-200
                    relative
                    overflow-hidden
                  `}>
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Icon className="text-white relative z-10" size={28} strokeWidth={2.5} />
                  </div>
                  
                  {/* Label */}
                  <div className="text-center">
                    <p className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-emerald-600 transition-colors leading-tight">
                      {item.label}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Dashboard Widgets Section */}
      <div className="px-3 sm:px-4 pb-4 space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-gray-900">Dashboard</h2>
        
        {/* Produk Laku Hari Ini - Full Width */}
        <TodaySales transactions={transactions} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <QuickActions />
          <RecentActivity transactions={transactions} />
        </div>

        <TopProducts products={products} />
      </div>

      {/* Info Banner - Stok Rendah */}
      {kpis.lowStockProducts > 0 && (
        <div className="mx-3 sm:mx-4 mb-6">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-orange-200 rounded-2xl p-4 flex items-center gap-3 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/40">
              <Package className="text-white" size={22} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900 mb-0.5">Perhatian!</p>
              <p className="text-xs text-gray-600">{kpis.lowStockProducts} produk stok menipis</p>
            </div>
            <Link 
              href="/dash/products"
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-sm font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl"
            >
              Lihat
            </Link>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mx-3 sm:mx-4 pb-6">
        <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span>Sistem Alexa</span>
            </div>
            <span>Kasgo POS</span>
          </div>
        </div>
      </div>
    </div>
  )
}
