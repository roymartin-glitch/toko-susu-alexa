import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password', '/']
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route))

  // API routes that are public
  const publicApiRoutes = ['/api/auth/login', '/api/auth/logout']
  const isPublicApiRoute = publicApiRoutes.some((route) => pathname === route)

  // If public route, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For protected routes, check authentication
  const token = request.cookies.get('auth_token')?.value

  // If no token and not public route, redirect to login
  if (!token) {
    // Allow public API routes without token
    if (isPublicApiRoute || pathname.startsWith('/api/')) {
      return NextResponse.next()
    }

    // Redirect non-API requests to login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verify token
  const decoded = verifyToken(token)
  if (!decoded && !isPublicRoute) {
    // Token invalid or expired - redirect to login
    if (!pathname.startsWith('/api/')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
