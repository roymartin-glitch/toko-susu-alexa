import { productsApi } from '@/lib/supabase'

export async function GET(request, { params }) {
  try {
    const product = await productsApi.getById(params.id)
    return Response.json({ success: true, data: product })
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json()
    const product = await productsApi.update(params.id, body)
    return Response.json({ success: true, data: product })
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    await productsApi.delete(params.id)
    return Response.json({ success: true })
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
