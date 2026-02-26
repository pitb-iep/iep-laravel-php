'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, Info } from 'lucide-react';

const CATEGORIES = [
    { id: 'general', label: 'General', color: 'bg-slate-100 text-slate-600 border-slate-200' },
    { id: 'urgent', label: 'Urgent', color: 'bg-rose-100 text-rose-700 border-rose-200' },
    { id: 'todo', label: 'To Do', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { id: 'idea', label: 'Idea', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
];

interface Note {
    id: string;
    text: string;
    category?: string;
    createdAt: number;
}

export default function QuickNotes() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('general');
    const [isInitialized, setIsInitialized] = useState(false);

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('iep_quick_notes');
        if (saved) {
            try {
                setNotes(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse notes', e);
            }
        }
        setIsInitialized(true);
    }, []);

    // Save to localStorage
    useEffect(() => {
        if (!isInitialized) return;
        localStorage.setItem('iep_quick_notes', JSON.stringify(notes));
    }, [notes, isInitialized]);

    const addNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;
        const note: Note = {
            id: crypto.randomUUID(),
            text: newNote,
            category: selectedCategory,
            createdAt: Date.now(),
        };
        setNotes([note, ...notes]);
        setNewNote('');
        setIsAdding(false);
        setSelectedCategory('general');
    };

    const deleteNote = (id: string) => {
        setNotes(notes.filter(n => n.id !== id));
    };

    const getCategoryStyle = (catId?: string) => {
        const cat = CATEGORIES.find(c => c.id === catId);
        return cat ? cat.color : CATEGORIES[0].color;
    };

    const getCategoryLabel = (catId?: string) => {
        const cat = CATEGORIES.find(c => c.id === catId);
        return cat ? cat.label : '';
    };

    return (
        <div className="card bg-[var(--color-alabaster-grey-50)] border-[var(--color-alabaster-grey-200)] h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[var(--color-ebony-800)]">📌 Quick Notes</h3>
                    <div className="group relative flex justify-center">
                        <Info size={14} className="text-[var(--color-ebony-400)] cursor-help hover:text-[var(--color-ebony-600)] transition-colors" />
                        <div className="absolute top-6 left-0 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 w-max max-w-[200px] whitespace-normal shadow-md">
                            Notes are stored locally on this device
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="text-xs bg-[var(--color-dusty-olive-100)] text-[var(--color-dusty-olive-800)] px-2 py-1 rounded-full hover:bg-[var(--color-dusty-olive-200)] flex items-center gap-1 transition-colors"
                >
                    <Plus size={12} /> New
                </button>
            </div>

            {isAdding && (
                <form onSubmit={addNote} className="mb-3 animate-fade-in-up">
                    <div className="flex gap-2 mb-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${selectedCategory === cat.id ? cat.color + ' ring-1 ring-offset-1 ring-slate-300 font-bold' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <input
                            autoFocus
                            type="text"
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Type note and hit enter..."
                            className="w-full text-sm p-2 pr-8 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-dusty-olive-300)] shadow-sm"
                            onBlur={() => !newNote && setIsAdding(false)}
                        />
                        <button type="button" onClick={() => setIsAdding(false)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <X size={12} />
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1 custom-scrollbar">
                {notes.length === 0 && !isAdding && (
                    <div className="text-center text-slate-400 text-sm italic py-8 flex flex-col items-center gap-2">
                        <span className="opacity-50 text-2xl">📝</span>
                        <span>No notes yet.</span>
                    </div>
                )}
                {notes.map(note => (
                    <div key={note.id} className="bg-white p-3 rounded-xl border border-slate-100 text-sm shadow-sm text-slate-600 relative group animate-fade-in-up hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-1">
                            {note.category && (
                                <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${getCategoryStyle(note.category)}`}>
                                    {getCategoryLabel(note.category)}
                                </span>
                            )}
                            <button
                                onClick={() => deleteNote(note.id)}
                                className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete Note"
                            >
                                <X size={14} />
                            </button>
                        </div>
                        <div className="text-[var(--color-ebony-700)] leading-relaxed">
                            {note.text}
                        </div>
                        <div className="text-[9px] text-slate-300 mt-2 text-right">
                            {new Date(note.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
