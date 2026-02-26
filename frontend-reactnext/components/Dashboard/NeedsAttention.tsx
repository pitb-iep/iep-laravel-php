'use client';

import React from 'react';
import { AlertCircle, Clock, TrendingDown } from 'lucide-react';
import Link from 'next/link';

interface AttentionItem {
    id: string;
    type: 'review_due' | 'stalled_goal' | 'assessment_needed';
    studentName: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
    link: string;
}

interface NeedsAttentionProps {
    items: AttentionItem[];
}

export default function NeedsAttention({ items }: NeedsAttentionProps) {
    if (!items || items.length === 0) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'review_due': return <Clock size={16} className="text-amber-500" />;
            case 'stalled_goal': return <TrendingDown size={16} className="text-red-500" />;
            default: return <AlertCircle size={16} className="text-blue-500" />;
        }
    };

    const getBgColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-50/50 border-red-100';
            case 'medium': return 'bg-amber-50/50 border-amber-100';
            default: return 'bg-blue-50/50 border-blue-100';
        }
    };

    return (
        <div className="card h-full">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4">
                <AlertCircle className="text-red-500" size={20} />
                Needs Attention
            </h3>
            <div className="flex flex-col gap-3">
                {items.map(item => (
                    <Link href={item.link} key={item.id}>
                        <div className={`p-3 rounded-xl border ${getBgColor(item.priority)} hover:shadow-md transition-all cursor-pointer group`}>
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">{getIcon(item.type)}</div>
                                <div>
                                    <div className="text-sm font-semibold text-[var(--color-ebony-900)] group-hover:text-[var(--color-dusty-olive-600)] transition-colors">
                                        {item.studentName}
                                    </div>
                                    <div className="text-xs text-[var(--color-ebony-600)] leading-snug">
                                        {item.message}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
