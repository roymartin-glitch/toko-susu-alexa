import { customersApi } from '@/lib/supabase'

export async function GET() {
  try {
    const customers = await customersApi.getAll()
    return Response.json({ success: true, data: customers })
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
    const customer = await customersApi.create(body)
    return Response.json({ success: true, data: customer }, { status: 201 })
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
