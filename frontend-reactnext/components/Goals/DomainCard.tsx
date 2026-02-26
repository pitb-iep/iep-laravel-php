import Link from 'next/link';
import React from 'react';

interface DomainProps {
    id: string;
    code?: string;
    title: string;
    icon: string;
    description?: string;
    subSkillsCount: number;
    goalsCount: number;
    order?: number;
}

export default function DomainCard({ id, code, title, icon, description, subSkillsCount, goalsCount }: DomainProps) {
    return (
        <Link
            href={`/goals/domain/${id}`}
            className="card group hover:border-[hsl(var(--primary-hue),70%,60%)] relative flex flex-col py-8 px-6 transition-all cursor-pointer overflow-hidden"
        >
            {/* Domain code badge */}
            {code && (
                <span className="absolute top-3 right-3 font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {code}
                </span>
            )}

            {/* Icon */}
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>

            {/* Title */}
            <div className="font-bold text-base text-slate-800 mb-1 leading-snug">
                {title}
            </div>

            {/* Description snippet */}
            {description && (
                <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                    {description}
                </p>
            )}

            {/* Stats */}
            <div className="mt-auto flex items-center gap-3 text-xs text-slate-500">
                <span className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5">
                    {subSkillsCount} sub-skills
                </span>
                <span className="bg-indigo-50 border border-indigo-100 text-indigo-600 font-semibold rounded px-2 py-0.5">
                    {goalsCount} goals
                </span>
            </div>

            {/* Hover accent bar */}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-[hsl(var(--primary-hue),70%,60%)] scale-x-0 group-hover:scale-x-100 transition-transform" />
        </Link>
    );
}
