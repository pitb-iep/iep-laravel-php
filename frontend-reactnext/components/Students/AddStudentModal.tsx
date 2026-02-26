'use client';

import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { X, Loader2, Plus, Info, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Define Zod Schema
const studentSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    grade: z.string().min(1, 'Grade is required'),
    dob: z.string().min(1, 'Date of Birth is required'),
    programStream: z.string().optional(),
    diagnosis: z.string().optional(),
    currentLevel: z.string().optional(),
    description: z.string().optional(),
    parentName: z.string().optional(),
    parentEmail: z.string().email('Invalid email').optional().or(z.literal('')),
});

type AddStudentInputs = z.infer<typeof studentSchema>;

interface AddStudentModalProps {
    onClose: () => void;
}

export default function AddStudentModal({ onClose }: AddStudentModalProps) {
    const queryClient = useQueryClient();
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async (data: AddStudentInputs) => {
            const res = await fetch('/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to create student');
            return res.json();
        },
        onSuccess: () => {
            toast.success('Student added successfully');
            queryClient.invalidateQueries({ queryKey: ['students'] });
            router.refresh();
            onClose();
        },
        onError: (error) => {
            console.error(error);
            toast.error('Error adding student');
        }
    });

    const form = useForm({
        defaultValues: {
            name: '',
            grade: '',
            dob: '',
            programStream: 'ECE',
            diagnosis: '',
            currentLevel: 'New',
            description: '',
            parentName: '',
            parentEmail: ''
        } as AddStudentInputs,
        validators: {
            onChange: studentSchema,
        },
        onSubmit: async ({ value }) => {
            mutation.mutate(value);
        },
    });

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up border border-slate-100 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 pb-4 flex justify-between items-center border-b border-slate-50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Add New Student</h2>
                        <p className="text-sm font-semibold text-slate-400">Register a new student profile and set up history.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-all">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            form.handleSubmit();
                        }}
                        className="space-y-6"
                    >
                        {/* Section 1: Basic Information */}
                        <div className="space-y-4">
                            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                                <span className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-[8px]">1</span>
                                Basic Information
                            </div>

                            <form.Field name="name">
                                {(field) => (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 ml-1">Full Name *</label>
                                        <input
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            className="w-full bg-slate-50 border-none rounded-xl p-3 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            placeholder="e.g. Liam Smith"
                                        />
                                        {field.state.meta.errors && (
                                            <p className="text-rose-500 text-[10px] font-bold px-1">{field.state.meta.errors.join(', ')}</p>
                                        )}
                                    </div>
                                )}
                            </form.Field>

                            <div className="grid grid-cols-2 gap-4">
                                <form.Field name="grade">
                                    {(field) => (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 ml-1">Grade / Class *</label>
                                            <input
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                className="w-full bg-slate-50 border-none rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                                placeholder="e.g. 5A"
                                            />
                                        </div>
                                    )}
                                </form.Field>
                                <form.Field name="dob">
                                    {(field) => (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 ml-1">Date of Birth *</label>
                                            <input
                                                type="date"
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                className="w-full bg-slate-50 border-none rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            />
                                        </div>
                                    )}
                                </form.Field>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <form.Field name="programStream">
                                    {(field) => (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 ml-1">Program</label>
                                            <select
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                className="w-full bg-slate-50 border-none rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            >
                                                <option value="ECE">ECE</option>
                                                <option value="Autism Support">Autism Support</option>
                                                <option value="General Ed">General Ed</option>
                                                <option value="Life Skills">Life Skills</option>
                                            </select>
                                        </div>
                                    )}
                                </form.Field>
                                <form.Field name="currentLevel">
                                    {(field) => (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 ml-1">Support Level</label>
                                            <select
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                className="w-full bg-slate-50 border-none rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            >
                                                <option value="New">Level 1 (Support)</option>
                                                <option value="Junior">Level 2 (Substantial)</option>
                                                <option value="Senior">Level 3 (Very Substantial)</option>
                                            </select>
                                        </div>
                                    )}
                                </form.Field>
                            </div>
                        </div>

                        {/* Section 2: Clinical Context & History */}
                        <div className="space-y-4 pt-4 border-t border-slate-50">
                            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                                <span className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-[8px]">2</span>
                                Clinical Context & History
                            </div>

                            <form.Field name="diagnosis">
                                {(field) => (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 ml-1">Diagnosis (Optional)</label>
                                        <input
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            className="w-full bg-slate-50 border-none rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            placeholder="Primary diagnosis..."
                                        />
                                    </div>
                                )}
                            </form.Field>

                            <form.Field name="description">
                                {(field) => (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 ml-1">Observations / Notes</label>
                                        <textarea
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            className="w-full bg-slate-50 border-none rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 min-h-[80px] font-medium"
                                            placeholder="Initial clinical remarks..."
                                        />
                                    </div>
                                )}
                            </form.Field>

                            {/* MOCKED: Student History & Attachments UI */}
                            <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/50 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-[10px] font-black text-indigo-700 uppercase tracking-widest flex items-center gap-1.5">
                                        <FileText size={12} /> Student History Mock
                                    </div>
                                    <span className="text-[8px] bg-white text-indigo-600 px-1.5 py-0.5 rounded-full font-bold shadow-sm">PHYSICAL SYNC</span>
                                </div>
                                <button
                                    type="button"
                                    className="w-full bg-white border-2 border-dashed border-indigo-200 py-4 rounded-xl text-[10px] font-black text-indigo-300 hover:border-indigo-400 hover:text-indigo-500 transition-all flex flex-col items-center gap-1"
                                >
                                    <Plus size={16} />
                                    <span>Attach Previous IEP / Clinical Records (Mock)</span>
                                </button>
                                <div className="flex items-center gap-2 px-1">
                                    <input type="checkbox" id="physical-history-check" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                    <label htmlFor="physical-history-check" className="text-[10px] text-slate-500 font-bold uppercase tracking-tight leading-none">
                                        Physical history documents available on file
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Guardian Information */}
                        <div className="space-y-4 pt-4 border-t border-slate-50">
                            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                                <span className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-[8px]">3</span>
                                Guardian Information
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <form.Field name="parentName">
                                    {(field) => (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 ml-1">Parent/Guardian Name</label>
                                            <input
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                className="w-full bg-slate-50 border-none rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                                placeholder="e.g. John Doe"
                                            />
                                        </div>
                                    )}
                                </form.Field>
                                <form.Field name="parentEmail">
                                    {(field) => (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 ml-1">Parent Email</label>
                                            <input
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                className="w-full bg-slate-50 border-none rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                                placeholder="parent@example.com"
                                            />
                                            {field.state.meta.errors && (
                                                <p className="text-rose-500 text-[10px] font-bold px-1">{field.state.meta.errors.join(', ')}</p>
                                            )}
                                        </div>
                                    )}
                                </form.Field>
                            </div>

                            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex gap-3 items-center">
                                <Info size={16} className="text-blue-500 shrink-0" />
                                <p className="text-[10px] text-blue-700 font-bold leading-tight">
                                    An automated invitation for the <strong>Parent Portal</strong> will be sent to the email above upon registration.
                                </p>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white pb-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 text-slate-400 hover:text-slate-600 font-black text-[10px] uppercase tracking-widest transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={mutation.isPending}
                                className="px-10 py-3 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center gap-2"
                            >
                                {mutation.isPending ? (
                                    <>Adding... <Loader2 size={14} className="animate-spin" /></>
                                ) : (
                                    'Register Student'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
