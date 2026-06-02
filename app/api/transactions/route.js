import { transactionsApi, productsApi } from '@/lib/supabase'
import { verifyAuth, errorResponse } from '@/lib/api-auth'

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
    
    // Create transaction
    const transaction = await transactionsApi.create(body)
    
    // Update stock for each item
    if (body.items && Array.isArray(body.items)) {
      for (const item of body.items) {
        if (item.product_id) {
          // Get current product
          const product = await productsApi.getById(item.product_id)
          if (product) {
            // Reduce stock
            const newStock = Math.max(0, product.stock - item.quantity)
            await productsApi.updateStock(item.product_id, newStock)
          }
        }
      }
    }
    
    return Response.json({ success: true, data: transaction }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}
