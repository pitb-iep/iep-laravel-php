'use client';

import React from 'react';
import { CheckCircle2, Clock, AlertCircle, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Log {
    id: string;
    studentId: string;
    goalId: string;
    result: string; // 'Achieved' | 'Emerging' | 'Not Yet'
    activity?: string;
    timestamp: string;
    studentName?: string;
    goalTitle?: string;
    performanceStatus?: string; // Handling backend variance
    goal?: { title: string }; // Nested goal object from backend
    rubricLevel?: number;
}

interface Student {
    id: string;
    name: string;
    logs?: Log[];
}

interface ActivityTableProps {
    students: Student[];
}

export default function ActivityTable({ students }: ActivityTableProps) {
    // Flatten and sort logs
    const logs = students
        .flatMap(student => (student.logs || []).map(log => ({
            ...log,
            studentName: student.name,
            goalTitle: log.goal?.title || log.goalTitle || 'Goal Update'
        })))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (!logs || logs.length === 0) {
        return (
            <div className="text-center p-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                <div className="inline-flex p-4 rounded-full bg-slate-50 mb-4">
                    <Calendar className="w-8 h-8 text-slate-300" />
                </div>
                <p>No activity recorded yet.</p>
                <div className="mt-4">
                    <Link href="/activity-log" className="text-sm font-semibold text-[hsl(var(--primary-hue),70%,60%)] hover:underline">
                        Record First Entry
                    </Link>
                </div>
            </div>
        );
    }

    // Helper to get Status or Rubric Badge
    const getResultDisplay = (log: any) => {
        // 1. Prefer Rubric Level (1-5)
        if (log.rubricLevel) {
            return (
                <div className="flex items-center gap-1" title={`Rubric Level ${log.rubricLevel} / 5`}>
                    {[1, 2, 3, 4, 5].map((level) => (
                        <span key={level} className={`text-sm ${level <= log.rubricLevel ? 'text-amber-400' : 'text-slate-200'}`}>
                            ★
                        </span>
                    ))}
                    <span className="text-xs text-slate-400 font-medium ml-1">L{log.rubricLevel}</span>
                </div>
            );
        }

        // 2. Fallback to Legacy Status
        const s = log.performanceStatus === 'Achieved' || log.result === 'Achieved' ? 'Achieved'
            : (log.performanceStatus === 'Emerging' || log.result === 'Emerging' ? 'Emerging' : 'Not Yet');

        if (s === 'Achieved') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Achieved
                </span>
            );
        }
        if (s === 'Emerging') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                    <Clock className="w-3.5 h-3.5" />
                    Emerging
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
                <AlertCircle className="w-3.5 h-3.5" />
                Not Yet
            </span>
        );
    };

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto relative">
                <table className="w-full text-sm text-left">
                    <thead className="bg-[var(--color-alabaster-grey-50)] border-b border-[var(--color-alabaster-grey-200)] text-[var(--color-ebony-500)] font-semibold uppercase tracking-wider text-xs sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-6 py-4 bg-[var(--color-alabaster-grey-50)]">Student</th>
                            <th className="px-6 py-4 bg-[var(--color-alabaster-grey-50)]">Goal & Activity</th>
                            <th className="px-6 py-4 w-40 bg-[var(--color-alabaster-grey-50)]">Outcome</th>
                            <th className="px-6 py-4 w-40 text-right bg-[var(--color-alabaster-grey-50)]">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-alabaster-grey-100)]">
                        {logs.slice(0, 10).map((log, idx) => { // Limit to 10 for dashboard overview
                            const date = new Date(log.timestamp);
                            const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                            const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

                            // Handle backend variance on result key
                            const actualResult = log.performanceStatus || log.result;

                            return (
                                <tr key={idx} className="hover:bg-[var(--color-alabaster-grey-50)]/80 transition-colors">
                                    <td className="px-6 py-4 font-medium text-[var(--color-ebony-900)]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[var(--color-dusty-olive-50)] text-[var(--color-dusty-olive-700)] flex items-center justify-center font-bold text-xs">
                                                {log.studentName?.charAt(0) || 'S'}
                                            </div>
                                            {log.studentName || 'Unknown'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-[var(--color-ebony-800)] mb-0.5">{log.goalTitle || 'Goal Update'}</div>
                                        {log.activity && (
                                            <div className="text-[var(--color-ebony-500)] text-xs italic line-clamp-1 max-w-xs" title={log.activity}>
                                                Strategy: {log.activity}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getResultDisplay(log)}
                                    </td>
                                    <td className="px-6 py-4 text-right text-[var(--color-ebony-500)] tabular-nums">
                                        <div className="text-xs font-medium">{dateStr}</div>
                                        <div className="text-[0.65rem] opacity-70">{timeStr}</div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {logs.length > 10 && (
                <div className="bg-slate-50 p-3 text-center text-xs text-slate-500 border-t border-slate-200">
                    Showing recent 10 entries
                </div>
            )}
        </div>
    );
}
