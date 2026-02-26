'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, X, Calendar, Clock, MapPin, Users, FileText } from 'lucide-react';
import type { Incident, IncidentType, IncidentStatus, IncidentSeverity, Student } from '@/types';

interface IncidentModalProps {
    incident: Incident | null;
    students: Student[];
    onClose: () => void;
    onSuccess: () => void;
}

const INCIDENT_TYPES: IncidentType[] = [
    'Staff Injury', 'Student Injury', 'Medical Error', 'Administration of Sedative Medication',
    'Emergency Protective Measure', 'Extension of Standard Protective Measure', 'Use of Extraordinary Procedure',
    'Novel Staff/Student Behavior', 'Inappropriate Student-to-Student Contact', 'Runaway',
    'Community/Neighbor Issue', 'Van Accident', 'False Fire Alarm', 'Actual Fire',
    'Major Environmental Damage', 'Unusual Family Issue/Communication', 'Other'
];

const STATUSES: IncidentStatus[] = ['Open', 'Under Review', 'Resolved', 'Closed'];
const SEVERITIES: IncidentSeverity[] = ['Low', 'Medium', 'High', 'Critical'];

export default function IncidentModal({ incident, students, onClose, onSuccess }: IncidentModalProps) {
    const isEditing = !!incident;

    const [formData, setFormData] = useState({
        date: incident?.date ? new Date(incident.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        startTime: incident?.startTime || '',
        endTime: incident?.endTime || '',
        setting: incident?.setting || '',
        incidentType: incident?.incidentType || 'Other' as IncidentType,
        severity: incident?.severity || 'Medium' as IncidentSeverity,
        status: incident?.status || 'Open' as IncidentStatus,
        studentsInvolved: incident?.studentsInvolved?.map(s => typeof s === 'object' ? (s.id || s._id) : s) || [],
        studentNames: incident?.studentNames || [],
        teamMembersOnShift: incident?.teamMembersOnShift?.join(', ') || '',
        otherStaffPresent: incident?.otherStaffPresent || '',
        nameOfInjured: incident?.nameOfInjured || '',
        description: incident?.description || '',
        reportedTo: incident?.reportedTo?.name || '',
        reportedToDate: incident?.reportedTo?.date ? new Date(incident.reportedTo.date).toISOString().split('T')[0] : '',
        receivedBySpecialist: incident?.receivedBySpecialist?.name || '',
        specialistDate: incident?.receivedBySpecialist?.date ? new Date(incident.receivedBySpecialist.date).toISOString().split('T')[0] : '',
        receivedByDirector: incident?.receivedByDirector?.name || '',
        directorDate: incident?.receivedByDirector?.date ? new Date(incident.receivedByDirector.date).toISOString().split('T')[0] : '',
        comments: incident?.comments || ''
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const url = isEditing ? `/api/incidents/${incident.id || incident._id}` : '/api/incidents';
            const res = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to save incident');
            return res.json();
        },
        onSuccess
    });

    const handleStudentChange = (studentId: string, checked: boolean) => {
        const student = students.find(s => (s.id || s._id) === studentId);
        if (checked) {
            setFormData(prev => ({
                ...prev,
                studentsInvolved: [...prev.studentsInvolved, studentId],
                studentNames: [...prev.studentNames, student?.name || '']
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                studentsInvolved: prev.studentsInvolved.filter(id => id !== studentId),
                studentNames: prev.studentNames.filter(n => n !== student?.name)
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload: any = {
            date: new Date(formData.date),
            startTime: formData.startTime,
            endTime: formData.endTime || undefined,
            setting: formData.setting,
            incidentType: formData.incidentType,
            severity: formData.severity,
            status: formData.status,
            studentsInvolved: formData.studentsInvolved,
            studentNames: formData.studentNames,
            teamMembersOnShift: formData.teamMembersOnShift.split(',').map(s => s.trim()).filter(Boolean),
            otherStaffPresent: formData.otherStaffPresent || undefined,
            nameOfInjured: formData.nameOfInjured || undefined,
            description: formData.description,
            comments: formData.comments || undefined
        };

        if (formData.reportedTo) {
            payload.reportedTo = { name: formData.reportedTo, date: formData.reportedToDate ? new Date(formData.reportedToDate) : undefined };
        }
        if (formData.receivedBySpecialist) {
            payload.receivedBySpecialist = { name: formData.receivedBySpecialist, date: formData.specialistDate ? new Date(formData.specialistDate) : undefined };
        }
        if (formData.receivedByDirector) {
            payload.receivedByDirector = { name: formData.receivedByDirector, date: formData.directorDate ? new Date(formData.directorDate) : undefined };
        }

        mutation.mutate(payload);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white p-6 border-b border-slate-200 flex items-center justify-between z-10">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <AlertTriangle className="text-red-500" />
                        {isEditing ? 'Edit Incident Report' : 'New Critical Incident Report'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Date & Time */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                <Calendar size={14} className="inline mr-1" />
                                Date *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                <Clock size={14} className="inline mr-1" />
                                Start Time *
                            </label>
                            <input
                                type="time"
                                required
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                <Clock size={14} className="inline mr-1" />
                                End Time
                            </label>
                            <input
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                            />
                        </div>
                    </div>

                    {/* Type, Severity, Status */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Incident Type *</label>
                            <select
                                required
                                value={formData.incidentType}
                                onChange={(e) => setFormData({ ...formData, incidentType: e.target.value as IncidentType })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                            >
                                {INCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Severity *</label>
                            <select
                                required
                                value={formData.severity}
                                onChange={(e) => setFormData({ ...formData, severity: e.target.value as IncidentSeverity })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                            >
                                {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
                            <select
                                required
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as IncidentStatus })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                            >
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            <MapPin size={14} className="inline mr-1" />
                            Setting/Location *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Full address, room, and location details"
                            value={formData.setting}
                            onChange={(e) => setFormData({ ...formData, setting: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                        />
                    </div>

                    {/* Students Involved */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <Users size={14} className="inline mr-1" />
                            Students Involved
                        </label>
                        <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                            {students.map(student => (
                                <label key={student.id || student._id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-1 rounded">
                                    <input
                                        type="checkbox"
                                        checked={formData.studentsInvolved.includes(student.id || student._id)}
                                        onChange={(e) => handleStudentChange(student.id || student._id, e.target.checked)}
                                        className="rounded text-indigo-600"
                                    />
                                    {student.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Team Members */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Team Members on Shift</label>
                            <input
                                type="text"
                                placeholder="Comma-separated names"
                                value={formData.teamMembersOnShift}
                                onChange={(e) => setFormData({ ...formData, teamMembersOnShift: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Other Staff Present</label>
                            <input
                                type="text"
                                placeholder="Names of other staff"
                                value={formData.otherStaffPresent}
                                onChange={(e) => setFormData({ ...formData, otherStaffPresent: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                            />
                        </div>
                    </div>

                    {/* Name of Injured (conditional) */}
                    {(formData.incidentType === 'Staff Injury' || formData.incidentType === 'Student Injury') && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Name of Injured Person</label>
                            <input
                                type="text"
                                placeholder="Full name of injured person"
                                value={formData.nameOfInjured}
                                onChange={(e) => setFormData({ ...formData, nameOfInjured: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                            />
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            <FileText size={14} className="inline mr-1" />
                            Detailed Description *
                        </label>
                        <textarea
                            required
                            rows={4}
                            placeholder="Provide a detailed description of the incident..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none resize-none"
                        />
                    </div>

                    {/* Reporting Chain */}
                    <div className="border-t border-slate-200 pt-4">
                        <h3 className="text-sm font-bold text-slate-700 mb-3">Reporting Chain</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Reported To"
                                    value={formData.reportedTo}
                                    onChange={(e) => setFormData({ ...formData, reportedTo: e.target.value })}
                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                                />
                                <input
                                    type="date"
                                    value={formData.reportedToDate}
                                    onChange={(e) => setFormData({ ...formData, reportedToDate: e.target.value })}
                                    className="w-36 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                                />
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Received by Specialist"
                                    value={formData.receivedBySpecialist}
                                    onChange={(e) => setFormData({ ...formData, receivedBySpecialist: e.target.value })}
                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                                />
                                <input
                                    type="date"
                                    value={formData.specialistDate}
                                    onChange={(e) => setFormData({ ...formData, specialistDate: e.target.value })}
                                    className="w-36 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                                />
                            </div>
                            <div className="flex gap-2 md:col-span-2">
                                <input
                                    type="text"
                                    placeholder="Received by Director"
                                    value={formData.receivedByDirector}
                                    onChange={(e) => setFormData({ ...formData, receivedByDirector: e.target.value })}
                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                                />
                                <input
                                    type="date"
                                    value={formData.directorDate}
                                    onChange={(e) => setFormData({ ...formData, directorDate: e.target.value })}
                                    className="w-36 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Comments */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Comments / Follow-up</label>
                        <textarea
                            rows={3}
                            placeholder="Additional comments or follow-up actions..."
                            value={formData.comments}
                            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={mutation.isPending} className="btn-primary flex items-center gap-2">
                            {mutation.isPending ? (
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                            ) : (
                                <AlertTriangle size={16} />
                            )}
                            {isEditing ? 'Update Incident' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
