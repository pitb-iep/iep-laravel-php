'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, BookOpen, Target, Layers } from 'lucide-react';
import DomainCard from '@/components/Goals/DomainCard';
import type { Domain, SubSkill } from '@/types';

export default function GoalBankPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: domains = [], isLoading } = useQuery<Domain[]>({
        queryKey: ['domains'],
        queryFn: async () => {
            const res = await fetch('/api/domains');
            const data = await res.json();
            return data.success ? data.data : [];
        },
        staleTime: 1000 * 60 * 60 // 1 hour cache
    });

    // Calculate totals
    const totalSubSkills = domains.reduce((acc, d) => acc + (d.subSkills?.length || 0), 0);
    const totalGoals = domains.reduce((acc, d) =>
        acc + (d.subSkills || []).reduce((a: number, s: SubSkill) => a + (s.goals?.length || 0), 0)
        , 0);

    // Filter domains by search
    const filteredDomains = domains.filter(d =>
        !searchTerm ||
        d.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.subSkills?.some((s: SubSkill) =>
            s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.goals?.some(g => g.title?.toLowerCase().includes(searchTerm.toLowerCase()))
        )
    );

    return (
        <div className="animate-fade-in max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-indigo-500" />
                        Goal Bank
                    </h1>
                    <p className="text-slate-500 mt-1">Browse domains and select goals for IEPs</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search domains, skills, or goals..."
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-indigo-50">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800">{domains.length}</div>
                        <div className="text-sm text-slate-500">Domains</div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-violet-50">
                        <Layers className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800">{totalSubSkills}</div>
                        <div className="text-sm text-slate-500">Sub-Skills</div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-50">
                        <Target className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800">{totalGoals}</div>
                        <div className="text-sm text-slate-500">Goals</div>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                </div>
            )}

            {/* Domain Grid */}
            {!isLoading && (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
                    {filteredDomains.map((d: Domain) => {
                        const goalsCount = (d.subSkills || []).reduce((acc: number, s: SubSkill) => acc + (s.goals?.length || 0), 0);
                        return (
                            <DomainCard
                                key={d.id || d._id}
                                id={d.id || d._id || ''}
                                code={d.code || undefined}
                                title={d.title}
                                icon={d.icon || '🎯'}
                                description={d.description || undefined}
                                subSkillsCount={d.subSkills?.length || 0}
                                goalsCount={goalsCount}
                                order={d.order}
                            />
                        );
                    })}
                </div>
            )}

            {/* Empty States */}
            {!isLoading && filteredDomains.length === 0 && searchTerm && (
                <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-200">
                    <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No Results Found</h3>
                    <p className="text-slate-500">No domains match "{searchTerm}"</p>
                    <button
                        onClick={() => setSearchTerm('')}
                        className="mt-4 text-sm font-medium text-indigo-600 hover:underline"
                    >
                        Clear Search
                    </button>
                </div>
            )}

            {!isLoading && domains.length === 0 && !searchTerm && (
                <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-200">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No Domains Yet</h3>
                    <p className="text-slate-500">Goal bank is empty. Add domains to get started.</p>
                </div>
            )}
        </div>
    );
}
