'use client'

import { useState, useMemo, useEffect } from 'react'
import { useProducts, useCustomers, useCreateTransaction } from '@/lib/hooks'
import { formatCurrency, generateTransactionNumber, searchInArray } from '@/lib/utils'
import { Search, Plus, Minus, Trash2, ShoppingCart, X, Scan, Printer } from 'lucide-react'
import { toast } from 'sonner'
import BarcodeScanner from '@/app/components/pos/BarcodeScanner'
import ThermalReceipt from '@/app/components/pos/ThermalReceipt'

export default function POSPage() {
  const { data: products = [] } = useProducts()
  const { data: customers = [] } = useCustomers()
  const createTransaction = useCreateTransaction()

  const [cart, setCart] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('tunai')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastTransaction, setLastTransaction] = useState(null)

  // Search products
  const filteredProducts = useMemo(() => {
    return searchInArray(products, searchQuery, ['name', 'barcode'])
  }, [products, searchQuery])

  // Handle barcode scan
  const handleBarcodeScan = (barcode) => {
    const product = products.find(p => p.barcode === barcode)
    if (product) {
      addToCart(product)
      setShowScanner(false)
    } else {
      toast.error(`Produk dengan barcode ${barcode} tidak ditemukan`)
    }
  }

  // Auto-focus search on keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e) => {
      // F2 untuk buka scanner
      if (e.key === 'F2') {
        e.preventDefault()
        setShowScanner(true)
      }
      // F3 untuk fokus ke search
      if (e.key === 'F3') {
        e.preventDefault()
        document.getElementById('product-search')?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    return {
      subtotal,
      total: subtotal
    }
  }, [cart])

  // Add to cart
  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id)
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          barcode: product.barcode,
          name: product.name,
          price: product.sell_price,
          quantity: 1,
          stock: product.stock,
        },
      ])
    }
    toast.success(`${product.name} ditambahkan ke keranjang`)
  }

  // Update quantity
  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id)
    } else {
      const item = cart.find((item) => item.id === id)
      if (item && quantity > item.stock) {
        toast.error(`Stok tidak cukup. Tersedia: ${item.stock}`)
        return
      }
      setCart(
        cart.map((item) =>
          item.id === id ? { ...item, quantity } : item
        )
      )
    }
  }

  // Remove from cart
  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id))
  }

  // Clear cart
  const clearCart = () => {
    if (window.confirm('Hapus semua item dari keranjang?')) {
      setCart([])
      setSelectedCustomer(null)
    }
  }

  // Process payment
  const handlePayment = async () => {
    if (cart.length === 0) {
      toast.error('Keranjang kosong')
      return
    }

    try {
      const transactionData = {
        no: generateTransactionNumber(),
        customer_id: selectedCustomer?.id || null,
        customer_name: selectedCustomer?.name || 'Umum (Tanpa Member)',
        items: cart.map((item) => ({
          product_id: item.id,
          barcode: item.barcode,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
        })),
        item_count: cart.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: totals.subtotal,
        discount: 0,
        tax: 0,
        total: totals.total,
        payment_method: paymentMethod,
        paid: totals.total,
        change: 0,
        created_at: new Date().toISOString()
      }

      await createTransaction.mutateAsync(transactionData)
      
      // Save transaction for receipt
      setLastTransaction(transactionData)

      // Reset form
      setCart([])
      setSelectedCustomer(null)
      setPaymentMethod('tunai')
      setShowPaymentModal(false)
      
      // Show receipt
      setShowReceipt(true)
      
      toast.success('Transaksi berhasil!')
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Transaksi gagal: ' + (error?.message || 'Terjadi kesalahan'))
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
      {/* Products Section */}
      <div className="lg:col-span-2 flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg transition-colors">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-800">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" size={20} />
              <input
                id="product-search"
                type="text"
                placeholder="Cari produk atau barcode... (F3)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
              />
            </div>
            <button
              onClick={() => setShowScanner(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
              title="Scan Barcode (F2)"
            >
              <Scan size={20} />
              <span className="hidden sm:inline">Scan</span>
            </button>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            💡 Tekan <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs">F2</kbd> untuk scan barcode
          </p>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-950">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock === 0}
                className={`relative p-4 rounded-2xl border-2 transition-all text-left shadow-md hover:shadow-xl ${
                  product.stock === 0
                    ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-400 bg-white dark:bg-gray-900 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:scale-105'
                }`}
              >
                {/* Stock Badge - Top Right */}
                <span className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-bold shadow-sm ${
                  product.stock > 10
                    ? 'bg-green-500 text-white'
                    : product.stock > 5
                    ? 'bg-yellow-500 text-white'
                    : 'bg-red-500 text-white'
                }`}>
                  {product.stock}
                </span>
                
                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate pr-8">{product.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">{product.barcode}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="font-bold text-base text-emerald-600 dark:text-emerald-400">{formatCurrency(product.sell_price)}</p>
                </div>
              </button>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <p>Produk tidak ditemukan</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Section */}
      <div className="flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg transition-colors">
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-800">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-gray-900 dark:text-white">Keranjang</h3>
          </div>
          <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
            {cart.length} item
          </span>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-950">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-900 rounded-xl p-3 space-y-2 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(item.price)}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Minus size={16} className="text-gray-700 dark:text-gray-300" />
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                    className="w-14 text-center border border-gray-300 dark:border-gray-600 rounded-lg py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Plus size={16} className="text-gray-700 dark:text-gray-300" />
                  </button>
                  <span className="ml-auto font-bold text-sm text-gray-900 dark:text-white">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <p>Keranjang kosong</p>
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3 bg-white dark:bg-gray-900">
            {/* Customer Selection */}
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">Pelanggan</label>
              <select
                value={selectedCustomer?.id || ''}
                onChange={(e) => {
                  const customer = customers.find((c) => c.id === e.target.value)
                  setSelectedCustomer(customer || null)
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Umum (Tanpa Member)</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(totals.total)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={clearCart}
                className="px-4 py-2.5 border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 font-medium text-sm transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold text-base transition-all shadow-lg hover:shadow-xl w-full"
              >
                💰 Bayar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Thermal Receipt Modal */}
      {showReceipt && lastTransaction && (
        <ThermalReceipt
          transaction={lastTransaction}
          onClose={() => setShowReceipt(false)}
          onPrint={() => {
            toast.success('Struk berhasil di-print!')
            setShowReceipt(false)
          }}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Pembayaran</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Total */}
              <div className="bg-emerald-50 rounded-lg p-4 border-2 border-emerald-200">
                <p className="text-sm text-gray-600 mb-1">Total Pembayaran</p>
                <p className="text-3xl font-bold text-emerald-600">{formatCurrency(totals.total)}</p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">Metode Pembayaran</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-base"
                >
                  <option value="tunai">💵 Tunai</option>
                  <option value="qris">📱 QRIS (GoPay/OVO/Dana)</option>
                  <option value="kartu_debit">💳 Kartu Debit</option>
                  <option value="kartu_kredit">💳 Kartu Kredit</option>
                  <option value="transfer">🏦 Transfer Bank</option>
                </select>
              </div>

              {/* QRIS Instructions */}
              {paymentMethod === 'qris' && (
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border-2 border-emerald-200">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-3xl">📱</span>
                    </div>
                    
                    <div>
                      <p className="text-lg font-bold text-gray-900 mb-2">
                        Silakan scan Soundbox di meja kasir
                      </p>
                      <p className="text-sm text-gray-600">
                        Gunakan aplikasi GoPay, OVO, Dana, atau ShopeePay
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-emerald-200">
                      <p className="text-sm text-gray-700 font-medium mb-1">
                        GoPay: 0813-3194-1357
                      </p>
                      <p className="text-2xl text-emerald-600 font-bold">
                        {formatCurrency(totals.total)}
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 bg-emerald-100 rounded-lg px-4 py-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      <span className="text-sm font-medium text-emerald-700">
                        Menunggu pembayaran...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Info for other payment methods */}
              {paymentMethod === 'tunai' && (
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    💵 Terima pembayaran tunai dari pelanggan
                  </p>
                </div>
              )}

              {paymentMethod === 'transfer' && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    🏦 Transfer ke rekening:
                  </p>
                  <p className="text-xs text-blue-700">
                    BCA: 1234567890<br />
                    a.n. Toko Susu
                  </p>
                </div>
              )}

              {(paymentMethod === 'kartu_debit' || paymentMethod === 'kartu_kredit') && (
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <p className="text-sm text-purple-800">
                    💳 Gesek kartu pada mesin EDC
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {paymentMethod === 'qris' ? (
                <div className="space-y-3 pt-4">
                  <button
                    onClick={handlePayment}
                    disabled={createTransaction.isPending}
                    className="w-full px-6 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold text-lg transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
                  >
                    {createTransaction.isPending ? 'Memproses...' : '✓ Konfirmasi Pembayaran Diterima'}
                  </button>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={createTransaction.isPending}
                    className="px-4 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold text-base transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
                  >
                    {createTransaction.isPending ? 'Memproses...' : 'Selesaikan'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
