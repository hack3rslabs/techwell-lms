"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function EmployerCreateDrive() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        jobRole: '',
        salary: '',
        openings: '',
        targetYear: '',
        location: '',
        scheduledDate: '',
        skills: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/campus-drives', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    ...formData,
                    isOffCampus: false, // Employers can only create internal drives, Admin can make it public
                    skills: formData.skills.split(',').map(s => s.trim())
                })
            });
            
            if (res.ok) {
                alert('Campus Drive created successfully!');
                router.push('/employer/dashboard'); // redirect to dashboard or drives list
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to create drive');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-4xl mx-auto">
            <div className="mb-8">
                            <Link href="/employer/dashboard" className="inline-flex items-center text-sm font-medium text-indigo-500 hover:text-indigo-600 mb-4">
                                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl text-slate-800 font-bold">Post a Campus Drive</h1>
                                    <p className="text-slate-500 mt-1">Create a new recruitment drive and invite partner institutes.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Drive Title *</label>
                                        <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. 2026 Freshers Hiring Drive" />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Job Role *</label>
                                        <input type="text" name="jobRole" required value={formData.jobRole} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Software Engineer" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Target Batch / Year *</label>
                                        <input type="text" name="targetYear" required value={formData.targetYear} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. 2025, 2026" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Salary / CTC Package</label>
                                        <input type="text" name="salary" value={formData.salary} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. 8 LPA" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Number of Openings</label>
                                        <input type="number" name="openings" value={formData.openings} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="10" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Location *</label>
                                        <input type="text" name="location" required value={formData.location} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="On-Site / Remote" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Tentative Schedule Date *</label>
                                        <input type="date" name="scheduledDate" required value={formData.scheduledDate} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Required Skills (comma separated)</label>
                                        <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="React, Node.js, AWS" />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Description & Eligibility Criteria</label>
                                        <textarea name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Describe the job, bond conditions, and interview rounds..."></textarea>
                                    </div>
                                </div>

                                <div className="flex justify-end mt-8 border-t border-slate-200 pt-6">
                                    <button type="submit" disabled={submitting} className="btn bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg font-medium flex items-center disabled:opacity-70">
                                        {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        {submitting ? 'Creating...' : 'Post Drive'}
                                    </button>
                                </div>
                            </form>
                        </div>
        </div>
    );
}
