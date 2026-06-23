'use client'

import { 
  Plus, 
  ScanLine, 
  UserPlus, 
  FileText,
  Zap
} from 'lucide-react'
import Link from 'next/link'

const quickActions = [
  {
    label: 'Transaksi Baru',
    icon: Plus,
    href: '/dash/pos',
    color: 'from-emerald-500 to-teal-500',
    iconBg: 'bg-emerald-500'
  },
  {
    label: 'Scan Barcode',
    icon: ScanLine,
    href: '/dash/pos',
    color: 'from-blue-500 to-indigo-500',
    iconBg: 'bg-blue-500'
  },
  {
    label: 'Pelanggan Baru',
    icon: UserPlus,
    href: '/dash/customers',
    color: 'from-purple-500 to-pink-500',
    iconBg: 'bg-purple-500'
  },
  {
    label: 'Lihat Laporan',
    icon: FileText,
    href: '/dash/reports',
    color: 'from-orange-500 to-red-500',
    iconBg: 'bg-orange-500'
  },
]

export default function QuickActions() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
          <Zap className="text-white" size={18} />
        </div>
        <h3 className="text-base font-bold text-gray-900">Aksi Cepat</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.label}
              href={action.href}
              className="group"
            >
              <div className={`
                bg-gradient-to-br ${action.color}
                rounded-xl p-4
                flex flex-col items-center justify-center
                gap-2
                shadow-md
                hover:shadow-xl
                active:scale-95
                transition-all duration-200
              `}>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Icon className="text-white" size={24} />
                </div>
                <p className="text-xs font-bold text-white text-center">
                  {action.label}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
