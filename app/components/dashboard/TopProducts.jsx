'use client'

import { 
  Package, 
  TrendingUp,
  Crown,
  ChevronRight
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default function TopProducts({ products = [] }) {
  // Sort by stock (you can change this to sort by sales in the future)
  const topProducts = [...products]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5)

  const getMedalColor = (index) => {
    switch(index) {
      case 0: return 'from-yellow-500 to-amber-500'
      case 1: return 'from-gray-400 to-gray-500'
      case 2: return 'from-orange-600 to-amber-700'
      default: return 'from-blue-500 to-indigo-500'
    }
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <Crown className="text-white" size={18} />
          </div>
          <h3 className="text-base font-bold text-gray-900">Produk Terpopuler</h3>
        </div>
        <Link 
          href="/dash/products"
          className="text-xs text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-1"
        >
          Lihat Semua
          <ChevronRight size={14} />
        </Link>
      </div>

      {topProducts.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Package className="mx-auto mb-2 opacity-30" size={40} />
          <p className="text-sm">Belum ada produk</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topProducts.map((product, index) => (
            <div 
              key={product.id || index}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer"
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${getMedalColor(index)} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow`}>
                <span className="text-white font-bold text-sm">#{index + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {product.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500">
                    Stok: {product.stock}
                  </span>
                  {product.stock <= 10 && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-semibold">
                      Rendah
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">
                  {formatCurrency(product.price || 0)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
