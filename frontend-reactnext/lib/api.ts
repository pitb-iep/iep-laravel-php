import { cookies } from 'next/headers';

const API_BASE_URL = process.env.BACKEND_URL;
export async function fetchFromAPI(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    // Get token from cookies if available (Server Component usage)
    let token = '';
    try {
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get('app_token');
        if (tokenCookie) token = tokenCookie.value;
    } catch (e) {
        // Ignored: Likely running on client or outside request context
    }

    const headers: any = { ...options.headers };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const res = await fetch(url, {
            ...options,
            headers,
            // cache: 'no-store', // Removed to allow Next.js defaults (or ISR via options)
        });
        if (!res.ok) {
            console.error(`API Error ${res.status}: ${url}`);
            return null;
        }
        const json = await res.json();
        return json.success ? json.data : null;
    } catch (error) {
        console.error(`Fetch Error: ${url}`, error);
        return null;
    }
}
