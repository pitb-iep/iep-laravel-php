'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Info, Plus, Users, FileText, Star } from 'lucide-react';
import AddStudentModal from '../Students/AddStudentModal'; // Verify path

interface StatsTilesProps {
    studentCount: number;
    iepCount: number;
    goalCount: number | string;
    complianceRate: number;
    avgMastery?: number;
}

export default function StatsTiles({ studentCount, iepCount, goalCount, complianceRate, avgMastery }: StatsTilesProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    return (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 mb-10">

            {/* Students Tile */}
            <div
                id="tour-tile-students"
                onClick={() => router.push('/students')}
                className="card group relative overflow-hidden cursor-pointer hover:shadow-md transition-all border-0"
                style={{ backgroundColor: '#70a288' }}
            >
                <div className="absolute -top-3 -right-3 text-[5rem] opacity-10">👩‍🎓</div>
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-xs text-white/80 font-semibold uppercase tracking-wider">Total Students</div>
                        <div className="text-4xl font-bold text-white my-2">{studentCount}</div>
                    </div>
                    <div className="bg-white/20 text-white p-2 rounded-full backdrop-blur-sm shadow-sm">
                        <Users className="w-5 h-5" />
                    </div>
                </div>
                <div className="mt-auto pt-4 border-t border-white/20 flex justify-between items-center group-hover:border-white/40 transition-colors">
                    <span className="text-xs text-white/90 font-medium">View Roster</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsModalOpen(true);
                        }}
                        className="bg-[#1e4635] text-white rounded-full w-6 h-6 flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            {/* IEPs Tile */}
            <Link href="/dashboard/reports" id="tour-tile-ieps" className="card group relative overflow-hidden cursor-pointer border-0"
                style={{ backgroundColor: '#1f5469' }}
            >
                <div className="absolute -top-3 -right-3 text-[5rem] opacity-10">📄</div>
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-xs text-white/80 font-semibold uppercase tracking-wider">Active IEPs</div>
                        <div className="text-4xl font-bold text-white my-2">{iepCount}</div>
                    </div>
                    <div className="bg-white/20 text-white p-2 rounded-full backdrop-blur-sm shadow-sm">
                        <FileText className="w-5 h-5" />
                    </div>
                </div>
                <div className="mt-auto pt-4 border-t border-white/20">
                    <div className="text-xs text-white/90 font-medium">Next Review: {new Date().toLocaleDateString()}</div>
                </div>
            </Link>

            {/* Goals Tile */}
            {/* Mastery Tile */}
            <Link href="/dashboard/reports" id="tour-tile-mastery" className="card group relative overflow-hidden cursor-pointer border-0"
                style={{ backgroundColor: '#f6aa1c' }}
            >
                <div className="absolute -top-3 -right-3 text-[5rem] opacity-10">⭐</div>
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-xs text-white/80 font-semibold uppercase tracking-wider">Avg. Mastery</div>
                        <div className="text-4xl font-bold text-white my-2">{avgMastery}</div>
                    </div>
                    <div className="bg-white/20 text-white p-2 rounded-full backdrop-blur-sm shadow-sm">
                        <Star className="w-5 h-5" />
                    </div>
                </div>
                <div className="mt-auto pt-4 border-t border-white/20">
                    <div className="text-xs text-white/90 font-medium">
                        Level 1-5 Scale • All Students
                    </div>
                </div>
            </Link>

            {/* Compliance Tile */}
            <div
                id="tour-tile-compliance"
                className="card flex flex-col justify-center items-center text-center p-4 relative overflow-hidden border-0"
                style={{ background: 'linear-gradient(135deg, var(--color-dusty-olive-600), var(--color-dusty-olive-800))', color: 'white' }}
            >
                <div className="text-3xl font-bold mb-1">{complianceRate ?? 0}%</div>
                <div className="text-[var(--color-dusty-olive-100)] text-sm flex items-center justify-center gap-1 group relative cursor-help">
                    IEP Teacher Compliance
                    <Info size={14} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-full mb-2 bg-[var(--color-ebony-900)] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 w-max max-w-[300px] whitespace-normal">
                        Percentage of students with an active IEP
                    </div>
                </div>
            </div>

            {isModalOpen && <AddStudentModal onClose={() => setIsModalOpen(false)} />}
        </div>
    );
}
