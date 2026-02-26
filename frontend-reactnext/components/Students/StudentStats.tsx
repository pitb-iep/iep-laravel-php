import React from 'react';
import { Users, FileCheck, AlertCircle, TrendingUp } from 'lucide-react';

interface StatsData {
    totalStudents: number;
    activeIEPs: number;
    complianceRate: number;
    needsAttention: any[];
}

export default function StudentStats({ stats }: { stats: StatsData }) {
    if (!stats) return null;

    return (
        <div id="tour-students-stats" className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="card p-4 flex items-center gap-4 bg-white border border-[var(--color-alabaster-grey-200)] shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[var(--color-dusty-olive-50)] text-[var(--color-dusty-olive-600)] flex items-center justify-center">
                    <Users size={20} />
                </div>
                <div>
                    <div className="text-sm text-[var(--color-ebony-500)] font-medium">Total Students</div>
                    <div className="text-2xl font-bold text-[var(--color-ebony-800)]">{stats.totalStudents}</div>
                </div>
            </div>

            <div className="card p-4 flex items-center gap-4 bg-white border border-[var(--color-alabaster-grey-200)] shadow-sm">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FileCheck size={20} />
                </div>
                <div>
                    <div className="text-sm text-[var(--color-ebony-500)] font-medium">Active IEPs</div>
                    <div className="text-2xl font-bold text-[var(--color-ebony-800)]">{stats.activeIEPs}</div>
                </div>
            </div>

            <div className="card p-4 flex items-center gap-4 bg-white border border-[var(--color-alabaster-grey-200)] shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[var(--color-dusty-olive-100)] text-[var(--color-dusty-olive-700)] flex items-center justify-center">
                    <TrendingUp size={20} />
                </div>
                <div>
                    <div className="text-sm text-[var(--color-ebony-500)] font-medium">Compliance Rate</div>
                    <div className="text-2xl font-bold text-[var(--color-ebony-800)]">{stats.complianceRate}%</div>
                </div>
            </div>

            <div className="card p-4 flex items-center gap-4 bg-white border border-[var(--color-alabaster-grey-200)] shadow-sm">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                    <AlertCircle size={20} />
                </div>
                <div>
                    <div className="text-sm text-[var(--color-ebony-500)] font-medium">Needs Review</div>
                    <div className="text-2xl font-bold text-[var(--color-ebony-800)]">{stats.needsAttention?.length || 0}</div>
                </div>
            </div>
        </div>
    );
}
