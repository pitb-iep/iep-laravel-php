'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const queryClient = useQueryClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // We use the Next.js API proxy
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (data.success) {
                // Set Cookie for SSR
                document.cookie = `app_token=${data.token}; path=/; max-age=86400`;
                // Also set local storage for compatibility if needed by legacy client code
                localStorage.setItem('app_token', data.token);

                await queryClient.invalidateQueries({ queryKey: ['me'] });

                router.push('/dashboard');
            } else {
                setError(data.error || 'Login Failed');
            }
        } catch (err) {
            setError('Connection failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--primary-hue),90%,96%)]">
            <div className="card max-w-md w-full p-8 bg-white/80 backdrop-blur-xl">
                <div className="text-center mb-8">
                    <div className="mb-4 flex justify-center">
                        <Image
                            src="/logo.png"
                            alt="Maryam Nawaz School and Resource Centre for Autism Logo"
                            width={120}
                            height={120}
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
                    <p className="text-slate-500">Sign in to AUTISM360</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg p-3 bg-white focus:border-[hsl(var(--primary-hue),70%,60%)] focus:ring-4 focus:ring-[hsl(var(--primary-hue),70%,60%)]/10 transition-all outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg p-3 bg-white focus:border-[hsl(var(--primary-hue),70%,60%)] focus:ring-4 focus:ring-[hsl(var(--primary-hue),70%,60%)]/10 transition-all outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full mt-4 flex justify-center"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                    Don't have an account? <Link href="/auth/register" className="text-[hsl(var(--primary-hue),70%,60%)] font-semibold hover:underline">Create Account</Link>
                </div>
            </div>
        </div>
    );
}
