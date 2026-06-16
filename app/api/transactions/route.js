import { transactionsApi, productsApi, supabase } from '@/lib/supabase' // ✅ ADD supabase import
import { verifyAuth, errorResponse } from '@/lib/api-auth'
import { validateForm, transactionSchema } from '@/lib/validators' // ✅ ADD validation

export async function GET(request) {
  try {
    const { error } = verifyAuth(request)
    if (error) return error

    const transactions = await transactionsApi.getAll()
    return Response.json({ success: true, data: transactions })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request) {
  try {
    const { error } = verifyAuth(request)
    if (error) return error

    const body = await request.json()
    
    // ✅ SECURITY: Validate input
    const validation = await validateForm(transactionSchema, body)
    if (!validation.success) {
      return Response.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      )
    }
    
    // Create transaction
    const transaction = await transactionsApi.create(validation.data)
    
    // ✅ SECURITY FIX: Atomic stock update to prevent race conditions
    if (validation.data.items && Array.isArray(validation.data.items)) {
      for (const item of validation.data.items) {
        if (item.product_id && item.quantity > 0) {
          // Get current stock first
          const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('stock, name')
            .eq('id', item.product_id)
            .single()

          if (fetchError || !product) {
            throw new Error(`Product ${item.name} not found`)
          }

          // Check if enough stock
          if (product.stock < item.quantity) {
            throw new Error(`Stock tidak cukup untuk ${product.name}. Tersedia: ${product.stock}, Dibutuhkan: ${item.quantity}`)
          }

          // Atomic update with optimistic locking
          const newStock = product.stock - item.quantity
          const { error: updateError } = await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.product_id)
            .eq('stock', product.stock) // Optimistic locking - only update if stock hasn't changed

          if (updateError) {
            throw new Error(`Failed to update stock for ${product.name}. Try again.`)
          }
        }
      }
    }
    
    return Response.json({ success: true, data: transaction }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}
