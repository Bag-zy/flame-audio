import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"
import { NextURL } from "next/dist/server/web/next-url"

// Public paths that don't require authentication
const publicPaths = [
  '/',
  '/_next',
  '/api/auth',
  '/favicon.ico',
  '/public',
  '/_vercel',
  '/site.webmanifest',
  '/sitemap.xml',
  '/robots.txt'
]

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log('Middleware - Request path:', pathname)
  
  // Check if authentication is disabled
  const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED !== 'false'
  
  // If authentication is disabled, allow all requests
  if (!authEnabled) {
    console.log('Middleware - Authentication is disabled, allowing access')
    return NextResponse.next()
  }
  
  // Skip middleware for public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    console.log('Middleware - Public path, skipping auth check:', pathname)
    return NextResponse.next()
  }
  
  // Special handling for playground - it should be protected
  if (pathname === '/playground') {
    console.log('Middleware - Playground route, checking auth...')
    // Continue to auth check below
  }
  
  // Skip API routes and auth routes
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next()
  }

  console.log('Middleware - Protected route, checking auth...')
  
  try {
    // Get the token from the request
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      // Ensure we get the latest token from the session
      raw: false,
      // Use secure cookies in production
      secureCookie: process.env.NODE_ENV === 'production',
      // Cookie options
      cookieName: process.env.NODE_ENV === 'production' ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
    })

    console.log('Middleware - Token check result:', {
      hasToken: !!token,
      tokenExp: token?.exp ? new Date((token.exp as number) * 1000) : 'No exp',
      now: new Date(),
      path: pathname,
      isExpired: token?.exp ? token.exp < Date.now() / 1000 : true
    })

    // If no token and trying to access protected route, redirect to home
    if (!token) {
      console.log('Middleware - No valid token, redirecting to home')
      const homeUrl = new URL('/', request.url)
      console.log('Middleware - Redirect URL:', homeUrl.toString())
      
      // Clear any invalid session cookies
      const response = NextResponse.redirect(homeUrl)
      response.cookies.delete('__Secure-next-auth.session-token')
      response.cookies.delete('next-auth.session-token')
      
      return response
    }

    console.log('Middleware - Valid token, allowing access to:', pathname)
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware - Error during authentication check:', error)
    // In case of error, redirect to login
    const signInUrl = new URL('/auth/login', request.url)
    signInUrl.searchParams.set('error', 'SessionError')
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }
}

// Configure which routes should be protected
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/ (auth pages)
     * - public/ (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/auth/|_vercel/).*)',
  ],
}
