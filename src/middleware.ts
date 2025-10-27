import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

// 1. Specify protected and public routes
const protectedRoutes = ['/dashboard'];
const publicRoutes = ['/login', '/signup', '/'];

export default async function proxy(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  const cookieStore = await cookies();
  const access = cookieStore.get('access_token')?.value;

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('Cookie', cookieStore.toString());
  requestHeaders.set('Authorization', `Bearer ${access}`);
  requestHeaders.set('credentials', 'include');

  // 3. Decrypt the session from the cookie
  // 4. Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !access) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // 5. Redirect to /dashboard if the user is authenticated
  if (
    isPublicRoute &&
    access &&
    !req.nextUrl.pathname.startsWith('/dashboard')
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

// Routes Proxy should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
