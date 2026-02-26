'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingDown, TrendingUp, Minus, AlertTriangle, MapPin, Clock, Calendar } from 'lucide-react';

interface HeatMapData {
    timeDistribution: Record<string, number>;
    locationDistribution: Record<string, number>;
    dayOfWeekDistribution: Record<string, number>;
    totalIncidents: number;
    peakPatterns: {
        time: { period: string; count: number } | null;
        location: { place: string; count: number } | null;
        day: { weekday: string; count: number } | null;
    };
    recommendations: Array<{
        type: string;
        message: string;
        priority: string;
    }>;
}

interface IncidentHeatMapProps {
    studentId?: string;
    incidentType?: string;
}

export default function IncidentHeatMap({ studentId, incidentType }: IncidentHeatMapProps) {
    const [heatMapData, setHeatMapData] = useState<HeatMapData | null>(null);
    const [dateRange, setDateRange] = useState('last30days');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHeatMap();
    }, [studentId, incidentType, dateRange]);

    const fetchHeatMap = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ dateRange });
            if (studentId) params.append('studentId', studentId);
            if (incidentType) params.append('incidentType', incidentType);

            const response = await fetch(`/api/incidents/heatmap?${params.toString()}`);

            if (!response.ok) {
                console.error('Failed to fetch heat map data:', response.status, response.statusText);
                setLoading(false);
                return;
            }

            const result = await response.json();

            if (result.success) {
                setHeatMapData(result.data);
            }
        } catch (error) {
            console.error('Error fetching heat map:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIntensityColor = (value: number, max: number) => {
        const percentage = max > 0 ? (value / max) * 100 : 0;
        if (percentage >= 75) return 'bg-red-600 text-white';
        if (percentage >= 50) return 'bg-orange-500 text-white';
        if (percentage >= 25) return 'bg-yellow-400 text-gray-900';
        if (percentage > 0) return 'bg-blue-300 text-gray-900';
        return 'bg-gray-100 text-gray-400';
    };

    const getPriorityIcon = (priority: string) => {
        if (priority === 'High') return <AlertTriangle className="h-4 w-4 text-red-600" />;
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-12 text-center">
                    <div className="text-gray-500">Loading heat map data...</div>
                </CardContent>
            </Card>
        );
    }

    if (!heatMapData || heatMapData.totalIncidents === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Incident Heat Map</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-500">No incident data available for the selected period.</p>
                </CardContent>
            </Card>
        );
    }

    const maxTimeValue = Math.max(...Object.values(heatMapData.timeDistribution));
    const maxLocationValue = Math.max(...Object.values(heatMapData.locationDistribution));
    const maxDayValue = Math.max(...Object.values(heatMapData.dayOfWeekDistribution));

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Incident Pattern Analysis</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">
                                {heatMapData.totalIncidents} incidents analyzed
                            </p>
                        </div>
                        <Select value={dateRange} onValueChange={setDateRange}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="last7days">Last 7 Days</SelectItem>
                                <SelectItem value="last30days">Last 30 Days</SelectItem>
                                <SelectItem value="last90days">Last 90 Days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
            </Card>

            {/* Recommendations */}
            {heatMapData.recommendations.length > 0 && (
                <div className="space-y-2">
                    {heatMapData.recommendations.map((rec, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-lg border ${rec.priority === 'High'
                                ? 'bg-red-50 border-red-200'
                                : 'bg-yellow-50 border-yellow-200'
                                }`}
                        >
                            <div className="flex items-start">
                                {getPriorityIcon(rec.priority)}
                                <p className={`ml-3 text-sm ${rec.priority === 'High' ? 'text-red-800' : 'text-yellow-800'
                                    }`}>
                                    {rec.message}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Time Distribution Heat Map */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-blue-600" />
                        Time of Day Distribution
                    </CardTitle>
                    {heatMapData.peakPatterns.time && (
                        <p className="text-sm text-gray-600">
                            Peak time: <strong>{heatMapData.peakPatterns.time.period}</strong> ({heatMapData.peakPatterns.time.count} incidents)
                        </p>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-4 gap-2">
                        {Object.entries(heatMapData.timeDistribution)
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([time, count]) => (
                                <div
                                    key={time}
                                    className={`p-3 rounded-lg text-center transition-all hover:scale-105 ${getIntensityColor(
                                        count,
                                        maxTimeValue
                                    )}`}
                                >
                                    <div className="text-xs font-semibold mb-1">{time}</div>
                                    <div className="text-lg font-bold">{count}</div>
                                </div>
                            ))}
                    </div>
                </CardContent>
            </Card>

            {/* Location Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-green-600" />
                        Location Distribution
                    </CardTitle>
                    {heatMapData.peakPatterns.location && (
                        <p className="text-sm text-gray-600">
                            Most incidents at: <strong>{heatMapData.peakPatterns.location.place}</strong> ({heatMapData.peakPatterns.location.count} incidents)
                        </p>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {Object.entries(heatMapData.locationDistribution)
                            .sort(([, a], [, b]) => b - a)
                            .map(([location, count]) => {
                                const percentage = maxLocationValue > 0 ? (count / maxLocationValue) * 100 : 0;
                                return (
                                    <div key={location} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">{location}</span>
                                            <span className="text-gray-600">{count} incidents ({Math.round((count / heatMapData.totalIncidents) * 100)}%)</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all ${percentage >= 75
                                                    ? 'bg-red-500'
                                                    : percentage >= 50
                                                        ? 'bg-orange-400'
                                                        : 'bg-blue-400'
                                                    }`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </CardContent>
            </Card>

            {/* Day of Week Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                        Day of Week Distribution
                    </CardTitle>
                    {heatMapData.peakPatterns.day && (
                        <p className="text-sm text-gray-600">
                            Peak day: <strong>{heatMapData.peakPatterns.day.weekday}</strong> ({heatMapData.peakPatterns.day.count} incidents)
                        </p>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-7 gap-2">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                            const count = heatMapData.dayOfWeekDistribution[day] || 0;
                            return (
                                <div
                                    key={day}
                                    className={`p-3 rounded-lg text-center ${getIntensityColor(count, maxDayValue)}`}
                                >
                                    <div className="text-xs font-semibold mb-1">{day.slice(0, 3)}</div>
                                    <div className="text-lg font-bold">{count}</div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
