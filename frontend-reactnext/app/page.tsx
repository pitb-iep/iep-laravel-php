'use client';

import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import Hero from '@/components/LandingPage/Hero';
import Features from '@/components/LandingPage/Features';
import Stats from '@/components/LandingPage/Stats';
import CTA from '@/components/LandingPage/CTA';
import Footer from '@/components/LandingPage/Footer';

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      {/* Header for logged-in users */}
      {user && (
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-dusty-olive-200 shadow-sm">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="AUTISM360" className="h-10 w-10 object-contain" />
              <span className="font-bold text-lg text-dusty-olive-700">AUTISM360</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-ebony-600">Welcome back, <strong>{user.name}</strong></span>
              <Link
                href="/dashboard"
                className="bg-dusty-olive-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-dusty-olive-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}

      <main className="min-h-screen bg-white">
        <Hero />
        <Features />
        <Stats />
        <CTA />
        <Footer />
      </main>
    </>
  );
}
