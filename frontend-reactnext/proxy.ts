import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
    // Only apply to /api routes
    if (request.nextUrl.pathname.startsWith('/api')) {
        const token = request.cookies.get('app_token')?.value;

        // Create headers/request clone
        const requestHeaders = new Headers(request.headers);

        // If token exists and no Authorization header is present, inject it
        if (token && !requestHeaders.has('Authorization')) {
            requestHeaders.set('Authorization', `Bearer ${token}`);
        }

        // Pass the modified headers to the rewrite destination
        return NextResponse.rewrite(new URL(request.url), {
            request: {
                headers: requestHeaders,
            },
        });
    }

    return NextResponse.next();
}

// Ensure middleware runs on matches
export const config = {
    matcher: '/api/:path*',
};
