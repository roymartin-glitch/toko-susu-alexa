'use client'

import { useTransactions, useProducts, useCustomers } from '@/lib/hooks'
import { formatCurrency, formatDate, formatDateIndonesian, getPaymentMethodLabel, getPaymentMethodBadgeColor } from '@/lib/utils'
import { TrendingUp, Package, Users, ShoppingCart } from 'lucide-react'
import { useMemo } from 'react'

export default function DashboardPage() {
  const { data: transactions = [] } = useTransactions()
  const { data: products = [] } = useProducts()
  const { data: customers = [] } = useCustomers()

  // Calculate KPIs
  const kpis = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayTransactions = transactions.filter((tx) => {
      const txDate = new Date(tx.created_at)
      txDate.setHours(0, 0, 0, 0)
      return txDate.getTime() === today.getTime()
    })

    const totalRevenue = todayTransactions.reduce((sum, tx) => sum + (tx.total || 0), 0)
    const totalTransactions = todayTransactions.length
    const lowStockProducts = products.filter((p) => p.stock <= 10).length

    return {
      totalRevenue,
      totalTransactions,
      totalProducts: products.length,
      lowStockProducts,
      totalCustomers: customers.length,
    }
  }, [transactions, products, customers])

  // Recent transactions
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5)
  }, [transactions])

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
        <h1 className="text-xl sm:text-2xl font-bold mb-1">Selamat datang, Admin! 👋</h1>
        <p className="text-sm sm:text-base text-emerald-50">{formatDateIndonesian(new Date())}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Revenue Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 truncate">Penjualan Hari Ini</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                {formatCurrency(kpis.totalRevenue)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">{kpis.totalTransactions} transaksi</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center ml-2">
              <TrendingUp size={20} className="sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Transactions Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 truncate">Total Transaksi</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{kpis.totalTransactions}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">Hari ini</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center ml-2">
              <ShoppingCart size={20} className="sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Products Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 truncate">Total Produk</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{kpis.totalProducts}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                {kpis.lowStockProducts} stok rendah
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center ml-2">
              <Package size={20} className="sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Customers Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 truncate">Total Pelanggan</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{kpis.totalCustomers}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">Member terdaftar</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center ml-2">
              <Users size={20} className="sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Transaksi Terbaru</h3>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">No.</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Pelanggan</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Items</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Total</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap hidden sm:table-cell">Metode</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap hidden md:table-cell">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{tx.no}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-700 dark:text-gray-300 truncate max-w-[100px] sm:max-w-none">{tx.customer_name || 'Umum'}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">{tx.item_count} item</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                        {formatCurrency(tx.total)}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 hidden sm:table-cell">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPaymentMethodBadgeColor(tx.payment_method || 'tunai')}`}>
                          {getPaymentMethodLabel(tx.payment_method || 'tunai')}
                        </span>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 dark:text-gray-400 whitespace-nowrap hidden md:table-cell">
                        {formatDate(tx.created_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-6 sm:py-8 px-2 sm:px-4 text-center text-gray-500 dark:text-gray-400">
                      Belum ada transaksi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
