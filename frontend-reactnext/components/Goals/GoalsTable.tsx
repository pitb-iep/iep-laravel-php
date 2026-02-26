'use client';

import React, { useState, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    createColumnHelper,
    SortingState,
    RowSelectionState,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, Search, Check, ChevronLeft, ChevronRight, Target, Sparkles, ListChecks } from 'lucide-react';

// Colour palettes for the various enum values
const SKILL_TYPE_COLORS: Record<string, string> = {
    // Therapy approaches
    ABA: 'bg-purple-100 text-purple-700',
    TEACCH: 'bg-blue-100 text-blue-700',
    Speech: 'bg-sky-100 text-sky-700',
    OT: 'bg-orange-100 text-orange-700',
    PT: 'bg-red-100 text-red-700',
    // Domain types
    Functional: 'bg-teal-100 text-teal-700',
    ADL: 'bg-lime-100 text-lime-700',
    Social: 'bg-pink-100 text-pink-700',
    Academic: 'bg-indigo-100 text-indigo-700',
    Motor: 'bg-yellow-100 text-yellow-700',
    Behavior: 'bg-rose-100 text-rose-700',
    Safety: 'bg-amber-100 text-amber-700',
    // Extended
    Vocational: 'bg-cyan-100 text-cyan-700',
    Sensory: 'bg-violet-100 text-violet-700',
    Islamic: 'bg-emerald-100 text-emerald-700',
    Creative: 'bg-fuchsia-100 text-fuchsia-700',
    Technology: 'bg-slate-100 text-slate-600',
    Civic: 'bg-green-100 text-green-700',
    default: 'bg-slate-100 text-slate-500',
};

const TIER_STYLES: Record<string, { label: string; cls: string }> = {
    A: { label: 'Tier A — Foundational', cls: 'bg-blue-50  text-blue-600 border border-blue-200' },
    B: { label: 'Tier B — Emerging', cls: 'bg-amber-50 text-amber-600 border border-amber-200' },
    C: { label: 'Tier C — Advanced', cls: 'bg-green-50 text-green-700 border border-green-200' },
};

const PROMPT_COLORS: Record<string, string> = {
    Physical: 'text-red-600',
    Modeling: 'text-orange-600',
    Gestural: 'text-amber-600',
    Verbal: 'text-blue-600',
    Visual: 'text-violet-600',
    Independent: 'text-green-600',
    None: 'text-slate-400',
};

interface Goal {
    id: string;
    _id?: string;
    code?: string;
    title: string;
    description?: string;
    tier?: string;
    ageGroup?: string;
    objectives?: string[];
    skillType?: string;
    promptLevel?: string;
    masteryCriteria?: string;
    subSkillTitle?: string;
}

interface GoalsTableProps {
    goals: Goal[];
    subSkillTitle?: string;
    onSelectionChange?: (selectedGoals: Goal[]) => void;
    selectable?: boolean;
}

const columnHelper = createColumnHelper<Goal>();

