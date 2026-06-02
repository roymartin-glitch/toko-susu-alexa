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
    <div className="space-y-6">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold mb-1">Selamat datang, Admin! 👋</h1>
        <p className="text-emerald-50">{formatDateIndonesian(new Date())}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Penjualan Hari Ini</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(kpis.totalRevenue)}
              </p>
              <p className="text-xs text-gray-500 mt-2">{kpis.totalTransactions} transaksi</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={24} className="text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Transactions Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Transaksi</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.totalTransactions}</p>
              <p className="text-xs text-gray-500 mt-2">Hari ini</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Products Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Produk</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.totalProducts}</p>
              <p className="text-xs text-gray-500 mt-2">
                {kpis.lowStockProducts} stok rendah
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        {/* Customers Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Pelanggan</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.totalCustomers}</p>
              <p className="text-xs text-gray-500 mt-2">Member terdaftar</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Transaksi Terbaru</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">No. Transaksi</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Pelanggan</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Items</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Total</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Metode</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{tx.no}</td>
                    <td className="py-3 px-4 text-gray-700">{tx.customer_name || 'Umum'}</td>
                    <td className="py-3 px-4 text-gray-700">{tx.item_count} item</td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {formatCurrency(tx.total)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPaymentMethodBadgeColor(tx.payment_method || 'tunai')}`}>
                        {getPaymentMethodLabel(tx.payment_method || 'tunai')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatDate(tx.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 px-4 text-center text-gray-500">
                    Belum ada transaksi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
