'use client'

import { useState, useMemo } from 'react'
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useCategories } from '@/lib/hooks'
import { formatCurrency, searchInArray, getStockStatus, getStockStatusColor } from '@/lib/utils'
import { Plus, Search, Edit2, Trash2, AlertCircle, Scan } from 'lucide-react'
import { toast } from 'sonner'
import { productSchema, validateForm } from '@/lib/validators'
import BarcodeScanner from '@/app/components/pos/BarcodeScanner'

export default function ProductsPage() {
  const { data: products = [], isLoading } = useProducts()
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori')
  const [showModal, setShowModal] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    category: '',
    buy_price: 0,
    sell_price: 0,
    stock: 0,
    unit: 'pcs',
  })
  const [errors, setErrors] = useState({})

  // Get first category as default
  const defaultCategory = categories.length > 0 ? categories[0].name : ''

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = products
    if (selectedCategory !== 'Semua Kategori') {
      filtered = filtered.filter((p) => p.category === selectedCategory)
    }
    return searchInArray(filtered, searchQuery, ['name', 'barcode'])
  }, [products, searchQuery, selectedCategory])

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    const validation = await validateForm(productSchema, formData)
    if (!validation.success) {
      setErrors(validation.errors)
      return
    }

    try {
      if (editingId) {
        await updateProduct.mutateAsync({
          id: editingId,
          updates: formData,
        })
      } else {
        await createProduct.mutateAsync(formData)
      }
      resetForm()
    } catch (error) {
      console.error('Form error:', error)
    }
  }

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Hapus produk ini?')) {
      try {
        await deleteProduct.mutateAsync(id)
      } catch (error) {
        console.error('Delete error:', error)
      }
    }
  }

  // Handle edit
  const handleEdit = (product) => {
    setFormData(product)
    setEditingId(product.id)
    setShowModal(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      barcode: '',
      name: '',
      category: defaultCategory,
      buy_price: 0,
      sell_price: 0,
      stock: 0,
      unit: 'pcs',
    })
    setEditingId(null)
    setErrors({})
    setShowModal(false)
  }

  // Handle barcode scan
  const handleBarcodeScan = (barcode) => {
    setFormData({ ...formData, barcode })
    setShowScanner(false)
    toast.success(`Barcode ${barcode} berhasil di-scan!`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Barang</h1>
          <p className="text-gray-600 mt-1">Kelola daftar produk toko Anda</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors"
        >
          <Plus size={20} />
          Tambah Barang
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari nama atau barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          disabled={categoriesLoading}
        >
          <option>Semua Kategori</option>
          {categoriesLoading ? (
            <option disabled>Memuat kategori...</option>
          ) : categories.length === 0 ? (
            <option disabled>Belum ada kategori</option>
          ) : (
            categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Memuat data...</div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Barcode</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Nama Produk</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Kategori</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Harga Beli</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Harga Jual</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Stok</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product.stock)
                  const statusColor = getStockStatusColor(status)
                  return (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-xs text-gray-600">{product.barcode}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">{product.name}</td>
                      <td className="py-3 px-4 text-gray-700">{product.category}</td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {formatCurrency(product.buy_price)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        {formatCurrency(product.sell_price)}
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-gray-900">
                        {product.stock} {product.unit}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColor}`}>
                          {status === 'tersedia' && 'Tersedia'}
                          {status === 'hampir_habis' && 'Hampir Habis'}
                          {status === 'habis' && 'Habis'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <AlertCircle className="mx-auto mb-2 text-gray-400" size={32} />
            <p>Tidak ada produk</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Barcode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.barcode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Scan atau ketik barcode"
                  />
                  <button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                  >
                    <Scan size={18} />
                    Scan
                  </button>
                </div>
                {errors.barcode && <p className="text-red-600 text-xs mt-1">{errors.barcode}</p>}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  disabled={categoriesLoading}
                >
                  {categoriesLoading ? (
                    <option>Memuat kategori...</option>
                  ) : categories.length === 0 ? (
                    <option>Belum ada kategori</option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
                {categories.length === 0 && !categoriesLoading && (
                  <p className="text-xs text-amber-600 mt-1">
                    💡 Tambahkan kategori di halaman Pengaturan
                  </p>
                )}
              </div>

              {/* Buy Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Beli (Rp)</label>
                <input
                  type="number"
                  value={formData.buy_price}
                  onChange={(e) => setFormData({ ...formData, buy_price: parseInt(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.buy_price ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.buy_price && <p className="text-red-600 text-xs mt-1">{errors.buy_price}</p>}
              </div>

              {/* Sell Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jual (Rp)</label>
                <input
                  type="number"
                  value={formData.sell_price}
                  onChange={(e) => setFormData({ ...formData, sell_price: parseInt(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.sell_price ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.sell_price && <p className="text-red-600 text-xs mt-1">{errors.sell_price}</p>}
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.stock ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.stock && <p className="text-red-600 text-xs mt-1">{errors.stock}</p>}
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createProduct.isPending || updateProduct.isPending}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors disabled:opacity-50"
                >
                  {createProduct.isPending || updateProduct.isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  )
}
