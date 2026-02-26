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
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, Search, Eye, Trash2, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Assessment } from '@/types';

interface AssessmentTableProps {
    data: Assessment[];
    onView: (assessment: Assessment) => void;
    onDelete: (assessment: Assessment) => void;
}

const columnHelper = createColumnHelper<Assessment>();

export default function AssessmentTable({ data, onView, onDelete }: AssessmentTableProps) {
    const [sorting, setSorting] = useState<SortingState>([{ id: 'dateConducted', desc: true }]);
    const [globalFilter, setGlobalFilter] = useState('');

    const columns = useMemo(() => [
        columnHelper.accessor('student', {
            header: 'Student',
            cell: info => {
                const student = info.getValue();
                if (!student) return <span className="text-slate-400">-</span>;
                const name = typeof student === 'object' ? student.name : 'Unknown';
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600">
                            {name?.charAt(0) || '?'}
                        </div>
                        <span className="font-medium text-slate-800">{name}</span>
                    </div>
                );
            },
        }),
        columnHelper.accessor('type', {
            header: 'Assessment Type',
            cell: info => {
                const type = info.getValue();
                const colorMap: Record<string, string> = {
                    'VB-MAPP': 'bg-violet-100 text-violet-700 border-violet-200',
                    'ABLLS-R': 'bg-blue-100 text-blue-700 border-blue-200',
                    'Baseline': 'bg-emerald-100 text-emerald-700 border-emerald-200',
                    'Periodic': 'bg-amber-100 text-amber-700 border-amber-200',
                    'Re-assessment': 'bg-orange-100 text-orange-700 border-orange-200',
                    'default': 'bg-slate-100 text-slate-700 border-slate-200'
                };
                return (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorMap[type] || colorMap.default}`}>
                        <ClipboardList size={12} />
                        {type}
                    </span>
                );
            },
        }),
        columnHelper.accessor('dateConducted', {
            header: 'Date',
            cell: info => {
                const date = info.getValue();
                if (!date) return '-';
                const d = new Date(date);
                return (
                    <div>
                        <div className="font-medium text-slate-700">{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div className="text-xs text-slate-400">{d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                );
            },
        }),
        columnHelper.accessor('assessor', {
            header: 'Assessor',
            cell: info => {
                const assessor = info.getValue();
                if (!assessor) return <span className="text-slate-400">-</span>;
                const name = typeof assessor === 'object' ? (assessor.fullName || assessor.name) : 'Unknown';
                return <span className="text-sm text-slate-600">{name}</span>;
            },
        }),
        columnHelper.accessor('results', {
            header: 'Results',
            cell: info => {
                const results = info.getValue() || [];
                return (
                    <div className="text-sm">
                        <span className="font-bold text-slate-800">{results.length}</span>
                        <span className="text-slate-400 ml-1">items</span>
                    </div>
                );
            },
        }),
        columnHelper.display({
            id: 'actions',
            header: '',
            cell: info => (
                <div className="flex items-center gap-2 justify-end">
                    <button
                        onClick={() => onView(info.row.original)}
                        className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="View Details"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(info.row.original)}
                        className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        }),
    ], [onView, onDelete]);

    const table = useReactTable({
        data,
        columns,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 10 } }
    });

    if (data.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-200">
                <div className="inline-flex p-4 rounded-full bg-slate-50 mb-4">
                    <ClipboardList className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500 mb-2">No assessments recorded yet.</p>
                <p className="text-xs text-slate-400">Create your first assessment to get started.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center justify-between">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        value={globalFilter ?? ''}
                        onChange={e => setGlobalFilter(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="Search assessments..."
                    />
                </div>
                <div className="text-sm text-slate-500">
                    <span className="font-semibold text-slate-800">{table.getFilteredRowModel().rows.length}</span> assessments
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id} className="bg-slate-50 border-b border-slate-200">
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    className={`flex items-center gap-1 ${header.column.getCanSort() ? 'cursor-pointer select-none hover:text-slate-700' : ''}`}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {{
                                                        asc: <ChevronUp size={14} />,
                                                        desc: <ChevronDown size={14} />,
                                                    }[header.column.getIsSorted() as string] ?? null}
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-6 py-4 text-sm">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
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
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                    <span className="text-sm text-slate-500">
                        Page <span className="font-medium text-slate-800">{table.getState().pagination.pageIndex + 1}</span> of{' '}
                        <span className="font-medium text-slate-800">{table.getPageCount()}</span>
                    </span>
                </div>
            )}
        </div>
    );
}
