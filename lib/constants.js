// ============================================
// APP CONSTANTS
// ============================================

export const APP_NAME = 'Toko Susu Alexakids'
export const APP_SUBTITLE = 'POS & Manajemen Toko'
export const APP_VERSION = '2.0.0'
export const CURRENCY = 'IDR'
export const TAX_RATE = 0.1 // 10%

// Store Information
export const STORE_NAME = 'Toko Susu Alexakids'
export const STORE_ADDRESS = 'Jl. Batu Gede, Cilebut Bar., Kec. Sukaraja, Kabupaten Bogor, Jawa Barat 16710'
export const STORE_PHONE = '085276358423'
export const STORE_EMAIL = 'tokosusualexa@gmail.com'

// ============================================
// USER ROLES
// ============================================
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  CASHIER: 'cashier',
}

export const ROLE_LABELS = {
  admin: 'Administrator',
  manager: 'Manajer',
  cashier: 'Kasir',
}

// ============================================
// PAYMENT METHODS
// ============================================
export const PAYMENT_METHODS = {
  CASH: 'tunai',
  CARD: 'kartu_kredit',
  QRIS: 'qris',
  TRANSFER: 'transfer',
}

export const PAYMENT_METHOD_LABELS = {
  tunai: 'Tunai',
  kartu_kredit: 'Kartu Kredit',
  qris: 'QRIS',
  transfer: 'Transfer Bank',
}

// ============================================
// TRANSACTION STATUS
// ============================================
export const TRANSACTION_STATUS = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
}

export const TRANSACTION_STATUS_LABELS = {
  completed: 'Selesai',
  pending: 'Menunggu',
  cancelled: 'Dibatalkan',
  refunded: 'Dikembalikan',
}

// ============================================
// STOCK STATUS
// ============================================
export const STOCK_STATUS = {
  AVAILABLE: 'tersedia',
  LOW: 'hampir_habis',
  OUT_OF_STOCK: 'habis',
}

export const STOCK_STATUS_LABELS = {
  tersedia: 'Tersedia',
  hampir_habis: 'Hampir Habis',
  habis: 'Habis',
}

export const LOW_STOCK_THRESHOLD = 10 // Minimum stock before warning

// ============================================
// DATE FORMATS
// ============================================
export const DATE_FORMAT = 'dd/MM/yyyy'
export const TIME_FORMAT = 'HH:mm:ss'
export const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm:ss'

// ============================================
// PAGINATION
// ============================================
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

// ============================================
// VALIDATION RULES
// ============================================
export const VALIDATION = {
  MIN_PRODUCT_NAME: 3,
  MAX_PRODUCT_NAME: 100,
  MIN_PRICE: 0,
  MAX_PRICE: 999999999,
  MIN_STOCK: 0,
  MAX_STOCK: 999999,
  MIN_PHONE: 10,
  MAX_PHONE: 15,
  MIN_PASSWORD: 6,
  MAX_PASSWORD: 50,
}

// ============================================
// API ENDPOINTS
// ============================================
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REGISTER: '/api/auth/register',
  ME: '/api/auth/me',

  // Products
  PRODUCTS: '/api/products',
  PRODUCTS_SEARCH: '/api/products/search',
  PRODUCTS_LOW_STOCK: '/api/products/low-stock',

  // Customers
  CUSTOMERS: '/api/customers',
  CUSTOMERS_SEARCH: '/api/customers/search',

  // Transactions
  TRANSACTIONS: '/api/transactions',
  TRANSACTIONS_REPORT: '/api/transactions/report',
  TRANSACTIONS_DAILY_SUMMARY: '/api/transactions/daily-summary',

  // Settings
  SETTINGS: '/api/settings',
}

// ============================================
// LOCAL STORAGE KEYS
// ============================================
export const STORAGE_KEYS = {
  USER: 'kasirku_user',
  CART: 'kasirku_cart',
  THEME: 'kasirku_theme',
  SETTINGS: 'kasirku_settings',
}

// ============================================
// TOAST MESSAGES
// ============================================
export const TOAST_MESSAGES = {
  SUCCESS: 'Berhasil!',
  ERROR: 'Terjadi kesalahan',
  LOADING: 'Memproses...',
  SAVED: 'Data berhasil disimpan',
  DELETED: 'Data berhasil dihapus',
  UPDATED: 'Data berhasil diperbarui',
  ADDED: 'Data berhasil ditambahkan',
}
