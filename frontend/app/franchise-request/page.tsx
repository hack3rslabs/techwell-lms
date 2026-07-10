'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';

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
        <div className="container mx-auto py-12 px-4 max-w-3xl">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">Become a Techwell Franchise</CardTitle>
                    <CardDescription className="text-md mt-2">
                        Partner with an industry leader in IT Training and Placement. Fill out the form below to start your journey.
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
    );
}
