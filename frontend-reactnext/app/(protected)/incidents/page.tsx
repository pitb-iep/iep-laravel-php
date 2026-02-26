'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
    createColumnHelper,
    SortingState,
} from '@tanstack/react-table';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import {
    AlertTriangle, Plus, Search, Filter, HelpCircle, Calendar,
    ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Eye, Pencil, Trash2,
    User, MapPin, Clock, FileWarning, BarChart3
} from 'lucide-react';
import Link from 'next/link';
import type { Incident, IncidentType, IncidentStatus, IncidentSeverity, Student } from '@/types';
import IncidentModal from '@/components/Incidents/IncidentModal';
import ProtocolSuggestions from '@/components/Incidents/ProtocolSuggestions';

const INCIDENT_TYPES: IncidentType[] = [
    'Staff Injury', 'Student Injury', 'Medical Error', 'Administration of Sedative Medication',
    'Emergency Protective Measure', 'Extension of Standard Protective Measure', 'Use of Extraordinary Procedure',
    'Novel Staff/Student Behavior', 'Inappropriate Student-to-Student Contact', 'Runaway',
    'Community/Neighbor Issue', 'Van Accident', 'False Fire Alarm', 'Actual Fire',
    'Major Environmental Damage', 'Unusual Family Issue/Communication', 'Other'
];

const STATUS_COLORS: Record<IncidentStatus, string> = {
    'Open': 'bg-red-100 text-red-700',
    'Under Review': 'bg-amber-100 text-amber-700',
    'Resolved': 'bg-emerald-100 text-emerald-700',
    'Closed': 'bg-slate-100 text-slate-600'
};

const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
    'Low': 'bg-slate-100 text-slate-600',
    'Medium': 'bg-blue-100 text-blue-700',
    'High': 'bg-orange-100 text-orange-700',
    'Critical': 'bg-red-100 text-red-700'
};

const columnHelper = createColumnHelper<Incident>();

