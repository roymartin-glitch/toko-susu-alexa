import { productsApi } from '@/lib/supabase'
import { verifyAuth, errorResponse } from '@/lib/api-auth'

export async function GET(request) {
  try {
    const { error } = verifyAuth(request)
    if (error) return error

    const products = await productsApi.getAll()
    return Response.json({ success: true, data: products })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request) {
  try {
    const { error } = verifyAuth(request)
    if (error) return error

    const body = await request.json()
    const product = await productsApi.create(body)
    return Response.json({ success: true, data: product }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}
