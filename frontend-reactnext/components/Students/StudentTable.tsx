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
import { ChevronDown, ChevronUp, Search, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface StudentData {
    id: string;
    _id: string; // Handle potential ID variance
    name: string;
    diagnosis?: string;
    program?: string;
    programStream?: string;
    ieps?: any[];
    teacher?: { name: string; fullName?: string };
    parents?: { name: string; fullName?: string }[];
}

const columnHelper = createColumnHelper<StudentData>();

export default function StudentTable({ data }: { data: StudentData[] }) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    const columns = useMemo(() => [
        columnHelper.accessor('name', {
            header: 'Student Name',
            cell: info => (
                <div>
                    <Link href={`/students/${info.row.original.id || info.row.original._id}`}>
                        <div className="font-semibold text-[var(--color-ebony-900)]">{info.getValue()}</div>
                        <div className="text-xs text-[var(--color-ebony-500)]">{info.row.original.diagnosis || 'No Diagnosis'}</div>
                    </Link>
                </div>
            ),
        }),
        columnHelper.accessor(row => row.programStream || row.program, {
            id: 'program',
            header: 'Program',
            cell: info => (
                <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-dusty-olive-50)] text-[var(--color-dusty-olive-700)]">
                    {info.getValue() || 'N/A'}
                </span>
            ),
        }),
        columnHelper.accessor('teacher', {
            header: 'Teacher',
            cell: info => {
                const teacher = info.getValue();
                return teacher ? (
                    <div title={teacher.fullName || teacher.name} className="flex items-center gap-1 text-sm text-[var(--color-ebony-600)]">
                        <span className="w-5 h-5 rounded-full bg-[var(--color-alabaster-grey-100)] flex items-center justify-center text-[10px]">
                            {(teacher.fullName || teacher.name || '?').charAt(0)}
                        </span>
                        <span className="truncate max-w-[120px]">{teacher.fullName || teacher.name}</span>
                    </div>
                ) : <span className="text-[var(--color-ebony-400)] text-xs">-</span>;
            }
        }),
        columnHelper.accessor('ieps', {
            header: 'Active Goals',
            cell: info => {
                const ieps = info.getValue() || [];
                // Prioritize Active, fallback to Draft
                const displayIep = ieps.find((i: any) => i.status === 'Active') || ieps.find((i: any) => i.status === 'Draft');
                const goalCount = displayIep?.goals?.length || 0;
                const isDraft = displayIep?.status === 'Draft';

                return (
                    <div className="font-medium text-[var(--color-ebony-700)]">
                        {goalCount} <span className="text-[var(--color-ebony-400)] text-xs font-normal">goals {isDraft && '(Draft)'}</span>
                    </div>
                );
            }
        }),
        columnHelper.accessor('ieps', {
            id: 'progress',
            header: 'Progress',
            cell: info => {
                const ieps = info.getValue() || [];
                const displayIep = ieps.find((i: any) => i.status === 'Active') || ieps.find((i: any) => i.status === 'Draft');

                const totalGoals = displayIep?.goals?.length || 0;
                const achievedGoals = displayIep?.goals?.filter((g: any) => g.status === 'Achieved').length || 0;
                const progress = totalGoals > 0 ? Math.round((achievedGoals / totalGoals) * 100) : 0;

                return (
                    <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-[var(--color-alabaster-grey-100)] rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-[var(--color-dusty-olive-600)]'}`}
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <span className="text-xs font-medium text-[var(--color-ebony-600)]">{progress}%</span>
                    </div>
                );
            }
        }),
        columnHelper.display({
            id: 'actions',
            cell: info => (
                <Link
                    href={`/students/${info.row.original.id || info.row.original._id}`}
                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-[var(--color-dusty-olive-700)] bg-[var(--color-dusty-olive-50)] hover:bg-[var(--color-dusty-olive-100)] rounded-lg transition-colors"
                >
                    View
                </Link>
            )
        })
    ], []);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex items-center justify-between">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        value={globalFilter ?? ''}
                        onChange={e => setGlobalFilter(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="Search students..."
                    />
                </div>
                <div className="text-sm text-slate-500">
                    <span className="font-medium text-slate-900">{data.length}</span> students total
                </div>
            </div>

            {/* Table */}
            <div id="tour-students-table" className="bg-white rounded-xl shadow-sm border border-[var(--color-alabaster-grey-200)] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id} className="bg-[var(--color-alabaster-grey-50)] border-b border-[var(--color-alabaster-grey-200)]">
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="px-6 py-3 text-xs font-semibold text-[var(--color-ebony-500)] uppercase tracking-wider">
                                        {header.isPlaceholder ? null : (
                                            <div
                                                className={`flex items-center gap-1 cursor-pointer select-none ${header.column.getCanSort() ? 'hover:text-[var(--color-ebony-700)]' : ''}`}
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
                    <tbody className="divide-y divide-[var(--color-alabaster-grey-100)]">
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-[var(--color-alabaster-grey-50)]/50 transition-colors">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-6 py-3 text-sm text-[var(--color-ebony-600)]">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400 italic">
                                    No students found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {table.getPageCount() > 1 && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            className="p-1 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            className="p-1 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronRight size={16} />
                        </button>
                        <span className="text-sm text-slate-500">
                            Page <span className="font-medium text-slate-900">{table.getState().pagination.pageIndex + 1}</span> of{' '}
                            <span className="font-medium text-slate-900">{table.getPageCount()}</span>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
