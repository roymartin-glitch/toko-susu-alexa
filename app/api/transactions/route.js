import { supabase } from '@/lib/supabase'
import { verifyCookieAuth, errorResponse } from '@/lib/api-auth'
import { validateForm, transactionSchema } from '@/lib/validators'

export async function GET() {
  try {
    const auth = await verifyCookieAuth()
    if (auth.error) return auth.error

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return Response.json({ success: true, data: data || [] })
  } catch (error) {
    console.error('GET /api/transactions error:', error)
    return errorResponse(error)
  }
}

export async function POST(request) {
  try {
    const auth = await verifyCookieAuth()
    if (auth.error) return auth.error

    const body = await request.json()

    const validation = await validateForm(transactionSchema, body)
    if (!validation.success) {
      console.error('Transaction validation failed:', validation.errors)
      return Response.json(
        { success: false, errors: validation.errors, error: 'Data transaksi tidak valid' },
        { status: 400 }
      )
    }

    const payload = validation.data

    if (payload.items?.length) {
      for (const item of payload.items) {
        if (!item.product_id || item.quantity <= 0) continue

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

        if (product.stock < item.quantity) {
          return Response.json(
            {
              success: false,
              error: `Stok tidak cukup untuk ${product.name}. Tersedia: ${product.stock}`,
            },
            { status: 400 }
          )
        }

        const newStock = product.stock - item.quantity
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
      }
    }

    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert([payload])
      .select()
      .single()

    if (transactionError) {
      console.error('Transaction insert error:', transactionError)
      return Response.json(
        { success: false, error: `Gagal membuat transaksi: ${transactionError.message}` },
        { status: 500 }
      )
    }

    return Response.json({ success: true, data: transaction }, { status: 201 })
  } catch (error) {
    console.error('POST /api/transactions error:', error)
    return errorResponse(error)
  }
}
