'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EditStudentModalProps {
    student: any;
    onClose: () => void;
}

export default function EditStudentModal({ student, onClose }: EditStudentModalProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        const data = {
            name: formData.get('name'),
            diagnosis: formData.get('diagnosis'),
            programStream: formData.get('programStream'),
            currentLevel: formData.get('currentLevel'),
            activeTherapies: formData.getAll('activeTherapies'),
        };

        try {
            const res = await fetch(`/api/students/${student.id || student._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                router.refresh();
                onClose();
            } else {
                alert('Failed to update student');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-[fadeIn_0.2s_ease-out]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl m-0">Edit Profile</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                        <input name="name" defaultValue={student.name} type="text" required className="w-full border rounded-lg p-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Diagnosis / Focus</label>
                            <input name="diagnosis" defaultValue={student.diagnosis} type="text" className="w-full border rounded-lg p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Program</label>
                            <select name="programStream" defaultValue={student.programStream || 'ECE'} className="w-full border rounded-lg p-2">
                                <option value="ECE">ECE</option>
                                <option value="Autism Support">Autism Support</option>
                                <option value="General Ed">General Ed</option>
                                <option value="Life Skills">Life Skills</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Active Therapies</label>
                        <div className="flex flex-wrap gap-3">
                            {['SLP', 'OT', 'ABA', 'PT', 'Speech'].map(therapy => (
                                <label key={therapy} className="flex items-center gap-2 text-sm bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                                    <input
                                        type="checkbox"
                                        name="activeTherapies"
                                        value={therapy}
                                        defaultChecked={student.activeTherapies?.includes(therapy)}
                                        className="rounded text-[hsl(var(--primary-hue),70%,60%)] focus:ring-[hsl(var(--primary-hue),70%,60%)]"
                                    />
                                    {therapy}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Support Level</label>
                        <select name="currentLevel" defaultValue={student.currentLevel || 'New'} className="w-full border rounded-lg p-2">
                            <option value="New">Level 1 (Support)</option>
                            <option value="Junior">Level 2 (Substantial)</option>
                            <option value="Senior">Level 3 (Very Substantial)</option>
                        </select>
                    </div>

                    <div className="mt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
