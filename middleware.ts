// /middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // This refreshes the user's session and ensures the cookie is updated
  // if the session has expired or is invalid.
  await supabase.auth.getSession();

  return res;
}

// Specify the paths where the middleware should run.
// You might want to adjust this based on your needs.
// This example applies it to all paths except static files and the Supabase auth callback.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Any paths related to Supabase auth callbacks if you have them configured
     * - Your API routes that don't require auth (if any)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
    // Add specific API routes if needed, e.g., '/api/admin/:path*'
    '/api/admin/:path*', // Ensure middleware runs on admin API routes
  ],
};
