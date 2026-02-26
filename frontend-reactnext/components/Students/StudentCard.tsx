import Link from 'next/link';

interface StudentProps {
    id: string;
    name: string;
    diagnosis?: string;
    program?: string;
    iepCount?: number;
    teacher?: { name: string; fullName?: string };
    parents?: { name: string; fullName?: string }[];
    ieps?: any[];
}

export default function StudentCard({ id, name, diagnosis, program, iepCount = 0, teacher, parents, ieps = [] }: StudentProps) {
    // Calculate Stats
    const activeIep = ieps.find((i: any) => i.status === 'Active') || ieps.find((i: any) => i.status === 'Draft');
    const activeGoals = activeIep?.goals?.length || 0;
    const achievedGoals = activeIep?.goals?.filter((g: any) => g.status === 'Achieved').length || 0;
    const progress = activeGoals > 0 ? Math.round((achievedGoals / activeGoals) * 100) : 0;

    return (
        <div className="card group hover:border-[hsl(var(--primary-hue),70%,60%)] transition-all">
            <div className="flex gap-4 items-start mb-3">
                <div className="w-10 h-10 bg-[hsl(var(--primary-hue),90%,96%)] text-[hsl(var(--primary-hue),70%,60%)] rounded-full flex shrink-0 items-center justify-center font-bold text-lg">
                    {name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900 truncate" title={name}>{name}</div>
                    <div className="text-xs text-slate-500 mb-1">{diagnosis || 'No Diagnosis'}</div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                        <span className="inline-block px-2 py-0.5 rounded text-[0.65rem] font-medium bg-[hsl(var(--primary-hue),90%,96%)] text-[hsl(var(--primary-hue),70%,60%)]">
                            {program || 'N/A'}
                        </span>
                        {teacher && (
                            <span className="inline-block px-2 py-0.5 rounded text-[0.65rem] font-medium bg-slate-100 text-slate-600 truncate max-w-[120px]" title={`Teacher: ${teacher.fullName || teacher.name}`}>
                                👨‍🏫 {teacher.fullName || teacher.name}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Parents */}
            <div className="text-xs text-slate-500 mb-3 pl-1 truncate" title={parents?.map(p => p.fullName || p.name).join(', ')}>
                <span className="font-medium">Parents:</span> {parents && parents.length > 0 ? parents.map(p => p.fullName || p.name).join(', ') : 'Not assigned'}
            </div>

            {/* divider */}
            <div className="h-px bg-slate-100 my-3"></div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Goals</div>
                    <div className="text-lg font-bold text-slate-700">{activeGoals} <span className="text-xs font-normal text-slate-400">Active</span></div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Progress</div>
                    <div className={`text-lg font-bold ${progress === 100 ? 'text-emerald-600' : 'text-indigo-600'}`}>{progress}%</div>
                </div>
            </div>

            <div className="text-right">
                <Link
                    href={`/students/${id}`}
                    className="inline-block text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors w-full text-center"
                >
                    View Profile
                </Link>
            </div>
        </div>
    );
}
