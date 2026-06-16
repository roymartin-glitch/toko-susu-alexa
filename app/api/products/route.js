import { productsApi } from '@/lib/supabase'
import { verifyAuth, errorResponse } from '@/lib/api-auth'
import { validateForm, productSchema } from '@/lib/validators' // ✅ ADD validation

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
    
    // ✅ SECURITY: Validate input
    const validation = await validateForm(productSchema, body)
    if (!validation.success) {
      return Response.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      )
    }
    
    const product = await productsApi.create(validation.data)
    return Response.json({ success: true, data: product }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}
