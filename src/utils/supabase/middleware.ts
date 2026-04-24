import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Expose path+search to server components (used by the (app) consent gate
  // to build its own ?redirectTo= when bouncing to /login).
  request.headers.set('x-pathname', request.nextUrl.pathname + request.nextUrl.search)
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect unauthenticated users to login (except for public routes)
  const publicPaths = ['/login', '/auth/callback']
  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // Preserve where the user was trying to go so the login page can bounce
    // them back after sign-in. Path + query only — no host/scheme, to avoid
    // open-redirect risk if anyone ever injects absolute URLs.
    const original = request.nextUrl.pathname + request.nextUrl.search
    if (original && original !== '/' && !original.startsWith('/login')) {
      url.searchParams.set('redirectTo', original)
    }
    const redirect = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((c) =>
      redirect.cookies.set(c.name, c.value)
    )
    return redirect
  }

  // Note: do NOT redirect authenticated users off /login here — the login page
  // itself handles the "authenticated but hasn't completed consent" case and
  // will bounce the user home once consent is recorded. Redirecting here would
  // race with the (app) layout's consent gate and create a redirect loop.

  return supabaseResponse
}
