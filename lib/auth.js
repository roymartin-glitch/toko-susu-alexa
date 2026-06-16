const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

const ADMIN_USERS = [
  {
    id: '1',
    email: 'admin@toksusu.com',
    passwordPlain: 'Admin123!',
    name: 'Administrator',
    role: 'admin'
  }
]

function base64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function encodeBase64url(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function decodeBase64url(str) {
  let padded = str + '=='.substring(0, (4 - (str.length % 4)) % 4)
  return decodeURIComponent(escape(atob(padded.replace(/-/g, '+').replace(/_/g, '/'))))
}

async function getKey() {
  const enc = new TextEncoder()
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

async function sign(data) {
  const key = await getKey()
  const enc = new TextEncoder()
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  return base64url(signature)
}

async function verifySignature(data, signature) {
  const key = await getKey()
  const enc = new TextEncoder()
  let padded = signature + '=='.substring(0, (4 - (signature.length % 4)) % 4)
  const sigBuf = Uint8Array.from(atob(padded.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
  return await crypto.subtle.verify('HMAC', key, sigBuf, enc.encode(data))
}

export async function generateToken(payload) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const claims = {
    ...payload,
    iat: now,
    exp: now + Math.floor(TOKEN_EXPIRY / 1000),
  }

  const headerEncoded = encodeBase64url(JSON.stringify(header))
  const claimsEncoded = encodeBase64url(JSON.stringify(claims))
  const signatureEncoded = await sign(`${headerEncoded}.${claimsEncoded}`)

  return `${headerEncoded}.${claimsEncoded}.${signatureEncoded}`
}

export async function verifyToken(token) {
  try {
    if (!token || typeof token !== 'string') return null

    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [headerEncoded, claimsEncoded, signatureEncoded] = parts

    const valid = await verifySignature(`${headerEncoded}.${claimsEncoded}`, signatureEncoded)
    if (!valid) return null

    const claims = JSON.parse(decodeBase64url(claimsEncoded))
    const now = Math.floor(Date.now() / 1000)
    if (claims.exp && claims.exp < now) return null

    return claims
  } catch (error) {
    console.error('Token verification error:', error.message)
    return null
  }
}

export async function getUserFromToken(token) {
  const decoded = await verifyToken(token)
  if (!decoded) return null
  return {
    id: decoded.id,
    email: decoded.email,
    name: decoded.name,
  }
}

export async function validateCredentials(email, password) {
  try {
    const user = ADMIN_USERS.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!user) return null

    if (password !== user.passwordPlain) return null

    const { passwordPlain: _, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    console.error('Credential validation error:', error)
    return null
  }
}

export async function hashPassword(password) {
  return password
}