'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import {
    ArrowLeft, FileText, User, Users, ClipboardList, Target, BookOpen,
    Calendar, Settings, Clock, Sparkles, CheckCircle2, HelpCircle, Printer,
    Download, List, GraduationCap, AlertTriangle
} from 'lucide-react';
import type { IEP, Student, GoalRef, Incident } from '@/types';

interface PageParams {
    id: string;
}

// Table of Contents item
interface TOCItem {
    id: string;
    title: string;
    icon: React.ElementType;
}

// Section component for consistent styling
function Section({ id, title, icon: Icon, children, tourId }: { id?: string; title: string; icon: React.ElementType; children: React.ReactNode; tourId?: string }) {
    return (
        <section id={tourId || id} className="bg-white rounded-xl border border-[var(--color-dusty-olive-200)] shadow-sm overflow-hidden break-inside-avoid print:border print:border-[var(--color-dusty-olive-100)] print:shadow-none print:bg-transparent print:mb-4 print:rounded-lg">
            <div className="bg-gradient-to-r from-[var(--color-alabaster-grey-50)] to-white px-6 py-4 border-b border-[var(--color-alabaster-grey-200)] flex items-center gap-3 print:bg-[var(--color-alabaster-grey-50)] print:border-b print:border-[var(--color-dusty-olive-100)] print:px-3 print:py-2">
                <div className="p-2 rounded-lg bg-[var(--color-dusty-olive-50)] print:bg-transparent print:p-0 print:hidden">
                    <Icon className="w-5 h-5 text-[var(--color-dusty-olive-600)] print:hidden" />
                </div>
                <h2 className="text-lg font-bold text-[var(--color-ebony-900)] print:text-base print:uppercase print:tracking-tight print:text-[var(--color-dusty-olive-700)]">{title}</h2>
            </div>
            <div className="p-6 print:p-3">{children}</div>
        </section>
    );
}

// Info Row component
function InfoRow({ label, value }: { label: string; value: string | React.ReactNode }) {
    return (
        <div className="flex print:text-xs print:py-0.5">
            <div className="w-40 text-sm font-medium text-slate-500 print:text-xs print:w-32 print:font-semibold print:text-[var(--color-ebony-600)]">{label}</div>
            <div className="flex-1 text-sm text-slate-800 print:text-xs print:text-[var(--color-ebony-900)]">{value || <span className="text-slate-300">—</span>}</div>
        </div>
    );
}

