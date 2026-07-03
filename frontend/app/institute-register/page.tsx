"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterInstitute() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        type: 'TRAINING_INSTITUTE',
        state: '',
        district: '',
        city: '',
        website: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/institutes/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(true);
            } else {
                alert(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred during registration');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-medium text-gray-900 mb-2">Registration Submitted</h2>
                        <p className="text-gray-500 mb-6">
                            Your institute registration has been successfully submitted. Our team will review your application and contact you shortly.
                        </p>
                        <Link href="/" className="text-indigo-600 hover:text-indigo-500 font-medium">
                            Return to Homepage
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 lg:p-0">
            <div className="w-full max-w-[1400px] h-full lg:h-[850px] bg-card rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden grid lg:grid-cols-2 border border-border">
                <div className="hidden lg:flex flex-col relative bg-muted p-12 overflow-hidden justify-between">
                    <div className="absolute inset-0 z-0">
                        <div 
                            className="absolute inset-0 bg-cover bg-center" 
                            style={{ backgroundImage: 'url(/images/institute-bg.jpg)' }} 
                        />
                        <div className="absolute inset-0 bg-indigo-900/60 mix-blend-multiply" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <Image src="/logo-dark.png" alt="Techwell" width={160} height={48} priority className="brightness-0 invert drop-shadow-md" />
                        </div>
                        
                        <div className="relative z-20 mt-auto bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-2xl">
                            <blockquote className="space-y-4 text-white">
                                <p className="text-xl font-medium leading-relaxed tracking-wide">
                                    &quot;Techwell's Campus Hiring Hub transformed our placement cell, providing our students with direct access to top-tier employers seamlessly.&quot;
                                </p>
                                <footer className="text-sm font-semibold opacity-90 flex items-center">
                                    <span className="w-8 h-[1px] bg-white mr-3"></span>
                                    Dr. Rajesh Kumar, Dean of Placements
                                </footer>
                            </blockquote>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-12 lg:h-full lg:overflow-y-auto lg:max-h-[850px]">
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[500px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">Partner with Techwell</h1>
                        <p className="text-sm text-muted-foreground">
                            Join our ecosystem as an Institute or College
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Institute Name</label>
                                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Institute Type</label>
                                <select name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border">
                                    <option value="COLLEGE">College</option>
                                    <option value="UNIVERSITY">University</option>
                                    <option value="TRAINING_INSTITUTE">Training Institute</option>
                                    <option value="SKILL_CENTER">Skill Center</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Contact Person Name</label>
                                <input type="text" name="contactPerson" required value={formData.contactPerson} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Official Email</label>
                                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input type="text" name="phone" required value={formData.phone} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Website URL</label>
                                <input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">State</label>
                                <input type="text" name="state" value={formData.state} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">District</label>
                                <input type="text" name="district" value={formData.district} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">City</label>
                                <input type="text" name="city" value={formData.city} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border" />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {loading ? 'Submitting...' : 'Submit Registration'}
                            </button>
                        </div>
                    </form>

                    <div className="text-center text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="underline underline-offset-4 hover:text-indigo-600">
                            Login here
                        </Link>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
}
