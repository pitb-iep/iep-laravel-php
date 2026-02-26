'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';
import ActivityLogGrid from '@/components/ActivityLog/ActivityLogGrid';

interface LogActivityModalProps {
    studentId: string;
    preSelectedGoalId?: string;
    onClose: () => void;
    onSave?: () => void;
}

// Helper to get cookie
function getCookie(name: string) {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
}

export default function LogActivityModal({ studentId, preSelectedGoalId, onClose, onSave }: LogActivityModalProps) {
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                // Attach token
                const token = getCookie('app_token');
                const headers: any = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const res = await fetch(`/api/students/${studentId}/ieps`, { headers });
                const ieps = await res.json();

                if (ieps && ieps.success) {
                    const active = ieps.data.find((i: any) => i.status === 'Active');
                    if (active) {
                        setGoals(active.goals || []);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch goals", err);
            } finally {
                setLoading(false);
            }
        };

        if (studentId) fetchGoals();
    }, [studentId]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <Clock size={16} className="text-[hsl(var(--primary-hue),70%,60%)]" />
                        Quick Activity Log
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-0 overflow-auto flex-1 bg-white">
                    {loading ? (
                        <div className="p-10 text-center text-slate-400">Loading goals...</div>
                    ) : (() => {
                        // Filter to only the preselected goal if provided
                        const filteredGoals = preSelectedGoalId
                            ? goals.filter(g => {
                                const goalId = g.id || g._id;
                                const originalGoalId = g.originalGoal && typeof g.originalGoal === 'object'
                                    ? g.originalGoal.id || g.originalGoal._id
                                    : g.originalGoal;

                                // Debug logging
                                console.log('Filtering goal:', {
                                    goalId,
                                    originalGoalId,
                                    preSelectedGoalId,
                                    matches: goalId === preSelectedGoalId || originalGoalId === preSelectedGoalId
                                });

                                return goalId === preSelectedGoalId || originalGoalId === preSelectedGoalId;
                            })
                            : goals;

                        // Log filtering results
                        if (preSelectedGoalId) {
                            console.log('Goal filtering:', {
                                preSelectedGoalId,
                                totalGoals: goals.length,
                                filteredCount: filteredGoals.length,
                                filteredGoals
                            });
                        }

                        return (
                            <div className="p-6">
                                {filteredGoals.length > 0 ? (
                                    <ActivityLogGrid
                                        studentId={studentId}
                                        goals={filteredGoals}
                                        onLogSaved={() => {
                                            if (onSave) onSave();
                                        }}
                                    />
                                ) : (
                                    <div className="text-center py-10 text-slate-500">
                                        {preSelectedGoalId
                                            ? 'Goal not found in active IEP.'
                                            : 'No active IEP goals found for this student.'}
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}
