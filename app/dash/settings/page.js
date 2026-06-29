'use client'

import { useState } from 'react'
import { Settings, Save, AlertCircle, Plus, Trash2, Tag } from 'lucide-react'
import { toast } from 'sonner'
import { useCategories, useCreateCategory, useDeleteCategory } from '@/lib/hooks'
import { categoriesApi } from '@/lib/supabase'

export default function SettingsPage() {
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const createCategory = useCreateCategory()
  const deleteCategory = useDeleteCategory()

  const [settings, setSettings] = useState({
    store_name: 'Toko Susu Alexakids',
    address: 'Jl. Batu Gede, Cilebut Bar., Kec. Sukaraja, Kabupaten Bogor, Jawa Barat 16710',
    phone: '085276358423',
    footer: 'Terima kasih atas kunjungan Anda',
    paper_size: '80mm',
    show_logo: true,
    dark_mode: false,
    timezone: 'Asia/Jakarta',
    use_realtime: true,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isAddingCategory, setIsAddingCategory] = useState(false)

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save to localStorage for timezone and realtime settings
      localStorage.setItem('app_timezone', settings.timezone)
      localStorage.setItem('app_use_realtime', settings.use_realtime ? 'true' : 'false')
      
      // Simulate API call for other settings
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Pengaturan berhasil disimpan')
      
      // Reload page to apply timezone changes
      if (settings.timezone !== localStorage.getItem('app_timezone')) {
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } catch (error) {
      toast.error('Gagal menyimpan pengaturan')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Nama kategori tidak boleh kosong')
      return
    }

    setIsAddingCategory(true)
    try {
      await createCategory.mutateAsync({ name: newCategoryName.trim() })
      setNewCategoryName('')
    } catch (error) {
      console.error('Error adding category:', error)
    } finally {
      setIsAddingCategory(false)
    }
  }

  const handleDeleteCategory = async (categoryId, categoryName) => {
    // Check if category is being used
    try {
      const isUsed = await categoriesApi.checkUsage(categoryName)
      if (isUsed) {
        toast.error('Kategori tidak bisa dihapus karena masih digunakan oleh produk')
        return
      }

      if (window.confirm(`Hapus kategori "${categoryName}"?`)) {
        await deleteCategory.mutateAsync(categoryId)
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pengaturan Toko</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola informasi dan preferensi toko Anda</p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Store Information */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Settings size={20} />
              Informasi Toko
            </h3>

            <div className="space-y-4">
              {/* Store Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Toko</label>
                <input
                  type="text"
                  value={settings.store_name}
                  onChange={(e) => handleChange('store_name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat</label>
                <textarea
                  value={settings.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomor Telepon</label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              {/* Footer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pesan Footer (Struk)</label>
                <textarea
                  value={settings.footer}
                  onChange={(e) => handleChange('footer', e.target.value)}
                  rows="2"
                  placeholder="Pesan yang akan ditampilkan di bagian bawah struk"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Category Management */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Tag size={20} />
              Kelola Kategori Produk
            </h3>

            {/* Add Category Form */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                placeholder="Nama kategori baru..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <button
                onClick={handleAddCategory}
                disabled={isAddingCategory || !newCategoryName.trim()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Plus size={18} />
                Tambah
              </button>
            </div>

            {/* Categories List */}
            <div className="space-y-2">
              {categoriesLoading ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Memuat kategori...</p>
              ) : categories.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada kategori</p>
              ) : (
                categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                    <button
                      onClick={() => handleDeleteCategory(category.id, category.name)}
                      className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                      title="Hapus kategori"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              💡 Kategori yang masih digunakan oleh produk tidak bisa dihapus
            </p>
          </div>

          {/* Receipt Settings */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Pengaturan Struk</h3>

            <div className="space-y-4">
              {/* Paper Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ukuran Kertas</label>
                <select
                  value={settings.paper_size}
                  onChange={(e) => handleChange('paper_size', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="80mm">80mm (Thermal Printer)</option>
                  <option value="58mm">58mm (Thermal Printer)</option>
                </select>
              </div>

              {/* Show Logo */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="show_logo"
                  checked={settings.show_logo}
                  onChange={(e) => handleChange('show_logo', e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                />
                <label htmlFor="show_logo" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tampilkan logo di struk
                </label>
              </div>
            </div>
          </div>

          {/* Time & System Settings */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Pengaturan Waktu & Sistem</h3>

            <div className="space-y-4">
              {/* Use Real-time */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    id="use_realtime"
                    checked={settings.use_realtime}
                    onChange={(e) => handleChange('use_realtime', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                  />
                  <label htmlFor="use_realtime" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Gunakan waktu real-time otomatis
                  </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 ml-7">
                  Sistem akan menggunakan waktu dari perangkat Anda
                </p>
              </div>

              {/* Timezone Selection */}
              {!settings.use_realtime && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Zona Waktu
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleChange('timezone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="Asia/Jakarta">WIB - Jakarta (GMT+7)</option>
                    <option value="Asia/Makassar">WITA - Makassar (GMT+8)</option>
                    <option value="Asia/Jayapura">WIT - Jayapura (GMT+9)</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Pilih zona waktu sesuai lokasi toko Anda
                  </p>
                </div>
              )}

              {/* Current Time Display */}
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800 p-3">
                <p className="text-xs font-medium text-emerald-900 dark:text-emerald-300 mb-1">
                  Waktu Sekarang:
                </p>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  {new Date().toLocaleString('id-ID', {
                    timeZone: settings.use_realtime ? undefined : settings.timezone,
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
                  {settings.use_realtime ? '🔄 Real-time otomatis' : `📍 ${settings.timezone}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Preview Struk</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 font-mono text-xs text-gray-900 dark:text-white space-y-1">
              <div className="text-center font-bold">{settings.store_name}</div>
              <div className="text-center text-gray-600 dark:text-gray-400 text-xs">{settings.address}</div>
              <div className="text-center text-gray-600 dark:text-gray-400 text-xs">{settings.phone}</div>
              <div className="border-t border-gray-300 dark:border-gray-600 my-2" />
              <div>No. Transaksi: TRX-123456</div>
              <div>Tanggal: 01/06/2026 14:26</div>
              <div className="border-t border-gray-300 dark:border-gray-600 my-2" />
              <div>Produk 1 x 2 = Rp 15.000</div>
              <div className="border-t border-gray-300 dark:border-gray-600 my-2" />
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>Rp 15.000</span>
              </div>
              <div className="border-t border-gray-300 dark:border-gray-600 my-2" />
              <div className="text-center text-gray-600 dark:text-gray-400 text-xs">{settings.footer}</div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
            <div className="flex gap-3">
              <AlertCircle size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Informasi</p>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                  Perubahan pengaturan akan berlaku untuk semua struk yang dicetak setelah ini.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors disabled:opacity-50"
        >
          <Save size={20} />
          {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </div>
    </div>
  )
}
