import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET || JWT_SECRET === 'your-secret-key-change-in-production') {
  throw new Error('❌ JWT_SECRET must be set in .env.local with a strong value (min 32 chars)')
}

const TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

// ✅ SECURE: Admin users with bcrypt hashed passwords
// Password untuk admin@toksusu.com adalah: Admin123!
// ⚠️ GANTI PASSWORD INI SETELAH FIRST LOGIN!
const ADMIN_USERS = [
  {
    id: '1',
    email: 'admin@toksusu.com',
    // Password: Admin123! (hashed with bcrypt)
    password: '$2b$10$sZaw58Oq3wjJH0gcYKGhVeZoN06BjykNxz5Mv/pHAUvolll3sYXue',
    name: 'Administrator',
    role: 'admin'
  }
]

// JWT helper functions
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
  const header = { alg: 'HS256', typ: 'JWT' }
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
    if (!token || typeof token !== 'string') return null

    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [headerEncoded, claimsEncoded, signatureEncoded] = parts

    // Verify signature
    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${headerEncoded}.${claimsEncoded}`)
      .digest()
    const expectedSignature = base64url(signature)

    if (signatureEncoded !== expectedSignature) return null

    // Decode and verify claims
    const claimsStr = decodeBase64url(claimsEncoded)
    const claims = JSON.parse(claimsStr)

    // Check expiration
    const now = Math.floor(Date.now() / 1000)
    if (claims.exp && claims.exp < now) return null

    return claims
  } catch (error) {
    console.error('Token verification error:', error.message)
    return null
  }
}

/**
 * ✅ SECURE: Validate credentials with bcrypt
 * @param {string} email - User email
 * @param {string} password - User password (plaintext)
 * @returns {Object|null} User object (without password) or null if invalid
 */
export async function validateCredentials(email, password) {
  try {
    // Find user by email (case-insensitive)
    const user = ADMIN_USERS.find(u => u.email.toLowerCase() === email.toLowerCase())
    
    if (!user) {
      // Prevent timing attacks - still hash even if user not found
      await bcrypt.hash('dummy-password', 10)
      return null
    }

    // Verify password with bcrypt
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return null
    }

    // Return user without password field
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    console.error('Credential validation error:', error)
    return null
  }
}

/**
 * ✅ NEW: Hash password helper (untuk create user baru)
 * @param {string} password - Plaintext password
 * @returns {string} Bcrypt hash
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10)
}

/**
 * Extract user from token
 * @param {string} token - JWT token
 * @returns {Object|null} User object or null
 */
export function getUserFromToken(token) {
  const decoded = verifyToken(token)
  return decoded || null
}