export default function IncidentsPage() {
    const queryClient = useQueryClient();
    const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
    const [viewingIncident, setViewingIncident] = useState<Incident | null>(null);

    // Fetch incidents
    const { data: incidents = [], isLoading } = useQuery<Incident[]>({
        queryKey: ['incidents', statusFilter, typeFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            if (typeFilter) params.append('incidentType', typeFilter);
            const res = await fetch(`/api/incidents?${params.toString()}`);
            const data = await res.json();
            return data.success ? data.data : [];
        }
    });

    // Fetch students for modal
    const { data: students = [] } = useQuery<Student[]>({
        queryKey: ['students-list'],
        queryFn: async () => {
            const res = await fetch('/api/students');
            const data = await res.json();
            return data.success ? data.data : [];
        }
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/incidents/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incidents'] })
    });

    // Table columns - same as before
    const columns = [
        columnHelper.accessor('date', {
            header: 'Date',
            cell: (info) => (
                <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    {new Date(info.getValue()).toLocaleDateString()}
                </div>
            ),
            sortingFn: 'datetime'
        }),
        columnHelper.accessor('incidentType', {
            header: 'Type',
            cell: (info) => (
                <span className="inline-flex items-center gap-1.5 text-sm">
                    <FileWarning size={14} className="text-amber-500" />
                    {info.getValue()}
                </span>
            )
        }),
        columnHelper.accessor('setting', {
            header: 'Location',
            cell: (info) => (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin size={14} />
                    <span className="truncate max-w-[150px]">{info.getValue()}</span>
                </div>
            )
        }),
        columnHelper.accessor('studentNames', {
            header: 'Students',
            cell: (info) => {
                const names = info.getValue() || [];
                return names.length > 0 ? (
                    <div className="flex items-center gap-1">
                        <User size={14} className="text-slate-400" />
                        <span className="truncate max-w-[120px]">{names.join(', ')}</span>
                    </div>
                ) : <span className="text-slate-400">—</span>;
            }
        }),
        columnHelper.accessor('severity', {
            header: 'Severity',
            cell: (info) => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${SEVERITY_COLORS[info.getValue()]}`}>
                    {info.getValue()}
                </span>
            )
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: (info) => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[info.getValue()]}`}>
                    {info.getValue()}
                </span>
            )
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: (info) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setViewingIncident(info.row.original)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="View"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => { setEditingIncident(info.row.original); setModalOpen(true); }}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                        title="Edit"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('Delete this incident report?')) {
                                deleteMutation.mutate(info.row.original.id || info.row.original._id!);
                            }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        })
    ];

    const table = useReactTable({
        data: incidents,
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

    // Guided tour
    const startTour = () => {
        const driverObj = driver({
            showProgress: true,
            animate: true,
            steps: [
                { element: '#tour-incident-header', popover: { title: '⚠️ Incident Reports', description: 'Track and manage critical incidents involving students and staff.', side: 'bottom' } },
                { element: '#tour-create-incident', popover: { title: '➕ Report Incident', description: 'Click here to file a new critical incident report.', side: 'bottom' } },
                { element: '#tour-incident-filters', popover: { title: '🔍 Filter & Search', description: 'Filter by status, incident type, or search by keywords.', side: 'bottom' } },
                { element: '#tour-incident-table', popover: { title: '📋 Incident Log', description: 'View all incidents with sortable columns. Click headers to sort.', side: 'top' } }
            ]
        });
        driverObj.drive();
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div id="tour-incident-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <span className="p-2 bg-red-50 rounded-xl">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </span>
                        Critical Incident Reports
                    </h1>
                    <p className="text-slate-500 mt-1">Document and track incidents for compliance and safety</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/analytics/incidents"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                        <BarChart3 size={16} /> View Heat Map
                    </Link>
                    <button
                        onClick={startTour}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                        <HelpCircle size={16} /> Guide Me
                    </button>
                    <button
                        id="tour-create-incident"
                        onClick={() => { setEditingIncident(null); setModalOpen(true); }}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus size={18} /> Report Incident
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Open', count: incidents.filter(i => i.status === 'Open').length, color: 'text-red-600 bg-red-50' },
                    { label: 'Under Review', count: incidents.filter(i => i.status === 'Under Review').length, color: 'text-amber-600 bg-amber-50' },
                    { label: 'Resolved', count: incidents.filter(i => i.status === 'Resolved').length, color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'This Month', count: incidents.filter(i => new Date(i.date).getMonth() === new Date().getMonth()).length, color: 'text-indigo-600 bg-indigo-50' }
                ].map((stat) => (
                    <div key={stat.label} className="card flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${stat.color}`}>
                            {stat.count}
                        </div>
                        <div className="text-sm font-medium text-slate-600">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div id="tour-incident-filters" className="card mb-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search incidents..."
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                        >
                            <option value="">All Status</option>
                            <option value="Open">Open</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                        </select>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                        >
                            <option value="">All Types</option>
                            {INCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div id="tour-incident-table" className="card overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : incidents.length === 0 ? (
                    <div className="text-center py-12">
                        <AlertTriangle size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600 mb-2">No Incidents Reported</h3>
                        <p className="text-slate-400 mb-4">No critical incidents have been filed yet.</p>
                        <button onClick={() => setModalOpen(true)} className="btn-primary">
                            <Plus size={16} className="mr-1" /> Report First Incident
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    {table.getHeaderGroups().map(hg => (
                                        <tr key={hg.id} className="border-b border-slate-200 bg-slate-50">
                                            {hg.headers.map(header => (
                                                <th
                                                    key={header.id}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                    className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                                                >
                                                    <div className="flex items-center gap-1">
                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                        {header.column.getIsSorted() === 'asc' && <ChevronUp size={14} />}
                                                        {header.column.getIsSorted() === 'desc' && <ChevronDown size={14} />}
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {table.getRowModel().rows.map(row => (
                                        <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id} className="px-4 py-3 text-sm text-slate-800">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
                            <div className="text-sm text-slate-500">
                                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                                {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, incidents.length)} of{' '}
                                {incidents.length} incidents
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className="p-2 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-sm text-slate-600">
                                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                                </span>
                                <button
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    className="p-2 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* View Incident Modal WITH Protocol Suggestions */}
            {viewingIncident && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <AlertTriangle className="text-red-500" />
                                Incident Details & Recommended Protocols
                            </h2>
                            <button onClick={() => setViewingIncident(null)} className="text-slate-400 hover:text-slate-600">
                                ✕
                            </button>
                        </div>
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left: Incident Details */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Incident Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs font-bold uppercase text-slate-500 mb-1">Date</div>
                                        <div>{new Date(viewingIncident.date).toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold uppercase text-slate-500 mb-1">Time</div>
                                        <div>{viewingIncident.startTime} - {viewingIncident.endTime || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold uppercase text-slate-500 mb-1">Incident Type</div>
                                        <div>{viewingIncident.incidentType}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold uppercase text-slate-500 mb-1">Severity</div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${SEVERITY_COLORS[viewingIncident.severity]}`}>
                                            {viewingIncident.severity}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold uppercase text-slate-500 mb-1">Status</div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[viewingIncident.status]}`}>
                                            {viewingIncident.status}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold uppercase text-slate-500 mb-1">Location</div>
                                        <div>{viewingIncident.setting}</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold uppercase text-slate-500 mb-1">Reported By</div>
                                    <div>{viewingIncident.reportingStaffName}</div>
                                </div>
                                {viewingIncident.studentNames && viewingIncident.studentNames.length > 0 && (
                                    <div>
                                        <div className="text-xs font-bold uppercase text-slate-500 mb-1">Students Involved</div>
                                        <div>{viewingIncident.studentNames.join(', ')}</div>
                                    </div>
                                )}
                                <div>
                                    <div className="text-xs font-bold uppercase text-slate-500 mb-1">Description</div>
                                    <p className="text-sm bg-slate-50 p-3 rounded-lg">{viewingIncident.description}</p>
                                </div>
                                {viewingIncident.comments && (
                                    <div>
                                        <div className="text-xs font-bold uppercase text-slate-500 mb-1">Comments/Follow-up</div>
                                        <p className="text-sm bg-slate-50 p-3 rounded-lg">{viewingIncident.comments}</p>
                                    </div>
                                )}
                            </div>

                            {/* Right: Protocol Suggestions */}
                            <div>
                                <h3 className="font-semibold text-lg mb-4">Recommended Interventions</h3>
                                {viewingIncident.studentsInvolved && viewingIncident.studentsInvolved.length > 0 ? (
                                    <ProtocolSuggestions
                                        studentId={
                                            typeof viewingIncident.studentsInvolved[0] === 'string'
                                                ? viewingIncident.studentsInvolved[0]
                                                : viewingIncident.studentsInvolved[0]._id || viewingIncident.studentsInvolved[0].id || ''
                                        }
                                        incidentType={viewingIncident.incidentType}
                                    />
                                ) : (
                                    <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                                        No student linked to this incident. Protocol suggestions require a student association.
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-200 flex justify-end gap-2">
                            <button
                                onClick={() => { setEditingIncident(viewingIncident); setViewingIncident(null); setModalOpen(true); }}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <Pencil size={16} /> Edit
                            </button>
                            <button onClick={() => setViewingIncident(null)} className="btn-primary">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {modalOpen && (
                <IncidentModal
                    incident={editingIncident}
                    students={students}
                    onClose={() => { setModalOpen(false); setEditingIncident(null); }}
                    onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ['incidents'] });
                        setModalOpen(false);
                        setEditingIncident(null);
                    }}
                />
            )}
        </div>
    );
}
