import { customersApi } from '@/lib/supabase'
import { verifyAuth, errorResponse } from '@/lib/api-auth'

export async function GET(request) {
  try {
    const { error } = verifyAuth(request)
    if (error) return error

    const customers = await customersApi.getAll()
    return Response.json({ success: true, data: customers })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request) {
  try {
    const { error } = verifyAuth(request)
    if (error) return error

    const body = await request.json()
    const customer = await customersApi.create(body)
    return Response.json({ success: true, data: customer }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}
