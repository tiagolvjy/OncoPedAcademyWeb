import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const userCookie = request.cookies.get('user');

    if (!userCookie?.value)
        return NextResponse.redirect(new URL('/', request.url));

    try {
        const user = JSON.parse(userCookie.value);
        if (!user?.uid || !user?.role)
            return NextResponse.redirect(new URL('/', request.url));

        // Médico não pode acessar área de usuários
        if (user.role === 'doctor' && request.nextUrl.pathname.startsWith('/admin/usuarios'))
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));

    } catch {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};