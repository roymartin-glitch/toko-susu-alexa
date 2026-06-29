'use client'

import { useTransactions, useProducts } from '@/lib/hooks'
import { formatCurrency, formatDate, groupBy, sortBy } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Calendar, TrendingUp, Package, FileDown, Printer } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { STORE_NAME, STORE_ADDRESS, STORE_PHONE } from '@/lib/constants'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

export default function ReportsPage() {
  const { data: transactions = [] } = useTransactions()
  const { data: products = [] } = useProducts()
  const [dateRange, setDateRange] = useState('today')

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    const now = new Date()
    let startDate = new Date()

    switch (dateRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'all':
        startDate = new Date(0)
        break
      default:
        startDate.setHours(0, 0, 0, 0)
    }

    return transactions.filter((tx) => new Date(tx.created_at) >= startDate)
  }, [transactions, dateRange])

  // Calculate summary
  const summary = useMemo(() => {
    const totalRevenue = filteredTransactions.reduce((sum, tx) => sum + (tx.total || 0), 0)
    const totalTransactions = filteredTransactions.length
    const totalItems = filteredTransactions.reduce((sum, tx) => sum + (tx.item_count || 0), 0)
    const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

    return { totalRevenue, totalTransactions, totalItems, avgTransaction }
  }, [filteredTransactions])

  // Top products
  const topProducts = useMemo(() => {
    const productSales = {}
    filteredTransactions.forEach((tx) => {
      if (tx.items) {
        tx.items.forEach((item) => {
          if (!productSales[item.name]) {
            productSales[item.name] = { name: item.name, quantity: 0, revenue: 0 }
          }
          productSales[item.name].quantity += item.quantity
          productSales[item.name].revenue += item.subtotal
        })
      }
    })
    return sortBy(Object.values(productSales), 'revenue', 'desc').slice(0, 5)
  }, [filteredTransactions])

  // Payment methods breakdown
  const paymentBreakdown = useMemo(() => {
    const breakdown = {}
    filteredTransactions.forEach((tx) => {
      const method = tx.payment_method || 'Tunai'
      if (!breakdown[method]) {
        breakdown[method] = { name: method, value: 0, count: 0 }
      }
      breakdown[method].value += tx.total
      breakdown[method].count += 1
    })
    return Object.values(breakdown)
  }, [filteredTransactions])

  // Daily sales trend
  const dailySales = useMemo(() => {
    const sales = {}
    filteredTransactions.forEach((tx) => {
      const date = formatDate(tx.created_at)
      if (!sales[date]) {
        sales[date] = { date, revenue: 0, transactions: 0 }
      }
      sales[date].revenue += tx.total
      sales[date].transactions += 1
    })
    return sortBy(Object.values(sales), 'date', 'asc')
  }, [filteredTransactions])

  // Export to PDF
  const handleExportPDF = () => {
    const printWindow = window.open('', '', 'width=800,height=600')
    
    const dateRangeLabel = {
      today: 'Hari Ini',
      week: '7 Hari Terakhir',
      month: '30 Hari Terakhir',
      all: 'Semua Data'
    }[dateRange]

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan Penjualan - ${STORE_NAME}</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 20mm;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.6;
              color: #000;
              background: #fff;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #000;
              padding-bottom: 15px;
            }
            .store-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .store-info {
              font-size: 11px;
              color: #555;
            }
            .report-title {
              font-size: 18px;
              font-weight: bold;
              margin: 20px 0 10px 0;
            }
            .report-meta {
              font-size: 11px;
              color: #555;
              margin-bottom: 20px;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin-bottom: 30px;
            }
            .summary-card {
              border: 1px solid #ddd;
              padding: 15px;
              border-radius: 5px;
            }
            .summary-label {
              font-size: 11px;
              color: #666;
              margin-bottom: 5px;
            }
            .summary-value {
              font-size: 20px;
              font-weight: bold;
              color: #000;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              background: #f5f5f5;
              padding: 10px;
              text-align: left;
              border: 1px solid #ddd;
              font-weight: bold;
              font-size: 11px;
            }
            td {
              padding: 8px 10px;
              border: 1px solid #ddd;
              font-size: 11px;
            }
            .text-right {
              text-align: right;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 10px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }
            .section-title {
              font-size: 14px;
              font-weight: bold;
              margin: 20px 0 10px 0;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="store-name">${STORE_NAME}</div>
            <div class="store-info">
              ${STORE_ADDRESS}<br />
              Telp: ${STORE_PHONE}
            </div>
          </div>

          <div class="report-title">LAPORAN PENJUALAN</div>
          <div class="report-meta">
            Periode: ${dateRangeLabel}<br />
            Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>

          <div class="summary-grid">
            <div class="summary-card">
              <div class="summary-label">Total Penjualan</div>
              <div class="summary-value">${formatCurrency(summary.totalRevenue)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Jumlah Transaksi</div>
              <div class="summary-value">${summary.totalTransactions}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Total Item Terjual</div>
              <div class="summary-value">${summary.totalItems}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Rata-rata Transaksi</div>
              <div class="summary-value">${formatCurrency(summary.avgTransaction)}</div>
            </div>
          </div>

          <div class="section-title">Produk Terlaris</div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Produk</th>
                <th class="text-right">Jumlah Terjual</th>
                <th class="text-right">Total Penjualan</th>
                <th class="text-right">% dari Total</th>
              </tr>
            </thead>
            <tbody>
              ${topProducts.map((product, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${product.name}</td>
                  <td class="text-right">${product.quantity}</td>
                  <td class="text-right">${formatCurrency(product.revenue)}</td>
                  <td class="text-right">${((product.revenue / summary.totalRevenue) * 100).toFixed(1)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="section-title">Metode Pembayaran</div>
          <table>
            <thead>
              <tr>
                <th>Metode</th>
                <th class="text-right">Jumlah Transaksi</th>
                <th class="text-right">Total Nilai</th>
                <th class="text-right">% dari Total</th>
              </tr>
            </thead>
            <tbody>
              ${paymentBreakdown.map((method) => `
                <tr>
                  <td>${method.name}</td>
                  <td class="text-right">${method.count}</td>
                  <td class="text-right">${formatCurrency(method.value)}</td>
                  <td class="text-right">${((method.value / summary.totalRevenue) * 100).toFixed(1)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="section-title">Riwayat Transaksi Detail</div>
          <table>
            <thead>
              <tr>
                <th>No. Transaksi</th>
                <th>Tanggal</th>
                <th>Waktu</th>
                <th>Pelanggan</th>
                <th class="text-right">Item</th>
                <th class="text-right">Total</th>
                <th>Metode</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTransactions.map((tx) => {
                const date = new Date(tx.created_at)
                return `
                  <tr>
                    <td>${tx.no}</td>
                    <td>${date.toLocaleDateString('id-ID')}</td>
                    <td>${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>${tx.customer_name || 'Umum'}</td>
                    <td class="text-right">${tx.item_count || 0}</td>
                    <td class="text-right">${formatCurrency(tx.total)}</td>
                    <td>${tx.payment_method || 'tunai'}</td>
                  </tr>
                `
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            Laporan ini dicetak secara otomatis oleh sistem Kasgo POS<br />
            © ${new Date().getFullYear()} ${STORE_NAME} - Semua hak dilindungi
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print()
    }
    
    toast.success('Laporan PDF siap dicetak!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laporan Penjualan</h1>
          <p className="text-gray-600 mt-1">Analisis data penjualan dan performa toko</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="today">Hari Ini</option>
            <option value="week">7 Hari Terakhir</option>
            <option value="month">30 Hari Terakhir</option>
            <option value="all">Semua Data</option>
          </select>
          
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
          >
            <FileDown size={18} />
            <span className="hidden sm:inline">Export PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Penjualan</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.totalRevenue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={24} className="text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Jumlah Transaksi</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalTransactions}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Item Terjual</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalItems}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Rata-rata Transaksi</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.avgTransaction)}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Tren Penjualan Harian</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="revenue" fill="#10b981" name="Penjualan" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods Pie Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Metode Pembayaran</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Produk Terlaris</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Produk</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Jumlah Terjual</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Total Penjualan</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">% dari Total</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{product.name}</td>
                  <td className="py-3 px-4 text-right text-gray-700">{product.quantity}</td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">
                    {formatCurrency(product.revenue)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-700">
                    {((product.revenue / summary.totalRevenue) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
