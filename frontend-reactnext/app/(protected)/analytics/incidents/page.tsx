import IncidentHeatMap from '@/components/Incidents/IncidentHeatMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function IncidentAnalyticsPage() {
    return (
        <div className="p-6 space-y-6 animate-fade-in">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-[var(--color-ebony-900)] mb-2">
                    Incident Pattern Analysis
                </h1>
                <p className="text-[var(--color-ebony-600)]">
                    Identify temporal and spatial patterns to inform preventative strategies and staffing decisions
                </p>
            </div>

            <IncidentHeatMap />
        </div>
    );
}
