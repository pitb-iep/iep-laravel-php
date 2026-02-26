
export const GOAL_OUTCOMES = {
    ACHIEVED: 'Achieved',
    EMERGING: 'Emerging',
    NOT_YET: 'Not Yet'
} as const;

export type GoalOutcome = typeof GOAL_OUTCOMES[keyof typeof GOAL_OUTCOMES];

// Prompt levels for ABA therapy tracking (matches backend model)
export const PROMPT_LEVELS = [
    { value: 'Independent', label: 'Independent (No Prompt)', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    { value: 'Verbal', label: 'Verbal Prompt', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { value: 'Gestural', label: 'Gestural Prompt', color: 'bg-amber-50 border-amber-200 text-amber-700' },
    { value: 'Modeling', label: 'Modeling', color: 'bg-purple-50 border-purple-200 text-purple-700' },
    { value: 'Physical', label: 'Physical Prompt', color: 'bg-rose-50 border-rose-200 text-rose-700' },
] as const;

export type PromptLevel = typeof PROMPT_LEVELS[number]['value'];

// Session types for distinguishing teaching from baseline/probe
export const SESSION_TYPES = [
    { value: 'Teaching', label: 'Teaching Session' },
    { value: 'Probe', label: 'Probe (No Prompts)' },
    { value: 'Baseline', label: 'Baseline' },
    { value: 'Generalization', label: 'Generalization' },
    { value: 'Maintenance', label: 'Maintenance' },
] as const;

export type SessionType = typeof SESSION_TYPES[number]['value'];

// Teaching strategies/methods used during sessions (different from prompt levels)
// These describe HOW instruction is delivered, not the level of prompting
export const TEACHING_STRATEGIES = [
    { value: 'Discrete Trial Training (DTT)', label: 'Discrete Trial Training (DTT)' },
    { value: 'Natural Environment Teaching (NET)', label: 'Natural Environment Teaching (NET)' },
    { value: 'Errorless Teaching', label: 'Errorless Teaching' },
    { value: 'PECS', label: 'Picture Exchange (PECS)' },
    { value: 'Video Modeling', label: 'Video Modeling' },
    { value: 'Peer Modeling', label: 'Peer Modeling' },
    { value: 'Social Stories', label: 'Social Stories' },
    { value: 'Token Economy', label: 'Token Economy' },
    { value: 'Visual Schedule', label: 'Visual Schedule' },
    { value: 'Task Analysis', label: 'Task Analysis' },
    { value: 'Incidental Teaching', label: 'Incidental Teaching' },
    { value: 'Pivotal Response Training (PRT)', label: 'Pivotal Response Training (PRT)' },
];

export const NOTE_CATEGORIES = [
    { id: 'general', label: 'General', color: 'bg-slate-100 text-slate-600 border-slate-200' },
    { id: 'urgent', label: 'Urgent', color: 'bg-rose-100 text-rose-700 border-rose-200' },
    { id: 'todo', label: 'To Do', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { id: 'idea', label: 'Idea', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
] as const;
