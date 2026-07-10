'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface IssueCertificateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function IssueCertificateModal({ isOpen, onClose, onSuccess }: IssueCertificateModalProps) {
    const [students, setStudents] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);

    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [grade, setGrade] = useState('');

    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const fetchData = async () => {
            setIsLoadingData(true);
            try {
                // Fetch Students
                const studentsRes = await api.get('/users?role=STUDENT&limit=100');
                setStudents(studentsRes.data.users || []);

                // Fetch Courses (Assuming all available courses, or enrolled courses if we had a specific endpoint)
                const coursesRes = await api.get('/courses');
                setCourses(coursesRes.data.courses || []);

                // Fetch Templates
                const templatesRes = await api.get('/certificates/admin/templates');
                setTemplates(templatesRes.data.templates || []);
            } catch (error) {
                toast.error('Failed to load required data');
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!selectedStudent || !selectedCourse || !selectedTemplate) {
            toast.error('Please select student, course, and template.');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/certificates/bulk-generate', {
                userIds: [selectedStudent],
                courseId: selectedCourse,
                templateId: selectedTemplate,
                issueDate,
                grade: grade || null
            });
            toast.success('Certificate issued successfully!');
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to issue certificate');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Issue Certificate</DialogTitle>
                    <DialogDescription>
                        Generate a new certificate for a student using your co-branded templates.
                    </DialogDescription>
                </DialogHeader>

                {isLoadingData ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Student</Label>
                            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a student" />
                                </SelectTrigger>
                                <SelectContent>
                                    {students.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.name} ({s.email})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Course</Label>
                            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Template</Label>
                            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a template" />
                                </SelectTrigger>
                                <SelectContent>
                                    {templates.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Issue Date</Label>
                            <Input 
                                type="date" 
                                value={issueDate} 
                                onChange={(e) => setIssueDate(e.target.value)} 
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Grade (Optional)</Label>
                            <Input 
                                placeholder="e.g., A+, 95%" 
                                value={grade} 
                                onChange={(e) => setGrade(e.target.value)} 
                            />
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || isLoadingData}>
                        {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Issue Certificate
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
