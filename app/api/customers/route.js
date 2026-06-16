import { customersApi } from '@/lib/supabase'
import { verifyAuth, errorResponse } from '@/lib/api-auth'
import { validateForm, customerSchema } from '@/lib/validators' // ✅ ADD validation

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
    
    // ✅ SECURITY: Validate input
    const validation = await validateForm(customerSchema, body)
    if (!validation.success) {
      return Response.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      )
    }
    
    const customer = await customersApi.create(validation.data)
    return Response.json({ success: true, data: customer }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}
