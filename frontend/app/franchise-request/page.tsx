'use client';

import React, { useState } from 'react';
import type { Metadata } from 'next';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';
import { Building2, TrendingUp, Handshake, CheckCircle2 } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://techwell.co.in"

export const metadata: Metadata = {
  title: "IT Training & Consulting Franchise Opportunities | Techwell",
  description: "Partner with Techwell and start your own highly profitable IT Training, Placement, and Consulting franchise. Proven business model and curriculum.",
  keywords: ["IT Training Franchise", "Education Franchise", "Business Consulting Franchise", "Profitable Franchise", "Techwell Partner"],
  alternates: {
    canonical: `${BASE_URL}/franchise-request`,
  }
}

const franchiseJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Techwell Franchise Opportunities",
  description: "Start your own highly profitable IT Training and Consulting franchise with Techwell."
}

export default function FranchiseRequest() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        franchiseType: 'INDIVIDUAL',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        state: '',
        city: '',
        pincode: '',
        googleBusinessUrl: ''
    });

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/franchise/public-request', formData);
            if (res.data.success) {
                toast.success('Franchise request submitted successfully!');
                setSubmitted(true);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="container mx-auto py-20 px-4 text-center">
                <h1 className="text-4xl font-bold mb-4 text-green-600">Request Received!</h1>
                <p className="text-lg text-gray-600 mb-8">
                    Successfully submitted. Our team will contact you soon. All the best!
                </p>
                <Button onClick={() => router.push('/')}>Return to Home</Button>
            </div>
        );
    }

    return (
        <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(franchiseJsonLd) }}
        />
        <div className="bg-slate-50 dark:bg-[#030712] min-h-screen pb-24">
            
            {/* HERO SECTION */}
            <div className="bg-slate-900 text-white py-20 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6">
                    <Badge className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border-none px-4 py-2 uppercase tracking-widest font-bold">
                        Partner Network
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black">
                        Start Your Own <span className="text-orange-500">Techwell Franchise</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
                        Join India's fastest-growing ecosystem for IT Training, Placement Assistance, and Business Consulting. High ROI, zero curriculum headaches.
                    </p>
                </div>
            </div>

            {/* BENEFITS SECTION */}
            <div className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/20 text-orange-600 mx-auto rounded-full flex items-center justify-center mb-4">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">High Profit Margins</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Multiple revenue streams via courses, corporate training, and consulting.</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 text-blue-600 mx-auto rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Turnkey Curriculum</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Access to constantly updated, industry-curated syllabus and placement LMS.</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 mx-auto rounded-full flex items-center justify-center mb-4">
                        <Handshake className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Centralized Placements</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Your students get access to our 500+ MNC hiring partner network.</p>
                </div>
            </div>

            {/* FORM SECTION */}
            <div className="container mx-auto px-4 max-w-3xl">
                <Card className="border-slate-200 dark:border-slate-800 shadow-xl">
                    <CardHeader className="text-center bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 rounded-t-xl">
                        <CardTitle className="text-2xl font-bold">Apply for Partnership</CardTitle>
                        <CardDescription className="text-md mt-2">
                            Fill out the form below and our franchise director will contact you within 24 hours.
                        </CardDescription>
                    </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Organization / Business Name *</Label>
                                <Input 
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Your business name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Business Type</Label>
                                <select 
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.franchiseType}
                                    onChange={(e) => setFormData({...formData, franchiseType: e.target.value})}
                                >
                                    <option value="INDIVIDUAL">Individual</option>
                                    <option value="COMPANY">Registered Company</option>
                                    <option value="INSTITUTE">Existing Training Institute</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Contact Person Name *</Label>
                                <Input 
                                    required
                                    value={formData.contactPerson}
                                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                                    placeholder="Full Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email Address *</Label>
                                <Input 
                                    required type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone Number *</Label>
                                <Input 
                                    required type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    placeholder="+91"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>State</Label>
                                <Input 
                                    value={formData.state}
                                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                                    placeholder="e.g. Andhra Pradesh"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>City</Label>
                                <Input 
                                    value={formData.city}
                                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                                    placeholder="City"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Pincode</Label>
                                <Input 
                                    value={formData.pincode}
                                    onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                                    placeholder="Pincode"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Proposed Location Address</Label>
                            <Input 
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                placeholder="Detailed address"
                            />
                        </div>

                        {formData.franchiseType === 'INSTITUTE' && (
                            <div className="space-y-2">
                                <Label>Google My Business Location <span className="text-red-500">*</span></Label>
                                <Input 
                                    required
                                    type="url"
                                    placeholder="https://maps.app.goo.gl/..."
                                    value={formData.googleBusinessUrl}
                                    onChange={(e) => setFormData({...formData, googleBusinessUrl: e.target.value})}
                                />
                                <p className="text-xs text-muted-foreground">Required for existing institutes</p>
                            </div>
                        )}
                        
                        <Button type="submit" className="w-full text-lg h-12" size="lg" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    </div>
    </>
    );
}
