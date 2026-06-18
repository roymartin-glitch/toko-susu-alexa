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
    
    // ✅ CRITICAL FIX: Update stock BEFORE creating transaction
    // This ensures stock is updated even if transaction creation fails
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

          // Calculate new stock
          const newStock = product.stock - item.quantity
          
          console.log(`Updating stock for ${product.name}: ${product.stock} -> ${newStock} (quantity: ${item.quantity})`)

          // Update stock with optimistic locking
          const { data: updatedProduct, error: updateError } = await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.product_id)
            .eq('stock', product.stock) // Optimistic locking - only update if stock hasn't changed
            .select()

          if (updateError) {
            console.error('Stock update error:', updateError)
            throw new Error(`Gagal update stok untuk ${product.name}. Silakan coba lagi.`)
          }

          if (!updatedProduct || updatedProduct.length === 0) {
            console.error('Optimistic lock failed - stock changed by another transaction')
            throw new Error(`Stok ${product.name} berubah saat transaksi. Silakan coba lagi.`)
          }

          console.log(`Stock updated successfully for ${product.name}:`, updatedProduct[0])
        }
      }
    }
    
    // Create transaction after stock is updated
    const transaction = await transactionsApi.create(validation.data)
    
    return Response.json({ success: true, data: transaction }, { status: 201 })
  } catch (error) {
    console.error('Transaction API error:', error)
    return errorResponse(error)
  }
}
