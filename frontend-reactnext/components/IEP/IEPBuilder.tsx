'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, ChevronRight, User, BookOpen, Target, Calendar } from 'lucide-react';

export default function IEPBuilder() {
    const [step, setStep] = useState(1);
    const router = useRouter();

    // Selections
    const [selStuId, setSelStuId] = useState('');
    const [selDomainIds, setSelDomainIds] = useState<string[]>([]);
    const [selGoalIds, setSelGoalIds] = useState<string[]>([]);

    // Extended IEP Details
    const [teamMembers, setTeamMembers] = useState<{ name: string, role: string }[]>([
        { name: '', role: 'Parent/Guardian' },
        { name: '', role: 'Special Education Teacher' },
        { name: '', role: 'Administrator' }
    ]);
    const [accommodations, setAccommodations] = useState<{ instructional: string[], environmental: string[], assessment: string[] }>({
        instructional: [],
        environmental: [],
        assessment: []
    });
    const [plaafp, setPlaafp] = useState({
        strengths: '',
        concerns: '',
        impact: '',
        academics: '',
        functional: ''
    });

    // Details/Plan
    const [goalDetails, setGoalDetails] = useState<Record<string, { activity: string, targetDate: string, trialsTarget: number }>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Data Fetching
    const { data: students = [] } = useQuery({
        queryKey: ['students'],
        queryFn: async () => (await fetch('/api/students')).json().then(res => res.success ? res.data : [])
    });

    const { data: domains = [] } = useQuery({
        queryKey: ['domains'],
        queryFn: async () => (await fetch('/api/domains')).json().then(res => res.success ? res.data : [])
    });

    // Helpers
    const toggle = (list: string[], item: string, setFn: Function) => {
        if (list.includes(item)) setFn(list.filter((i: string) => i !== item));
        else setFn([...list, item]);
    };

    const selectAllGoals = (goals: any[]) => {
        const goalIds = goals.map(g => g.id);
        const allSelected = goalIds.every(id => selGoalIds.includes(id));
        if (allSelected) setSelGoalIds(selGoalIds.filter(id => !goalIds.includes(id)));
        else setSelGoalIds([...new Set([...selGoalIds, ...goalIds])]);
    };

    const handleCreateIEP = async () => {
        setIsSubmitting(true);
        const advancedGoals = selGoalIds.map(gid => {
            const details = goalDetails[gid] || {};
            return {
                originalGoal: gid,
                activities: details.activity || '',
                targetDate: details.targetDate || null,
                customTrialsTarget: details.trialsTarget || 10,
                status: 'In Progress'
            };
        });

        try {
            const res = await fetch(`/api/students/${selStuId}/ieps`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    domains: selDomainIds,
                    goals: advancedGoals,
                    status: 'Active',
                    teamMembers: teamMembers.filter(t => t.name),
                    accommodations,
                    presentLevelSummary: plaafp
                })
            });
            if (res.ok) {
                toast.success('IEP Created Successfully!');
                router.push(`/students/${selStuId}`);
            } else {
                toast.error('Error creating IEP');
            }
        } catch (e) {
            console.error(e);
            toast.error('Connection Failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Steps UI ---
    const steps = [
        { num: 1, label: 'Student', icon: User },
        { num: 2, label: 'Domains', icon: BookOpen },
        { num: 3, label: 'Goals', icon: Target },
        { num: 4, label: 'Plan', icon: Calendar },
    ];

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Modern Stepper */}
            <div className="mb-10">
                <div className="flex items-center justify-between relative z-10 mx-10">
                    {steps.map((s, i) => {
                        const active = step >= s.num;
                        const current = step === s.num;
                        return (
                            <div key={s.num} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => step > s.num && setStep(s.num)}>
                                <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 border-2
                                    ${active ? 'bg-[hsl(var(--primary-hue),70%,60%)] border-[hsl(var(--primary-hue),70%,60%)] text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-200 text-slate-400'}
                                    ${current ? 'ring-4 ring-indigo-50 scale-110' : ''}
                                `}>
                                    <s.icon size={20} />
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${active ? 'text-slate-800' : 'text-slate-400'}`}>{s.label}</span>
                            </div>
                        );
                    })}
                </div>
                {/* Connecting Line */}
                <div className="absolute top-[170px] left-[calc(50%-450px)] w-[900px] h-1 bg-slate-100 -z-0">
                    <div
                        className="h-full bg-[hsl(var(--primary-hue),70%,60%)] transition-all duration-500 ease-out"
                        style={{ width: `${((step - 1) / 3) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* STEP 1: Student & PLAAFP */}
            {step === 1 && (
                <div className="animate-[fadeIn_0.4s_ease-out]">
                    <div className="card max-w-2xl mx-auto p-10 shadow-sm border border-slate-100">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span className="text-[hsl(var(--primary-hue),70%,60%)]"><User /></span>
                            Student Profile
                        </h2>

                        <div className="mb-8">
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Select Student <span className="text-rose-500">*</span>
                            </label>
                            <select
                                className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-[hsl(var(--primary-hue),70%,60%)]/20"
                                value={selStuId}
                                onChange={(e) => setSelStuId(e.target.value)}
                            >
                                <option value="">-- Select a Student --</option>
                                {students.map((s: any) => (
                                    <option key={s.id || s._id} value={s.id || s._id}>{s.name} ({s.programStream || 'IEC'})</option>
                                ))}
                            </select>
                        </div>

                        {selStuId && (
                            <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                                <div className="border-t border-slate-100 pt-6">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4">Present Levels (PLAAFP)</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                                                Strengths & Interests <span className="text-rose-500">*</span>
                                            </label>
                                            <textarea
                                                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-[hsl(var(--primary-hue),70%,60%)] outline-none"
                                                rows={3}
                                                value={plaafp.strengths}
                                                onChange={e => setPlaafp({ ...plaafp, strengths: e.target.value })}
                                                placeholder="What is the student good at?"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                                                Impact of Disability <span className="text-slate-400 font-normal normal-case float-right">(Optional)</span>
                                            </label>
                                            <textarea
                                                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-[hsl(var(--primary-hue),70%,60%)] outline-none"
                                                rows={3}
                                                value={plaafp.impact}
                                                onChange={e => setPlaafp({ ...plaafp, impact: e.target.value })}
                                                placeholder="How does the disability affect their progress?"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-10 flex justify-end">
                            <button
                                disabled={!selStuId || !plaafp.strengths}
                                onClick={() => setStep(2)}
                                className="btn-primary px-8 py-3 flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next Step <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 2: Domains (Tabular/Grid) */}
            {step === 2 && (
                <div className="animate-[fadeIn_0.4s_ease-out]">
                    <h2 className="text-2xl font-bold mb-2">Select Focus Domains</h2>
                    <p className="text-slate-500 mb-8">Choose the areas of development to target.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {domains.map((d: any) => {
                            const selected = selDomainIds.includes(d.id);
                            return (
                                <div
                                    key={d.id}
                                    onClick={() => toggle(selDomainIds, d.id, setSelDomainIds)}
                                    className={`
                                        relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 overflow-hidden group
                                        ${selected
                                            ? 'border-[hsl(var(--primary-hue),70%,60%)] bg-white shadow-lg shadow-indigo-100 ring-1 ring-[hsl(var(--primary-hue),70%,60%)]'
                                            : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-md'}
                                    `}
                                >
                                    {selected && (
                                        <div className="absolute top-3 right-3 text-[hsl(var(--primary-hue),70%,60%)] bg-indigo-50 rounded-full p-1">
                                            <Check size={16} strokeWidth={3} />
                                        </div>
                                    )}
                                    {!selected && d.code && (
                                        <span className="absolute top-3 right-3 font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                            {d.code}
                                        </span>
                                    )}
                                    <div className="flex items-start gap-4">
                                        <div className="text-3xl group-hover:scale-110 transition-transform duration-300 mt-0.5">{d.icon}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`font-bold text-lg leading-snug ${selected ? 'text-indigo-900' : 'text-slate-700'}`}>{d.title}</div>
                                            {d.description && (
                                                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{d.description}</p>
                                            )}
                                            <div className="text-xs text-slate-400 mt-2">{d.subSkills?.length || 0} sub-skills</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-between mt-10">
                        <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
                        <button
                            onClick={() => {
                                if (selDomainIds.length === 0) return toast.error('Select at least one domain');
                                setStep(3);
                            }}
                            className="btn-primary px-8"
                        >
                            Next: Goals →
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 3: Goals (Tabular) */}
            {step === 3 && (
                <div className="animate-[fadeIn_0.4s_ease-out]">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">Select Goals</h2>
                            <p className="text-slate-500">Select specific goals from the goal bank.</p>
                        </div>
                        <div className="bg-indigo-50 text-[hsl(var(--primary-hue),70%,60%)] px-4 py-2 rounded-lg font-bold text-sm">
                            {selGoalIds.length} Goals Selected
                        </div>
                    </div>

                    <div className="space-y-8">
                        {domains.filter((d: any) => selDomainIds.includes(d.id)).map((d: any) => (
                            <div key={d.id} className="card p-0 overflow-hidden border border-slate-200">
                                <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center gap-3">
                                    <span className="text-2xl">{d.icon}</span>
                                    <h3 className="font-bold text-lg text-slate-800">{d.title}</h3>
                                </div>

                                {d.subSkills.map((s: any, idx: number) => (
                                    <div key={idx} className="p-0">
                                        <div className="bg-white p-3 border-b border-slate-100 flex justify-between items-center px-6">
                                            <h4 className="font-bold text-slate-600 text-sm uppercase tracking-wide">{s.title}</h4>
                                            <button onClick={() => selectAllGoals(s.goals)} className="text-xs text-indigo-600 font-bold hover:underline">
                                                Select All
                                            </button>
                                        </div>

                                        <div className="divide-y divide-slate-100">
                                            <table className="w-full text-left">
                                                <tbody className="divide-y divide-slate-50">
                                                    {s.goals.map((g: any) => {
                                                        const isSel = selGoalIds.includes(g.id);
                                                        const tierColors: Record<string, string> = {
                                                            A: 'bg-blue-100 text-blue-600',
                                                            B: 'bg-amber-100 text-amber-600',
                                                            C: 'bg-green-100 text-green-700',
                                                        };
                                                        return (
                                                            <tr
                                                                key={g.id}
                                                                onClick={() => toggle(selGoalIds, g.id, setSelGoalIds)}
                                                                className={`
                                                                    cursor-pointer transition-colors hover:bg-slate-50 group
                                                                    ${isSel ? 'bg-indigo-50/50' : ''}
                                                                `}
                                                            >
                                                                <td className="p-4 w-12 text-center">
                                                                    <div className={`
                                                                        w-5 h-5 rounded border flex items-center justify-center transition-all
                                                                        ${isSel ? 'bg-[hsl(var(--primary-hue),70%,60%)] border-[hsl(var(--primary-hue),70%,60%)]' : 'border-slate-300 bg-white'}
                                                                    `}>
                                                                        {isSel && <Check size={12} className="text-white" />}
                                                                    </div>
                                                                </td>
                                                                <td className="p-4 py-3">
                                                                    <div className="flex items-start gap-2">
                                                                        {g.code && (
                                                                            <span className="shrink-0 font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5">
                                                                                {g.code}
                                                                            </span>
                                                                        )}
                                                                        <div>
                                                                            <div className={`font-medium ${isSel ? 'text-indigo-900' : 'text-slate-700'}`}>{g.title}</div>
                                                                            {g.description && (
                                                                                <div className="text-xs text-slate-500 mt-0.5">{g.description}</div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="p-4 w-32 text-right">
                                                                    <div className="flex items-center justify-end gap-1.5">
                                                                        {g.tier && (
                                                                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${tierColors[g.tier] || 'bg-slate-100 text-slate-500'}`}>
                                                                                {g.tier}
                                                                            </span>
                                                                        )}
                                                                        <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded tracking-wider">
                                                                            {g.skillType || 'Skill'}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between mt-10">
                        <button onClick={() => setStep(2)} className="btn-secondary">Back</button>
                        <button
                            onClick={() => {
                                if (selGoalIds.length === 0) return toast.error('Select at least one goal');
                                setStep(4);
                            }}
                            className="btn-primary px-8"
                        >
                            Next: Plan →
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 4: Plan */}
            {step === 4 && (
                <div className="animate-[fadeIn_0.4s_ease-out]">
                    <h2 className="text-2xl font-bold mb-6">Finalize IEP Plan</h2>

                    <div className="grid gap-8">
                        {/* 1. Goals Plan */}
                        <section className="card p-6 border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Target size={18} className="text-[hsl(var(--primary-hue),70%,60%)]" />
                                Goal Implementation
                            </h3>
                            <div className="divide-y divide-slate-100">
                                {domains.flatMap((d: any) => d.subSkills.flatMap((s: any) => s.goals))
                                    .filter((g: any) => selGoalIds.includes(g.id))
                                    .map((g: any) => (
                                        <div key={g.id} className="py-6 first:pt-0">
                                            <div className="flex justify-between mb-3">
                                                <div className="font-bold text-slate-700">{g.title}</div>
                                                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">GOAL</span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Teaching Strategy <span className="text-rose-500">*</span></label>
                                                    <textarea
                                                        className="w-full p-2 rounded-lg border border-slate-300 text-sm focus:border-[hsl(var(--primary-hue),70%,60%)] outline-none"
                                                        rows={2}
                                                        placeholder="How will this be taught?"
                                                        value={goalDetails[g.id]?.activity || ''}
                                                        onChange={(e) => setGoalDetails(prev => ({
                                                            ...prev,
                                                            [g.id]: { ...prev[g.id], activity: e.target.value }
                                                        }))}
                                                    ></textarea>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Target Date <span className="text-rose-500">*</span></label>
                                                    <input
                                                        type="date"
                                                        className="w-full p-2 rounded-lg border border-slate-300 text-sm focus:border-[hsl(var(--primary-hue),70%,60%)] outline-none"
                                                        value={goalDetails[g.id]?.targetDate || ''}
                                                        onChange={(e) => setGoalDetails(prev => ({
                                                            ...prev,
                                                            [g.id]: { ...prev[g.id], targetDate: e.target.value }
                                                        }))}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Daily Trials Target</label>
                                                    <input
                                                        type="number"
                                                        className="w-full p-2 rounded-lg border border-slate-300 text-sm focus:border-[hsl(var(--primary-hue),70%,60%)] outline-none"
                                                        min="1"
                                                        max="100"
                                                        value={goalDetails[g.id]?.trialsTarget || 10}
                                                        onChange={(e) => setGoalDetails(prev => ({
                                                            ...prev,
                                                            [g.id]: { ...prev[g.id], trialsTarget: parseInt(e.target.value) || 10 }
                                                        }))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </section>

                        {/* 2. Accommodations */}
                        <section className="card p-6 border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <BookOpen size={18} className="text-[hsl(var(--primary-hue),70%,60%)]" />
                                Accommodations
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Instructional Supports</label>
                                    <textarea
                                        className="w-full p-3 border border-slate-200 rounded-xl text-sm" rows={4}
                                        placeholder="e.g. Visual schedules, Extra time..."
                                        value={accommodations.instructional.join('\\n')}
                                        onChange={e => setAccommodations({ ...accommodations, instructional: e.target.value.split('\\n') })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Environmental Supports</label>
                                    <textarea
                                        className="w-full p-3 border border-slate-200 rounded-xl text-sm" rows={4}
                                        placeholder="e.g. Quiet corner, Seating preference..."
                                        value={accommodations.environmental.join('\\n')}
                                        onChange={e => setAccommodations({ ...accommodations, environmental: e.target.value.split('\\n') })}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* 3. Team */}
                        <section className="card p-6 border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <User size={18} className="text-[hsl(var(--primary-hue),70%,60%)]" />
                                IEP Team
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {teamMembers.map((member, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <div className="w-1/2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 flex items-center">
                                            {member.role}
                                        </div>
                                        <input
                                            className="w-1/2 p-3 border border-slate-200 rounded-lg text-sm"
                                            placeholder="Name"
                                            value={member.name}
                                            onChange={e => {
                                                const newTeam = [...teamMembers];
                                                newTeam[idx].name = e.target.value;
                                                setTeamMembers(newTeam);
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="flex justify-between mt-10">
                        <button onClick={() => setStep(3)} className="btn-secondary">Back</button>
                        <button
                            onClick={handleCreateIEP}
                            disabled={isSubmitting}
                            className="btn-primary px-8 py-4 text-lg shadow-xl shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-1 transition-all"
                        >
                            {isSubmitting ? 'Creating IEP...' : '✓ Create & Activate IEP'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
