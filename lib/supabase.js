import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============================================
// SESSION MANAGEMENT UTILITIES
// ============================================

/**
 * Check if session is valid and refresh if needed
 * @param {number} refreshThresholdMinutes - Refresh if session expires within this many minutes (default: 10)
 * @returns {Promise<{success: boolean, session: object|null, error: string|null}>}
 */
export const ensureValidSession = async (refreshThresholdMinutes = 10) => {
  try {
    // Step 1: Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Session check error:', sessionError)
      return {
        success: false,
        session: null,
        error: 'Gagal memeriksa sesi login'
      }
    }
    
    if (!session) {
      console.error('❌ No active session found')
      return {
        success: false,
        session: null,
        error: 'Sesi login habis, silakan login ulang'
      }
    }
    
    // Step 2: Check if session is about to expire
    const expiresAt = session.expires_at
    const now = Math.floor(Date.now() / 1000)
    const timeLeftSeconds = expiresAt - now
    const timeLeftMinutes = Math.floor(timeLeftSeconds / 60)
    
    console.log(`⏱️ Session expires in ${timeLeftMinutes} minutes (${timeLeftSeconds}s)`)
    
    // Step 3: Refresh if needed
    const refreshThresholdSeconds = refreshThresholdMinutes * 60
    
    if (timeLeftSeconds < refreshThresholdSeconds) {
      console.log(`⚠️ Session expiring soon (<${refreshThresholdMinutes} min), refreshing...`)
      
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
      
      if (refreshError) {
        console.error('❌ Session refresh failed:', refreshError)
        return {
          success: false,
          session: null,
          error: 'Gagal refresh sesi, silakan login ulang'
        }
      }
      
      if (!refreshData?.session) {
        console.error('❌ Session refresh returned no session')
        return {
          success: false,
          session: null,
          error: 'Gagal refresh sesi, silakan login ulang'
        }
      }
      
      const newTimeLeft = refreshData.session.expires_at - now
      console.log(`✅ Session refreshed! New expiry: ${Math.floor(newTimeLeft / 60)} minutes`)
      
      return {
        success: true,
        session: refreshData.session,
        error: null
      }
    }
    
    // Session is still fresh
    console.log('✅ Session is fresh')
    return {
      success: true,
      session: session,
      error: null
    }
  } catch (error) {
    console.error('❌ Unexpected session error:', error)
    return {
      success: false,
      session: null,
      error: error.message || 'Error tidak diketahui'
    }
  }
}

/**
 * Retry a request with automatic session refresh on 401
 * @param {Function} requestFn - Function that makes the request (should return Response)
 * @param {number} maxRetries - Maximum number of retries (default: 1)
 * @param {number} retryDelay - Delay between retries in ms (default: 300)
 * @returns {Promise<any>} The parsed response data
 */
export const retryWithAuth = async (requestFn, maxRetries = 1, retryDelay = 300) => {
  let lastError = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const isRetry = attempt > 0
    
    try {
      console.log(`📡 Request attempt ${attempt + 1}/${maxRetries + 1}${isRetry ? ' (retry)' : ''}`)
      
      // Make the request
      const response = await requestFn()
      
      // Parse response
      let result
      try {
        result = await response.json()
      } catch (parseError) {
        console.error('❌ Failed to parse response:', parseError)
        throw new Error('Server error: Invalid response format')
      }
      
      console.log(`📡 Response:`, {
        status: response.status,
        ok: response.ok,
        success: result.success
      })
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        console.error(`❌ Got 401 Unauthorized (attempt ${attempt + 1})`)
        
        if (attempt < maxRetries) {
          // Try to refresh session and retry
          console.log('🔄 Attempting session refresh...')
          
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
          
          if (refreshError || !refreshData?.session) {
            console.error('❌ Session refresh failed:', refreshError)
            throw new Error('Sesi login habis, silakan login ulang')
          }
          
          console.log('✅ Session refreshed, retrying request...')
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, retryDelay))
          
          // Continue to next iteration (retry)
          lastError = new Error('Unauthorized - retrying')
          continue
        } else {
          // Max retries reached
          console.error('❌ Max retries reached, session truly expired')
          throw new Error('Sesi login habis, silakan login ulang')
        }
      }
      
      // Handle other HTTP errors
      if (!response.ok) {
        const errorMessage = result.error || result.message || `Server error: ${response.status}`
        console.error('❌ HTTP error:', errorMessage)
        throw new Error(errorMessage)
      }
      
      // Handle success=false in response
      if (result.success === false) {
        const errorMessage = result.error || 'Request failed'
        console.error('❌ Request failed:', errorMessage)
        throw new Error(errorMessage)
      }
      
      // Success!
      console.log('✅ Request successful!')
      return result.data
      
    } catch (error) {
      lastError = error
      
      // If it's a login-related error or max retries reached, throw immediately
      if (error.message.includes('login') || attempt >= maxRetries) {
        throw error
      }
      
      // Otherwise continue to next retry
      console.log(`⚠️ Request failed, will retry: ${error.message}`)
    }
  }
  
  // Should never reach here, but just in case
  throw lastError || new Error('Request failed after retries')
}

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
    if (transaction.items?.length) {
      for (const item of transaction.items) {
        if (!item.product_id || item.quantity <= 0) continue

        const product = await productsApi.getById(item.product_id)
        if (!product) {
          throw new Error(`Produk ${item.name} tidak ditemukan`)
        }
        if (product.stock < item.quantity) {
          throw new Error(`Stok tidak cukup untuk ${product.name}. Tersedia: ${product.stock}`)
        }

        await productsApi.updateStock(item.product_id, product.stock - item.quantity)
      }
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single()

    if (error) {
      throw new Error(`Gagal membuat transaksi: ${error.message}`)
    }

    return data
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
