'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Moon, Pill, Utensils, SmilePlus, CheckCircle2 } from 'lucide-react';

interface ParentLogFormProps {
    studentId: string;
}

export default function ParentLogForm({ studentId }: ParentLogFormProps) {
    const [formData, setFormData] = useState({
        sleepHours: '',
        sleepQuality: '',
        medicationTaken: false,
        medicationNotes: '',
        breakfast: {
            time: '',
            eaten: true,
            notes: ''
        },
        mood: '',
        behavioralNotes: '',
        concerns: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitSuccess(false);

        try {
            const response = await fetch(`/api/parent/students/${studentId}/log`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('app_token')}`
                },
                body: JSON.stringify({
                    sleepHours: formData.sleepHours ? parseFloat(formData.sleepHours) : undefined,
                    sleepQuality: formData.sleepQuality || undefined,
                    medicationTaken: formData.medicationTaken,
                    medicationNotes: formData.medicationNotes || undefined,
                    mealTimes: {
                        breakfast: formData.breakfast
                    },
                    mood: formData.mood || undefined,
                    behavioralNotes: formData.behavioralNotes || undefined,
                    concerns: formData.concerns || undefined
                })
            });

            const result = await response.json();

            if (result.success) {
                setSubmitSuccess(true);
                // Reset form
                setFormData({
                    sleepHours: '',
                    sleepQuality: '',
                    medicationTaken: false,
                    medicationNotes: '',
                    breakfast: { time: '', eaten: true, notes: '' },
                    mood: '',
                    behavioralNotes: '',
                    concerns: ''
                });

                // Hide success message after 3 seconds
                setTimeout(() => setSubmitSuccess(false), 3000);
            } else {
                alert(result.error || 'Failed to submit log');
            }
        } catch (error) {
            console.error('Error submitting parent log:', error);
            alert('Failed to submit log');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="text-2xl">Morning Check-In</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                    Share information about last night and this morning to help your child's teacher
                </p>
            </CardHeader>

            <CardContent className="pt-6">
                {submitSuccess && (
                    <div className="mb-6 bg-green-50 border border-green-200 p-4 rounded-lg flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mr-3" />
                        <p className="text-green-800 font-medium">Log submitted successfully! Teacher will be notified.</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sleep Section */}
                    <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                        <div className="flex items-center space-x-2 mb-3">
                            <Moon className="h-5 w-5 text-blue-600" />
                            <h3 className="font-semibold text-blue-900">Sleep</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="sleepHours">Hours of Sleep</Label>
                                <Input
                                    id="sleepHours"
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    max="24"
                                    value={formData.sleepHours}
                                    onChange={e => setFormData({ ...formData, sleepHours: e.target.value })}
                                    placeholder="e.g., 9.5"
                                />
                            </div>

                            <div>
                                <Label htmlFor="sleepQuality">Sleep Quality</Label>
                                <Select
                                    value={formData.sleepQuality}
                                    onValueChange={value => setFormData({ ...formData, sleepQuality: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select quality" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Excellent">Excellent</SelectItem>
                                        <SelectItem value="Good">Good</SelectItem>
                                        <SelectItem value="Fair">Fair</SelectItem>
                                        <SelectItem value="Poor">Poor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Medication Section */}
                    <div className="bg-green-50 p-4 rounded-lg space-y-4">
                        <div className="flex items-center space-x-2 mb-3">
                            <Pill className="h-5 w-5 text-green-600" />
                            <h3 className="font-semibold text-green-900">Medication</h3>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="medicationTaken"
                                checked={formData.medicationTaken}
                                onChange={e => setFormData({ ...formData, medicationTaken: e.target.checked })}
                                className="h-4 w-4"
                            />
                            <Label htmlFor="medicationTaken">Medication taken this morning</Label>
                        </div>

                        {formData.medicationTaken && (
                            <div>
                                <Label htmlFor="medicationNotes">Medication Notes</Label>
                                <Input
                                    id="medicationNotes"
                                    value={formData.medicationNotes}
                                    onChange={e => setFormData({ ...formData, medicationNotes: e.target.value })}
                                    placeholder="e.g., Took at 7:30 AM with breakfast"
                                />
                            </div>
                        )}
                    </div>

                    {/* Breakfast Section */}
                    <div className="bg-yellow-50 p-4 rounded-lg space-y-4">
                        <div className="flex items-center space-x-2 mb-3">
                            <Utensils className="h-5 w-5 text-yellow-600" />
                            <h3 className="font-semibold text-yellow-900">Breakfast</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="breakfastTime">Time</Label>
                                <Input
                                    id="breakfastTime"
                                    type="time"
                                    value={formData.breakfast.time}
                                    onChange={e => setFormData({
                                        ...formData,
                                        breakfast: { ...formData.breakfast, time: e.target.value }
                                    })}
                                />
                            </div>

                            <div className="flex items-center pt-6">
                                <input
                                    type="checkbox"
                                    id="breakfastEaten"
                                    checked={formData.breakfast.eaten}
                                    onChange={e => setFormData({
                                        ...formData,
                                        breakfast: { ...formData.breakfast, eaten: e.target.checked }
                                    })}
                                    className="h-4 w-4 mr-2"
                                />
                                <Label htmlFor="breakfastEaten">Ate well</Label>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="breakfastNotes">What did they eat?</Label>
                            <Input
                                id="breakfastNotes"
                                value={formData.breakfast.notes}
                                onChange={e => setFormData({
                                    ...formData,
                                    breakfast: { ...formData.breakfast, notes: e.target.value }
                                })}
                                placeholder="e.g., Eggs and toast"
                            />
                        </div>
                    </div>

                    {/* Mood Section */}
                    <div className="bg-purple-50 p-4 rounded-lg space-y-4">
                        <div className="flex items-center space-x-2 mb-3">
                            <SmilePlus className="h-5 w-5 text-purple-600" />
                            <h3 className="font-semibold text-purple-900">Mood & Behavior</h3>
                        </div>

                        <div>
                            <Label htmlFor="mood">Current Mood</Label>
                            <Select
                                value={formData.mood}
                                onValueChange={value => setFormData({ ...formData, mood: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select mood" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Very Happy">Very Happy 😊</SelectItem>
                                    <SelectItem value="Happy">Happy 🙂</SelectItem>
                                    <SelectItem value="Neutral">Neutral 😐</SelectItem>
                                    <SelectItem value="Upset">Upset 😟</SelectItem>
                                    <SelectItem value="Very Upset">Very Upset 😢</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="behavioralNotes">Behavioral Notes</Label>
                            <Textarea
                                id="behavioralNotes"
                                value={formData.behavioralNotes}
                                onChange={e => setFormData({ ...formData, behavioralNotes: e.target.value })}
                                placeholder="e.g., Excited about school today, Had a small tantrum before leaving"
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Concerns */}
                    <div>
                        <Label htmlFor="concerns">Any Concerns?</Label>
                        <Textarea
                            id="concerns"
                            value={formData.concerns}
                            onChange={e => setFormData({ ...formData, concerns: e.target.value })}
                            placeholder="Share any concerns or important information for the teacher"
                            rows={3}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Morning Check-In'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
