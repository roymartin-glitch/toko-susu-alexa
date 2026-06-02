import { getUserFromToken } from './auth'

/**
 * Extract and verify token from request
 * @param {Request} request - Next.js request object
 * @returns {Object} { user, token } or error response
 */
export function extractToken(request) {
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

  const user = getUserFromToken(token)
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
export function verifyAuth(request) {
  return extractToken(request)
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