// Table of Contents Component
function TableOfContents({ items, activeSection }: { items: TOCItem[]; activeSection: string }) {
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <nav className="hidden xl:block fixed right-8 top-32 w-56 bg-white/80 backdrop-blur-sm rounded-xl border border-[var(--color-dusty-olive-200)] p-4 shadow-lg print-hidden">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-[var(--color-dusty-olive-500)] mb-3">
                <List size={14} />
                On This Page
            </div>
            <ul className="space-y-1">
                {items.map((item) => (
                    <li key={item.id}>
                        <button
                            onClick={() => scrollToSection(item.id)}
                            className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${activeSection === item.id
                                ? 'bg-[var(--color-dusty-olive-50)] text-[var(--color-dusty-olive-700)] font-medium'
                                : 'text-[var(--color-ebony-500)] hover:bg-[var(--color-alabaster-grey-100)]'
                                }`}
                        >
                            <item.icon size={14} className="flex-shrink-0" />
                            <span className="truncate">{item.title}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export default function IEPDocumentPage({ params }: { params: Promise<PageParams> }) {
    const { id } = use(params);
    const [showTour, setShowTour] = useState(false);
    const [activeSection, setActiveSection] = useState('tour-student-info');

    // Table of contents items
    const tocItems: TOCItem[] = [
        { id: 'tour-student-info', title: 'Student Info', icon: User },
        { id: 'tour-team-members', title: 'IEP Team', icon: Users },
        { id: 'tour-plaafp', title: 'Present Levels', icon: ClipboardList },
        { id: 'tour-related-services', title: 'Services', icon: Clock },
        { id: 'tour-annual-goals', title: 'Annual Goals', icon: Target },
        { id: 'tour-accommodations', title: 'Accommodations', icon: Settings },
        { id: 'tour-transition', title: 'Transition', icon: Sparkles },
        { id: 'tour-esy', title: 'ESY Services', icon: Calendar },
        { id: 'tour-incidents', title: 'Incidents', icon: AlertTriangle },
        { id: 'signatures', title: 'Signatures', icon: BookOpen },
    ];

    // Fetch IEP with student data
    const { data, isLoading, error } = useQuery<{ iep: IEP; student: Student }>({
        queryKey: ['iep-document', id],
        queryFn: async () => {
            // First get the IEP
            const iepRes = await fetch(`/api/ieps/${id}`);
            const iepData = await iepRes.json();
            const iep = iepData.success ? iepData.data : null;

            if (!iep) throw new Error('IEP not found');

            // Get student details
            const studentId = typeof iep.student === 'object' ? iep.student._id || iep.student.id : iep.student;
            const studentRes = await fetch(`/api/students/${studentId}`);
            const studentData = await studentRes.json();
            const student = studentData.success ? studentData.data : null;

            return { iep, student };
        }
    });

    // Fetch student incidents
    const { data: incidents = [] } = useQuery<Incident[]>({
        queryKey: ['student-incidents', data?.student?._id || data?.student?.id],
        queryFn: async () => {
            const studentId = data?.student?._id || data?.student?.id;
            if (!studentId) return [];
            const res = await fetch(`/api/incidents/student/${studentId}`);
            const result = await res.json();
            return result.success ? result.data : [];
        },
        enabled: !!data?.student
    });

    const iep = data?.iep;
    const student = data?.student;

    // Set document title for PDF filename
    useEffect(() => {
        if (student && student.name) {
            document.title = `IEP - ${student.name}`;
        }
        return () => {
            document.title = 'AUTISM360'; // Reset on unmount
        };
    }, [student]);

    // Track active section with intersection observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: '-100px 0px -50% 0px' }
        );

        tocItems.forEach((item) => {
            const element = document.getElementById(item.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [data]);

    // Initialize tour
    useEffect(() => {
        if (showTour) {
            const driverObj = driver({
                showProgress: true,
                animate: true,
                allowClose: true,
                doneBtnText: 'Finish Tour',
                nextBtnText: 'Next',
                prevBtnText: 'Back',
                onDestroyed: () => setShowTour(false),
                steps: [
                    { element: '#tour-student-info', popover: { title: '🧑‍🎓 Student Information', description: "Basic student profile including name, DOB, and program stream.", side: 'bottom' } },
                    { element: '#tour-team-members', popover: { title: '👥 IEP Team', description: "Team members involved in the IEP including teachers, parents, and specialists.", side: 'bottom' } },
                    { element: '#tour-plaafp', popover: { title: '📋 Present Levels (PLAAFP)', description: "Current academic achievement and functional performance levels.", side: 'bottom' } },
                    { element: '#tour-related-services', popover: { title: '🏥 Related Services', description: "Therapy services including frequency and duration.", side: 'bottom' } },
                    { element: '#tour-annual-goals', popover: { title: '🎯 Annual Goals', description: "Measurable goals with objectives and progress tracking.", side: 'bottom' } },
                    { element: '#tour-accommodations', popover: { title: '⚙️ Accommodations', description: "Instructional, environmental, and assessment supports.", side: 'bottom' } },
                    { element: '#tour-transition', popover: { title: '🚀 Transition Plan', description: "Post-secondary goals for students 14 and older.", side: 'bottom' } },
                    { element: '#tour-esy', popover: { title: '📅 Extended School Year', description: "ESY services during summer and breaks.", side: 'bottom' } },
                ]
            });
            driverObj.drive();
        }
    }, [showTour]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (error || !iep || !student) {
        return (
            <div className="text-center py-20">
                <div className="text-6xl mb-4">📄</div>
                <h2 className="text-2xl font-bold text-slate-700 mb-2">IEP Not Found</h2>
                <p className="text-slate-500 mb-6">Unable to load this IEP document.</p>
                <Link href="/students" className="btn-primary">View Students</Link>
            </div>
        );
    }

    const age = student.dob ? Math.floor((Date.now() - new Date(student.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;
    const showTransition = age && age >= 14;
    const printDate = new Date().toLocaleDateString();

    return (
        <>
            {/* Print-only Header */}
            <div className="iep-print-header hidden print:block mb-8">
                <div className="flex flex-col items-center justify-center gap-4 mb-6">
                    {/* Placeholder for Logo if needed in print */}
                    <div className="text-2xl font-bold tracking-tight text-[var(--color-ebony-900)]">Maryam Nawaz School and Resource Centre for Autism</div>
                    <h1 className="text-xl font-medium text-[var(--color-dusty-olive-600)] uppercase tracking-wide">Individualized Education Program</h1>
                </div>
                <div className="flex justify-between border-y border-[var(--color-dusty-olive-200)] py-4 text-sm text-[var(--color-ebony-700)]">
                    <div><span className="font-bold text-[var(--color-ebony-900)]">Student:</span> {student.name}</div>
                    <div><span className="font-bold text-[var(--color-ebony-900)]">IEP Period:</span> {iep.startDate ? new Date(iep.startDate).toLocaleDateString() : ''} – {iep.endDate ? new Date(iep.endDate).toLocaleDateString() : ''}</div>
                    <div><span className="font-bold text-[var(--color-ebony-900)]">Date:</span> {printDate}</div>
                </div>
            </div>

            <div className="animate-fade-in max-w-5xl mx-auto pb-20 xl:mr-64 print:mr-0 print:pb-0 print:max-w-none">
                {/* Table of Contents - Fixed Sidebar */}
                <TableOfContents items={tocItems} activeSection={activeSection} />

                {/* Navigation & Actions */}
                <div className="flex items-center justify-between mb-6 print-hidden">
                    <Link href={`/students/${student.id || student._id}`} className="inline-flex items-center gap-2 text-sm text-[var(--color-ebony-500)] hover:text-[var(--color-dusty-olive-600)] transition-colors">
                        <ArrowLeft size={16} /> Back to Student Profile
                    </Link>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowTour(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-dusty-olive-600)] bg-[var(--color-dusty-olive-50)] hover:bg-[var(--color-dusty-olive-100)] rounded-lg transition-colors"
                        >
                            <HelpCircle size={16} /> Guide Me
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-ebony-600)] bg-[var(--color-alabaster-grey-100)] hover:bg-[var(--color-alabaster-grey-200)] rounded-lg transition-colors"
                        >
                            <Printer size={16} /> Print / PDF
                        </button>
                    </div>
                </div>

                {/* Header */}
                <div className="bg-gradient-to-br from-[var(--color-dusty-olive-600)] to-[var(--color-dusty-olive-700)] rounded-2xl p-8 mb-8 text-white shadow-xl shadow-[rgba(97,112,92,0.2)] iep-header-gradient print:hidden">
                    <div className="flex items-center gap-2 text-[var(--color-dusty-olive-50)] text-sm mb-2">
                        <FileText size={16} />
                        Individualized Education Program
                    </div>
                    <h1 className="text-3xl font-bold mb-1 !text-white">{student.name}</h1>
                    <div className="flex items-center gap-6 mt-4 text-sm text-[var(--color-dusty-olive-100)] flex-wrap">
                        <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {iep.startDate ? new Date(iep.startDate).toLocaleDateString() : 'Start'} — {iep.endDate ? new Date(iep.endDate).toLocaleDateString() : 'End'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${iep.status === 'Active' ? 'bg-emerald-500' : 'bg-[var(--color-ebony-500)]'}`}>
                            {iep.status}
                        </span>
                        {iep.updatedAt && (
                            <span className="text-xs opacity-75">
                                Last Updated: {new Date(iep.updatedAt).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>

                {/* Sections */}
                <div className="space-y-8 print:space-y-4 print:text-[12px] print:leading-tight">
                    {/* 1. Student Information */}
                    <Section title="Student Information" icon={User} tourId="tour-student-info">
                        <div className="grid md:grid-cols-2 gap-4 print:gap-2 print:gap-y-1">
                            <InfoRow label="Student Name" value={student.name} />
                            <InfoRow label="Date of Birth" value={student.dob ? new Date(student.dob).toLocaleDateString() : ''} />
                            <InfoRow label="Age" value={age ? `${age} years` : ''} />
                            <InfoRow label="Program Stream" value={student.programStream} />
                            <InfoRow label="Diagnosis" value={student.diagnosis} />
                            <InfoRow label="IEP Period" value={`${iep.startDate ? new Date(iep.startDate).toLocaleDateString() : ''} – ${iep.endDate ? new Date(iep.endDate).toLocaleDateString() : ''}`} />
                        </div>
                    </Section>

                    {/* 2. Team Members */}
                    <Section title="IEP Team Members" icon={Users} tourId="tour-team-members">
                        {iep.teamMembers && iep.teamMembers.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-3 print:grid-cols-3 print:gap-2">
                                {iep.teamMembers.map((member, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg print:bg-[var(--color-alabaster-grey-50)] print:border print:border-[var(--color-dusty-olive-100)] print:p-2 print:gap-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 print:hidden">
                                            {member.name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-800 print:text-[11px] print:font-semibold">{member.name || 'Unnamed'}</div>
                                            <div className="text-xs text-slate-500 print:text-[10px]">{member.role}</div>
                                        </div>
                                        {member.attended !== undefined && (
                                            <span className={`ml-auto text-xs px-2 py-0.5 rounded ${member.attended ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'} print:hidden`}>
                                                {member.attended ? 'Present' : 'Absent'}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 italic">No team members specified</p>
                        )}
                    </Section>

                    {/* 3. PLAAFP */}
                    <Section title="Present Levels of Academic Achievement & Functional Performance" icon={ClipboardList} tourId="tour-plaafp">
                        <div className="space-y-4">
                            {iep.presentLevelSummary?.strengths && (
                                <div>
                                    <div className="text-xs font-bold uppercase text-slate-500 mb-1">Strengths, Interests & Preferences</div>
                                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg print:bg-white print:border print:border-slate-200">{iep.presentLevelSummary.strengths}</p>
                                </div>
                            )}
                            {iep.presentLevelSummary?.concerns && (
                                <div>
                                    <div className="text-xs font-bold uppercase text-slate-500 mb-1">Parent Concerns</div>
                                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg print:bg-white print:border print:border-slate-200">{iep.presentLevelSummary.concerns}</p>
                                </div>
                            )}
                            {iep.presentLevelSummary?.impact && (
                                <div>
                                    <div className="text-xs font-bold uppercase text-slate-500 mb-1">Impact of Disability</div>
                                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg print:bg-white print:border print:border-slate-200">{iep.presentLevelSummary.impact}</p>
                                </div>
                            )}
                            {!iep.presentLevelSummary?.strengths && !iep.presentLevelSummary?.concerns && !iep.presentLevelSummary?.impact && (
                                <p className="text-slate-400 italic">No present level information recorded</p>
                            )}
                        </div>
                    </Section>

                    {/* 4. Related Services */}
                    <Section title="Related Services" icon={Clock} tourId="tour-related-services">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-2 font-semibold text-slate-600">Service</th>
                                        <th className="text-left py-2 font-semibold text-slate-600">Frequency</th>
                                        <th className="text-left py-2 font-semibold text-slate-600">Duration</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {student.activeTherapies?.map((therapy: string, idx: number) => (
                                        <tr key={idx}>
                                            <td className="py-2 text-slate-800">{therapy}</td>
                                            <td className="py-2 text-slate-600">As scheduled</td>
                                            <td className="py-2 text-slate-600">Per session</td>
                                        </tr>
                                    )) || (
                                            <tr><td colSpan={3} className="py-4 text-slate-400 italic text-center">No related services specified</td></tr>
                                        )}
                                </tbody>
                            </table>
                        </div>
                    </Section>

                    {/* 5. Annual Goals - Page break before in print */}
                    <div className="print-page-break">
                        <Section title="Annual Goals & Objectives" icon={Target} tourId="tour-annual-goals">
                            {iep.goals && iep.goals.length > 0 ? (
                                <div className="space-y-4">
                                    {iep.goals.map((goal: GoalRef, idx: number) => {
                                        const goalTitle = typeof goal.originalGoal === 'object' ? goal.originalGoal.title : 'Goal';
                                        const goalDesc = typeof goal.originalGoal === 'object' ? goal.originalGoal.description : '';
                                        return (
                                            <div key={idx} className="border border-slate-200 rounded-xl p-4 goal-card print:border print:border-[var(--color-dusty-olive-100)] print:bg-[var(--color-alabaster-grey-50)] print:p-3 print:mb-3 print:rounded-lg break-inside-avoid">
                                                <div className="flex items-start justify-between gap-4 mb-3 print:mb-2">
                                                    <div>
                                                        <div className="text-xs font-bold text-indigo-600 mb-1 print:text-[10px] print:text-[var(--color-dusty-olive-700)]">Goal #{idx + 1}</div>
                                                        <h4 className="font-bold text-slate-800 print:text-[12px] print:text-[var(--color-ebony-900)]">{goalTitle}</h4>
                                                        {goalDesc && <p className="text-sm text-slate-500 mt-1 print:text-[11px] print:mt-0.5 print:text-[var(--color-ebony-600)]">{goalDesc}</p>}
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-xs font-bold flex-shrink-0 ${goal.status === 'Achieved' ? 'bg-emerald-100 text-emerald-700' :
                                                        goal.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-slate-100 text-slate-600'
                                                        }`}>
                                                        {goal.status}
                                                    </span>
                                                </div>
                                                <div className="grid md:grid-cols-3 gap-3 text-sm print:grid-cols-3 print:text-[10px] print:gap-2">
                                                    <div className="bg-slate-50 p-2 rounded print:bg-white print:border print:border-[var(--color-dusty-olive-100)] print:p-1.5 print:rounded">
                                                        <span className="text-xs text-slate-500 print:text-[9px] print:uppercase print:tracking-wider">Target Date</span>
                                                        <div className="font-medium">{goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : '—'}</div>
                                                    </div>
                                                    <div className="bg-slate-50 p-2 rounded print:bg-white print:border print:border-[var(--color-dusty-olive-100)] print:p-1.5 print:rounded">
                                                        <span className="text-xs text-slate-500 print:text-[9px] print:uppercase print:tracking-wider">Trials Target</span>
                                                        <div className="font-medium">{goal.customTrialsTarget || 10}</div>
                                                    </div>
                                                    <div className="bg-slate-50 p-2 rounded print:bg-white print:border print:border-[var(--color-dusty-olive-100)] print:p-1.5 print:rounded">
                                                        <span className="text-xs text-slate-500 print:text-[9px] print:uppercase print:tracking-wider">Teaching Strategy</span>
                                                        <div className="font-medium text-sm print:text-[10px]">{goal.activities || '—'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-slate-400 italic">No goals defined</p>
                            )}
                        </Section>
                    </div>

                    {/* 6. Accommodations */}
                    <Section title="Accommodations & Modifications" icon={Settings} tourId="tour-accommodations">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <div className="text-xs font-bold uppercase text-slate-500 mb-2">Instructional</div>
                                {iep.accommodations?.instructional?.length ? (
                                    <ul className="space-y-1">
                                        {iep.accommodations.instructional.map((item: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                                <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-sm text-slate-400 italic">None specified</p>}
                            </div>
                            <div>
                                <div className="text-xs font-bold uppercase text-slate-500 mb-2">Environmental</div>
                                {iep.accommodations?.environmental?.length ? (
                                    <ul className="space-y-1">
                                        {iep.accommodations.environmental.map((item: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                                <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-sm text-slate-400 italic">None specified</p>}
                            </div>
                            <div>
                                <div className="text-xs font-bold uppercase text-slate-500 mb-2">Assessment</div>
                                {iep.accommodations?.assessment?.length ? (
                                    <ul className="space-y-1">
                                        {iep.accommodations.assessment.map((item: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                                <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-sm text-slate-400 italic">None specified</p>}
                            </div>
                        </div>
                    </Section>

                    {/* 7. Transition Plan (if age 14+) */}
                    {showTransition && (
                        <Section title="Transition Plan" icon={Sparkles} tourId="tour-transition">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-lg print:bg-white print:border print:border-slate-200">
                                    <div className="text-xs font-bold uppercase text-slate-500 mb-2">Post-Secondary Education</div>
                                    <p className="text-sm text-slate-700">{iep.transitionPlan?.postSecondary || <span className="italic text-slate-400">Not specified</span>}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-lg print:bg-white print:border print:border-slate-200">
                                    <div className="text-xs font-bold uppercase text-slate-500 mb-2">Vocational Training</div>
                                    <p className="text-sm text-slate-700">{iep.transitionPlan?.vocational || <span className="italic text-slate-400">Not specified</span>}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-lg print:bg-white print:border print:border-slate-200">
                                    <div className="text-xs font-bold uppercase text-slate-500 mb-2">Independent Living</div>
                                    <p className="text-sm text-slate-700">{iep.transitionPlan?.independentLiving || <span className="italic text-slate-400">Not specified</span>}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-lg print:bg-white print:border print:border-slate-200">
                                    <div className="text-xs font-bold uppercase text-slate-500 mb-2">Community Participation</div>
                                    <p className="text-sm text-slate-700">{iep.transitionPlan?.community || <span className="italic text-slate-400">Not specified</span>}</p>
                                </div>
                            </div>
                        </Section>
                    )}

                    {/* 8. Extended School Year */}
                    <Section title="Extended School Year (ESY) Services" icon={Calendar} tourId="tour-esy">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs font-bold uppercase text-slate-500 mb-2">ESY Required?</div>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${iep.esy?.required ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {iep.esy?.required ? 'Yes' : 'No'}
                                </span>
                            </div>
                            {iep.esy?.required && (
                                <>
                                    <div>
                                        <div className="text-xs font-bold uppercase text-slate-500 mb-2">Justification</div>
                                        <p className="text-sm text-slate-700">{iep.esy?.justification || '—'}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <div className="text-xs font-bold uppercase text-slate-500 mb-2">Services Provided</div>
                                        <p className="text-sm text-slate-700">{iep.esy?.services || '—'}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </Section>

                    {/* 9. Critical Incidents */}
                    <Section title="Incident Reports" icon={AlertTriangle} tourId="tour-incidents">
                        {incidents.length === 0 ? (
                            <p className="text-sm text-slate-500">No incidents reported for this student.</p>
                        ) : (
                            <>
                                <p className="text-sm text-slate-500 mb-4">
                                    {incidents.length} incident{incidents.length !== 1 ? 's' : ''} on file for this student.
                                </p>
                                <div className="space-y-2 mb-4 print:hidden">
                                    {incidents.slice(0, 3).map((incident) => (
                                        <div key={incident._id || incident.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${incident.severity === 'Critical' ? 'bg-red-500' :
                                                    incident.severity === 'High' ? 'bg-orange-500' :
                                                        incident.severity === 'Medium' ? 'bg-amber-500' : 'bg-slate-400'
                                                    }`} />
                                                <div>
                                                    <div className="text-sm font-medium text-slate-800">{incident.incidentType}</div>
                                                    <div className="text-xs text-slate-500">{new Date(incident.date).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${incident.status === 'Open' ? 'bg-red-100 text-red-700' :
                                                incident.status === 'Under Review' ? 'bg-amber-100 text-amber-700' :
                                                    incident.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {incident.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                {/* Print version */}
                                <div className="hidden print:block">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-300">
                                                <th className="text-left py-2">Date</th>
                                                <th className="text-left py-2">Type</th>
                                                <th className="text-left py-2">Severity</th>
                                                <th className="text-left py-2">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {incidents.slice(0, 5).map((incident) => (
                                                <tr key={incident._id || incident.id} className="border-b border-slate-200">
                                                    <td className="py-2">{new Date(incident.date).toLocaleDateString()}</td>
                                                    <td className="py-2">{incident.incidentType}</td>
                                                    <td className="py-2">{incident.severity}</td>
                                                    <td className="py-2">{incident.status}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <Link
                                    href={`/incidents?studentId=${student._id || student.id}`}
                                    className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium print:hidden"
                                >
                                    View All Incidents <ArrowLeft size={14} className="rotate-180" />
                                </Link>
                            </>
                        )}
                    </Section>

                    {/* 10. Signatures - Page break before in print */}
                    <div className="print-page-break">
                        <Section title="Signatures" icon={BookOpen} id="signatures">
                            <p className="text-sm text-slate-500 mb-4 print:hidden">By signing below, team members acknowledge participation in the IEP development process.</p>
                            <div className="grid md:grid-cols-2 gap-6">
                                {['Parent/Guardian', 'Special Education Teacher', 'Administrator', 'Service Provider'].map((role, idx) => (
                                    <div key={idx} className="pb-4">
                                        <div className="text-xs font-medium text-slate-500 mb-2">{role}</div>
                                        <div className="h-10 border-b-2 border-slate-300 mb-2 signature-line"></div>
                                        <div className="flex justify-between text-xs text-slate-400">
                                            <span>Signature</span>
                                            <span>Date: ____________</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    </div>
                </div>
            </div>

            {/* Print Footer */}
            <div className="iep-print-footer hidden print:block">
                <p>IEP Document for {student.name} • Page <span className="page-number"></span></p>
            </div>
        </>
    );
}
