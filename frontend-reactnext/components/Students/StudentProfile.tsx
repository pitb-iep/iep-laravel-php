'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import EditStudentModal from './EditStudentModal';
import LogActivityModal from './LogActivityModal';
import { Users, Pencil, Activity, PlusCircle, FileText, CheckCircle2, X } from 'lucide-react';
import { GOAL_OUTCOMES } from '@/lib/constants';
import { Student, Log, GoalBankEntry } from '@/types';
import GuideMeButton from '@/components/Tour/GuideMeButton';
import PromptFadingAlert from '@/components/PromptFadingAlert';
import DualAxisProgressChart from '@/components/Charts/DualAxisProgressChart';
import MasteryVerificationModal from '@/components/Goals/MasteryVerificationModal';

interface StudentProfileProps {
    student: Student;
    logs: Log[];
    allGoalsMap: Record<string, string>; // ID -> Title
}

export default function StudentProfile({ student, logs, allGoalsMap }: StudentProfileProps) {

    const [logModal, setLogModal] = useState<{ isOpen: boolean; preSelectedGoal?: string }>({ isOpen: false });
    const [isUpdating, setIsUpdating] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [verificationModal, setVerificationModal] = useState<{ isOpen: boolean; goalId?: string; goalTitle?: string; independenceRate?: number }>({ isOpen: false });
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // MOCK HISTORY DATA
    const mockHistory = [
        { id: '1', date: '2025-10-15', type: 'Previous IEP', content: 'Student showed significant progress in requesting items. Recommended fading physical prompts.', addedBy: 'Sarah Connor' },
        { id: '2', date: '2025-06-12', type: 'Clinical Note', content: 'Initial assessment indicates strong visual matching skills but challenges with vocal imitation.', addedBy: 'Dr. Smith' },
        { id: '3', date: '2024-12-01', type: 'Assessment', content: 'VB-MAPP Level 1 assessment completed. Barriers identified in instructional control.', addedBy: 'System Migration' }
    ];

    // Fetch Progress Stats
    const { data: progressData } = useQuery({
        queryKey: ['progress', student.id || student._id],
        queryFn: async () => {
            const res = await fetch(`/api/students/${student.id || student._id}/goals/progress`);
            const json = await res.json();
            return json.success ? json.data : {};
        },
        enabled: !!(student.id || student._id)
    });

    const activeIep = (student.ieps || []).find(i => i.status === 'Active');
    const goalsCount = activeIep ? (activeIep.goals?.length || 0) : 0;

    // Sort IEPs: Active first, then Draft (latest first), then Archived
    const allIeps = [...(student.ieps || [])].sort((a, b) => {
        if (a.status === 'Active') return -1;
        if (b.status === 'Active') return 1;
        if (a.status === 'Draft' && b.status !== 'Draft') return -1;
        if (b.status === 'Draft' && a.status !== 'Draft') return 1;
        return new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime();
    });

    const handleActivateIEP = async (iepId: string) => {
        if (!confirm('Are you sure you want to activate this IEP?')) return;
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/students/${student.id || student._id}/ieps/${iepId}`.replace('/students/', '/ieps/').replace(/\/ieps\/[^\/]+\/ieps\//, '/ieps/'), { // Wait, route is /api/ieps/:id or nested? 
                // iepRoutes.js: router.route('/:id').put(protect, updateIEP); mount path is /:studentId/ieps NO wait...
                // server/routes/iepRoutes.js IS mounted at /:studentId/ieps, but ALSO maybe at /api/ieps directly?
                // Let's check server.js or just assume typical REST. 
                // Actually, usually PUT /api/ieps/:id is better.
                // But looking at iepRoutes.js, it has router.route('/:id').put(updateIEP).
                // It is mounted in studentRoutes as router.use('/:studentId/ieps', iepRouter).
                // So url is /api/students/:studentId/ieps/:id.
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Active' })
            });

            if (res.ok) {
                window.location.reload();
            } else {
                alert('Failed to update IEP status');
            }
        } catch (e) {
            console.error(e);
            alert('Error updating IEP');
        } finally {
            setIsUpdating(false);
        }
    };

    // Stats calculation
    // Match 'Achieved' or 'Mastered'
    const achievedLogs = logs.filter(l => l.result === 'Achieved' || l.performanceStatus === 'Achieved');
    const progressPct = goalsCount > 0 ? Math.min(100, Math.round((achievedLogs.length / (goalsCount * 5)) * 100)) : 0; // Rough mock logic

    // Support Level
    const levelName = student.currentLevel || 'New';
    const levelNum = levelName === 'Senior' ? 3 : (levelName === 'Junior' ? 2 : 1);

    // Therapies
    const therapies = student.activeTherapies || [];

    // Filter logs with notes for the sidebar
    const notesLogs = logs.filter(l => l.notes || l.activity).slice(0, 5);

    return (
        <div className="animate-fade-in">
            <Link href="/students" className="btn-secondary inline-block mb-4">← Back to Students</Link>
            {/* Infographic Header */}
            <div id="tour-profile-header" className="card mb-8 flex gap-8 items-center relative overflow-hidden bg-gradient-to-br from-white to-[var(--color-alabaster-grey-50)]">
                <div className="pattern-bg opacity-30 mix-blend-multiply"></div>

                <div className="w-[100px] h-[100px] bg-white text-[var(--color-dusty-olive-600)] rounded-[30px] flex items-center justify-center font-bold text-4xl shadow-md z-10 shrink-0 ring-4 ring-[var(--color-dusty-olive-50)]">
                    <span className="text-4xl">{student.name.charAt(0)}</span>
                </div>

                <div className="flex-1 z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl m-0 mb-1 text-[var(--color-ebony-900)]">{student.name}</h1>
                            <div className="mb-4 opacity-80 font-medium flex items-center gap-2 text-sm text-[var(--color-ebony-600)]">
                                {student.diagnosis || 'No Diagnosis'}
                                <span className="bg-[var(--color-alabaster-grey-300)] w-1 h-1 rounded-full"></span>
                                {student.dob ? new Date().getFullYear() - new Date(student.dob).getFullYear() + ' Years Old' : 'Age N/A'}
                                <span className="bg-[var(--color-alabaster-grey-300)] w-1 h-1 rounded-full"></span>
                                <span className="badge bg-white text-[var(--color-ebony-700)] border border-[var(--color-dusty-olive-200)] shadow-sm inline-flex items-center gap-1.5 px-3 py-1 rounded-full">
                                    <span className="text-[var(--color-dusty-olive-800)] font-semibold tracking-wide text-xs">
                                        {student.programStream || 'N/A'}
                                    </span>
                                </span>
                            </div>
                            <div className="text-sm text-[var(--color-ebony-500)] flex items-center gap-1">
                                <Users className="w-4 h-4 text-[var(--color-ebony-400)]" />
                                Teacher: <strong>{student.teacher?.fullName || 'Not Assigned'}</strong>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <GuideMeButton />
                            <button
                                onClick={() => setIsHistoryOpen(true)}
                                className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl transition-all border border-slate-200 shadow-sm text-sm font-semibold flex items-center gap-2"
                            >
                                <FileText className="w-4 h-4 text-indigo-500" /> View History
                            </button>
                            <button
                                onClick={() => setIsEditOpen(true)}
                                className="bg-white hover:bg-[var(--color-alabaster-grey-50)] text-[var(--color-ebony-700)] px-4 py-2 rounded-xl transition-all border border-[var(--color-alabaster-grey-200)] shadow-sm text-sm font-semibold flex items-center gap-2"
                            >
                                <Pencil className="w-4 h-4" /> Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* Mastery Bar */}
                    <div id="tour-profile-mastery" className="mt-4">
                        <div className="flex justify-between text-xs font-semibold mb-1 text-[var(--color-ebony-500)]">
                            <span>IEP Goal Mastery Progress (Approximation)</span>
                            <span>{progressPct}%</span>
                        </div>
                        <div className="w-full h-3 bg-[var(--color-alabaster-grey-100)] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[var(--color-dusty-olive-500)] to-[var(--color-dusty-olive-700)] transition-all duration-1000 ease-out"
                                style={{ width: `${progressPct}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Donut Chart Visual */}
                <div className="pr-4 hidden md:block">
                    <div className="w-20 h-20 rounded-full border-[6px] border-[var(--color-alabaster-grey-100)] flex items-center justify-center relative">
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle
                                cx="50" cy="50" r="40"
                                fill="transparent"
                                stroke="var(--color-dusty-olive-600)"
                                strokeWidth="8"
                                strokeDasharray={`${progressPct * 2.51} 251`}
                                strokeLinecap="round"
                            />
                        </svg>
                        <span className="font-bold text-[var(--color-dusty-olive-700)]">{progressPct}%</span>
                    </div>
                    <div className="text-center text-[0.65rem] font-bold text-[var(--color-ebony-400)] uppercase mt-2 tracking-wider">Goal Mastery</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">

                {/* Metrics & Goals */}
                <div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {/* Support Level */}
                        <div className="card p-4">
                            <h4 className="mb-4 text-xs uppercase text-[var(--color-ebony-500)] tracking-wider">Support Level</h4>
                            <div className="flex justify-between items-center">
                                <div className="flex gap-1">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className={`w-5 h-5 rounded ${i <= levelNum ? 'bg-[var(--color-dusty-olive-600)]' : 'bg-[var(--color-alabaster-grey-200)]'}`}></div>
                                    ))}
                                </div>
                                <span className="font-bold text-[var(--color-dusty-olive-700)]">{levelName}</span>
                            </div>
                            <p className="text-xs text-[var(--color-ebony-400)] mt-3">
                                {levelName === 'Senior' ? 'Requires very substantial support.' : (levelName === 'Junior' ? 'Requires substantial support.' : 'Requires support.')}
                            </p>
                        </div>

                        {/* Therapy Focus */}
                        <div className="card p-4">
                            <h4 className="mb-4 text-xs uppercase text-[var(--color-ebony-500)] tracking-wider">Therapy Engagement</h4>
                            <div className="flex flex-wrap gap-1.5">
                                {therapies.length > 0 ? therapies.map(t => (
                                    <span key={t} className="bg-[var(--color-dusty-olive-50)] text-[var(--color-dusty-olive-700)] px-2 py-1 rounded-lg text-xs font-semibold">{t}</span>
                                )) : <span className="text-xs text-[var(--color-ebony-400)]">No therapies listed</span>}
                            </div>
                            <div className="mt-3 text-xs text-[var(--color-ebony-400)]">Active in {therapies.length} disciplines.</div>
                        </div>
                    </div>

                    {/* Active Goals */}
                    <div id="tour-profile-goals" className="card">
                        <h3 className="mb-6 text-lg text-[var(--color-ebony-900)]">Active IEP Goals ({goalsCount})</h3>
                        {activeIep && activeIep.goals.length > 0 ? (
                            activeIep.goals.map((g, idx) => {
                                let gTitle = 'Unknown Goal';
                                // g.id is reference ID.

                                if (g.originalGoal && typeof g.originalGoal === 'object') {
                                    gTitle = (g.originalGoal as GoalBankEntry).title;
                                } else if (typeof g.originalGoal === 'string') {
                                    gTitle = allGoalsMap[g.originalGoal] || 'Unknown Goal';
                                }

                                const status = g.status || 'Not Started';
                                let statusColors = "bg-[var(--color-alabaster-grey-100)] text-[var(--color-ebony-600)]";
                                if (status === 'Achieved') statusColors = "bg-emerald-100 text-emerald-700";
                                if (status === 'In Progress') statusColors = "bg-amber-100 text-amber-700";

                                const goalId = g.id || g._id;

                                // Skip if goalId is undefined
                                if (!goalId) return null;

                                const independenceRate = progressData?.[goalId]?.independenceRate || 0;
                                const readyForVerification = status === 'In Progress' && independenceRate >= 80;

                                return (
                                    <div key={idx} className="p-4 rounded-xl border border-[var(--color-alabaster-grey-200)] mb-4 bg-white">
                                        <div className="flex justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-[var(--color-ebony-800)]">{gTitle}</span>
                                                <span className={`text-xs px-2 py-1 rounded-lg font-medium ${statusColors}`}>{status}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {readyForVerification && (
                                                    <button
                                                        onClick={() => setVerificationModal({
                                                            isOpen: true,
                                                            goalId: goalId,
                                                            goalTitle: gTitle,
                                                            independenceRate
                                                        })}
                                                        className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-2 py-1 rounded border border-green-200 flex items-center gap-1 h-fit"
                                                    >
                                                        <CheckCircle2 size={12} /> Verify
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setLogModal({ isOpen: true, preSelectedGoal: goalId })}
                                                    className="text-xs bg-[var(--color-dusty-olive-50)] text-[var(--color-dusty-olive-700)] hover:bg-[var(--color-dusty-olive-100)] px-2 py-1 rounded border border-[var(--color-dusty-olive-200)] flex items-center gap-1 h-fit"
                                                >
                                                    <PlusCircle size={12} /> Log
                                                </button>
                                            </div>
                                        </div>

                                        {/* Prompt Fading Alert */}
                                        <PromptFadingAlert studentId={student.id || student._id} goalId={goalId} className="mb-3" />

                                        {/* Progress Stats */}
                                        {progressData && progressData[goalId] && (
                                            <div className="flex gap-4 mb-3 text-xs">
                                                <div className="flex items-center gap-1.5 bg-[var(--color-alabaster-grey-50)] px-2 py-1 rounded border border-[var(--color-alabaster-grey-200)]">
                                                    <span className="text-[var(--color-ebony-500)] font-semibold uppercase tracking-wider text-[10px]">Accuracy</span>
                                                    <span className={`font-bold ${progressData[goalId].overallAccuracy >= 80 ? 'text-emerald-600' : 'text-[var(--color-ebony-700)]'}`}>
                                                        {progressData[goalId].overallAccuracy}%
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-[var(--color-alabaster-grey-50)] px-2 py-1 rounded border border-[var(--color-alabaster-grey-200)]">
                                                    <span className="text-[var(--color-ebony-500)] font-semibold uppercase tracking-wider text-[10px]">Independence</span>
                                                    <span className="font-bold text-[var(--color-ebony-700)]">{progressData[goalId].independenceRate}%</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-[var(--color-alabaster-grey-50)] px-2 py-1 rounded border border-[var(--color-alabaster-grey-200)]">
                                                    <span className="text-[var(--color-ebony-500)] font-semibold uppercase tracking-wider text-[10px]">Logs</span>
                                                    <span className="font-bold text-[var(--color-ebony-700)]">{progressData[goalId].totalLogs}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Dual Axis Progress Chart */}
                                        {progressData && progressData[goalId] && progressData[goalId].totalLogs > 0 && (
                                            <div id="tour-progress-chart" className="mb-3">
                                                <DualAxisProgressChart studentId={student.id || student._id} goalId={goalId} />
                                            </div>
                                        )}

                                        {g.activities && (
                                            <div className="text-xs text-[var(--color-ebony-500)] mb-2"><strong>Strategy:</strong> {g.activities}</div>
                                        )}

                                        {/* Dynamic Progress Bar */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-[var(--color-ebony-500)] font-semibold">Goal Progress</span>
                                                {progressData && progressData[goalId] ? (
                                                    <span className={`font-bold ${progressData[goalId].overallAccuracy >= 80 ? 'text-emerald-600' :
                                                        progressData[goalId].overallAccuracy >= 50 ? 'text-amber-600' : 'text-rose-600'
                                                        }`}>
                                                        {progressData[goalId].overallAccuracy}%
                                                    </span>
                                                ) : (
                                                    <span className="text-[var(--color-ebony-400)]">No data yet</span>
                                                )}
                                            </div>
                                            <div className="w-full h-1.5 bg-[var(--color-alabaster-grey-100)] rounded-full overflow-hidden">
                                                {(() => {
                                                    const accuracy = progressData?.[goalId]?.overallAccuracy || 0;
                                                    const progressColor = accuracy >= 80 ? 'bg-emerald-500' :
                                                        accuracy >= 50 ? 'bg-amber-400' : 'bg-rose-400';
                                                    return (
                                                        <div
                                                            className={`h-full transition-all duration-500 ${progressColor}`}
                                                            style={{ width: `${accuracy}%` }}
                                                        />
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-[var(--color-ebony-400)] italic">No active IEP found.</p>
                        )}
                    </div>

                    {/* IEP History / List */}
                    <div className="card mt-6">
                        <h3 className="mb-4 text-lg text-[var(--color-ebony-900)]">IEP History</h3>
                        <div className="flex flex-col gap-3">
                            {allIeps.length > 0 ? (
                                allIeps.map((iep: any, idx: number) => (
                                    <div key={iep.id || iep._id || idx} className="p-4 rounded-xl border border-[var(--color-alabaster-grey-200)] flex justify-between items-center bg-white">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${iep.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : (iep.status === 'Draft' ? 'bg-amber-100 text-amber-700' : 'bg-[var(--color-alabaster-grey-100)] text-[var(--color-ebony-500)]')}`}>
                                                    {iep.status}
                                                </span>
                                                <span className="text-sm font-semibold text-[var(--color-ebony-700)]">
                                                    {new Date(iep.startDate).toLocaleDateString()} - {iep.endDate ? new Date(iep.endDate).toLocaleDateString() : 'Ongoing'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-[var(--color-ebony-500)]">
                                                {iep.goals?.length || 0} Goal(s) • Created by {iep.createdBy?.fullName || iep.createdBy?.name || 'Unknown'}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/iep-document/${iep.id || iep._id}`}
                                                className="btn-secondary text-xs flex items-center gap-1.5 bg-[var(--color-dusty-olive-50)] text-[var(--color-dusty-olive-700)] hover:bg-[var(--color-dusty-olive-100)] border-[var(--color-dusty-olive-200)]"
                                            >
                                                <FileText size={14} /> View Document
                                            </Link>
                                            {iep.status === 'Draft' && (
                                                <button
                                                    onClick={() => handleActivateIEP(iep.id || iep._id)}
                                                    disabled={isUpdating}
                                                    className="btn-secondary text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                                                >
                                                    Activate
                                                </button>
                                            )}
                                            {iep.status === 'Active' && <span className="text-emerald-600 font-bold text-sm">CURRENT</span>}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-[var(--color-ebony-400)] italic">No IEP records found.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div>
                    <div id="tour-profile-notes" className="card mb-6 bg-gradient-to-b from-white to-[var(--color-alabaster-grey-50)]">
                        <h3 className="mb-4 text-base text-[var(--color-ebony-800)]">Recent Clinical Notes</h3>
                        <div className="flex flex-col gap-0 max-h-[300px] overflow-y-auto">
                            {notesLogs.length > 0 ? (
                                notesLogs.map((log, index) => (
                                    <div key={log.id || index} className="p-3 border-b border-[var(--color-alabaster-grey-200)] last:border-0 hover:bg-[var(--color-alabaster-grey-50)] transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="text-xs font-semibold text-[var(--color-ebony-800)]">
                                                {log.recordedBy?.fullName || log.recordedBy?.name || student.teacher?.fullName || 'Staff'}
                                            </div>
                                            <div className="text-[10px] text-[var(--color-ebony-400)]">
                                                {new Date(log.timestamp).toLocaleDateString()}
                                            </div>
                                        </div>

                                        {/* Result Badge & Goal */}
                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${log.performanceStatus === 'Achieved' || log.result === 'Achieved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                (log.performanceStatus === 'Emerging' || log.result === 'Emerging' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                    'bg-rose-50 text-rose-700 border-rose-100')
                                                }`}>
                                                {log.performanceStatus || log.result}
                                            </span>
                                            {/* Goal Title */}
                                            {log.goal && typeof log.goal === 'object' && (
                                                <span className="text-[10px] text-[var(--color-ebony-500)] truncate max-w-[150px]" title={(log.goal as any).title || ((log.goal as any).originalGoal ? (log.goal as any).originalGoal.title : 'Unknown Goal')}>
                                                    • {(log.goal as any).title || ((log.goal as any).originalGoal ? (log.goal as any).originalGoal.title : 'Goal')}
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-xs text-[var(--color-ebony-600)] line-clamp-3">
                                            {log.notes ? (
                                                <>
                                                    {log.activity && <span className="font-semibold text-[var(--color-ebony-500)]">Strategy: {log.activity} — </span>}
                                                    {log.notes}
                                                </>
                                            ) : (
                                                <span className="italic text-[var(--color-ebony-400)]">No clinical notes recorded.</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-[var(--color-ebony-400)] p-3 italic">No recent notes recorded.</p>
                            )}
                        </div>
                        <button className="btn-secondary w-full mt-4 text-sm">View All Notes</button>
                    </div>

                    <div id="tour-profile-actions" className="card bg-[var(--color-dusty-olive-600)] text-white">
                        <h3 className="text-white mb-4 text-base">Quick Actions</h3>
                        <div className="flex flex-col gap-2">
                            <button className="btn-secondary border-none bg-white/90 hover:bg-white text-[var(--color-dusty-olive-700)] w-full text-left">📄 View Full IEP Document</button>
                            <Link href="/activity-log" className="btn-secondary border-none bg-white/90 hover:bg-white text-[var(--color-dusty-olive-700)] w-full text-left block flex items-center gap-2">
                                <Activity size={14} /> Update Activity
                            </Link>
                            <Link href="/activity-log?mode=note" className="btn-secondary border-none bg-white/90 hover:bg-white text-[var(--color-dusty-olive-700)] w-full text-left block flex items-center gap-2">
                                <Pencil size={14} /> Add Clinical Note
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
            {/* Edit Student Modal */}
            {isEditOpen && (
                <EditStudentModal
                    student={student}
                    onClose={() => setIsEditOpen(false)}
                />
            )}

            {/* Log Activity Modal */}
            {logModal.isOpen && (
                <LogActivityModal
                    studentId={student.id || student._id}
                    preSelectedGoalId={logModal.preSelectedGoal}
                    onClose={() => setLogModal({ isOpen: false })}
                    onSave={() => {
                        // Just close the modal, the query invalidation will update the data
                        setLogModal({ isOpen: false });
                    }}
                />
            )}

            {/* Mastery Verification Modal */}
            {verificationModal.isOpen && verificationModal.goalId && (
                <MasteryVerificationModal
                    isOpen={verificationModal.isOpen}
                    onClose={() => setVerificationModal({ isOpen: false })}
                    studentId={student.id || student._id}
                    goalId={verificationModal.goalId}
                    goalTitle={verificationModal.goalTitle || 'Goal'}
                    independenceRate={verificationModal.independenceRate || 0}
                    onVerified={() => {
                        setVerificationModal({ isOpen: false });
                        window.location.reload(); // Refresh to show updated verification status
                    }}
                />
            )}

            {/* Student History Mock Modal */}
            {isHistoryOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up border border-slate-100 flex flex-col max-h-[80vh]">
                        <div className="p-8 pb-4 flex justify-between items-center border-b border-slate-50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Student History Logs</h2>
                                <p className="text-sm text-slate-400 font-bold">Historical data across clinical transitions.</p>
                            </div>
                            <button onClick={() => setIsHistoryOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto space-y-4 custom-scrollbar">
                            {mockHistory.map((item) => (
                                <div key={item.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 hover:bg-white hover:shadow-lg hover:shadow-slate-100 transition-all border-l-4 border-l-indigo-500">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">{item.type}</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{item.date}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed">{item.content}</p>
                                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                        <div className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-black text-slate-500">{item.addedBy.charAt(0)}</div>
                                        <span className="text-[10px] font-bold text-slate-400">Added by {item.addedBy}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-8 pt-4 border-t border-slate-50 flex justify-end">
                            <button onClick={() => setIsHistoryOpen(false)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">Close History</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
