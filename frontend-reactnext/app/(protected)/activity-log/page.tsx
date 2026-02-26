'use client';

import React, { useState, useEffect } from 'react';
import ActivityLogGrid from '@/components/ActivityLog/ActivityLogGrid';
import { Activity, ChevronRight } from 'lucide-react';

export default function DataEntryPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [goals, setGoals] = useState<any[]>([]);

    // Load students on mount
    useEffect(() => {
        fetch('/api/students')
            .then(res => res.json())
            .then(data => {
                if (data.success) setStudents(data.data);
            });
    }, []);

    // Load active goal for selected student
    useEffect(() => {
        if (!selectedStudentId) {
            setGoals([]);
            return;
        }

        const fetchStudentIEP = async () => {
            try {
                const res = await fetch(`/api/students/${selectedStudentId}/ieps`);
                const json = await res.json();
                if (json.success && json.data) {
                    const active = json.data.find((i: any) => i.status === 'Active');
                    if (active) {
                        setGoals(active.goals || []);
                    } else {
                        setGoals([]);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch IEP assignments", err);
                setGoals([]);
            }
        };

        fetchStudentIEP();
    }, [selectedStudentId]);

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-end mb-8 bg-white p-6 rounded-3xl shadow-sm border border-[var(--color-alabaster-grey-200)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-dusty-olive-50)]/50 to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2 text-[var(--color-ebony-900)] flex items-center gap-3">
                        <span className="w-10 h-10 bg-[var(--color-dusty-olive-600)] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[var(--color-dusty-olive-200)]">
                            <Activity size={24} />
                        </span>
                        Daily Activity Log
                    </h1>
                    <p className="text-[var(--color-ebony-500)] font-medium ml-14">Record progress, qualitative notes, and strategies for IEP goals.</p>
                </div>

                <div className="w-72 relative z-10">
                    <label className="block text-[10px] font-bold uppercase text-[var(--color-ebony-400)] tracking-wider mb-2">Select Student</label>
                    <div className="relative">
                        <select
                            className="w-full p-3 pl-4 pr-10 border border-[var(--color-alabaster-grey-300)] rounded-xl bg-[var(--color-alabaster-grey-50)] shadow-sm focus:bg-white focus:border-[var(--color-dusty-olive-500)] focus:ring-4 focus:ring-[var(--color-dusty-olive-100)] outline-none appearance-none font-semibold text-[var(--color-ebony-800)] transition-all cursor-pointer hover:border-[var(--color-dusty-olive-300)]"
                            value={selectedStudentId}
                            onChange={e => setSelectedStudentId(e.target.value)}
                        >
                            <option value="">-- Choose Student --</option>
                            {students.map(s => (
                                <option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>
                            ))}
                        </select>
                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ebony-400)] rotate-90" size={16} />
                    </div>
                </div>
            </div>

            {selectedStudentId ? (
                <div className="card bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
                    <ActivityLogGrid studentId={selectedStudentId} goals={goals} />
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <div className="text-4xl mb-4 opacity-50">👩‍🎓</div>
                    <p className="text-slate-500 font-medium">Please select a student to begin logging data.</p>
                </div>
            )}
        </div>
    );
}
