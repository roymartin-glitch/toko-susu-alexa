import { validateCredentials, generateToken } from '@/lib/auth-secure' // ✅ CHANGED to secure auth
import { NextResponse } from 'next/server'

// ✅ SECURITY: Simple rate limiting (in-memory)
const loginAttempts = new Map()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function checkRateLimit(ip) {
  const now = Date.now()
  const attempts = loginAttempts.get(ip) || []
  
  // Clean old attempts
  const recentAttempts = attempts.filter(time => now - time < WINDOW_MS)
  
  if (recentAttempts.length >= MAX_ATTEMPTS) {
    return false // Rate limited
  }
  
  recentAttempts.push(now)
  loginAttempts.set(ip, recentAttempts)
  return true
}

export async function POST(request) {
  try {
    // ✅ SECURITY: Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
               
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email, password } = body

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email dan password harus diisi' },
        { status: 400 }
      )
    }

    // ✅ SECURE: Validate credentials with bcrypt
    const user = await validateCredentials(email, password)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = await generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    // Create response with token in HttpOnly cookie
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 200 }
    )

    // ✅ SECURE: Set HttpOnly cookie for token
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    // ✅ SECURE: Don't expose error details to client
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
