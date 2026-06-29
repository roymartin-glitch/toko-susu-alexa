'use client'

import { useMemo } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Package, Clock, CreditCard, TrendingUp } from 'lucide-react'

export default function TodaySales({ transactions = [] }) {
  // Filter transaksi hari ini dan ambil detail produk
  const todaySalesDetail = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Filter transaksi hari ini
    const todayTransactions = transactions.filter((tx) => {
      const txDate = new Date(tx.created_at)
      txDate.setHours(0, 0, 0, 0)
      return txDate.getTime() === today.getTime()
    })

    // Extract semua item dari transaksi hari ini dengan detail
    const salesDetail = []
    todayTransactions.forEach((tx) => {
      if (tx.items && Array.isArray(tx.items)) {
        tx.items.forEach((item) => {
          salesDetail.push({
            productName: item.name,
            quantity: item.quantity,
            time: new Date(tx.created_at).toLocaleTimeString('id-ID', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            paymentMethod: tx.payment_method || 'tunai',
            subtotal: item.subtotal || (item.price * item.quantity),
            transactionNo: tx.no
          })
        })
      }
    })

    // Sort by time (newest first)
    return salesDetail.sort((a, b) => {
      const timeA = a.time.split(':').map(Number)
      const timeB = b.time.split(':').map(Number)
      return (timeB[0] * 60 + timeB[1]) - (timeA[0] * 60 + timeA[1])
    })
  }, [transactions])

  // Payment method display
  const getPaymentDisplay = (method) => {
    const paymentMap = {
      'tunai': { icon: '💵', label: 'Tunai' },
      'qris': { icon: '📱', label: 'QRIS' },
      'kartu_debit': { icon: '💳', label: 'Debit' },
      'kartu_kredit': { icon: '💳', label: 'Kredit' },
      'transfer': { icon: '🏦', label: 'Transfer' }
    }
    return paymentMap[method] || { icon: '💵', label: 'Tunai' }
  }

  if (todaySalesDetail.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Package className="text-emerald-600" size={20} />
            Produk Laku Hari Ini
          </h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Package size={48} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">Belum ada produk terjual hari ini</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
          <Package className="text-emerald-600" size={20} />
          Produk Laku Hari Ini
        </h3>
        <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
          {todaySalesDetail.length} item
        </div>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {todaySalesDetail.map((sale, index) => {
          const payment = getPaymentDisplay(sale.paymentMethod)
          return (
            <div 
              key={`${sale.transactionNo}-${index}`}
              className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-3 sm:p-4 hover:shadow-md transition-all group"
            >
              {/* Header: Product Name & Quantity */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-emerald-600 transition-colors truncate">
                    {sale.productName}
                  </h4>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md text-xs font-bold">
                      {sale.quantity}x
                    </div>
                    <span className="text-xs text-gray-500">terjual</span>
                  </div>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                  <p className="text-sm sm:text-base font-bold text-gray-900">
                    {formatCurrency(sale.subtotal)}
                  </p>
                </div>
              </div>

              {/* Footer: Time & Payment Method */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock size={14} className="flex-shrink-0" />
                  <span className="text-xs font-medium">{sale.time}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <span className="text-xs">{payment.icon}</span>
                  <span className="text-xs font-medium">{payment.label}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-4 pt-4 border-t-2 border-gray-200">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-emerald-600" size={20} />
              <span className="text-sm font-medium text-gray-700">Total Penjualan</span>
            </div>
            <div className="text-right">
              <p className="text-lg sm:text-xl font-bold text-emerald-600">
                {formatCurrency(todaySalesDetail.reduce((sum, sale) => sum + sale.subtotal, 0))}
              </p>
              <p className="text-xs text-gray-600">{todaySalesDetail.length} item terjual</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
