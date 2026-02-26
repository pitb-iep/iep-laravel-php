'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, ArrowLeft, ClipboardList } from 'lucide-react';
import AssessmentTable from '@/components/Assessments/AssessmentTable';
import AssessmentModal from '@/components/Assessments/AssessmentModal';
import type { Assessment } from '@/types';

export default function AssessmentsPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Assessment | null>(null);

    // Fetch assessments
    const { data: assessments = [], isLoading, error } = useQuery<Assessment[]>({
        queryKey: ['assessments'],
        queryFn: async () => {
            const res = await fetch('/api/assessments');
            const data = await res.json();
            return data.success ? data.data : [];
        }
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: async (data: Partial<Assessment>) => {
            const res = await fetch('/api/assessments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to create assessment');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessments'] });
            toast.success('Assessment created successfully');
            setIsModalOpen(false);
            setSelectedAssessment(null);
        },
        onError: () => {
            toast.error('Failed to create assessment');
        }
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: async (data: Partial<Assessment> & { id: string }) => {
            const res = await fetch(`/api/assessments/${data.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to update assessment');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessments'] });
            toast.success('Assessment updated successfully');
            setIsModalOpen(false);
            setSelectedAssessment(null);
        },
        onError: () => {
            toast.error('Failed to update assessment');
        }
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/assessments/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete assessment');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessments'] });
            toast.success('Assessment deleted');
            setDeleteConfirm(null);
        },
        onError: () => {
            toast.error('Failed to delete assessment');
        }
    });

    const handleSubmit = (data: Partial<Assessment>) => {
        if (selectedAssessment) {
            updateMutation.mutate({ ...data, id: selectedAssessment.id || selectedAssessment._id || '' });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleView = (assessment: Assessment) => {
        setSelectedAssessment(assessment);
        setIsModalOpen(true);
    };

    const handleDelete = (assessment: Assessment) => {
        setDeleteConfirm(assessment);
    };

    const confirmDelete = () => {
        if (deleteConfirm) {
            deleteMutation.mutate(deleteConfirm.id || deleteConfirm._id || '');
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="btn-secondary flex items-center gap-2">
                        <ArrowLeft size={16} /> Dashboard
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                            <ClipboardList className="w-8 h-8 text-indigo-500" />
                            Assessments
                        </h1>
                        <p className="text-slate-500 mt-1">Track VB-MAPP, ABLLS-R, and custom assessments</p>
                    </div>
                </div>
                <button
                    onClick={() => { setSelectedAssessment(null); setIsModalOpen(true); }}
                    className="btn-primary flex items-center gap-2 shadow-lg shadow-indigo-200"
                >
                    <Plus size={18} /> New Assessment
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {['VB-MAPP', 'ABLLS-R', 'Baseline', 'Other'].map(type => {
                    const count = assessments.filter(a =>
                        type === 'Other'
                            ? !['VB-MAPP', 'ABLLS-R', 'Baseline'].includes(a.type)
                            : a.type === type
                    ).length;
                    return (
                        <div key={type} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                            <div className="text-2xl font-bold text-slate-800">{count}</div>
                            <div className="text-sm text-slate-500">{type}</div>
                        </div>
                    );
                })}
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="text-center py-20 text-slate-400">
                    <div className="animate-spin inline-block w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
                    <p>Loading assessments...</p>
                </div>
            ) : error ? (
                <div className="text-center py-20 text-rose-500">
                    <p>Error loading assessments. Please try again.</p>
                </div>
            ) : (
                <AssessmentTable
                    data={assessments}
                    onView={handleView}
                    onDelete={handleDelete}
                />
            )}

            {/* Modal */}
            <AssessmentModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedAssessment(null); }}
                onSubmit={handleSubmit}
                assessment={selectedAssessment}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Assessment?</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            This action cannot be undone. The assessment and all its results will be permanently removed.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleteMutation.isPending}
                                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
                            >
                                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
