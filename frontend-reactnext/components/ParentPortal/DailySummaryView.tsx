'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Home, Pill, Utensils, Moon, SmilePlus } from 'lucide-react';

interface DailySummary {
    _id: string;
    date: string;
    summary: string;
    highlights: Array<{
        type: 'goal' | 'behavior' | 'social' | 'activity';
        goalId?: string;
        progress?: string;
        description?: string;
    }>;
    concerns?: string;
    parentAcknowledged: boolean;
    parentAcknowledgedAt?: string;
    createdBy: {
        fullName: string;
        role: string;
    };
}

interface ParentPortalViewProps {
    studentId: string;
    studentName: string;
}

export default function ParentPortalView({ studentId, studentName }: ParentPortalViewProps) {
    const [summaries, setSummaries] = useState<DailySummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSummaries();
    }, [studentId]);

    const fetchSummaries = async () => {
        try {
            const response = await fetch(`/api/parent/students/${studentId}/summaries?limit=30`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('app_token')}`
                }
            });
            const result = await response.json();

            if (result.success) {
                setSummaries(result.data);
            }
        } catch (error) {
            console.error('Error fetching summaries:', error);
        } finally {
            setLoading(false);
        }
    };

    const acknowledgeSummary = async (summaryId: string) => {
        try {
            const response = await fetch(`/api/parent/summaries/${summaryId}/acknowledge`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('app_token')}`
                }
            });

            const result = await response.json();

            if (result.success) {
                // Update local state
                setSummaries(prev =>
                    prev.map(s =>
                        s._id === summaryId
                            ? { ...s, parentAcknowledged: true, parentAcknowledgedAt: new Date().toISOString() }
                            : s
                    )
                );
            }
        } catch (error) {
            console.error('Error acknowledging summary:', error);
        }
    };

    const getHighlightIcon = (type: string) => {
        switch (type) {
            case 'goal':
                return '🎯';
            case 'behavior':
                return '⭐';
            case 'social':
                return '🤝';
            case 'activity':
                return '🎨';
            default:
                return '✨';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-gray-500">Loading daily summaries...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold mb-2">Daily Updates for {studentName}</h1>
                <p className="text-blue-100">Stay informed about your child's progress at school</p>
            </div>

            {summaries.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No daily summaries yet</p>
                        <p className="text-sm text-gray-400 mt-2">Your child's teacher will share updates here</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {summaries.map(summary => (
                        <Card key={summary._id} className="shadow-md hover:shadow-lg transition-shadow">
                            <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl">
                                            {new Date(summary.date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">
                                            by {summary.createdBy.fullName} ({summary.createdBy.role})
                                        </p>
                                    </div>
                                    {summary.parentAcknowledged && (
                                        <div className="text-sm text-green-600 flex items-center">
                                            <span className="mr-2">✓</span>
                                            Acknowledged
                                        </div>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4 pt-6">
                                {/* Summary Text */}
                                <div>
                                    <p className="text-gray-700 leading-relaxed">{summary.summary}</p>
                                </div>

                                {/* Highlights */}
                                {summary.highlights && summary.highlights.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Highlights:</h4>
                                        <div className="space-y-2">
                                            {summary.highlights.map((highlight, index) => (
                                                <div key={index} className="flex items-start space-x-2 bg-green-50 p-3 rounded-md">
                                                    <span className="text-lg">{getHighlightIcon(highlight.type)}</span>
                                                    <div>
                                                        <p className="text-sm font-medium text-green-900 capitalize">{highlight.type}</p>
                                                        <p className="text-sm text-gray-700">
                                                            {highlight.progress || highlight.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Concerns */}
                                {summary.concerns && (
                                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                                        <h4 className="font-semibold text-yellow-900 mb-1">Notes:</h4>
                                        <p className="text-sm text-yellow-800">{summary.concerns}</p>
                                    </div>
                                )}

                                {/* Acknowledge Button */}
                                {!summary.parentAcknowledged && (
                                    <div className="pt-2">
                                        <Button
                                            onClick={() => acknowledgeSummary(summary._id)}
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                        >
                                            Mark as Read
                                        </Button>
                                    </div>
                                )}

                                {summary.parentAcknowledged && summary.parentAcknowledgedAt && (
                                    <p className="text-xs text-gray-400 text-center">
                                        Acknowledged on {new Date(summary.parentAcknowledgedAt).toLocaleDateString()}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
