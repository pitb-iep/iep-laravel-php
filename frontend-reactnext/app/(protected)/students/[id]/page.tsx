import StudentProfile from '@/components/Students/StudentProfile';
import { fetchFromAPI } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: {
        id: string;
    }
}

// Fetch data logic
async function getData(id: string) {
    const student = await fetchFromAPI(`/students/${id}`);
    const logs = await fetchFromAPI(`/students/${id}/logs`);
    const ieps = await fetchFromAPI(`/students/${id}/ieps`); // Fetch IEPs explicitly
    const domains = await fetchFromAPI(`/domains`); // Needed to map goal IDs to Titles if not populated

    // Attach IEPs to student if fetched successfully
    if (student && ieps) {
        student.ieps = ieps;
    }

    // Create Goal Map
    const allGoalsMap: Record<string, string> = {};
    if (domains) {
        domains.forEach((d: any) => {
            d.subSkills.forEach((ss: any) => {
                ss.goals.forEach((g: any) => {
                    allGoalsMap[g.id] = g.title;
                    allGoalsMap[g._id] = g.title; // Handle both ID types
                });
            });
        });
    }

    return { student, logs: logs || [], allGoalsMap };
}

// Params are async in Next.js 15+ (if using 15, but package.json said 14 or latest? package.json said next: "16.1.5", so params are Promises)
// In Next 15 proposed, params might be promises, but for 14 it's sync. 
// Wait, checking package.json from earlier... "next": "16.1.5".
// In Next.js 15, `params` is a Promise.

export default async function StudentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { student, logs, allGoalsMap } = await getData(id);

    if (!student) {
        return <div className="p-10 text-center">Student not found</div>;
    }

    return (
        <StudentProfile
            student={student}
            logs={logs}
            allGoalsMap={allGoalsMap}
        />
    );
}
