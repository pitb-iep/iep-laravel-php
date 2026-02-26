'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, Clock, User } from 'lucide-react';

interface MasteryVerification {
    required: boolean;
    requiresSecondPerson: boolean;
    verifiedBy: Array<{
        userId: string;
        role: string;
        timestamp: string;
        notes?: string;
        generalizationSettings?: string[];
    }>;
    status: 'Pending' | 'Partial' | 'Complete';
}

interface MasteryVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    goalId: string;
    goalTitle: string;
    currentVerification?: MasteryVerification;
    independenceRate: number;
    onVerified: () => void;
}

const GENERALIZATION_SETTINGS = [
    'Home',
    'School',
    'Community',
    'Therapy Room',
    'Playground',
    'Cafeteria'
];

export default function MasteryVerificationModal({
    isOpen,
    onClose,
    studentId,
    goalId,
    goalTitle,
    currentVerification,
    independenceRate,
    onVerified
}: MasteryVerificationModalProps) {
    const [notes, setNotes] = useState('');
    const [selectedSettings, setSelectedSettings] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentUser = {
        role: localStorage.getItem('userRole') || 'Teacher',
        id: localStorage.getItem('userId') || ''
    };

    const hasUserVerified = currentVerification?.verifiedBy.some(
        v => v.userId === currentUser.id
    );

    const needsRoles = getMissingRoles(currentVerification, currentUser.role);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch(
                `/api/students/${studentId}/goals/${goalId}/verify`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('app_token')}`
                    },
                    body: JSON.stringify({
                        notes,
                        generalizationSettings: selectedSettings
                    })
                }
            );

            const result = await response.json();

            if (result.success) {
                onVerified();
                onClose();
                setNotes('');
                setSelectedSettings([]);
            } else {
                alert(result.error || 'Failed to submit verification');
            }
        } catch (error) {
            console.error('Error submitting verification:', error);
            alert('Failed to submit verification');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleSetting = (setting: string) => {
        setSelectedSettings(prev =>
            prev.includes(setting)
                ? prev.filter(s => s !== setting)
                : [...prev, setting]
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        Verify Goal Mastery
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Goal Info */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-lg text-blue-900">{goalTitle}</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            Current Independence Rate: <span className="font-bold">{independenceRate}%</span>
                        </p>
                    </div>

                    {/* Verification Status */}
                    <div>
                        <h4 className="font-semibold mb-3 flex items-center">
                            <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
                            Verification Status
                        </h4>

                        {currentVerification && currentVerification.verifiedBy.length > 0 ? (
                            <div className="space-y-2">
                                {currentVerification.verifiedBy.map((v, index) => (
                                    <div key={index} className="flex items-start space-x-3 bg-green-50 p-3 rounded-md">
                                        <User className="h-5 w-5 text-green-600 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-medium text-green-900">{v.role}</p>
                                            <p className="text-sm text-green-700">
                                                {new Date(v.timestamp).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                            {v.notes && (
                                                <p className="text-sm text-gray-600 mt-1 italic">"{v.notes}"</p>
                                            )}
                                            {v.generalizationSettings && v.generalizationSettings.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {v.generalizationSettings.map(setting => (
                                                        <span
                                                            key={setting}
                                                            className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded"
                                                        >
                                                            {setting}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No verifications yet</p>
                        )}

                        {needsRoles.length > 0 && (
                            <div className="mt-3 flex items-center text-sm text-amber-700 bg-amber-50 p-2 rounded">
                                <Clock className="h-4 w-4 mr-2" />
                                Still needs verification from: <span className="font-semibold ml-1">{needsRoles.join(', ')}</span>
                            </div>
                        )}
                    </div>

                    {/* Verification Form (only if user hasn't verified) */}
                    {!hasUserVerified && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Generalization Settings (Select all that apply)
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {GENERALIZATION_SETTINGS.map(setting => (
                                        <div key={setting} className="flex items-center space-x-2">
                                            <Checkbox
                                                checked={selectedSettings.includes(setting)}
                                                onCheckedChange={() => toggleSetting(setting)}
                                            />
                                            <label className="text-sm">{setting}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Verification Notes
                                </label>
                                <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Enter your verification notes (e.g., observed independent performance across multiple settings...)"
                                    rows={4}
                                    className="w-full"
                                />
                            </div>
                        </>
                    )}

                    {hasUserVerified && (
                        <div className="bg-green-50 border border-green-200 p-4 rounded-md text-center">
                            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                            <p className="font-semibold text-green-900">You have already verified this goal</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    {!hasUserVerified && (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || selectedSettings.length === 0}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isSubmitting ? 'Submitting...' : 'Verify Mastery'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function getMissingRoles(verification?: MasteryVerification, currentUserRole?: string): string[] {
    if (!verification || !verification.required) {
        return [];
    }

    const hasTeacher = verification.verifiedBy.some(v => v.role === 'Teacher');
    const hasSupervisor = verification.verifiedBy.some(
        v => ['School Head', 'BCBA', 'Supervisor'].includes(v.role)
    );

    const missing = [];
    if (!hasTeacher && currentUserRole !== 'Teacher') missing.push('Teacher');
    if (!hasSupervisor && verification.requiresSecondPerson &&
        !['School Head', 'BCBA', 'Supervisor'].includes(currentUserRole || '')) {
        missing.push('Supervisor/BCBA');
    }

    return missing;
}
