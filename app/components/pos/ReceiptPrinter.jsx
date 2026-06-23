'use client'

import { useRef } from 'react'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Printer, X } from 'lucide-react'
import { STORE_NAME, STORE_ADDRESS, STORE_PHONE } from '@/lib/constants'

export default function ReceiptPrinter({ transaction, onClose }) {
  const receiptRef = useRef()

  const handlePrint = () => {
    const printContent = receiptRef.current
    const printWindow = window.open('', '', 'width=300,height=600')
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Receipt</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              margin: 0;
              padding: 10mm;
              width: 80mm;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 8px 0; }
            .double-line { border-top: 2px solid #000; margin: 8px 0; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 2px 0; }
            .right { text-align: right; }
            .item-row td { padding: 4px 0; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    
    printWindow.document.close()
    printWindow.focus()
    
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  if (!transaction) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Struk Pembayaran</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Receipt Preview */}
        <div className="p-4">
          <div 
            ref={receiptRef}
            className="bg-white border border-gray-300 rounded p-4 font-mono text-xs"
            style={{ width: '300px', margin: '0 auto' }}
          >
            {/* Store Header */}
            <div className="center bold" style={{ fontSize: '14px' }}>
              {STORE_NAME.toUpperCase()}
            </div>
            <div className="center" style={{ fontSize: '10px' }}>
              Jl. Batu Gede, Cilebut Bar.
            </div>
            <div className="center" style={{ fontSize: '10px' }}>
              Kec. Sukaraja, Kab. Bogor, Jawa Barat 16710
            </div>
            <div className="center" style={{ fontSize: '10px' }}>
              Telp: {STORE_PHONE}
            </div>
            
            <div className="line"></div>

            {/* Transaction Info */}
            <table>
              <tbody>
                <tr>
                  <td>No. Transaksi</td>
                  <td className="right bold">{transaction.no}</td>
                </tr>
                <tr>
                  <td>Tanggal</td>
                  <td className="right">{formatDateTime(transaction.created_at || new Date())}</td>
                </tr>
                <tr>
                  <td>Kasir</td>
                  <td className="right">Admin Toko</td>
                </tr>
                <tr>
                  <td>Pelanggan</td>
                  <td className="right">{transaction.customer_name || 'Umum'}</td>
                </tr>
              </tbody>
            </table>

            <div className="line"></div>

            {/* Items */}
            <table>
              <tbody>
                {transaction.items?.map((item, index) => (
                  <tr key={index} className="item-row">
                    <td colSpan="2" className="bold">{item.name}</td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan="2">Tidak ada item</td>
                  </tr>
                )}
                {transaction.items?.map((item, index) => (
                  <tr key={`detail-${index}`}>
                    <td>{item.quantity} x {formatCurrency(item.price)}</td>
                    <td className="right">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="line"></div>

            {/* Totals */}
            <table>
              <tbody>
                <tr>
                  <td>Subtotal</td>
                  <td className="right">{formatCurrency(transaction.subtotal || 0)}</td>
                </tr>
                {transaction.discount > 0 && (
                  <tr>
                    <td>Diskon</td>
                    <td className="right">-{formatCurrency(transaction.discount)}</td>
                  </tr>
                )}
                <tr>
                  <td>Pajak (10%)</td>
                  <td className="right">{formatCurrency(transaction.tax || 0)}</td>
                </tr>
              </tbody>
            </table>

            <div className="double-line"></div>

            {/* Grand Total */}
            <table>
              <tbody>
                <tr className="bold" style={{ fontSize: '14px' }}>
                  <td>TOTAL</td>
                  <td className="right">{formatCurrency(transaction.total || 0)}</td>
                </tr>
                <tr>
                  <td>Bayar ({transaction.payment_method || 'Tunai'})</td>
                  <td className="right">{formatCurrency(transaction.paid || 0)}</td>
                </tr>
                <tr>
                  <td>Kembali</td>
                  <td className="right">{formatCurrency(transaction.change || 0)}</td>
                </tr>
              </tbody>
            </table>

            <div className="double-line"></div>

            {/* Footer */}
            <div className="center" style={{ fontSize: '10px', marginTop: '10px' }}>
              Terima kasih atas kunjungan Anda
            </div>
            <div className="center" style={{ fontSize: '10px' }}>
              Barang yang sudah dibeli tidak dapat dikembalikan
            </div>
            <div className="center" style={{ fontSize: '10px', marginTop: '5px' }}>
              WhatsApp: {STORE_PHONE}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Printer size={20} />
            Print Struk
          </button>
        </div>
      </div>
    </div>
  )
}
