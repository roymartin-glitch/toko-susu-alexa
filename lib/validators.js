import { z } from 'zod'
import { VALIDATION } from './constants'

// ============================================
// AUTH VALIDATORS
// ============================================
export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(VALIDATION.MIN_PASSWORD, `Password minimal ${VALIDATION.MIN_PASSWORD} karakter`),
})

export const registerSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(VALIDATION.MIN_PASSWORD, `Password minimal ${VALIDATION.MIN_PASSWORD} karakter`),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
})

// ============================================
// PRODUCT VALIDATORS
// ============================================
export const productSchema = z.object({
  barcode: z.string().min(1, 'Barcode harus diisi'),
  name: z.string()
    .min(VALIDATION.MIN_PRODUCT_NAME, `Nama produk minimal ${VALIDATION.MIN_PRODUCT_NAME} karakter`)
    .max(VALIDATION.MAX_PRODUCT_NAME, `Nama produk maksimal ${VALIDATION.MAX_PRODUCT_NAME} karakter`),
  category: z.string().min(1, 'Kategori harus dipilih'),
  buy_price: z.number().min(VALIDATION.MIN_PRICE, 'Harga beli tidak valid'),
  sell_price: z.number().min(VALIDATION.MIN_PRICE, 'Harga jual tidak valid'),
  stock: z.number().min(VALIDATION.MIN_STOCK, 'Stok tidak valid'),
  unit: z.string().default('pcs'),
}).refine((data) => data.sell_price > data.buy_price, {
  message: 'Harga jual harus lebih besar dari harga beli',
  path: ['sell_price'],
})

// ============================================
// CUSTOMER VALIDATORS
// ============================================
export const customerSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  phone: z.string()
    .min(VALIDATION.MIN_PHONE, `Nomor telepon minimal ${VALIDATION.MIN_PHONE} digit`)
    .max(VALIDATION.MAX_PHONE, `Nomor telepon maksimal ${VALIDATION.MAX_PHONE} digit`),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  address: z.string().optional(),
})

// ============================================
// TRANSACTION VALIDATORS
// ============================================
export const transactionItemSchema = z.object({
  product_id: z.string().min(1, 'Product ID harus diisi'),
  barcode: z.string(),
  name: z.string(),
  quantity: z.number().min(1, 'Jumlah minimal 1'),
  price: z.number().min(0, 'Harga tidak valid'),
  subtotal: z.number().min(0, 'Subtotal tidak valid'),
})

export const transactionSchema = z.object({
  customer_id: z.string().optional(),
  customer_name: z.string().optional(),
  items: z.array(transactionItemSchema).min(1, 'Minimal ada 1 item'),
  subtotal: z.number().min(0),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  total: z.number().min(0),
  payment_method: z.string().min(1, 'Metode pembayaran harus dipilih'),
  paid: z.number().min(0, 'Jumlah pembayaran tidak valid'),
})

// ============================================
// SETTINGS VALIDATORS
// ============================================
export const settingsSchema = z.object({
  store_name: z.string().min(3, 'Nama toko minimal 3 karakter'),
  address: z.string().optional(),
  phone: z.string().optional(),
  footer: z.string().optional(),
  paper_size: z.enum(['80mm', '58mm']).default('80mm'),
  show_logo: z.boolean().default(true),
  dark_mode: z.boolean().default(false),
})

// ============================================
// HELPER FUNCTIONS
// ============================================
export const validateForm = async (schema, data) => {
  try {
    const validated = await schema.parseAsync(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: 'Validasi gagal' } }
  }
}

export const getFieldError = (errors, fieldName) => {
  return errors?.[fieldName] || null
}
