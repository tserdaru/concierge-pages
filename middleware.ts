// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let res = NextResponse.next()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase env vars missing. Skipping auth middleware.')
    return res
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: Parameters<NextResponse['cookies']['set']>[2]) {
        // cookie se postavlja na RESPONSE (ne na request)
        res.cookies.set(name, value, options)
      },
      remove(name: string, options: Parameters<NextResponse['cookies']['set']>[2]) {
        res.cookies.set(name, '', { ...options, maxAge: 0 })
      },
    },
  })

  try {
    // refresha sesiju za Server Components
    await supabase.auth.getUser()

    // zaštiti dashboard rute (npr. /dashboard i podstranice)
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
      }
    }
  } catch (e) {
    console.error('Middleware auth error:', e)
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
