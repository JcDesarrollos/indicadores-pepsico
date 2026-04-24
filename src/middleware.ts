import { NextResponse, NextRequest } from 'next/server';

const COOKIE_NAME = process.env.NEXT_PUBLIC_COOKIE_NAME || 'renoa_pepsico_token';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Obtener el token de las cookies
  const token = request.cookies.get(COOKIE_NAME);

  // 2. Definir rutas públicas
  const isPublicRoute = pathname === '/login' || pathname.startsWith('/_next') || pathname.includes('.');

  // 3. Redirección lógica
  if (!token && !isPublicRoute) {
    // Si no hay token y no es ruta pública, al login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && pathname === '/login') {
    // Si hay token e intenta ir al login, al dashboard
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Configuración del middleware para que se ejecute en todas las rutas excepto static assets
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.jpeg|.*\\.png).*)'],
};
