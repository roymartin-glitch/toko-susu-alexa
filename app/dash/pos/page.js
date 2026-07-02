'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useProducts, useCustomers, useCreateTransaction } from '@/lib/hooks'
import { formatCurrency, generateTransactionNumber, searchInArray, toWIBISOString } from '@/lib/utils'
import { Search, Plus, Minus, Trash2, ShoppingCart, X, User, DollarSign, Check, ScanLine, Camera } from 'lucide-react'
import { toast } from 'sonner'
import BarcodeScanner from '@/app/components/pos/BarcodeScanner'
import ThermalReceipt from '@/app/components/pos/ThermalReceipt'

export default function POSPage() {
  const { data: products = [], isLoading: productsLoading } = useProducts()
  const { data: customers = [] } = useCustomers()
  const createTransaction = useCreateTransaction()

  const [cart, setCart] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('tunai')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [completedTransaction, setCompletedTransaction] = useState(null)
  const searchInputRef = useRef(null)

  // Search products
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products
    return searchInArray(products, searchQuery, ['name', 'barcode'])
  }, [products, searchQuery])

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    return {
      subtotal,
      total: subtotal,
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
    }
  }, [cart])

  // Add to cart
  const addToCart = (product) => {
    if (product.stock === 0) {
      toast.error('Stok habis!')
      return
    }

    const existingItem = cart.find((item) => item.id === product.id)
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error(`Stok tersisa ${product.stock}`)
        return
      }
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
    toast.success(`${product.name} ditambahkan`)
  }

  // Handle barcode scan
  const handleBarcodeScan = (barcode) => {
    const product = products.find((p) => p.barcode === barcode)
    if (product) {
      addToCart(product)
      setSearchQuery('') // Clear search after scan
    } else {
      toast.error('Produk tidak ditemukan!')
    }
  }

  // Update quantity
  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id)
    } else {
      const item = cart.find((item) => item.id === id)
      if (item && quantity > item.stock) {
        toast.error(`Stok tersisa ${item.stock}`)
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
    toast.success('Item dihapus')
  }

  // Clear cart
  const clearCart = () => {
    setCart([])
    setSelectedCustomer(null)
    toast.success('Keranjang dikosongkan')
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
        customer_name: selectedCustomer?.name || 'Umum',
        items: cart.map((item) => ({
          product_id: item.id,
          barcode: item.barcode,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
        })),
        item_count: totals.itemCount,
        subtotal: totals.subtotal,
        discount: 0,
        tax: 0,
        total: totals.total,
        payment_method: paymentMethod,
        paid: totals.total,
        change: 0,
        created_at: toWIBISOString() // Use WIB timezone
      }

      await createTransaction.mutateAsync(transactionData)
      
      // Close payment modal
      setShowPaymentModal(false)
      
      // Show success toast
      toast.success('✓ Transaksi berhasil!')
      
      // Save transaction data and show receipt modal
      setCompletedTransaction(transactionData)
      setShowReceiptModal(true)
      
      // Reset cart and form AFTER showing receipt
      setCart([])
      setSelectedCustomer(null)
      setPaymentMethod('tunai')
      
    } catch (error) {
      console.error('Payment error details:', {
        error,
        message: error?.message,
        name: error?.name,
        stack: error?.stack
      })
      
      // DON'T close modal or clear cart on error
      // User-friendly error messages
      let errorMessage = 'Transaksi gagal'
      
      if (error?.message?.includes('Sesi login habis') || error?.message?.includes('silakan login ulang')) {
        errorMessage = '⚠️ Sesi login Anda telah habis. Silakan login ulang untuk melanjutkan.'
        
        // Redirect to login after showing error
        setTimeout(() => {
          window.location.href = '/login'
        }, 3000)
      } else if (error?.message?.includes('Stok tidak cukup')) {
        errorMessage = '⚠️ ' + error.message
      } else if (error?.message?.includes('Produk') && error?.message?.includes('tidak ditemukan')) {
        errorMessage = '⚠️ ' + error.message
      } else if (error?.message) {
        errorMessage = 'Transaksi gagal: ' + error.message
      }
      
      toast.error(errorMessage, {
        duration: 5000,
      })
      
      // Keep modal open so user can retry
      // Cart data is preserved
    }
  }

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat produk...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 w-full overflow-x-hidden">
      {/* HEADER - Customer & Cart Summary */}
      <div className="bg-white border-b border-gray-200 p-2 sm:p-3 md:p-4 flex-shrink-0">
        <div className="flex items-center justify-between gap-2 sm:gap-3 w-full">
          {/* Customer Button */}
          <button
            onClick={() => setShowCustomerModal(true)}
            className="flex-1 flex items-center gap-1.5 sm:gap-2 md:gap-3 bg-gray-50 hover:bg-gray-100 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border border-gray-200 hover:border-emerald-500 transition-all min-w-0"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="text-emerald-600" size={16} />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-xs text-gray-500">Pelanggan</p>
              <p className="font-bold text-xs sm:text-sm md:text-base text-gray-900 truncate">
                {selectedCustomer?.name || 'Umum'}
              </p>
            </div>
          </button>

          {/* Cart Summary */}
          <div className="bg-emerald-50 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border border-emerald-200 text-right flex-shrink-0">
            <p className="text-xs text-emerald-700 font-medium">Total Belanja</p>
            <p className="font-bold text-sm sm:text-base md:text-xl text-emerald-600">
              {formatCurrency(totals.total)}
            </p>
            <p className="text-xs text-emerald-600 mt-0.5">{totals.itemCount} item</p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-hidden flex flex-col w-full">
        {/* Search Bar with Scan Button */}
        <div className="p-2 sm:p-3 md:p-4 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex gap-1.5 sm:gap-2 w-full">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  // Auto-detect barcode (typically Enter key after scan)
                  if (e.key === 'Enter' && searchQuery) {
                    const product = products.find((p) => p.barcode === searchQuery)
                    if (product) {
                      addToCart(product)
                      setSearchQuery('')
                    }
                  }
                }}
                className="w-full pl-8 sm:pl-10 pr-2 sm:pr-4 py-2.5 sm:py-3 md:py-4 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
              />
            </div>
            
            {/* Scan Barcode Button */}
            <button
              onClick={() => setShowBarcodeScanner(true)}
              className="px-3 sm:px-4 py-2.5 sm:py-3 md:py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg sm:rounded-xl font-bold hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0"
            >
              <Camera size={18} className="sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Scan</span>
            </button>
          </div>
        </div>

        {/* Products Grid - Large Touch Buttons */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 no-scrollbar w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1.5 sm:gap-2 md:gap-3 w-full">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock === 0}
                className={`relative p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl border transition-all text-left min-h-[100px] sm:min-h-[120px] md:min-h-[140px] flex flex-col w-full ${
                  product.stock === 0
                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-emerald-200 bg-white hover:border-emerald-500 hover:bg-emerald-50 active:scale-95 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Stock Badge */}
                <div className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-bold ${
                  product.stock > 10
                    ? 'bg-green-100 text-green-700'
                    : product.stock > 5
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {product.stock}
                </div>
                
                <div className="flex-1 min-h-0">
                  <p className="font-bold text-xs sm:text-sm md:text-base text-gray-900 line-clamp-2 pr-6 sm:pr-8 mb-0.5 sm:mb-1">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500 font-mono truncate">{product.barcode}</p>
                </div>
                
                <div className="mt-auto pt-1 sm:pt-2">
                  <p className="font-bold text-sm sm:text-base md:text-lg text-emerald-600">
                    {formatCurrency(product.sell_price)}
                  </p>
                </div>
              </button>
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <p className="text-lg mb-2">🔍</p>
                <p>Produk tidak ditemukan</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM BAR - Cart & Checkout */}
      {cart.length > 0 && (
        <div className="bg-white border-t-2 border-gray-200 p-2 sm:p-3 md:p-4 shadow-lg flex-shrink-0 w-full">
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 w-full">
            {/* Cart Items Count */}
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-gray-100 rounded-lg sm:rounded-xl border border-gray-200 flex-shrink-0"
            >
              <ShoppingCart className="text-gray-700" size={18} />
              <span className="font-bold text-gray-900 text-sm sm:text-base">{cart.length}</span>
            </button>

            {/* Clear Cart */}
            <button
              onClick={clearCart}
              className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-red-50 text-red-600 rounded-lg sm:rounded-xl border border-red-200 hover:bg-red-100 font-medium text-xs sm:text-sm flex-shrink-0"
            >
              Batal
            </button>

            {/* Checkout Button - Large & Prominent */}
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex-1 py-2.5 sm:py-3 md:py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all min-w-0 truncate"
            >
              💰 Bayar {formatCurrency(totals.total)}
            </button>
          </div>
        </div>
      )}

      {/* CUSTOMER MODAL */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold">Pilih Pelanggan</h3>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <button
                onClick={() => {
                  setSelectedCustomer(null)
                  setShowCustomerModal(false)
                }}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  !selectedCustomer
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <p className="font-bold text-gray-900">Umum</p>
                <p className="text-sm text-gray-500">Tanpa member</p>
              </button>

              {customers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => {
                    setSelectedCustomer(customer)
                    setShowCustomerModal(false)
                  }}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedCustomer?.id === customer.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <p className="font-bold text-gray-900">{customer.name}</p>
                  <p className="text-sm text-gray-500">{customer.phone}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold">Konfirmasi Pembayaran</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Cart Items */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Item Belanja</p>
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.quantity} x {formatCurrency(item.price)}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="bg-emerald-50 rounded-2xl p-4 border-2 border-emerald-200">
                <p className="text-sm text-emerald-700 mb-1">Total Pembayaran</p>
                <p className="text-3xl font-bold text-emerald-600">{formatCurrency(totals.total)}</p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">Metode Pembayaran</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'tunai', label: 'Tunai', icon: '💵' },
                    { value: 'qris', label: 'QRIS', icon: '📱' },
                    { value: 'kartu_debit', label: 'Debit', icon: '💳' },
                    { value: 'transfer', label: 'Transfer', icon: '🏦' },
                  ].map((method) => (
                    <button
                      key={method.value}
                      onClick={() => setPaymentMethod(method.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === method.value
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{method.icon}</div>
                      <p className="text-sm font-medium">{method.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-gray-200 space-y-2">
              <button
                onClick={handlePayment}
                disabled={createTransaction.isPending}
                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {createTransaction.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memproses...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Check size={20} />
                    Selesaikan Pembayaran
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BARCODE SCANNER MODAL */}
      {showBarcodeScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}

      {/* RECEIPT PRINT MODAL */}
      {showReceiptModal && completedTransaction && (
        <ThermalReceipt
          transaction={completedTransaction}
          onClose={() => {
            setShowReceiptModal(false)
            setCompletedTransaction(null)
          }}
          onPrint={() => {
            // Optional: do something after print
            console.log('Receipt printed')
          }}
        />
      )}
    </div>
  )
}
