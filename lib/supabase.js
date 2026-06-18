import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============================================
// PRODUCTS
// ============================================
export const productsApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  create: async (product) => {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
    if (error) throw error
    return data?.[0]
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
    if (error) throw error
    return data?.[0]
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    if (error) throw error
    return true
  },

  updateStock: async (id, newStock) => {
    const { data, error } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', id)
      .select()
    if (error) throw error
    return data?.[0]
  },
}

// ============================================
// CUSTOMERS
// ============================================
export const customersApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  create: async (customer) => {
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select()
    if (error) throw error
    return data?.[0]
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
    if (error) throw error
    return data?.[0]
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
    if (error) throw error
    return true
  },
}

// ============================================
// TRANSACTIONS
// ============================================
export const transactionsApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  create: async (transaction) => {
    // ✅ CRITICAL FIX: Call API route instead of direct Supabase insert
    // This ensures stock is updated properly via the backend logic
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create transaction')
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || 'Failed to create transaction')
    }

    return result.data
  },

  getTodayTotal: async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data, error } = await supabase
      .from('transactions')
      .select('total')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())
    if (error) throw error
    return data || []
  },
}

// ============================================
// SETTINGS
// ============================================
export const settingsApi = {
  get: async (userId) => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return data || null
  },

  upsert: async (userId, settings) => {
    const { data, error } = await supabase
      .from('settings')
      .upsert({ user_id: userId, ...settings })
      .select()
    if (error) throw error
    return data?.[0]
  },
}

// ============================================
// CATEGORIES
// ============================================
export const categoriesApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })
    if (error) throw error
    return data || []
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  create: async (category) => {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name: category.name }])
      .select()
    if (error) throw error
    return data?.[0]
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
    if (error) throw error
    return data?.[0]
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
    if (error) throw error
    return true
  },

  checkUsage: async (categoryName) => {
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .eq('category', categoryName)
      .limit(1)
    if (error) throw error
    return (data || []).length > 0
  },
}
