'use client';

import { useEffect, useState } from 'react';
import DailySummaryView from '@/components/ParentPortal/DailySummaryView';
import ParentLogForm from '@/components/ParentPortal/ParentLogForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ParentPortalPage() {
    const [studentId, setStudentId] = useState<string>('');
    const [studentName, setStudentName] = useState<string>('');

    useEffect(() => {
        // Get student info from localStorage or API
        // For parent role, they should only see their child's data
        const storedStudentId = localStorage.getItem('parentStudentId');
        const storedStudentName = localStorage.getItem('parentStudentName');

        if (storedStudentId) {
            setStudentId(storedStudentId);
            setStudentName(storedStudentName || 'Your Child');
        } else {
            // Fetch from API if not in localStorage
            fetchStudentInfo();
        }
    }, []);

    const fetchStudentInfo = async () => {
        try {
            const response = await fetch('/api/parent/my-students', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const result = await response.json();

            if (result.success && result.data.length > 0) {
                const student = result.data[0]; // Get first student if parent has multiple
                setStudentId(student._id);
                setStudentName(student.name);
                localStorage.setItem('parentStudentId', student._id);
                localStorage.setItem('parentStudentName', student.name);
            }
        } catch (error) {
            console.error('Error fetching student info:', error);
        }
    };

    if (!studentId) {
        return (
            <div className="p-12 text-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="p-6 animate-fade-in">
            <Tabs defaultValue="summaries" className="space-y-6">
                <TabsList className="bg-white border">
                    <TabsTrigger value="summaries">Daily Updates</TabsTrigger>
                    <TabsTrigger value="log">Morning Check-In</TabsTrigger>
                </TabsList>

                <TabsContent value="summaries">
                    <DailySummaryView studentId={studentId} studentName={studentName} />
                </TabsContent>

                <TabsContent value="log">
                    <ParentLogForm studentId={studentId} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
