import { customersApi } from '@/lib/supabase'

export async function GET(request, { params }) {
  try {
    const customer = await customersApi.getById(params.id)
    return Response.json({ success: true, data: customer })
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
    const customer = await customersApi.update(params.id, body)
    return Response.json({ success: true, data: customer })
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    await customersApi.delete(params.id)
    return Response.json({ success: true })
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
