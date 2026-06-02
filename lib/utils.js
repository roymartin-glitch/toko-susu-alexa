import { CURRENCY, DATE_FORMAT, TIME_FORMAT, DATETIME_FORMAT } from './constants'
import { format, parse } from 'date-fns'
import { id } from 'date-fns/locale'

// ============================================
// CURRENCY FORMATTING
// ============================================
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const parseCurrency = (value) => {
  if (typeof value === 'number') return value
  return parseInt(value?.replace(/\D/g, '') || 0, 10)
}

// ============================================
// DATE FORMATTING
// ============================================
export const formatDate = (date) => {
  if (!date) return '-'
  try {
    return format(new Date(date), DATE_FORMAT, { locale: id })
  } catch {
    return '-'
  }
}

export const formatDateIndonesian = (date) => {
  if (!date) return '-'
  try {
    return format(new Date(date), 'EEEE, dd MMMM yyyy', { locale: id })
  } catch {
    return '-'
  }
}

export const formatTime = (date) => {
  if (!date) return '-'
  try {
    return format(new Date(date), TIME_FORMAT, { locale: id })
  } catch {
    return '-'
  }
}

export const formatDateTime = (date) => {
  if (!date) return '-'
  try {
    return format(new Date(date), DATETIME_FORMAT, { locale: id })
  } catch {
    return '-'
  }
}

export const parseDate = (dateString) => {
  try {
    return parse(dateString, DATE_FORMAT, new Date())
  } catch {
    return null
  }
}

// ============================================
// TRANSACTION HELPERS
// ============================================
export const generateTransactionNumber = () => {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `TRX-${timestamp}${random}`
}

export const calculateTransactionTotal = (items, discount = 0, taxRate = 0.1) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = Math.round(subtotal * taxRate)
  const total = subtotal - discount + tax
  return { subtotal, discount, tax, total }
}

export const calculateChange = (total, paid) => {
  return Math.max(0, paid - total)
}

// ============================================
// PRODUCT HELPERS
// ============================================
export const getStockStatus = (stock, threshold = 10) => {
  if (stock === 0) return 'habis'
  if (stock <= threshold) return 'hampir_habis'
  return 'tersedia'
}

export const getStockStatusLabel = (status) => {
  const labels = {
    tersedia: 'Tersedia',
    hampir_habis: 'Hampir Habis',
    habis: 'Habis',
  }
  return labels[status] || 'Tidak Diketahui'
}

export const getStockStatusColor = (status) => {
  const colors = {
    tersedia: 'bg-green-100 text-green-800',
    hampir_habis: 'bg-yellow-100 text-yellow-800',
    habis: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export const calculateProfit = (buyPrice, sellPrice, quantity) => {
  return (sellPrice - buyPrice) * quantity
}

// ============================================
// CUSTOMER HELPERS
// ============================================
export const formatPhoneNumber = (phone) => {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('62')) {
    return `+${cleaned}`
  }
  if (cleaned.startsWith('0')) {
    return `+62${cleaned.slice(1)}`
  }
  return `+62${cleaned}`
}

export const getCustomerDisplayName = (customer) => {
  if (!customer) return 'Umum (Tanpa Member)'
  return customer.name || 'Pelanggan'
}

// ============================================
// ARRAY & OBJECT HELPERS
// ============================================
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key]
    if (!result[group]) {
      result[group] = []
    }
    result[group].push(item)
    return result
  }, {})
}

export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return order === 'asc' ? -1 : 1
    if (a[key] > b[key]) return order === 'asc' ? 1 : -1
    return 0
  })
}

export const filterBy = (array, key, value) => {
  return array.filter((item) => item[key] === value)
}

export const searchInArray = (array, query, searchKeys = []) => {
  if (!query) return array
  const lowerQuery = query.toLowerCase()
  return array.filter((item) =>
    searchKeys.some((key) =>
      String(item[key]).toLowerCase().includes(lowerQuery)
    )
  )
}

// ============================================
// VALIDATION HELPERS
// ============================================
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+62|0)[0-9]{9,12}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export const isValidBarcode = (barcode) => {
  return barcode && barcode.length >= 8 && barcode.length <= 13
}

// ============================================
// STRING HELPERS
// ============================================
export const truncate = (str, length = 50) => {
  if (!str) return ''
  return str.length > length ? `${str.substring(0, length)}...` : str
}

export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const slugify = (str) => {
  if (!str) return ''
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ============================================
// EXPORT HELPERS
// ============================================
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) return

  const headers = Object.keys(data[0])
  const csv = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header]
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`
        }
        return value
      }).join(',')
    ),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

// ============================================
// ERROR HANDLING
// ============================================
export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  if (error?.error?.message) return error.error.message
  return 'Terjadi kesalahan yang tidak diketahui'
}

export const handleApiError = (error) => {
  const message = getErrorMessage(error)
  console.error('API Error:', message)
  return {
    success: false,
    message,
    error,
  }
}

// ============================================
// PAYMENT METHOD HELPERS
// ============================================
export const getPaymentMethodLabel = (method) => {
  const labels = {
    tunai: 'Tunai',
    qris: 'QRIS',
    kartu_debit: 'Kartu Debit',
    kartu_kredit: 'Kartu Kredit',
    transfer: 'Transfer Bank',
  }
  return labels[method] || method
}

export const getPaymentMethodBadgeColor = (method) => {
  const colors = {
    tunai: 'bg-green-100 text-green-700',
    qris: 'bg-purple-100 text-purple-700',
    kartu_debit: 'bg-blue-100 text-blue-700',
    kartu_kredit: 'bg-blue-100 text-blue-700',
    transfer: 'bg-yellow-100 text-yellow-700',
  }
  return colors[method] || 'bg-gray-100 text-gray-700'
}

// ============================================
// MISC HELPERS
// ============================================
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const throttle = (func, limit) => {
  let inThrottle
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export const cloneDeep = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

export const mergeObjects = (target, source) => {
  return { ...target, ...source }
}
