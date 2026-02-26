'use client';

import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    GraduationCap,
    Target,
    FileText,
    ClipboardList,
    BookOpen,
    ClipboardCheck,
    AlertTriangle,
    Settings,
    LogOut
} from 'lucide-react';

export function SidebarContent({ onClose }: { onClose?: () => void }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { href: '/students', label: 'Students', icon: <GraduationCap size={20} />, id: 'tour-students-nav' },
        { href: '/goals', label: 'Goal Bank', icon: <Target size={20} /> },
        { href: '/dashboard/reports', label: 'Reports', icon: <FileText size={20} /> },
        { href: '/activity-log', label: 'Activity Log', icon: <ClipboardList size={20} /> },
        { href: '/iep-builder', label: 'IEP Builder', icon: <BookOpen size={20} /> },
        { href: '/assessments', label: 'Assessments', icon: <ClipboardCheck size={20} /> },
        { href: '/incidents', label: 'Incidents', icon: <AlertTriangle size={20} />, id: 'tour-incidents-nav' },
        { href: '/settings', label: 'Settings', icon: <Settings size={20} /> },
    ];

    return (
        <>
            <Link href="/dashboard" className="flex flex-col items-center gap-4 font-bold text-2xl text-[hsl(var(--primary-hue),70%,60%)] mb-10 px-2 tracking-tighter text-center hover:opacity-80 transition-opacity cursor-pointer">
                <div className="relative w-44 h-44 filter drop-shadow-md">
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <span>AUTISM360</span>
            </Link>

            <nav className="flex flex-col gap-2 flex-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            id={item.id}
                            onClick={onClose}
                            className={`flex items-center gap-2 p-2 text-sm font-medium rounded-xl transition-all hover:translate-x-1 ${isActive
                                ? 'bg-[var(--color-dusty-olive-100)] text-[var(--color-dusty-olive-700)] shadow-sm border border-[var(--color-dusty-olive-200)]'
                                : 'text-[var(--color-ebony-500)] hover:bg-[var(--color-dusty-olive-100)] hover:text-[var(--color-dusty-olive-800)]'
                                }`}
                        >
                            {item.icon} {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto">
                <div className="flex items-center gap-4 p-4 bg-[var(--color-alabaster-grey-100)] rounded-xl border border-[var(--color-dusty-olive-200)] mb-4 shadow-sm">
                    <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-dusty-olive-400)] to-[var(--color-dusty-olive-600)] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md overflow-hidden">
                        {user?.avatar ? (
                            <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            user?.name?.charAt(0) || 'U'
                        )}
                    </div>
                    <div>
                        <div className="text-md font-bold text-[var(--color-ebony-900)]">{user?.name || 'User'}</div>
                        <div className="text-sm text-[var(--color-ebony-500)]">{user?.role || 'Staff'}</div>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 p-2 text-md text-[var(--color-rosy-taupe-600)] font-medium rounded-xl transition-all hover:bg-[var(--color-rosy-taupe-50)] hover:text-[var(--color-rosy-taupe-700)] hover:translate-x-1"
                >
                    <LogOut size={20} /> Logout
                </button>
            </div>
        </>
    );
}

export default function Sidebar() {
    return (
        <aside className="fixed left-0 top-0 h-full w-[280px] bg-white/85 backdrop-blur-md border-r border-white/50 flex flex-col p-6 z-10">
            <SidebarContent />
        </aside>
    );
}
