import StudentTable from '@/components/Students/StudentTable';
import AddStudentButton from '@/components/Students/AddStudentButton';
import StudentStats from '@/components/Students/StudentStats';
import GuideMeButton from '@/components/Tour/GuideMeButton';
import { fetchFromAPI } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface Student {
    id: string;
    _id: string;
    name: string;
    diagnosis?: string;
    programStream?: string; // API uses programStream or program
    program?: string;
    ieps?: any[];
    teacher?: any;
    parents?: any[];
}

import { calculateStudentStats } from '@/lib/stats-helper';

export default async function StudentsPage() {
    const students: Student[] = await fetchFromAPI('/students') || [];
    const stats = calculateStudentStats(students);

    return (
        <div>
            {stats && <StudentStats stats={stats} />}

            <div id="tour-students-header" className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl mb-1">Students</h1>
                    <p className="text-slate-500">Manage your class roster.</p>
                </div>
                <div className="flex gap-3">
                    <GuideMeButton />
                    <AddStudentButton />
                </div>
            </div>

            {students.length === 0 ? (
                <div className="text-center py-20 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <div className="text-4xl opacity-20 mb-4">👩‍🎓</div>
                    <p className="text-slate-500">No students found.</p>
                </div>
            ) : (
                <StudentTable data={students.map(s => ({
                    ...s,
                    // Normalize props if needed
                    id: s.id || s._id // Ensure ID exists
                }))} />
            )}
        </div>
    );
}
