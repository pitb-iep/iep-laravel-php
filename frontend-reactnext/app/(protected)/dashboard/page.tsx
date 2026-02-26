import { fetchFromAPI } from '@/lib/api';

import StatsTiles from '@/components/Dashboard/StatsTiles';
import ClinicalProgress from '@/components/Dashboard/ClinicalProgress';
import ReviewList from '@/components/Dashboard/ReviewList';
import QuickNotes from '@/components/Dashboard/QuickNotes';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import NeedsAttention from '@/components/Dashboard/NeedsAttention';
import ActivityTable from '@/components/Dashboard/ActivityTable';

import { calculateStudentStats } from '@/lib/stats-helper';

// Types (simplified for dashboard)
interface Student {
    id: string;
    _id: string;
    name: string;
    reviewDate?: string;
    ieps?: { status: string }[];
    logs?: any[];
}

import TourGuide from '@/components/Tour/TourGuide';

// ... (existing imports)

export default async function DashboardPage() {
    // ... (existing data fetching)
    // Parallel Data Fetching
    const [studentsData, domainsData] = await Promise.all([
        fetchFromAPI('/students', { next: { revalidate: 0 } }),
        fetchFromAPI('/domains', { next: { revalidate: 3600 } })
    ]);

    const studentsRaw: any[] = studentsData || [];
    const students: Student[] = studentsRaw.map(s => {
        const activeIEP = s.ieps?.find((i: any) => i.status === 'Active');
        return {
            ...s,
            reviewDate: activeIEP?.nextReviewDate // Hoist review date
        };
    });

    const stats = calculateStudentStats(students);
    const domains: any[] = domainsData || [];

    // Count total goals
    let goalCount = 0;
    domains.forEach(d => {
        d.subSkills.forEach((s: any) => {
            goalCount += s.goals.length;
        });
    });

    return (
        <div className="animate-fade-in">
            <TourGuide>
                <div id="tour-dashboard-header">
                    <DashboardHeader />
                </div>

                <div className="mb-8" id="tour-dashboard-stats">
                    <StatsTiles
                        studentCount={stats.totalStudents || students.length}
                        iepCount={stats.activeIEPs}
                        goalCount={goalCount}
                        complianceRate={stats.complianceRate ?? 0}
                        avgMastery={stats.avgMastery || 0}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
                    <div className="flex flex-col gap-8">
                        {/* High Priority Alerts placed prominently */}
                        {stats.needsAttention?.length > 0 && (
                            <NeedsAttention items={stats.needsAttention} />
                        )}
                        <ClinicalProgress students={students} />
                        <div id="tour-recent-activity">
                            <ActivityTable students={students} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        <ReviewList students={students} />
                        <QuickNotes />
                    </div>
                </div>
            </TourGuide>
        </div>
    );
}
