import { productsApi } from '@/lib/supabase'
import { verifyAuth, errorResponse } from '@/lib/api-auth'

export async function GET(request, { params }) {
  try {
    const { error } = verifyAuth(request)
    if (error) return error

    const product = await productsApi.getById(params.id)
    return Response.json({ success: true, data: product })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function PUT(request, { params }) {
  try {
    const { error } = verifyAuth(request)
    if (error) return error

    const body = await request.json()
    const product = await productsApi.update(params.id, body)
    return Response.json({ success: true, data: product })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function DELETE(request, { params }) {
  try {
    const { error } = verifyAuth(request)
    if (error) return error

    await productsApi.delete(params.id)
    return Response.json({ success: true })
  } catch (error) {
    return errorResponse(error)
  }
}
