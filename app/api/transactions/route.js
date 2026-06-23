import { transactionsApi, productsApi, supabase } from '@/lib/supabase'
import { errorResponse } from '@/lib/api-auth'
import { validateForm, transactionSchema } from '@/lib/validators'

export async function GET(request) {
  try {
    const transactions = await transactionsApi.getAll()
    return Response.json({ success: true, data: transactions })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = await validateForm(transactionSchema, body)
    if (!validation.success) {
      return Response.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      )
    }
    
    // Update stock BEFORE creating transaction
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
            return Response.json(
              { success: false, error: `Produk ${item.name} tidak ditemukan` },
              { status: 404 }
            )
          }

          // Check if enough stock
          if (product.stock < item.quantity) {
            return Response.json(
              { success: false, error: `Stok tidak cukup untuk ${product.name}. Tersedia: ${product.stock}` },
              { status: 400 }
            )
          }

          // Calculate new stock
          const newStock = product.stock - item.quantity
          
          console.log(`Updating stock for ${product.name}: ${product.stock} -> ${newStock}`)

          // Update stock
          const { error: updateError } = await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.product_id)

          if (updateError) {
            console.error('Stock update error:', updateError)
            return Response.json(
              { success: false, error: `Gagal update stok untuk ${product.name}` },
              { status: 500 }
            )
          }

          console.log(`Stock updated successfully for ${product.name}`)
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
