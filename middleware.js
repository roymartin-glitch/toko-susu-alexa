import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth-secure'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  const publicRoutes = ['/login', '/register', '/forgot-password', '/']
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route))

  const publicApiRoutes = ['/api/auth/login', '/api/auth/logout']
  const isPublicApiRoute = publicApiRoutes.some((route) => pathname === route)

  if (isPublicRoute) {
    return NextResponse.next()
  }

  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    if (isPublicApiRoute || pathname.startsWith('/api/')) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const decoded = await verifyToken(token)
  if (!decoded && !isPublicRoute) {
    if (!pathname.startsWith('/api/')) {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.set('auth_token', '', { path: '/', maxAge: 0 })
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
