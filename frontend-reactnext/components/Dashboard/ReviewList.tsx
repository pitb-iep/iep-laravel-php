'use client';

import React, { useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    createColumnHelper,
    SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, Info } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';

interface StudentReview {
    id: string;
    _id: string;
    name: string;
    reviewDate?: string;
}

interface ReviewListProps {
    students: StudentReview[];
}

export default function ReviewList({ students }: ReviewListProps) {
    const [sorting, setSorting] = React.useState<SortingState>([{ id: 'reviewDate', desc: false }]);

    const data = useMemo(() => students.filter(s => s.reviewDate), [students]);

    const columnHelper = createColumnHelper<StudentReview>();

    const columns = [
        columnHelper.accessor('name', {
            header: 'Student',
            cell: info => <span className="font-semibold text-[var(--color-ebony-900)]">{info.getValue()}</span>,
        }),
        columnHelper.accessor('reviewDate', {
            header: ({ column }) => {
                return (
                    <button
                        className="flex items-center gap-1 hover:text-slate-900 transition-colors"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Review Date
                        <ArrowUpDown size={14} />
                    </button>
                )
            },
            cell: info => {
                const dateStr = info.getValue();
                if (!dateStr) return '-';
                const date = new Date(dateStr);
                return isValid(date) ? format(date, 'MMM d, yyyy') : dateStr;
            },
        }),
        columnHelper.display({
            id: 'actions',
            cell: () => (
                <button
                    className="text-xs font-medium text-[var(--color-dusty-olive-700)] bg-[var(--color-dusty-olive-50)] px-3 py-1.5 rounded-lg border border-[var(--color-dusty-olive-100)] hover:bg-[var(--color-dusty-olive-100)] transition-all hover:shadow-md"
                    title="Rescheduling feature coming soon"
                >
                    Reschedule
                </button>
            )
        })
    ];

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="card h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-bold text-[var(--color-ebony-800)]">📅 Upcoming Reviews</h3>
                <div className="group relative flex justify-center">
                    <Info size={14} className="text-[var(--color-ebony-400)] cursor-help hover:text-[var(--color-dusty-olive-600)] transition-colors" />
                    <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        Students with an upcoming IEP review date
                    </div>
                </div>
            </div>

            {data.length === 0 ? (
                <div className="text-slate-400 text-sm italic py-4 text-center">No reviews scheduled.</div>
            ) : (
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id} className="border-b border-slate-100">
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="p-3 text-xs font-semibold text-[var(--color-ebony-500)] uppercase tracking-wider">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-[var(--color-alabaster-grey-50)] transition-colors group">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="p-3 text-sm text-slate-600 border-b border-slate-50 last:border-0">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
