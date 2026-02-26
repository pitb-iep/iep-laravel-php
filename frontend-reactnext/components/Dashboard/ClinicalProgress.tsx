'use client';

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

interface MasteryData {
    name: string;
    mastery: number; // 0-100
}

interface ClinicalProgressProps {
    students: any[];
}

const COLORS = ['#70a288', '#1f5469', '#f6aa1c', '#9b2226', '#005f73'];

export default function ClinicalProgress({ students }: ClinicalProgressProps) {
    // Transform students to chart data
    const data = useMemo(() => {
        return students.map(s => {
            // Calculate Average Rubric Level
            const rubricLogs = (s.logs || []).filter((l: any) => l.rubricLevel);
            let masteryPercentage = 0;

            if (rubricLogs.length > 0) {
                const totalPoints = rubricLogs.reduce((sum: number, l: any) => sum + l.rubricLevel, 0);
                const avgLevel = totalPoints / rubricLogs.length; // 1 to 5
                masteryPercentage = (avgLevel / 5) * 100; // Convert to %
            } else {
                // Fallback for legacy data
                const iep = s.ieps?.find((i: any) => i.status === 'Active');
                const goalsCount = iep?.goals?.length || 0;
                const logs = s.logs || [];
                const achievedCount = logs.filter((l: any) => l.result === 'Achieved' || l.performanceStatus === 'Achieved').length;

                // Heuristic: If they have achieved X goals, assume some progress. 
                // Better heuristic: % of logs that are 'Achieved'
                const totalLogs = logs.length;
                masteryPercentage = totalLogs > 0 ? (achievedCount / totalLogs) * 100 : 0;
            }

            return {
                name: s.name,
                mastery: Math.min(100, Math.round(masteryPercentage))
            };
        })
            .sort((a, b) => b.mastery - a.mastery)
            .slice(0, 5); // Show top 5 students
    }, [students]);

    const isEmpty = data.length === 0;

    return (
        <div className="card min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-4 shrink-0">
                <h3 className="m-0 text-lg">Clinical Progress</h3>
                <div className="text-sm text-slate-500">Avg. Mastery Level (Converted to %)(Average Rubric Level)</div>
            </div>

            <div className="flex-1 w-full min-h-0 relative">
                {isEmpty ? (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm italic">
                        No data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="120%">
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-alabaster-grey-200)" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11, fill: 'var(--color-ebony-400)', fontWeight: 500 }}
                                axisLine={false}
                                tickLine={false}
                                interval={0}
                                dy={10}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: 'var(--color-ebony-400)' }}
                                axisLine={false}
                                tickLine={false}
                                domain={[0, 100]}
                                tickFormatter={(val) => `${val}%`}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    backgroundColor: 'white',
                                    padding: '12px'
                                }}
                                itemStyle={{ fontWeight: 600, color: '#1f2937' }}
                                formatter={(value: any) => [`${value ?? 0}% Mastery`, 'Mastery Level']}
                            />
                            <Bar
                                dataKey="mastery"
                                radius={[6, 6, 0, 0]}
                                barSize={45}
                                animationDuration={1000}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-500 leading-relaxed">
                    <span className="font-semibold text-slate-700 block mb-1">About this Graph:</span>
                    This chart tracks the <span className="text-[var(--color-dusty-olive-700)] font-medium">Average Mastery Level</span> for the top performing students.
                    Mastery is calculated by converting rubric scores (1-5) from cumulative activity logs into a percentage.
                    A score of <span className="font-medium">100%</span> indicates consistent performance at the highest rubric level across recorded trials.
                </div>
            </div>
        </div>
    );
}
