interface Log {
    id: string;
    studentId: string;
    goalId: string;
    result: string; // 'Achieved' | 'Not Yet' | 'Promising'
    activity?: string;
    timestamp: string;
    studentName?: string;
    goalTitle?: string;
}

interface Student {
    id: string;
    name: string;
    logs?: Log[];
}

interface ActivityFeedProps {
    students: Student[];
}

export default function ActivityFeed({ students }: ActivityFeedProps) {
    const logs = students
        .flatMap(student => (student.logs || []).map(log => ({ ...log, studentName: student.name })))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (!logs || logs.length === 0) {
        return (
            <div className="text-center p-8 text-slate-400">
                <div className="text-5xl mb-4 opacity-30">📋</div>
                <p>No activity recorded yet.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            {logs.map((log) => {
                const date = new Date(log.timestamp);
                const dateStr = date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

                let bgColor = '#f59e0b'; // Promising
                let icon = '📈';
                if (log.result === 'Achieved') {
                    bgColor = '#6366f1';
                    icon = '🏆';
                } else if (log.result === 'Not Yet') {
                    bgColor = '#ef4444';
                    icon = '⏳';
                }

                return (
                    <div key={log.id} className="flex items-start py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors px-2 rounded-lg">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center mr-4 shrink-0 shadow-sm text-lg"
                            style={{ backgroundColor: bgColor }}
                        >
                            <span className="text-white drop-shadow-sm">{icon}</span>
                        </div>
                        <div className="flex-1">
                            <div className="text-[0.95rem] text-slate-900 leading-snug mb-0.5">
                                <span className="font-semibold">{log.studentName || 'Student'}</span> recorded: <span className="font-bold text-blue-500">{log.result}</span>
                            </div>
                            <div className="text-xs font-medium text-slate-900 my-0.5">
                                {log.goalTitle || 'Unknown Goal'}
                            </div>
                            {log.activity && (
                                <div className="text-xs text-slate-500 italic">Strategy: {log.activity}</div>
                            )}
                            <div className="text-xs text-slate-400 font-normal mt-1">{dateStr} {timeStr}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
