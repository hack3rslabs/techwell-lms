'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

export default function FranchiseRegistration() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        franchiseType: 'INDIVIDUAL',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        password: ''
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/franchise/register', formData);
            if (res.data.success) {
                toast.success('Franchise registered successfully!');
                router.push('/admin/franchise');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-4">
            <Button variant="ghost" onClick={() => router.push('/admin/franchise')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Franchise List
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>Register New Franchise</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Franchise/Organization Name</Label>
                            <Input 
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Franchise Type</Label>
                            <select 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.franchiseType}
                                onChange={(e) => setFormData({...formData, franchiseType: e.target.value})}
                            >
                                <option value="INDIVIDUAL">Individual</option>
                                <option value="COMPANY">Company</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Contact Person</Label>
                            <Input 
                                required
                                value={formData.contactPerson}
                                onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input 
                                    required type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input 
                                    required type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Initial Password</Label>
                            <Input 
                                required type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Full Address</Label>
                            <Input 
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                            />
                        </div>
                        
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Registering...' : 'Register Franchise'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
