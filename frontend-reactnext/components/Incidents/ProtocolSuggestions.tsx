'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, BookOpen, Shield } from 'lucide-react';

interface BehaviorProtocol {
    _id: string;
    name: string;
    description: string;
    incidentTypes: string[];
    interventionSteps: string[];
    preventionStrategies?: string[];
    safetyPriority: 'Critical' | 'High' | 'Medium' | 'Low';
    relevanceScore?: number;
    studentIncidentCount?: number;
}

interface ProtocolSuggestionsProps {
    studentId: string;
    incidentType: string;
    onSelectProtocol?: (protocol: BehaviorProtocol) => void;
}

export default function ProtocolSuggestions({ studentId, incidentType, onSelectProtocol }: ProtocolSuggestionsProps) {
    const [protocols, setProtocols] = useState<BehaviorProtocol[]>([]);
    const [loading, setLoading] = useState(true);
    const [incidentHistory, setIncidentHistory] = useState({ total: 0, recent: [] });

    useEffect(() => {
        if (incidentType) {
            fetchProtocols();
        }
    }, [studentId, incidentType]);

    const fetchProtocols = async () => {
        try {
            const response = await fetch(
                `/api/students/${studentId}/protocols/suggest?incidentType=${encodeURIComponent(incidentType)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('app_token')}`
                    }
                }
            );

            const result = await response.json();

            if (result.success) {
                setProtocols(result.data.protocols);
                setIncidentHistory(result.data.incidentHistory);
            }
        } catch (error) {
            console.error('Error fetching protocol suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Critical':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'High':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Low':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (!incidentType) {
        return null;
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <div className="text-gray-500">Loading protocol suggestions...</div>
                </CardContent>
            </Card>
        );
    }

    if (protocols.length === 0) {
        return (
            <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
                        No Protocols Found
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-yellow-700">
                        No intervention protocols found for this incident type. Consider creating one or contact your supervisor.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* History Banner */}
            {incidentHistory.total > 0 && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>{incidentHistory.total}</strong> similar incident(s) recorded for this student.
                        {incidentHistory.total > 5 && (
                            <span className="ml-1 text-blue-600">Pattern detected - review prevention strategies below.</span>
                        )}
                    </p>
                </div>
            )}

            {/* Suggested Protocols */}
            <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-indigo-600" />
                    Suggested Intervention Protocols ({protocols.length})
                </h4>

                {protocols.map((protocol, index) => (
                    <Card
                        key={protocol._id}
                        className={`cursor-pointer hover:shadow-md transition-shadow ${index === 0 ? 'border-indigo-300 bg-indigo-50/50' : ''
                            }`}
                        onClick={() => onSelectProtocol?.(protocol)}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        {index === 0 && (
                                            <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                                                RECOMMENDED
                                            </span>
                                        )}
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded border font-semibold ${getPriorityColor(
                                                protocol.safetyPriority
                                            )}`}
                                        >
                                            <Shield className="h-3 w-3 inline mr-1" />
                                            {protocol.safetyPriority} Priority
                                        </span>
                                        {protocol.relevanceScore && (
                                            <span className="text-xs text-gray-500">
                                                Score: {protocol.relevanceScore}
                                            </span>
                                        )}
                                    </div>
                                    <CardTitle className="text-base">{protocol.name}</CardTitle>
                                    <p className="text-sm text-gray-600 mt-1">{protocol.description}</p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {/* Intervention Steps */}
                            <div>
                                <p className="text-xs font-semibold text-gray-700 mb-1.5">Intervention Steps:</p>
                                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                                    {protocol.interventionSteps.slice(0, 3).map((step, i) => (
                                        <li key={i} className="leading-relaxed">{step}</li>
                                    ))}
                                    {protocol.interventionSteps.length > 3 && (
                                        <li className="text-gray-500 italic">
                                            +{protocol.interventionSteps.length - 3} more steps...
                                        </li>
                                    )}
                                </ol>
                            </div>

                            {/* Prevention Strategies */}
                            {protocol.preventionStrategies && protocol.preventionStrategies.length > 0 && (
                                <div className="bg-green-50 p-2 rounded border border-green-200">
                                    <p className="text-xs font-semibold text-green-800 mb-1">Prevention Strategies:</p>
                                    <ul className="list-disc list-inside space-y-0.5 text-xs text-green-700">
                                        {protocol.preventionStrategies.map((strategy, i) => (
                                            <li key={i}>{strategy}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {index === 0 && (
                                <div className="pt-2 border-t border-indigo-200">
                                    <p className="text-xs text-indigo-700 italic">
                                        Click to apply this protocol to the incident report
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
