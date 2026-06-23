'use client'

import { useRef } from 'react'
import { X, Printer } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { STORE_NAME, STORE_ADDRESS, STORE_PHONE } from '@/lib/constants'

export default function ThermalReceipt({ transaction, onClose, onPrint }) {
  const receiptRef = useRef(null)

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=300,height=600')
    const receiptContent = receiptRef.current.innerHTML
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Receipt</title>
          <style>
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              color: #000;
              background: #fff;
              margin: 0;
              padding: 10mm;
              width: 80mm;
            }
            .receipt {
              width: 100%;
            }
            .header {
              text-align: center;
              margin-bottom: 10px;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
            }
            .store-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .store-info {
              font-size: 10px;
              line-height: 1.3;
            }
            .transaction-info {
              margin: 10px 0;
              font-size: 10px;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
            }
            .items {
              margin: 10px 0;
            }
            .item {
              margin-bottom: 8px;
            }
            .item-name {
              font-weight: bold;
            }
            .item-detail {
              display: flex;
              justify-content: space-between;
              font-size: 11px;
            }
            .totals {
              border-top: 1px dashed #000;
              padding-top: 10px;
              margin-top: 10px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
            }
            .grand-total {
              font-size: 16px;
              font-weight: bold;
              border-top: 2px solid #000;
              border-bottom: 2px solid #000;
              padding: 8px 0;
              margin: 10px 0;
            }
            .footer {
              text-align: center;
              margin-top: 15px;
              font-size: 10px;
              border-top: 1px dashed #000;
              padding-top: 10px;
            }
            .thank-you {
              font-weight: bold;
              margin: 10px 0;
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${receiptContent}
        </body>
      </html>
    `)
    printWindow.document.close()
    
    if (onPrint) onPrint()
  }

  const formatDate = (date) => {
    const d = new Date(date)
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Printer size={20} className="text-emerald-600" />
            Struk Pembayaran
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Receipt Preview */}
        <div className="p-6 max-h-[70vh] overflow-y-auto bg-gray-50">
          <div 
            ref={receiptRef}
            className="bg-white p-6 shadow-lg mx-auto"
            style={{ width: '80mm', fontFamily: 'Courier New, monospace' }}
          >
            {/* Store Header */}
            <div className="header">
              <div className="store-name">{STORE_NAME.toUpperCase()}</div>
              <div className="store-info">
                Jl. Batu Gede, Cilebut Bar.<br />
                Kec. Sukaraja, Kabupaten Bogor<br />
                Jawa Barat 16710<br />
                Telp: {STORE_PHONE}
              </div>
            </div>

            {/* Transaction Info */}
            <div className="transaction-info">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span>No. Transaksi</span>
                <span>{transaction.no}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span>Tanggal</span>
                <span>{formatDate(transaction.created_at || new Date())}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span>Kasir</span>
                <span>Admin</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Pelanggan</span>
                <span>{transaction.customer_name}</span>
              </div>
            </div>

            {/* Items */}
            <div className="items">
              {transaction.items.map((item, index) => (
                <div key={index} className="item">
                  <div className="item-name">{item.name}</div>
                  <div className="item-detail">
                    <span>{item.quantity} x {formatCurrency(item.price)}</span>
                    <span>{formatCurrency(item.subtotal)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>{formatCurrency(transaction.subtotal)}</span>
              </div>
              <div className="total-row grand-total">
                <span>TOTAL</span>
                <span>{formatCurrency(transaction.total)}</span>
              </div>
              <div className="total-row">
                <span>Metode Bayar</span>
                <span style={{ textTransform: 'uppercase' }}>
                  {transaction.payment_method === 'tunai' && '💵 TUNAI'}
                  {transaction.payment_method === 'qris' && '📱 QRIS'}
                  {transaction.payment_method === 'kartu_debit' && '💳 DEBIT'}
                  {transaction.payment_method === 'kartu_kredit' && '💳 KREDIT'}
                  {transaction.payment_method === 'transfer' && '🏦 TRANSFER'}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="footer">
              <div className="thank-you">TERIMA KASIH</div>
              <div>Atas kunjungan Anda</div>
              <div>Barang yang sudah dibeli<br />tidak dapat dikembalikan</div>
              <div style={{ marginTop: '10px' }}>WhatsApp: {STORE_PHONE}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <Printer size={18} />
              Print Struk
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            💡 Pastikan printer thermal sudah terhubung
          </p>
        </div>
      </div>
    </div>
  )
}
