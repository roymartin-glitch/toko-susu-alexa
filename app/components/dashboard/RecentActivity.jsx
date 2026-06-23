'use client'

import { 
  ShoppingCart, 
  TrendingUp, 
  Clock,
  ChevronRight
} from 'lucide-react'
import { formatCurrency, formatDateIndonesian } from '@/lib/utils'
import Link from 'next/link'

export default function RecentActivity({ transactions = [] }) {
  const recentTransactions = transactions.slice(0, 5)

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <Clock className="text-white" size={18} />
          </div>
          <h3 className="text-base font-bold text-gray-900">Transaksi Terakhir</h3>
        </div>
        <Link 
          href="/dash/reports"
          className="text-xs text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-1"
        >
          Lihat Semua
          <ChevronRight size={14} />
        </Link>
      </div>

      {recentTransactions.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <ShoppingCart className="mx-auto mb-2 opacity-30" size={40} />
          <p className="text-sm">Belum ada transaksi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentTransactions.map((tx, index) => (
            <div 
              key={tx.id || index}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                <ShoppingCart className="text-white" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {tx.customer_name || 'Pelanggan Umum'}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(tx.created_at).toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-emerald-600">
                  {formatCurrency(tx.total || 0)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
