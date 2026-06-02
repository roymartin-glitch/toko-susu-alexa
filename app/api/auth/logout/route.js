export async function POST(request) {
  try {
    // Clear auth token cookie
    const response = Response.json(
      { success: true, message: 'Logout berhasil' },
      { status: 200 }
    )

    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
