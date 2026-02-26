'use client';

import React, { useState } from 'react';
import AddStudentModal from './AddStudentModal';
import { Plus } from 'lucide-react';

export default function AddStudentButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                id="tour-add-student-btn"
                onClick={() => setIsOpen(true)}
                className="btn-primary flex items-center gap-2"
            >
                <span><Plus className="w-4 h-4 " /></span> Add Student
            </button>

            {isOpen && <AddStudentModal onClose={() => setIsOpen(false)} />}
        </>
    );
}
