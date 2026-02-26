'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, TrendingUp, CheckCircle } from 'lucide-react';

interface PromptFadingData {
    readyToFade: boolean;
    currentPromptLevel: string;
    nextPromptLevel: string | null;
    averageAccuracy: number;
    consecutiveSessions: number;
    message: string;
    criteria?: {
        needsHighAccuracy: boolean;
        needsConsistency: boolean;
        needsEnoughSessions: boolean;
        canFadeFurther: boolean;
    };
}

interface PromptFadingAlertProps {
    studentId: string;
    goalId: string;
    className?: string;
}

export default function PromptFadingAlert({ studentId, goalId, className = '' }: PromptFadingAlertProps) {
    const [fadingData, setFadingData] = useState<PromptFadingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        fetchFadingAnalysis();
    }, [studentId, goalId]);

    const fetchFadingAnalysis = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
            const response = await fetch(`${API_URL}/students/${studentId}/goals/${goalId}/fading-analysis`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('app_token')}`
                }
            });

            if (!response.ok) {
                console.error('Failed to fetch fading analysis:', response.status);
                setLoading(false);
                return;
            }

            const result = await response.json();

            if (result.success) {
                setFadingData(result.data);
            }
        } catch (error) {
            console.error('Error fetching fading analysis:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcknowledge = () => {
        // Mark as acknowledged in localStorage
        localStorage.setItem(`fading-acknowledged-${goalId}`, 'true');
        setDismissed(true);
    };

    if (loading || !fadingData || dismissed) return null;

    // Check if already acknowledged
    if (localStorage.getItem(`fading-acknowledged-${goalId}`) === 'true') {
        return null;
    }

    if (fadingData.readyToFade) {
        return (
            <div className={`bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-lg shadow-md ${className}`}>
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-3 flex-1">
                        <h3 className="text-sm font-semibold text-green-900">
                            🎉 Ready for Prompt Fading!
                        </h3>
                        <div className="mt-2 text-sm text-green-800">
                            <p>{fadingData.message}</p>
                            <div className="mt-3 flex items-center space-x-4 text-xs">
                                <span className="flex items-center">
                                    <TrendingUp className="h-4 w-4 mr-1" />
                                    {fadingData.averageAccuracy}% accuracy
                                </span>
                                <span>
                                    {fadingData.consecutiveSessions} consecutive sessions
                                </span>
                                <span className="font-semibold">
                                    {fadingData.currentPromptLevel} → {fadingData.nextPromptLevel}
                                </span>
                            </div>
                        </div>
                        <div className="mt-4">
                            <button
                                onClick={handleAcknowledge}
                                className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
                            >
                                Acknowledge & Update Teaching Plan
                            </button>
                            <button
                                onClick={() => setDismissed(true)}
                                className="ml-3 text-green-700 hover:text-green-900 text-sm font-medium"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show info alert if not ready but has some progress
    if (fadingData.averageAccuracy >= 75 && fadingData.criteria) {
        return (
            <div className={`bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg ${className}`}>
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-900">
                            Prompt Fading Progress
                        </h3>
                        <div className="mt-2 text-sm text-blue-800">
                            <p>{fadingData.message}</p>
                            <div className="mt-2 space-y-1 text-xs">
                                <div className="flex items-center">
                                    <span className={fadingData.criteria.needsHighAccuracy ? 'text-green-600' : 'text-gray-500'}>
                                        {fadingData.criteria.needsHighAccuracy ? '✓' : '○'} High accuracy (≥90%)
                                    </span>
                                    <span className="ml-2 text-gray-600">
                                        Currently: {fadingData.averageAccuracy}%
                                    </span>
                                </div>
                                <div className={fadingData.criteria.needsConsistency ? 'text-green-600' : 'text-gray-500'}>
                                    {fadingData.criteria.needsConsistency ? '✓' : '○'} Consistent prompt level
                                </div>
                                <div className={fadingData.criteria.needsEnoughSessions ? 'text-green-600' : 'text-gray-500'}>
                                    {fadingData.criteria.needsEnoughSessions ? '✓' : '○'} Sufficient data (≥3 sessions)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
