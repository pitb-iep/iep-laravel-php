'use client';

import { HelpCircle } from 'lucide-react';
import { useTour } from '@/components/Tour/TourGuide';

export default function GuideMeButton({ className }: { className?: string }) {
    const tour = useTour();

    if (!tour) return null;

    return (
        <button
            onClick={() => tour.startTour()}
            className={`px-4 py-2 bg-[var(--color-dusty-olive-50)] text-[var(--color-dusty-olive-700)] font-medium rounded-full shadow-sm hover:bg-[var(--color-dusty-olive-100)] transition-all flex items-center gap-2 ${className}`}
        >
            <HelpCircle size={18} /> <span className="hidden sm:inline">Guide Me</span>
        </button>
    );
}
