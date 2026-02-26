import { addDays, isBefore, parseISO, differenceInDays } from 'date-fns';

export function calculateStudentStats(students: any[]) {
    if (!students || !Array.isArray(students)) {
        return {
            totalStudents: 0,
            activeIEPs: 0,
            complianceRate: 0,
            needsAttention: []
        };
    }

    const totalStudents = students.length;

    // 1. Compliance: Count Active IEPs
    const activeIEPStudents = students.filter((s: any) =>
        Array.isArray(s.ieps) && s.ieps.some((i: any) => i.status === 'Active')
    ).length;

    const complianceRate = totalStudents > 0
        ? Math.round((activeIEPStudents / totalStudents) * 100)
        : 0;
    // 1b. Average Mastery (Rubric Level)
    let totalRubricPoints = 0;
    let totalRubricLogs = 0;

    students.forEach(s => {
        if (s.logs) {
            s.logs.forEach((l: any) => {
                if (l.rubricLevel) {
                    totalRubricPoints += l.rubricLevel;
                    totalRubricLogs++;
                }
            });
        }
    });

    const avgMastery = totalRubricLogs > 0
        ? parseFloat((totalRubricPoints / totalRubricLogs).toFixed(1))
        : 0; // 0 means no data

    // 2. Needs Attention List
    const needsAttention: any[] = [];

    students.forEach((s: any) => {
        // A. Review Due (within 30 days)
        if (s.reviewDate) {
            const reviewDate = parseISO(s.reviewDate);
            const thirtyDaysFromNow = addDays(new Date(), 30);

            if (isBefore(reviewDate, thirtyDaysFromNow)) {
                const daysLeft = differenceInDays(reviewDate, new Date());
                needsAttention.push({
                    id: `review-${s.id || s._id}`,
                    type: 'review_due',
                    studentName: s.name,
                    message: `IEP Review due in ${daysLeft} days`,
                    priority: daysLeft < 7 ? 'high' : 'medium',
                    link: `/students/${s.id || s._id}`
                });
            }
        }

        // B. Stalled Goals
        if (s.logs && s.logs.length > 0) {
            const logsByGoal = s.logs.reduce((acc: any, log: any) => {
                const gId = log.goalId;
                if (!acc[gId]) acc[gId] = [];
                acc[gId].push(log);
                return acc;
            }, {});

            Object.keys(logsByGoal).forEach(goalId => {
                const goalLogs = logsByGoal[goalId].sort((a: any, b: any) =>
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );

                // Check last 3
                if (goalLogs.length >= 3) {
                    const recent = goalLogs.slice(0, 3);

                    // Stalled if consistently low rubric level (<= 2) or 'Not Yet'
                    const allStruggling = recent.every((l: any) =>
                        (l.rubricLevel && l.rubricLevel <= 2) ||
                        (!l.rubricLevel && (l.result === 'Not Yet' || l.performanceStatus === 'Not Yet'))
                    );

                    if (allStruggling) {
                        needsAttention.push({
                            id: `stalled-${s.id || s._id}-${goalId}`,
                            type: 'stalled_goal',
                            studentName: s.name,
                            message: `Goal stalled (${recent[0].goal?.title || recent[0].goalTitle || 'Unknown Goal'})`,
                            priority: 'medium',
                            link: `/students/${s.id || s._id}`
                        });
                    }
                }
            });
        }
    });

    const prioritizedAttention = needsAttention
        .sort((a, b) => (a.priority === 'high' ? -1 : 1))
        .slice(0, 5);

    return {
        totalStudents,
        activeIEPs: activeIEPStudents,
        complianceRate,
        avgMastery,
        needsAttention: prioritizedAttention
    };
}
