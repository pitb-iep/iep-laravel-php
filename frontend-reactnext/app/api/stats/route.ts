import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.BACKEND_URL;

export async function GET() {
    try {
        const response = await fetch(`${API_BASE_URL}/stats/public`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store', // Don't cache stats, always fetch fresh
        });

        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch statistics',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
