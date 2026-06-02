import { productsApi } from '@/lib/supabase'

export async function GET() {
  try {
    const products = await productsApi.getAll()
    return Response.json({ success: true, data: products })
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
    const product = await productsApi.create(body)
    return Response.json({ success: true, data: product }, { status: 201 })
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
