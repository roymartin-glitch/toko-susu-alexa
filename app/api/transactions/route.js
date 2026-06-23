import { transactionsApi, productsApi, supabase } from '@/lib/supabase'
import { errorResponse } from '@/lib/api-auth'
import { validateForm, transactionSchema } from '@/lib/validators'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * Helper to validate session and return proper error response
 */
async function validateSession(supabaseClient) {
  try {
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError)
      return {
        valid: false,
        response: Response.json(
          { 
            success: false, 
            error: 'Unauthorized',
            message: 'Sesi login bermasalah, silakan login ulang',
            code: 'SESSION_ERROR'
          },
          { status: 401 }
        )
      }
    }
    
    if (!session) {
      console.error('❌ No active session')
      return {
        valid: false,
        response: Response.json(
          { 
            success: false, 
            error: 'Unauthorized',
            message: 'Sesi login habis, silakan login ulang',
            code: 'SESSION_EXPIRED'
          },
          { status: 401 }
        )
      }
    }
    
    // Check if session is about to expire (< 2 minutes)
    const expiresAt = session.expires_at
    const now = Math.floor(Date.now() / 1000)
    const timeLeft = expiresAt - now
    
    if (timeLeft < 120) {
      console.warn(`⚠️ Session expiring soon (${timeLeft}s left)`)
      // Still allow the request, but client should refresh
    }
    
    return { valid: true, session }
  } catch (error) {
    console.error('❌ Session validation error:', error)
    return {
      valid: false,
      response: Response.json(
        { 
          success: false, 
          error: 'Internal Server Error',
          message: 'Gagal memvalidasi sesi',
          code: 'VALIDATION_ERROR'
        },
        { status: 500 }
      )
    }
  }
}

export async function GET(request) {
  try {
    const supabaseClient = createRouteHandlerClient({ cookies })
    
    // Validate session
    const sessionCheck = await validateSession(supabaseClient)
    if (!sessionCheck.valid) {
      return sessionCheck.response
    }
    
    console.log('✅ GET /api/transactions - Session valid')
    
    const transactions = await transactionsApi.getAll()
    return Response.json({ success: true, data: transactions })
  } catch (error) {
    console.error('❌ GET /api/transactions error:', error)
    return errorResponse(error)
  }
}

export async function POST(request) {
  const startTime = Date.now()
  
  try {
    const supabaseClient = createRouteHandlerClient({ cookies })
    
    // Validate session
    const sessionCheck = await validateSession(supabaseClient)
    if (!sessionCheck.valid) {
      return sessionCheck.response
    }
    
    console.log('✅ POST /api/transactions - Session valid')
    
    const body = await request.json()
    
    // Validate input
    const validation = await validateForm(transactionSchema, body)
    if (!validation.success) {
      console.error('❌ Validation failed:', validation.errors)
      return Response.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      )
    }
    
    // Update stock BEFORE creating transaction
    if (validation.data.items && Array.isArray(validation.data.items)) {
      console.log(`📦 Updating stock for ${validation.data.items.length} items...`)
      
      for (const item of validation.data.items) {
        if (item.product_id && item.quantity > 0) {
          // Get current stock first
          const { data: product, error: fetchError } = await supabaseClient
            .from('products')
            .select('stock, name')
            .eq('id', item.product_id)
            .single()

          if (fetchError || !product) {
            console.error('❌ Product fetch error:', fetchError)
            return Response.json(
              { 
                success: false, 
                error: `Produk ${item.name} tidak ditemukan`,
                code: 'PRODUCT_NOT_FOUND'
              },
              { status: 404 }
            )
          }

          // Check if enough stock
          if (product.stock < item.quantity) {
            console.error(`❌ Insufficient stock for ${product.name}: ${product.stock} < ${item.quantity}`)
            return Response.json(
              { 
                success: false, 
                error: `Stok tidak cukup untuk ${product.name}. Tersedia: ${product.stock}`,
                code: 'INSUFFICIENT_STOCK'
              },
              { status: 400 }
            )
          }

          // Calculate new stock
          const newStock = product.stock - item.quantity
          
          console.log(`📦 ${product.name}: ${product.stock} -> ${newStock} (-${item.quantity})`)

          // Update stock
          const { error: updateError } = await supabaseClient
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.product_id)

          if (updateError) {
            console.error('❌ Stock update error:', updateError)
            return Response.json(
              { 
                success: false, 
                error: `Gagal update stok untuk ${product.name}: ${updateError.message}`,
                code: 'STOCK_UPDATE_FAILED'
              },
              { status: 500 }
            )
          }

          console.log(`✅ Stock updated for ${product.name}`)
        }
      }
    }
    
    // Create transaction after stock is updated
    console.log('💾 Creating transaction record...')
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('transactions')
      .insert([validation.data])
      .select()
      .single()
    
    if (transactionError) {
      console.error('❌ Transaction creation error:', transactionError)
      return Response.json(
        { 
          success: false, 
          error: `Gagal membuat transaksi: ${transactionError.message}`,
          code: 'TRANSACTION_CREATE_FAILED'
        },
        { status: 500 }
      )
    }
    
    const duration = Date.now() - startTime
    console.log(`✅ Transaction created successfully in ${duration}ms`)
    
    return Response.json({ 
      success: true, 
      data: transaction 
    }, { status: 201 })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('❌ Transaction API error:', error)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      duration: `${duration}ms`
    })
    return errorResponse(error)
  }
}
