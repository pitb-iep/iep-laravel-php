'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useEffect, useState } from 'react';

interface ProgressHistory {
    date: string;
    accuracy: number;
    status: string;
    isIndependent: boolean;
    promptLevel?: string;
    sessionType?: string;
}

interface ProgressData {
    overallAccuracy: number;
    independenceRate: number;
    history: ProgressHistory[];
}

interface DualAxisProgressChartProps {
    studentId: string;
    goalId: string;
    className?: string;
}

export default function DualAxisProgressChart({ studentId, goalId, className = '' }: DualAxisProgressChartProps) {
    const [progressData, setProgressData] = useState<ProgressData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProgressData();
    }, [studentId, goalId]);

    const fetchProgressData = async () => {
        try {
            const response = await fetch(`/api/students/${studentId}/goals/progress`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('app_token')}`
                }
            });

            if (!response.ok) {
                console.error('Failed to fetch progress data:', response.status, response.statusText);
                setLoading(false);
                return;
            }

            const result = await response.json();

            if (result.success && result.data[goalId]) {
                setProgressData(result.data[goalId]);
            }
        } catch (error) {
            console.error('Error fetching progress data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-gray-500">Loading progress data...</div>
            </div>
        );
    }

    if (!progressData || !progressData.history || progressData.history.length === 0) {
        return (
            <div className="w-full h-80 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                    <p className="text-gray-500 font-medium">No progress data available</p>
                    <p className="text-sm text-gray-400 mt-1">Start logging sessions to see progress visualization</p>
                </div>
            </div>
        );
    }

    // Transform data for chart
    const chartData = progressData.history.map((session) => ({
        date: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        accuracy: session.accuracy,
        independence: session.isIndependent ? 100 : 0,
        promptLevel: session.promptLevel || 'Unknown',
        sessionType: session.sessionType || 'Teaching',
        fullDate: session.date
    }));

    // Calculate running independence average for smoother line
    const runningIndependence = chartData.map((item, index, arr) => {
        const last5 = arr.slice(Math.max(0, index - 4), index + 1);
        const avgIndependence = last5.reduce((sum, s) => sum + s.independence, 0) / last5.length;
        return {
            ...item,
            independenceAvg: Math.round(avgIndependence)
        };
    });

    // Get prompt level color
    const getPromptColor = (level: string) => {
        const colors: Record<string, string> = {
            'Physical': '#ef4444', // red
            'Modeling': '#f59e0b', // amber
            'Gestural': '#eab308', // yellow
            'Verbal': '#3b82f6',   // blue
            'Independent': '#22c55e' // green
        };
        return colors[level] || '#6b7280';
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium text-gray-900">{data.date}</p>
                    <p className="text-sm mt-1">Accuracy: <span className="font-semibold text-blue-600">{data.accuracy}%</span></p>
                    <p className="text-sm">Independence: <span className="font-semibold text-green-600">{data.independenceAvg}%</span></p>
                    <p className="text-sm mt-1">
                        <span
                            className="inline-block w-2 h-2 rounded-full mr-1"
                            style={{ backgroundColor: getPromptColor(data.promptLevel) }}
                        />
                        {data.promptLevel}
                    </p>
                    {data.sessionType !== 'Teaching' && (
                        <p className="text-xs text-gray-500 mt-1">({data.sessionType} session)</p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Progress Tracking</h3>
                <p className="text-sm text-gray-600 mt-1">
                    Dual-axis view: Accuracy vs. Independence
                </p>
                <div className="flex items-center space-x-6 mt-2 text-sm">
                    <div className="flex items-center">
                        <div className="w-12 h-0.5 bg-blue-500 mr-2"></div>
                        <span className="text-gray-700">Overall Accuracy: <span className="font-semibold">{progressData.overallAccuracy}%</span></span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-12 h-0.5 bg-green-500 mr-2"></div>
                        <span className="text-gray-700">Independence Rate: <span className="font-semibold">{progressData.independenceRate}%</span></span>
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={runningIndependence} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                    />
                    <YAxis
                        yAxisId="left"
                        label={{ value: 'Accuracy %', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                        domain={[0, 100]}
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        label={{ value: 'Independence %', angle: 90, position: 'insideRight', style: { fontSize: 12 } }}
                        domain={[0, 100]}
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ fontSize: '14px' }}
                        iconType="line"
                    />

                    {/* Reference lines for mastery thresholds */}
                    <ReferenceLine
                        yAxisId="left"
                        y={80}
                        stroke="#22c55e"
                        strokeDasharray="5 5"
                        label={{ value: 'Mastery Goal (80%)', position: 'right', fontSize: 10, fill: '#22c55e' }}
                    />

                    {/* Main data lines */}
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="accuracy"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Accuracy %"
                        dot={{ fill: '#3b82f6', r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="independenceAvg"
                        stroke="#22c55e"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Independence % (5-session avg)"
                        dot={{ fill: '#22c55e', r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>

            {/* Prompt level legend */}
            <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-2">Prompt Level Key:</p>
                <div className="flex flex-wrap gap-3">
                    {['Physical', 'Modeling', 'Gestural', 'Verbal', 'Independent'].map(level => (
                        <div key={level} className="flex items-center">
                            <div
                                className="w-3 h-3 rounded-full mr-1.5"
                                style={{ backgroundColor: getPromptColor(level) }}
                            />
                            <span className="text-xs text-gray-600">{level}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