export default function GoalsTable({ goals, subSkillTitle, onSelectionChange, selectable = false }: GoalsTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [tierFilter, setTierFilter] = useState<string>('');

    // Notify parent of selection changes
    React.useEffect(() => {
        if (onSelectionChange) {
            const selectedGoals = Object.keys(rowSelection)
                .filter(key => rowSelection[key])
                .map(key => goals[parseInt(key)]);
            onSelectionChange(selectedGoals);
        }
    }, [rowSelection, goals, onSelectionChange]);

    // Client-side tier filter
    const filteredGoals = useMemo(() =>
        tierFilter ? goals.filter(g => g.tier === tierFilter) : goals,
        [goals, tierFilter]
    );

    const columns = useMemo(() => [
        ...(selectable ? [
            columnHelper.display({
                id: 'select',
                header: ({ table }) => (
                    <input
                        type="checkbox"
                        checked={table.getIsAllRowsSelected()}
                        onChange={table.getToggleAllRowsSelectedHandler()}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                ),
                cell: ({ row }) => (
                    <input
                        type="checkbox"
                        checked={row.getIsSelected()}
                        onChange={row.getToggleSelectedHandler()}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                ),
            })
        ] : []),

        // Code + Title combined
        columnHelper.accessor('title', {
            header: 'Goal',
            cell: info => {
                const goal = info.row.original;
                const isExpanded = expanded[goal.id];
                return (
                    <div className="space-y-1">
                        <div className="flex items-start gap-2">
                            {goal.code && (
                                <span className="shrink-0 font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5">
                                    {goal.code}
                                </span>
                            )}
                            <div className="font-medium text-slate-800">{info.getValue()}</div>
                        </div>
                        {isExpanded && goal.description && (
                            <div className="text-sm text-slate-500 ml-1 max-w-lg">{goal.description}</div>
                        )}
                        {isExpanded && goal.objectives && goal.objectives.length > 0 && (
                            <div className="ml-1 mt-2 space-y-1">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                    <ListChecks size={11} /> Short-Term Objectives
                                </div>
                                <ol className="list-decimal list-inside space-y-0.5 text-xs text-slate-600">
                                    {goal.objectives.map((obj, i) => (
                                        <li key={i} className="leading-relaxed">{obj}</li>
                                    ))}
                                </ol>
                            </div>
                        )}
                    </div>
                );
            },
        }),

        // Tier badge
        columnHelper.accessor('tier', {
            header: 'Tier',
            cell: info => {
                const tier = info.getValue();
                if (!tier) return <span className="text-slate-300">—</span>;
                const t = TIER_STYLES[tier];
                return (
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${t?.cls || ''}`} title={t?.label}>
                        {tier}
                        {info.row.original.ageGroup && (
                            <span className="ml-1 opacity-60">({info.row.original.ageGroup}yr)</span>
                        )}
                    </span>
                );
            },
        }),

        columnHelper.accessor('skillType', {
            header: 'Type',
            cell: info => {
                const type = info.getValue();
                if (!type) return <span className="text-slate-300">—</span>;
                return (
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${SKILL_TYPE_COLORS[type] || SKILL_TYPE_COLORS.default}`}>
                        {type}
                    </span>
                );
            },
        }),

        columnHelper.accessor('promptLevel', {
            header: 'Prompt',
            cell: info => {
                const level = info.getValue();
                if (!level || level === 'None') return <span className="text-slate-300">—</span>;
                return (
                    <span className={`text-xs font-semibold ${PROMPT_COLORS[level] || 'text-slate-600'}`}>
                        {level}
                    </span>
                );
            },
        }),

        columnHelper.accessor('masteryCriteria', {
            header: 'Mastery',
            cell: info => {
                const criteria = info.getValue();
                return (
                    <span className="text-xs text-slate-500 leading-snug">{criteria || '80% Accuracy'}</span>
                );
            },
        }),

        columnHelper.display({
            id: 'expand',
            header: '',
            cell: info => {
                const goal = info.row.original;
                const isExpanded = expanded[goal.id];
                const hasExtra = !!(goal.description || (goal.objectives && goal.objectives.length > 0));
                if (!hasExtra) return null;
                return (
                    <button
                        onClick={() => setExpanded(prev => ({ ...prev, [goal.id]: !prev[goal.id] }))}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400"
                        title={isExpanded ? 'Collapse' : 'View objectives'}
                    >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                );
            },
        }),
    ], [selectable, expanded]);

    const table = useReactTable({
        data: filteredGoals,
        columns,
        state: { sorting, globalFilter, rowSelection },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        enableRowSelection: selectable,
        initialState: { pagination: { pageSize: 15 } }
    });

    if (goals.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Target className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No goals in this category</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header, Filters & Search */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                    {subSkillTitle && (
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Sparkles size={16} className="text-indigo-500" />
                            {subSkillTitle}
                        </div>
                    )}
                    <span className="text-sm text-slate-400">
                        {table.getFilteredRowModel().rows.length} goals
                    </span>
                    {/* Tier filter pills */}
                    <div className="flex items-center gap-1">
                        {['', 'A', 'B', 'C'].map(t => (
                            <button
                                key={t}
                                onClick={() => setTierFilter(t)}
                                className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${tierFilter === t
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                    }`}
                            >
                                {t === '' ? 'All' : `Tier ${t}`}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="relative w-56">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                        value={globalFilter ?? ''}
                        onChange={e => setGlobalFilter(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        placeholder="Filter goals..."
                    />
                </div>
            </div>

            {/* Selection info */}
            {selectable && Object.keys(rowSelection).length > 0 && (
                <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                    <Check size={16} />
                    {Object.keys(rowSelection).filter(k => rowSelection[k]).length} goals selected
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id} className="bg-slate-50 border-b border-slate-200">
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    className={`flex items-center gap-1 ${header.column.getCanSort() ? 'cursor-pointer select-none hover:text-slate-700' : ''}`}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {{
                                                        asc: <ChevronUp size={12} />,
                                                        desc: <ChevronDown size={12} />,
                                                    }[header.column.getIsSorted() as string] ?? null}
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map(row => (
                                    <tr
                                        key={row.id}
                                        className={`hover:bg-slate-50/50 transition-colors ${row.getIsSelected() ? 'bg-indigo-50/50' : ''}`}
                                    >
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="px-4 py-3 text-sm align-top">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400 italic">
                                        No goals match your filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {table.getPageCount() > 1 && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <button
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                    <span className="text-xs text-slate-500">
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </span>
                </div>
            )}
        </div>
    );
}
