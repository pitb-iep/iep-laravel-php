'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ClipboardList } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { Assessment, AssessmentType, Student, Domain } from '@/types';

interface AssessmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Assessment>) => void;
    assessment?: Assessment | null;
    isLoading?: boolean;
}

const ASSESSMENT_TYPES: AssessmentType[] = [
    'Baseline', 'Periodic', 'Re-assessment', 'Behavior',
    'VB-MAPP', 'ABLLS-R', 'AFLS', 'Vineland', 'Other'
];

export default function AssessmentModal({ isOpen, onClose, onSubmit, assessment, isLoading }: AssessmentModalProps) {
    const [formData, setFormData] = useState({
        student: '',
        type: 'Baseline' as AssessmentType,
        dateConducted: new Date().toISOString().split('T')[0],
        summaryNotes: '',
        results: [] as { subSkill: string; scoreOrLevel: string; comments: string }[]
    });

    // Fetch students
    const { data: students = [] } = useQuery<Student[]>({
        queryKey: ['students'],
        queryFn: async () => {
            const res = await fetch('/api/students');
            const data = await res.json();
            return data.success ? data.data : [];
        }
    });

    // Fetch domains for subskills
    const { data: domains = [] } = useQuery<Domain[]>({
        queryKey: ['domains'],
        queryFn: async () => {
            const res = await fetch('/api/domains');
            const data = await res.json();
            return data.success ? data.data : [];
        }
    });

    // Flatten subskills from all domains
    const allSubSkills = domains.flatMap(d =>
        (d.subSkills || []).map(s => ({
            id: s.id || s._id,
            title: s.title,
            domainTitle: d.title
        }))
    );

    useEffect(() => {
        if (assessment) {
            setFormData({
                student: typeof assessment.student === 'object' ? assessment.student._id || assessment.student.id || '' : assessment.student || '',
                type: assessment.type,
                dateConducted: assessment.dateConducted ? new Date(assessment.dateConducted).toISOString().split('T')[0] : '',
                summaryNotes: assessment.summaryNotes || '',
                results: (assessment.results || []).map(r => ({
                    subSkill: typeof r.subSkill === 'object' ? r.subSkill._id || r.subSkill.id || '' : r.subSkill || '',
                    scoreOrLevel: r.scoreOrLevel || '',
                    comments: r.comments || ''
                }))
            });
        } else {
            setFormData({
                student: '',
                type: 'Baseline',
                dateConducted: new Date().toISOString().split('T')[0],
                summaryNotes: '',
                results: []
            });
        }
    }, [assessment, isOpen]);

    const addResult = () => {
        setFormData(prev => ({
            ...prev,
            results: [...prev.results, { subSkill: '', scoreOrLevel: '', comments: '' }]
        }));
    };

    const removeResult = (index: number) => {
        setFormData(prev => ({
            ...prev,
            results: prev.results.filter((_, i) => i !== index)
        }));
    };

    const updateResult = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            results: prev.results.map((r, i) => i === index ? { ...r, [field]: value } : r)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            dateConducted: formData.dateConducted
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-100">
                            <ClipboardList className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">
                                {assessment ? 'Edit Assessment' : 'New Assessment'}
                            </h2>
                            <p className="text-sm text-slate-500">Record assessment results</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Row 1: Student & Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                                Student <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={formData.student}
                                onChange={e => setFormData({ ...formData, student: e.target.value })}
                                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                required
                            >
                                <option value="">Select Student</option>
                                {students.map((s: Student) => (
                                    <option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                                Assessment Type <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value as AssessmentType })}
                                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                required
                            >
                                {ASSESSMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                            Date Conducted <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={formData.dateConducted}
                            onChange={e => setFormData({ ...formData, dateConducted: e.target.value })}
                            className="w-full p-3 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                            required
                        />
                    </div>

                    {/* Results Section */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-xs font-bold uppercase text-slate-500">
                                Results
                            </label>
                            <button
                                type="button"
                                onClick={addResult}
                                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                            >
                                <Plus size={14} /> Add Result
                            </button>
                        </div>

                        {formData.results.length === 0 ? (
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400">
                                <p className="text-sm">No results added yet</p>
                                <button
                                    type="button"
                                    onClick={addResult}
                                    className="mt-2 text-sm font-medium text-indigo-600 hover:underline"
                                >
                                    Add your first result
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {formData.results.map((result, idx) => (
                                    <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative group">
                                        <button
                                            type="button"
                                            onClick={() => removeResult(idx)}
                                            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Sub-Skill</label>
                                                <select
                                                    value={result.subSkill}
                                                    onChange={e => updateResult(idx, 'subSkill', e.target.value)}
                                                    className="w-full p-2 text-sm border border-slate-200 rounded-lg"
                                                >
                                                    <option value="">Select</option>
                                                    {allSubSkills.map(s => (
                                                        <option key={s.id} value={s.id}>{s.title} ({s.domainTitle})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Score/Level</label>
                                                <input
                                                    type="text"
                                                    value={result.scoreOrLevel}
                                                    onChange={e => updateResult(idx, 'scoreOrLevel', e.target.value)}
                                                    className="w-full p-2 text-sm border border-slate-200 rounded-lg"
                                                    placeholder="e.g. 3/5"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Comments</label>
                                                <input
                                                    type="text"
                                                    value={result.comments}
                                                    onChange={e => updateResult(idx, 'comments', e.target.value)}
                                                    className="w-full p-2 text-sm border border-slate-200 rounded-lg"
                                                    placeholder="Notes..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Summary Notes */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                            Summary Notes
                        </label>
                        <textarea
                            value={formData.summaryNotes}
                            onChange={e => setFormData({ ...formData, summaryNotes: e.target.value })}
                            className="w-full p-3 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none resize-none"
                            rows={3}
                            placeholder="Overall observations and recommendations..."
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !formData.student}
                        className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isLoading ? 'Saving...' : (assessment ? 'Update Assessment' : 'Create Assessment')}
                    </button>
                </div>
            </div>
        </div>
    );
}
