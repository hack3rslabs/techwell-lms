'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, UserCheck, UserX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function FranchiseStaffPage() {
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddMode, setIsAddMode] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'STAFF'
    });

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const res = await api.get('/users?role=STAFF,INSTRUCTOR');
            if (res.data.users) {
                setStaff(res.data.users);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/users', formData);
            if (res.data.user) {
                setStaff([res.data.user, ...staff]);
                setIsAddMode(false);
                setFormData({ name: '', email: '', password: '', phone: '', role: 'STAFF' });
            }
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to add staff');
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const res = await api.patch(`/users/${id}/status`, { isActive: !currentStatus });
            if (res.data.user) {
                setStaff(staff.map(s => s.id === id ? { ...s, isActive: !currentStatus } : s));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filteredStaff = staff.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Staff Management</h1>
                <Button onClick={() => setIsAddMode(!isAddMode)}>
                    {isAddMode ? 'Cancel' : <><Plus className="mr-2 h-4 w-4" /> Add New Staff</>}
                </Button>
            </div>

            {isAddMode && (
                <Card className="mb-6 border-blue-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Add New Staff Member</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Full Name</label>
                                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Email</label>
                                <Input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Password</label>
                                <Input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Must be at least 8 chars" minLength={8} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Phone</label>
                                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 XXXXX XXXXX" />
                            </div>
                            <div className="md:col-span-2 flex justify-end mt-2">
                                <Button type="submit">Create Account</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center w-full">
                        <CardTitle>My Team</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                            <Input 
                                placeholder="Search staff..." 
                                className="pl-8" 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-4">Loading staff...</p>
                    ) : filteredStaff.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-gray-900 border-b">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Name</th>
                                        <th className="px-4 py-3 font-medium">Email</th>
                                        <th className="px-4 py-3 font-medium">Role</th>
                                        <th className="px-4 py-3 font-medium">Joined</th>
                                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredStaff.map((s: any) => (
                                        <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <td className="px-4 py-3 font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                        {s.name.charAt(0)}
                                                    </div>
                                                    <span>{s.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">{s.email}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline">{s.role}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                                            <td className="px-4 py-3 text-right">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className={s.isActive ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                                                    onClick={() => toggleStatus(s.id, s.isActive)}
                                                >
                                                    {s.isActive ? <UserX className="h-4 w-4 mr-1" /> : <UserCheck className="h-4 w-4 mr-1" />}
                                                    {s.isActive ? 'Deactivate' : 'Activate'}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500 border border-dashed rounded-md">
                            <UserX className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">No staff found</p>
                            <p className="text-sm mt-1">You haven't added any team members yet.</p>
                            <Button className="mt-4" onClick={() => setIsAddMode(true)}>
                                <Plus className="mr-2 h-4 w-4" /> Add Your First Staff Member
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
