'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BookOpen, Target, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import GoalsTable from '@/components/Goals/GoalsTable';
import type { Domain, SubSkill, GoalBankEntry } from '@/types';

interface PageParams {
    id: string;
}

export default function DomainDetailsPage({ params }: { params: Promise<PageParams> }) {
    const { id } = use(params);
    const [expandedSubSkills, setExpandedSubSkills] = useState<Record<string, boolean>>({});

    // Fetch domain using new single-domain endpoint
    const { data: domain, isLoading, error } = useQuery<Domain>({
        queryKey: ['domain', id],
        queryFn: async () => {
            const res = await fetch(`/api/domains/${id}`);
            if (!res.ok) {
                // Fallback to fetching all and filtering
                const allRes = await fetch('/api/domains');
                const allData = await allRes.json();
                const domains = allData.success ? allData.data : [];
                return domains.find((d: Domain) => d.id === id || d._id === id);
            }
            const data = await res.json();
            return data.success ? data.data : null;
        }
    });

    const toggleSubSkill = (subSkillId: string) => {
        setExpandedSubSkills(prev => ({
            ...prev,
            [subSkillId]: !prev[subSkillId]
        }));
    };

    // Expand all by default on first load
    React.useEffect(() => {
        if (domain?.subSkills) {
            const expanded: Record<string, boolean> = {};
            domain.subSkills.forEach((s: SubSkill, idx: number) => {
                expanded[s.id || s._id || `sub-${idx}`] = true;
            });
            setExpandedSubSkills(expanded);
        }
    }, [domain]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (error || !domain) {
        return (
            <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold text-slate-700 mb-2">Domain Not Found</h2>
                <p className="text-slate-500 mb-6">The domain you're looking for doesn't exist.</p>
                <Link href="/goals" className="btn-primary">Back to Goal Bank</Link>
            </div>
        );
    }

    const totalGoals = domain.subSkills?.reduce((acc: number, s: SubSkill) => acc + (s.goals?.length || 0), 0) || 0;

    return (
        <div className="animate-fade-in max-w-6xl mx-auto">
            {/* Navigation */}
            <div className="mb-6">
                <Link href="/goals" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
                    <ArrowLeft size={16} /> Back to Goal Bank
                </Link>
            </div>

            {/* Domain Header Card */}
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-8 mb-8 text-white shadow-xl shadow-indigo-200">
                <div className="flex items-center gap-6">
                    <div className="text-6xl bg-white/20 w-24 h-24 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        {domain.icon || '🎯'}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            {domain.code && (
                                <span className="font-mono text-xs font-bold text-indigo-200 bg-white/10 border border-white/20 px-2 py-0.5 rounded">
                                    {domain.code}
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl font-bold mb-2 !text-white">{domain.title}</h1>
                        {domain.description && (
                            <p className="text-indigo-100 mb-4 max-w-2xl">{domain.description}</p>
                        )}
                        <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <Layers size={16} className="text-indigo-200" />
                                <span>{domain.subSkills?.length || 0} Sub-Skills</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Target size={16} className="text-indigo-200" />
                                <span>{totalGoals} Goals</span>
                            </div>
                        </div>
                        {/* Tier legend */}
                        <div className="flex items-center gap-2 mt-4 text-xs text-indigo-200">
                            <span className="bg-blue-500/30 border border-blue-300/40 text-white px-2 py-0.5 rounded font-bold">A</span>
                            <span>Foundational</span>
                            <span className="ml-2 bg-amber-400/30 border border-amber-300/40 text-white px-2 py-0.5 rounded font-bold">B</span>
                            <span>Emerging</span>
                            <span className="ml-2 bg-green-500/30 border border-green-300/40 text-white px-2 py-0.5 rounded font-bold">C</span>
                            <span>Advanced</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub-Skills Accordion with Tables */}
            <div className="space-y-4">
                {domain.subSkills?.map((subSkill: SubSkill, idx: number) => {
                    const subId = subSkill.id || subSkill._id || `sub-${idx}`;
                    const isExpanded = expandedSubSkills[subId] !== false;
                    const goals = subSkill.goals || [];

                    return (
                        <div key={subId} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            {/* Sub-Skill Header */}
                            <button
                                onClick={() => toggleSubSkill(subId)}
                                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-indigo-50">
                                        <BookOpen size={18} className="text-indigo-500" />
                                    </div>
                                    <div className="text-left">
                                        <div className="flex items-center gap-2">
                                            {subSkill.code && (
                                                <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                    {subSkill.code}
                                                </span>
                                            )}
                                            <h3 className="font-bold text-slate-800">{subSkill.title || subSkill.name}</h3>
                                        </div>
                                        <span className="text-sm text-slate-500">{goals.length} goals</span>
                                    </div>
                                </div>
                                <div className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                                    <ChevronRight size={20} className="text-slate-400" />
                                </div>
                            </button>

                            {/* Goals Table */}
                            {isExpanded && (
                                <div className="border-t border-slate-100 p-5 bg-slate-50/50">
                                    <GoalsTable
                                        goals={goals.map((g: GoalBankEntry) => ({
                                            id: g.id || g._id || '',
                                            code: g.code,
                                            title: g.title,
                                            description: g.description || '',
                                            tier: g.tier,
                                            ageGroup: g.ageGroup,
                                            objectives: g.objectives || [],
                                            skillType: g.skillType,
                                            promptLevel: g.suggestedPromptLevel || g.promptLevel,
                                            masteryCriteria: g.masteryCriteria
                                        }))}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {(!domain.subSkills || domain.subSkills.length === 0) && (
                <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-200">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No sub-skills defined for this domain yet.</p>
                </div>
            )}
        </div>
    );
}
