import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Protege /admin: sin sesión → /admin/login; con sesión en login → /admin.
 * También refresca el token de Supabase en cada petición del panel.
 */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const esLogin = request.nextUrl.pathname === "/admin/login";

  // Sin credenciales configuradas, el login explica qué falta.
  if (!url || !anonKey) {
    return esLogin
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/admin/login", request.url));
  }

  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesAEstablecer) {
        cookiesAEstablecer.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        respuesta = NextResponse.next({ request });
        cookiesAEstablecer.forEach(({ name, value, options }) =>
          respuesta.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !esLogin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (user && esLogin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return respuesta;
}

export const config = {
  matcher: ["/admin/:path*"],
};
