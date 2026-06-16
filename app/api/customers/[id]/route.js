import { customersApi } from '@/lib/supabase'
import { verifyAuth, errorResponse } from '@/lib/api-auth'
import { validateForm, customerSchema } from '@/lib/validators' // ✅ ADD validation

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
    
    // ✅ SECURITY: Validate input
    const validation = await validateForm(customerSchema, body)
    if (!validation.success) {
      return Response.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      )
    }
    
    const customer = await customersApi.update(params.id, validation.data)
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
