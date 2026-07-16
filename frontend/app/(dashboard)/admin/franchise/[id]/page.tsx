'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';

export default function FranchiseProfile() {
    const { id } = useParams();
    const router = useRouter();
    const [franchise, setFranchise] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { hasPermission } = useAuth();

    useEffect(() => {
        const fetchFranchise = async () => {
            try {
                const res = await api.get(`/franchise/${id}`);
                if (res.data.success) {
                    setFranchise(res.data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchFranchise();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!franchise) return <div>Franchise not found</div>;

    return (
        <div className="p-6 space-y-6">
            <Button variant="ghost" className="mb-2" onClick={() => router.push('/admin/franchise')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Franchise List
            </Button>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">{franchise.name}</h1>
                    <p className="text-gray-500">Branch Code: {franchise.branchCode}</p>
                </div>
                <Badge variant={franchise.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {franchise.status}
                </Badge>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="verification">Verification Docs</TabsTrigger>
                    <TabsTrigger value="subscription">Subscription</TabsTrigger>
                    <TabsTrigger value="revenue">Revenue</TabsTrigger>
                    <TabsTrigger value="staff">Staff</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                    <Card>
                        <CardHeader>
                            <CardTitle>Organization Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p><strong>Type:</strong> {franchise.franchiseType}</p>
                            <p><strong>Contact Person:</strong> {franchise.contactPerson}</p>
                            <p><strong>Email:</strong> {franchise.email}</p>
                            <p><strong>Phone:</strong> {franchise.phone}</p>
                            <p><strong>Address:</strong> {franchise.address}, {franchise.city}, {franchise.state} - {franchise.pincode}</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="verification">
                    <Card>
                        <CardHeader>
                            <CardTitle>Verification Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {franchise.verifications?.length > 0 ? (
                                <div className="space-y-4">
                                    {franchise.verifications.map((v: any) => (
                                        <div key={v.id} className="p-4 border rounded-md">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-semibold">Verification Request</h3>
                                                <Badge variant={v.status === 'APPROVED' ? 'default' : v.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                                                    {v.status || 'PENDING'}
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">PAN Number</p>
                                                    <p>{v.panNumber || 'Not provided'}</p>
                                                    {v.panUrl && <a href={v.panUrl} target="_blank" className="text-blue-500 text-sm">View Document</a>}
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">GST Number</p>
                                                    <p>{v.gstNumber || 'Not provided'}</p>
                                                    {v.gstUrl && <a href={v.gstUrl} target="_blank" className="text-blue-500 text-sm">View Document</a>}
                                                </div>
                                            </div>
                                            {v.status === 'PENDING' && hasPermission('FRANCHISES', 'update') && (
                                                <div className="mt-4 flex space-x-2">
                                                    <Button size="sm" variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">Approve</Button>
                                                    <Button size="sm" variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200">Reject</Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md text-center text-sm text-gray-500">
                                    No verification documents submitted yet.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="subscription">
                    <Card>
                        <CardHeader>
                            <CardTitle>Subscription & Plans</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {franchise.subscriptions?.length > 0 ? (
                                <div className="space-y-4">
                                    {franchise.subscriptions.map((s: any) => (
                                        <div key={s.id} className="flex justify-between items-center p-4 border rounded-md">
                                            <div>
                                                <h3 className="font-semibold">{s.planName}</h3>
                                                <p className="text-sm text-gray-500">Valid until: {new Date(s.endDate).toLocaleDateString()}</p>
                                            </div>
                                            <Badge variant={s.status === 'ACTIVE' ? 'default' : 'secondary'}>{s.status}</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md text-center text-sm text-gray-500">
                                    No active subscriptions found.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="revenue">
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue & Settlements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {franchise.revenues?.length > 0 ? (
                                <table className="w-full text-sm text-left mt-4 border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-900 border-b">
                                            <th className="px-4 py-2 font-medium">Date</th>
                                            <th className="px-4 py-2 font-medium">Total Amount</th>
                                            <th className="px-4 py-2 font-medium">Franchise Share</th>
                                            <th className="px-4 py-2 font-medium">Techwell Share</th>
                                            <th className="px-4 py-2 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {franchise.revenues.map((r: any) => (
                                            <tr key={r.id}>
                                                <td className="px-4 py-2">{new Date(r.createdAt).toLocaleDateString()}</td>
                                                <td className="px-4 py-2 font-semibold">₹{r.totalAmount}</td>
                                                <td className="px-4 py-2 text-green-600">₹{r.franchiseShare}</td>
                                                <td className="px-4 py-2 text-blue-600">₹{r.techwellShare}</td>
                                                <td className="px-4 py-2"><Badge variant="outline">{r.status}</Badge></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md text-center text-sm text-gray-500">
                                    No revenue records found.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="staff">
                    <Card>
                        <CardHeader>
                            <CardTitle>Franchise Staff</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {franchise.users?.map((u: any) => (
                                    <li key={u.id} className="flex justify-between p-2 border rounded">
                                        <span>{u.name} ({u.email})</span>
                                        <Badge>{u.role}</Badge>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
