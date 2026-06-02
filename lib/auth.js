import crypto from 'crypto'

// Hard requirement: JWT_SECRET must be set in environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Simple JWT implementation for session management
 * IMPORTANT: In production, use a proper JWT library and strong secret
 */

function base64url(buf) {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function encodeBase64url(str) {
  return base64url(Buffer.from(str))
}

function decodeBase64url(str) {
  let padded = str + '=='.substring(0, (4 - (str.length % 4)) % 4)
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
}

/**
 * Generate JWT token
 * @param {Object} payload - User data to encode
 * @returns {string} JWT token
 */
export function generateToken(payload) {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  }

  const now = Math.floor(Date.now() / 1000)
  const claims = {
    ...payload,
    iat: now,
    exp: now + Math.floor(TOKEN_EXPIRY / 1000),
  }

  const headerEncoded = encodeBase64url(JSON.stringify(header))
  const claimsEncoded = encodeBase64url(JSON.stringify(claims))
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${headerEncoded}.${claimsEncoded}`)
    .digest()
  const signatureEncoded = base64url(signature)

  return `${headerEncoded}.${claimsEncoded}.${signatureEncoded}`
}

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded payload or null if invalid
 */
export function verifyToken(token) {
  try {
    if (!token || typeof token !== 'string') {
      return null
    }

    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const [headerEncoded, claimsEncoded, signatureEncoded] = parts

    // Verify signature
    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${headerEncoded}.${claimsEncoded}`)
      .digest()
    const expectedSignature = base64url(signature)

    if (signatureEncoded !== expectedSignature) {
      return null
    }

    // Decode and verify claims
    const claimsStr = decodeBase64url(claimsEncoded)
    const claims = JSON.parse(claimsStr)

    // Check expiration
    const now = Math.floor(Date.now() / 1000)
    if (claims.exp && claims.exp < now) {
      return null
    }

    return claims
  } catch (error) {
    console.error('Token verification error:', error.message)
    return null
  }
}

/**
 * Extract user from token
 * @param {string} token - JWT token
 * @returns {Object|null} User object or null
 */
export function getUserFromToken(token) {
  const decoded = verifyToken(token)
  if (!decoded) {
    return null
  }

  return {
    id: decoded.id,
    email: decoded.email,
    name: decoded.name,
  }
}

/**
 * Validate login credentials
 * Currently supports hardcoded admin, but should be updated to check database
 * @param {string} email - Email address
 * @param {string} password - Password
 * @returns {Object|null} User data if valid, null otherwise
 */
export async function validateCredentials(email, password) {
  // TODO: Replace with proper user lookup and password hashing (bcrypt)
  // For now, simple in-memory validation
  // In production, use: await supabase.auth.signInWithPassword() or proper db lookup

  // Hardcoded admin for demo purposes
  // In production, fetch from database with proper password hashing
  if (email === 'admin@toko.com' && password === process.env.ADMIN_PASSWORD || password === 'admin123') {
    return {
      id: 'admin-001',
      email: 'admin@toko.com',
      name: 'Admin Toko',
      role: 'admin',
    }
  }

  return null
}
