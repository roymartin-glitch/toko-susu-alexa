import { customersApi } from '@/lib/supabase'
import { verifyAuth, errorResponse } from '@/lib/api-auth'

export async function GET(request, { params }) {
  try {
    const { error } = verifyAuth(request)
    if (error) return error

    const customer = await customersApi.getById(params.id)
    return Response.json({ success: true, data: customer })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function PUT(request, { params }) {
  try {
    const { error } = verifyAuth(request)
    if (error) return error

    const body = await request.json()
    const customer = await customersApi.update(params.id, body)
    return Response.json({ success: true, data: customer })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function DELETE(request, { params }) {
  try {
    const { error } = verifyAuth(request)
    if (error) return error

    await customersApi.delete(params.id)
    return Response.json({ success: true })
  } catch (error) {
    return errorResponse(error)
  }
}
