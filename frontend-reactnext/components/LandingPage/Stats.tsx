'use client';

import { useEffect, useState } from 'react';
import { Users, GraduationCap, FileText, TrendingUp, ClipboardCheck, Target } from 'lucide-react';

interface StatsData {
    totalStudents: number;
    totalTeachers: number;
    totalIEPs: number;
    totalProgressLogs: number;
    totalAssessments: number;
    totalGoals: number;
}

export default function Stats() {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/stats');
                const result = await response.json();

                if (result.success) {
                    setStats(result.data);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}k+`;
        return num.toLocaleString();
    };

    const statsDisplay = [
        {
            value: stats?.totalStudents || 0,
            label: 'Students Supported',
            icon: <Users className="w-8 h-8" />,
            bgColor: '#70a288'
        },
        {
            value: stats?.totalTeachers || 0,
            label: 'Educators Empowered',
            icon: <GraduationCap className="w-8 h-8" />,
            bgColor: '#1f5469'
        },
        {
            value: stats?.totalIEPs || 0,
            label: 'IEPs Created',
            icon: <FileText className="w-8 h-8" />,
            bgColor: '#f6aa1c'
        },
        {
            value: stats?.totalProgressLogs || 0,
            label: 'Data Points Logged',
            icon: <TrendingUp className="w-8 h-8" />,
            bgColor: '#9b2226'
        },
        {
            value: stats?.totalAssessments || 0,
            label: 'Assessments Completed',
            icon: <ClipboardCheck className="w-8 h-8" />,
            bgColor: '#005f73'
        },
        {
            value: stats?.totalGoals || 0,
            label: 'Goals in Bank',
            icon: <Target className="w-8 h-8" />,
            bgColor: '#ca6702'
        }
    ];

    return (
        <section className="py-24 bg-alabaster-grey-50 border-y border-dusty-olive-200">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-ebony-900 mb-3">Platform Impact</h2>
                    <p className="text-lg text-ebony-500 max-w-2xl mx-auto">Real-time statistics from our growing community of educators and students</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                    {statsDisplay.map((stat, index) => (
                        <div
                            key={index}
                            className="group rounded-2xl p-6 border-0 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center min-h-[180px]"
                            style={{ backgroundColor: stat.bgColor }}
                        >
                            <div className="text-white/20 absolute top-2 right-2 group-hover:scale-110 transition-transform duration-300 pointer-events-none">
                                {stat.icon}
                            </div>

                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors duration-300">
                                <div className="text-white">
                                    {stat.icon}
                                </div>
                            </div>

                            <div className="text-3xl md:text-4xl font-bold mb-2 text-center text-white">
                                {loading ? (
                                    <div className="animate-pulse bg-white/20 h-10 w-24 mx-auto rounded"></div>
                                ) : (
                                    formatNumber(stat.value)
                                )}
                            </div>

                            <div className="text-xs font-bold text-white/80 uppercase tracking-widest text-center mt-auto">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
