'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Save, ChevronDown } from 'lucide-react';
import MultiSelect from '@/components/ui/MultiSelect';
import { GoalBankEntry } from '@/types';
import { TEACHING_STRATEGIES, GOAL_OUTCOMES, PROMPT_LEVELS, PromptLevel } from '@/lib/constants';

interface LogEntry {
    goalId: string;
    goalTitle: string;
    studentId: string;
    status: 'Achieved' | 'Emerging' | 'Not Yet' | '';
    promptLevel: PromptLevel | '';
    trialsCorrect: number;
    trialsTotal: number;
    activities: string[];
    notes: string;
}

interface ActivityLogGridProps {
    studentId: string;
    goals: any[];
    onLogSaved?: () => void;
}

export default function ActivityLogGrid({ studentId, goals, onLogSaved }: ActivityLogGridProps) {
    const queryClient = useQueryClient();
    const [entries, setEntries] = useState<Record<string, LogEntry>>({});
    const [editingTotal, setEditingTotal] = useState<string | null>(null); // Track which goal's total is being edited

    // Initialize entries
    React.useEffect(() => {
        const newEntries = { ...entries };
        goals.forEach(g => {
            const gid = g.id || g._id;
            if (!newEntries[gid]) {
                newEntries[gid] = {
                    goalId: gid,
                    goalTitle: g.originalGoal?.title || g.title || 'Unknown Goal',
                    studentId,
                    status: '',
                    promptLevel: '',
                    trialsCorrect: 0,
                    trialsTotal: g.customTrialsTarget || 10,
                    activities: [],
                    notes: ''
                };
            }
        });
        setEntries(newEntries);
    }, [goals, studentId]);

    const mutation = useMutation({
        mutationFn: async (entry: LogEntry) => {
            if (!entry.goalId) throw new Error('Goal ID missing');

            const res = await fetch(`/api/students/${studentId}/logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    goal: entry.goalId,
                    performanceStatus: entry.status || GOAL_OUTCOMES.NOT_YET,
                    promptLevel: entry.promptLevel || 'Verbal',
                    trialsCorrect: entry.trialsCorrect,
                    trialsTotal: entry.trialsTotal,
                    activity: entry.activities.join(', '),
                    notes: entry.notes,
                    // ABA-accurate: Independence is based on prompt level, not outcome
                    isIndependent: entry.promptLevel === 'Independent'
                })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to save log');
            }
            return { data: await res.json(), goalId: entry.goalId };
        },
        onSuccess: (result) => {
            const { goalId } = result;
            const savedEntry = entries[goalId];

            // Show success toast with details
            toast.success(`Activity logged successfully! ${savedEntry.trialsCorrect}/${savedEntry.trialsTotal} trials recorded.`, {
                duration: 3000,
            });

            // Reset the form for next entry while keeping the trialsTotal
            setEntries(prev => ({
                ...prev,
                [goalId]: {
                    ...prev[goalId],
                    status: '',
                    promptLevel: '',
                    trialsCorrect: 0,
                    activities: [],
                    notes: ''
                }
            }));

            // Invalidate both logs and progress queries to update all related UI
            queryClient.invalidateQueries({ queryKey: ['logs', studentId] });
            queryClient.invalidateQueries({ queryKey: ['progress', studentId] });

            if (onLogSaved) onLogSaved();
        },
        onError: (err: any) => {
            toast.error(err.message || 'Failed to save log');
        }
    });

    const handleSave = (goalId: string) => {
        const entry = entries[goalId];
        if (!entry.status) return toast.error('Please select an outcome first');
        mutation.mutate(entry);
    };

    const updateEntry = (goalId: string, field: keyof LogEntry, value: any) => {
        console.log('Updating entry', goalId, field, value);
        setEntries(prev => ({
            ...prev,
            [goalId]: { ...prev[goalId], [field]: value }
        }));
    };

    const getPercent = (correct: number, total: number) => {
        if (!total) return 0;
        return Math.round((correct / total) * 100);
    };

    if (goals.length === 0) return <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">No active goals found for this student.</div>;

    return (
        <div className="pb-32"> {/* Extra padding at bottom for last dropdown */}
            <table className="w-full text-sm text-left border-separate border-spacing-y-3">
                <thead className="text-[var(--color-ebony-400)] uppercase font-bold text-[11px] tracking-wider">
                    <tr>
                        <th className="px-4 pb-2 w-1/4">Goal Details</th>
                        <th className="px-4 pb-2 text-center w-1/5">Outcome</th>
                        <th className="px-4 pb-2 text-center w-1/6">Trial Data</th>
                        <th className="px-4 pb-2 w-1/4">Strategies & Notes</th>
                        <th className="px-4 pb-2 text-right w-16">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {goals.map((g) => {
                        const gid = g.id || g._id;
                        const entry = entries[gid] || {};
                        const pct = getPercent(entry.trialsCorrect, entry.trialsTotal);
                        const goalTitle = (g.originalGoal as GoalBankEntry)?.title || g.title || 'Unknown Goal';
                        const goalDesc = (g.originalGoal as GoalBankEntry)?.description || '';

                        return (
                            <tr
                                key={gid}
                                className="bg-white rounded-2xl shadow-sm border border-slate-100 transition-all duration-200 hover:shadow-md hover:border-[var(--color-dusty-olive-200)] relative"
                            >
                                <td className="p-5 align-top first:rounded-l-2xl last:rounded-r-2xl">
                                    <div className="font-bold text-[var(--color-ebony-900)] text-sm mb-1.5 leading-snug">{goalTitle}</div>
                                    <div className="text-xs text-[var(--color-ebony-500)] font-normal leading-relaxed line-clamp-3">{goalDesc}</div>
                                </td>

                                <td className="p-5 align-top">
                                    <div className="space-y-2">
                                        {/* Outcome Dropdown */}
                                        <div className="relative">
                                            <select
                                                className={`w-full appearance-none py-2 pl-3 pr-8 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all cursor-pointer shadow-sm ${!entry.status ? 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white' :
                                                    entry.status === GOAL_OUTCOMES.ACHIEVED ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                                        entry.status === GOAL_OUTCOMES.EMERGING ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                                            'bg-rose-50 border-rose-200 text-rose-700'
                                                    }`}
                                                value={entry.status}
                                                onChange={(e) => updateEntry(gid, 'status', e.target.value)}
                                            >
                                                <option value="" disabled>Select Outcome...</option>
                                                <option value={GOAL_OUTCOMES.ACHIEVED}>✓ Achieved</option>
                                                <option value={GOAL_OUTCOMES.EMERGING}>◐ Emerging</option>
                                                <option value={GOAL_OUTCOMES.NOT_YET}>○ Not Yet</option>
                                            </select>
                                            <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 ${entry.status ? 'text-current' : 'text-slate-400'}`}>
                                                <ChevronDown size={12} />
                                            </div>
                                        </div>

                                        {/* Prompt Level Dropdown */}
                                        <div className="relative">
                                            <select
                                                className={`w-full appearance-none py-2 pl-3 pr-8 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all cursor-pointer shadow-sm ${!entry.promptLevel ? 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white' :
                                                    entry.promptLevel === 'Independent' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                                        entry.promptLevel === 'Verbal' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                                            entry.promptLevel === 'Gestural' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                                                entry.promptLevel === 'Modeling' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                                                                    'bg-rose-50 border-rose-200 text-rose-700'
                                                    }`}
                                                value={entry.promptLevel}
                                                onChange={(e) => updateEntry(gid, 'promptLevel', e.target.value)}
                                            >
                                                <option value="" disabled>Prompt Level...</option>
                                                {PROMPT_LEVELS.map(level => (
                                                    <option key={level.value} value={level.value}>
                                                        {level.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 ${entry.promptLevel ? 'text-current' : 'text-slate-400'}`}>
                                                <ChevronDown size={12} />
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td className="p-5 align-top">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="flex items-center justify-center gap-3">
                                            {/* Stepper Controls for Correct Trials */}
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => updateEntry(gid, 'trialsCorrect', Math.max(0, (entry.trialsCorrect || 0) - 1))}
                                                    className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 flex items-center justify-center transition-colors"
                                                    title="Decrease"
                                                >
                                                    -
                                                </button>

                                                <input
                                                    type="number"
                                                    className="w-14 h-12 text-center font-bold text-[var(--color-ebony-900)] bg-slate-50 border border-slate-200 rounded-xl shadow-inner text-xl focus:bg-white focus:border-[var(--color-dusty-olive-500)] focus:ring-4 focus:ring-[var(--color-dusty-olive-100)] outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    min="0"
                                                    max={entry.trialsTotal}
                                                    value={entry.trialsCorrect ?? ''}
                                                    onClick={(e) => (e.target as HTMLInputElement).select()}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 0;
                                                        // Clamp to 0..Total
                                                        const clamped = Math.min(Math.max(0, val), entry.trialsTotal);
                                                        updateEntry(gid, 'trialsCorrect', clamped);
                                                    }}
                                                />

                                                <button
                                                    onClick={() => updateEntry(gid, 'trialsCorrect', Math.min(entry.trialsTotal, (entry.trialsCorrect || 0) + 1))}
                                                    className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 flex items-center justify-center transition-colors"
                                                    title="Increase"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Total</span>
                                                {/* Total - Subtle or Editable */}
                                                {editingTotal === gid ? (
                                                    <input
                                                        autoFocus
                                                        type="number"
                                                        className="w-12 h-7 text-center text-xs text-[var(--color-ebony-600)] bg-white border border-slate-300 rounded focus:border-[var(--color-dusty-olive-500)] outline-none"
                                                        min={entry.trialsCorrect} // Can't be less than correct
                                                        value={entry.trialsTotal ?? ''}
                                                        onBlur={() => setEditingTotal(null)}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value) || 0;
                                                            // If total drops below correct, clamp correct? or prevent total drop?
                                                            // Better to let total change and clamp correct if needed, or just enforce constraints.
                                                            // Let's enforce min = correct.
                                                            const safeVal = Math.max(val, entry.trialsCorrect);
                                                            updateEntry(gid, 'trialsTotal', safeVal);
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') setEditingTotal(null);
                                                        }}
                                                    />
                                                ) : (
                                                    <button
                                                        onClick={() => setEditingTotal(gid)}
                                                        className="h-7 min-w-[30px] px-2 flex items-center justify-center text-[var(--color-ebony-500)] bg-slate-100 hover:bg-slate-200 rounded-md text-xs font-semibold transition-all group/total"
                                                        title="Global Target (Click to edit)"
                                                    >
                                                        / {entry.trialsTotal}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Accuracy Badge */}
                                        {entry.trialsTotal > 0 && (
                                            <div className={`text-center text-[10px] font-extrabold px-3 py-1 rounded-full shadow-sm border ${pct >= 80 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                                (pct >= 50 ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200')
                                                }`}>
                                                {pct}% Accuracy
                                            </div>
                                        )}
                                    </div>
                                </td>

                                <td className="p-5 align-top space-y-3">
                                    <MultiSelect
                                        options={TEACHING_STRATEGIES}
                                        selected={entry.activities || []}
                                        onChange={(val) => {
                                            console.log('Updating activities for goal:', gid, 'Selected:', val);
                                            updateEntry(gid, 'activities', val);
                                        }}
                                        placeholder="Teaching Strategies..."
                                        className="w-full"
                                    />
                                    <textarea
                                        rows={2}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[var(--color-dusty-olive-500)] focus:ring-4 focus:ring-[var(--color-dusty-olive-50)] outline-none transition-all resize-none placeholder:text-slate-400"
                                        placeholder="Add qualitative observations or notes..."
                                        value={entry.notes}
                                        onChange={(e) => updateEntry(gid, 'notes', e.target.value)}
                                    />
                                </td>

                                <td className="p-5 align-top text-right first:rounded-l-2xl last:rounded-r-2xl">
                                    <button
                                        onClick={() => handleSave(gid)}
                                        disabled={mutation.isPending || !entry.status}
                                        className={`
                                            w-12 h-12 rounded-xl shadow-sm transition-all flex items-center justify-center ml-auto
                                            ${!entry.status
                                                ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200'
                                                : 'bg-[var(--color-dusty-olive-600)] text-white hover:bg-[var(--color-dusty-olive-700)] hover:shadow-lg hover:-translate-y-1 shadow-md border border-transparent'}
                                        `}
                                        title="Save Entry"
                                    >
                                        <Save size={20} />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
