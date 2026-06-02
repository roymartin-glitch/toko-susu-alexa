import { transactionsApi, productsApi } from '@/lib/supabase'

export async function GET() {
  try {
    const transactions = await transactionsApi.getAll()
    return Response.json({ success: true, data: transactions })
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
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
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
