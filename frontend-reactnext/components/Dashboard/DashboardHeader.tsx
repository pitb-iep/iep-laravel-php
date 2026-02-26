'use client';

import { useState } from 'react';
import { Plus, Sun, CloudSun, Moon, HelpCircle } from 'lucide-react';
import AddStudentModal from '@/components/Students/AddStudentModal';
import { useAuth } from '@/components/AuthProvider';
import { useTour } from '@/components/Tour/TourGuide';

export default function DashboardHeader() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useAuth();
    const { startTour } = useTour() || {};

    const hour = new Date().getHours();
    let greeting = 'Good Morning';
    let icon = <Sun className="w-6 h-6 text-amber-500 inline-block" />;

    if (hour >= 12 && hour < 17) {
        greeting = 'Good Afternoon';
        icon = <CloudSun className="w-6 h-6 text-amber-600 inline-block" />;
    } else if (hour >= 17) {
        greeting = 'Good Evening';
        icon = <Moon className="w-6 h-6 text-slate-600 inline-block" />;
    }

    return (
        <div className="flex justify-between items-end mb-10">
            <div>
                <h1 className="text-4xl font-bold text-[var(--color-ebony-900)] mb-2 tracking-tight">Dashboard</h1>
                <p className="text-[var(--color-ebony-500)] text-lg flex items-center gap-2 font-medium">
                    {greeting}, {user?.name || 'User'} {icon}
                </p>
            </div>
            <div className="flex flex-col items-end gap-3">
                <div className="text-right hidden sm:block">
                    <div className="text-2xl font-bold text-[var(--color-dusty-olive-700)]">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                    </div>
                    <div className="text-[var(--color-ebony-400)] font-medium">
                        {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        id="tour-guide-me-btn"
                        onClick={() => startTour?.()}
                        className="px-4 py-2 bg-[var(--color-dusty-olive-50)] text-[var(--color-dusty-olive-700)] font-medium rounded-full shadow-sm hover:bg-[var(--color-dusty-olive-100)] transition-all flex items-center gap-2"
                    >
                        <HelpCircle size={18} /> <span className="hidden sm:inline">Guide Me</span>
                    </button>
                    <button
                        id="tour-add-student-btn"
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all rounded-full px-5"
                    >
                        <Plus size={20} />
                        Add Student
                    </button>
                </div>

                {isModalOpen && <AddStudentModal onClose={() => setIsModalOpen(false)} />}
            </div>
        </div>
    );
}
