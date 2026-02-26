'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowLeft, BarChart3, FileText, Download, Calendar, Users, Target,
    TrendingUp, ClipboardCheck, AlertTriangle, Star, Activity, Clock, Filter
} from 'lucide-react';
import type { Student, Log } from '@/types';

interface ReportCard {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    category: 'progress' | 'compliance' | 'behavior' | 'export';
    available: boolean;
}

const REPORT_TYPES: ReportCard[] = [
    {
        id: 'student-progress',
        title: 'Student Progress Report',
        description: 'Mastery analytics, accuracy trends, and independence rate by student',
        icon: TrendingUp,
        color: 'from-emerald-500 to-emerald-600',
        category: 'progress',
        available: true
    },
    {
        id: 'daily-trials',
        title: 'Daily Trial Goals',
        description: 'Trials correct/total per goal, accuracy %, daily target tracking',
        icon: Target,
        color: 'from-indigo-500 to-indigo-600',
        category: 'progress',
        available: true
    },
    {
        id: 'master-rubric',
        title: 'Master Rubric Metrics',
        description: '1-5 rubric scores by domain, baseline vs current comparison',
        icon: Star,
        color: 'from-amber-500 to-amber-600',
        category: 'progress',
        available: true
    },
    {
        id: 'quarterly-summary',
        title: 'Quarterly Progress Summary',
        description: 'Per-goal progress vs benchmarks with quarterly breakdown',
        icon: Calendar,
        color: 'from-violet-500 to-violet-600',
        category: 'progress',
        available: true
    },
    {
        id: 'mastery-analytics',
        title: 'Mastery Analytics',
        description: 'Rubric level distribution and trends across all students',
        icon: BarChart3,
        color: 'from-cyan-500 to-cyan-600',
        category: 'progress',
        available: true
    },
    {
        id: 'iep-compliance',
        title: 'IEP Compliance Report',
        description: 'Percentage of students with active IEPs and review schedules',
        icon: ClipboardCheck,
        color: 'from-blue-500 to-blue-600',
        category: 'compliance',
        available: true
    },
    {
        id: 'service-delivery',
        title: 'Service Delivery Logs',
        description: 'Exportable therapy session logs with date and duration',
        icon: Clock,
        color: 'from-slate-500 to-slate-600',
        category: 'export',
        available: true
    },
    {
        id: 'teacher-activity',
        title: 'Teacher Activity Report',
        description: 'Logs per teacher, session frequency, and activity patterns',
        icon: Users,
        color: 'from-pink-500 to-pink-600',
        category: 'compliance',
        available: true
    },
    {
        id: 'behavior-tracking',
        title: 'Behavior Tracking Report',
        description: 'Behavior incidents, frequency data, and intervention tracking',
        icon: Activity,
        color: 'from-orange-500 to-orange-600',
        category: 'behavior',
        available: true
    },
    {
        id: 'critical-incident',
        title: 'Critical Incident Reports',
        description: 'Documentation of significant incidents requiring attention',
        icon: AlertTriangle,
        color: 'from-rose-500 to-rose-600',
        category: 'behavior',
        available: false
    },
    {
        id: 'assessment-summary',
        title: 'Assessment Summary',
        description: 'Assessment scores over time by type (VB-MAPP, ABLLS-R, etc.)',
        icon: FileText,
        color: 'from-teal-500 to-teal-600',
        category: 'progress',
        available: true
    },
    {
        id: 'goal-bank-usage',
        title: 'Goal Bank Usage',
        description: 'Most used goals, domain coverage, and selection patterns',
        icon: Target,
        color: 'from-lime-500 to-lime-600',
        category: 'compliance',
        available: true
    }
];

export default function ReportsPage() {
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [selectedReport, setSelectedReport] = useState<string | null>(null);

    // Fetch basic stats for the summary
    const { data: students = [] } = useQuery<Student[]>({
        queryKey: ['students'],
        queryFn: async () => {
            const res = await fetch('/api/students');
            const data = await res.json();
            return data.success ? data.data : [];
        }
    });

    const filteredReports = categoryFilter === 'all'
        ? REPORT_TYPES
        : REPORT_TYPES.filter(r => r.category === categoryFilter);

    const handleGenerateReport = (reportId: string) => {
        // TODO: Implement actual report generation
        setSelectedReport(reportId);
        setTimeout(() => setSelectedReport(null), 2000);
    };

    return (
        <div className="animate-fade-in max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="btn-secondary flex items-center gap-2">
                        <ArrowLeft size={16} /> Dashboard
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                            <BarChart3 className="w-8 h-8 text-indigo-500" />
                            Reports & Analytics
                        </h1>
                        <p className="text-slate-500 mt-1">Generate progress reports and export data</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <div className="text-sm text-slate-500">Total Students</div>
                    <div className="text-2xl font-bold text-slate-800">{students.length}</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <div className="text-sm text-slate-500">Active IEPs</div>
                    <div className="text-2xl font-bold text-slate-800">
                        {students.filter((s: Student) => s.ieps?.some((i) => i.status === 'Active')).length}
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <div className="text-sm text-slate-500">This Month Logs</div>
                    <div className="text-2xl font-bold text-slate-800">—</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <div className="text-sm text-slate-500">Compliance Rate</div>
                    <div className="text-2xl font-bold text-emerald-600">
                        {students.length > 0
                            ? Math.round((students.filter((s: Student) => s.ieps?.some((i) => i.status === 'Active')).length / students.length) * 100)
                            : 0}%
                    </div>
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 mb-6">
                <Filter size={16} className="text-slate-400" />
                <span className="text-sm text-slate-500 mr-2">Filter:</span>
                {['all', 'progress', 'compliance', 'behavior', 'export'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${categoryFilter === cat
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-slate-500 hover:bg-slate-100'
                            }`}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            {/* Report Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredReports.map(report => {
                    const Icon = report.icon;
                    const isGenerating = selectedReport === report.id;

                    return (
                        <div
                            key={report.id}
                            className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md ${!report.available ? 'opacity-60' : ''}`}
                        >
                            {/* Card Header with gradient */}
                            <div className={`p-4 bg-gradient-to-r ${report.color} text-white`}>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold">{report.title}</h3>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-4">
                                <p className="text-sm text-slate-600 mb-4">{report.description}</p>

                                <div className="flex items-center justify-between">
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${report.category === 'progress' ? 'bg-emerald-100 text-emerald-700' :
                                            report.category === 'compliance' ? 'bg-blue-100 text-blue-700' :
                                                report.category === 'behavior' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-slate-100 text-slate-700'
                                        }`}>
                                        {report.category}
                                    </span>

                                    <button
                                        onClick={() => report.available && handleGenerateReport(report.id)}
                                        disabled={!report.available || isGenerating}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${report.available
                                                ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                                                : 'text-slate-400 bg-slate-100 cursor-not-allowed'
                                            }`}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <div className="animate-spin w-3 h-3 border border-indigo-600 border-t-transparent rounded-full"></div>
                                                Generating...
                                            </>
                                        ) : report.available ? (
                                            <>
                                                <Download size={14} />
                                                Generate
                                            </>
                                        ) : (
                                            'Coming Soon'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Info Banner */}
            <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                    <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                    <h4 className="font-semibold text-indigo-900">Report Generation</h4>
                    <p className="text-sm text-indigo-700 mt-1">
                        Reports are generated based on logged data. Ensure progress logs are up-to-date for accurate reports.
                        Daily Trial and Master Rubric reports use the 1-5 rubric scale and trial data from activity logs.
                    </p>
                </div>
            </div>
        </div>
    );
}
