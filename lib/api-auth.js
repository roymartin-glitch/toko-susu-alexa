import { cookies } from 'next/headers'
import { getUserFromToken } from '@/lib/auth-secure' // ✅ CHANGED to secure auth

/**
 * Extract and verify token from request
 * @param {Request} request - Next.js request object
 * @returns {Object} { user, token } or error response
 */
export async function extractToken(request) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return {
      error: Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      ),
    }
  }

  const user = await getUserFromToken(token)
  if (!user) {
    return {
      error: Response.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      ),
    }
  }

  return { user, token }
}

/**
 * Wrapper for protected API routes
 * Usage: const { user } = verifyAuth(request)
 */
export async function verifyAuth(request) {
  return extractToken(request)
}

/**
 * Verify JWT from HttpOnly auth_token cookie (used by login flow)
 */
export async function verifyCookieAuth() {
  const token = cookies().get('auth_token')?.value

  if (!token) {
    return {
      error: Response.json(
        { success: false, error: 'Unauthorized', message: 'Silakan login ulang' },
        { status: 401 }
      ),
    }
  }

  const user = await getUserFromToken(token)
  if (!user) {
    return {
      error: Response.json(
        { success: false, error: 'Unauthorized', message: 'Sesi login habis, silakan login ulang' },
        { status: 401 }
      ),
    }
  }

  return { user }
}

/**
 * Generic error response handler
 */
export function errorResponse(error, statusCode = 500) {
  console.error('API error:', error)
  
  // Don't expose error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error'
    : error.message

  return Response.json(
    { success: false, error: message },
    { status: statusCode }
  )
}
