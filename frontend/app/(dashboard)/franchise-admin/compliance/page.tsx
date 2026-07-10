'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function FranchiseCompliancePage() {
    const { user } = useAuth();
    const [franchise, setFranchise] = useState<any>(null);
    const [agreements, setAgreements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [panNumber, setPanNumber] = useState('');
    const [gstNumber, setGstNumber] = useState('');

    const fetchData = async () => {
        if (!user?.franchiseId) return;
        try {
            const [resFran, resAgr] = await Promise.all([
                api.get(`/franchise/${user.franchiseId}`),
                api.get(`/franchise/${user.franchiseId}/agreement`)
            ]);
            if (resFran.data.success) {
                setFranchise(resFran.data.data);
                // Pre-fill if exists
                const latestVer = resFran.data.data.verifications?.[0];
                if (latestVer) {
                    setPanNumber(latestVer.panNumber || '');
                    setGstNumber(latestVer.gstNumber || '');
                }
            }
            if (resAgr.data.success) {
                setAgreements(resAgr.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user?.franchiseId]);

    const handleUploadKYC = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post(`/franchise/${user?.franchiseId}/verification`, {
                panNumber,
                gstNumber
            });
            if (res.data.success) {
                alert('KYC details submitted successfully.');
                fetchData(); // refresh
            }
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to submit KYC');
        }
    };

    const handleSignAgreement = async (agreementId: string) => {
        try {
            const res = await api.post(`/franchise/${user?.franchiseId}/agreement/accept`, {
                agreementId,
                digitalSignature: user?.name // Simple signature for now
            });
            if (res.data.success) {
                alert('Agreement signed successfully.');
                fetchData();
            }
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to sign agreement');
        }
    };

    if (loading) return <div className="p-6">Loading compliance dashboard...</div>;

    const latestVerification = franchise?.verifications?.[0];
    const isApproved = latestVerification?.status === 'APPROVED';
    const isPending = latestVerification?.status === 'PENDING';

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Compliance & KYC</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* KYC Verification Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <ShieldCheck className="w-5 h-5 text-blue-600" />
                            <span>Business Verification (KYC)</span>
                        </CardTitle>
                        <CardDescription>
                            Submit your PAN and GST details for approval.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 flex items-center space-x-2">
                            <span className="font-medium text-sm">Current Status:</span>
                            {isApproved ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>
                            ) : isPending ? (
                                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><AlertCircle className="w-3 h-3 mr-1" /> Pending Review</Badge>
                            ) : (
                                <Badge variant="secondary">Not Submitted</Badge>
                            )}
                        </div>

                        <form onSubmit={handleUploadKYC} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Business PAN Number</label>
                                <Input 
                                    required 
                                    value={panNumber} 
                                    onChange={e => setPanNumber(e.target.value)} 
                                    disabled={isApproved || isPending}
                                    placeholder="e.g. ABCDE1234F" 
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">GSTIN (Optional)</label>
                                <Input 
                                    value={gstNumber} 
                                    onChange={e => setGstNumber(e.target.value)} 
                                    disabled={isApproved || isPending}
                                    placeholder="e.g. 22AAAAA0000A1Z5" 
                                />
                            </div>
                            {(!isApproved && !isPending) && (
                                <Button type="submit" className="w-full">Submit for Verification</Button>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Agreements Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <FileText className="w-5 h-5 text-purple-600" />
                            <span>Franchise Agreements</span>
                        </CardTitle>
                        <CardDescription>
                            Review and digitally sign your agreements.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {agreements.length > 0 ? (
                            <div className="space-y-4">
                                {agreements.map((agr: any) => (
                                    <div key={agr.id} className="p-4 border rounded-md">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-medium">{agr.title}</h4>
                                                <p className="text-sm text-gray-500">Valid from: {new Date(agr.validFrom).toLocaleDateString()}</p>
                                            </div>
                                            <Badge variant={agr.status === 'SIGNED' ? 'default' : 'secondary'}>
                                                {agr.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-3">
                                            {agr.content}
                                        </p>
                                        {agr.status === 'PENDING' && (
                                            <div className="mt-4 pt-4 border-t">
                                                <p className="text-xs text-gray-500 mb-2">By clicking "Sign Agreement", you digitally consent to the terms above.</p>
                                                <Button size="sm" onClick={() => handleSignAgreement(agr.id)}>Sign Agreement</Button>
                                            </div>
                                        )}
                                        {agr.status === 'SIGNED' && agr.signedAt && (
                                            <div className="mt-4 pt-4 border-t">
                                                <p className="text-xs text-green-600 flex items-center">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Signed on {new Date(agr.signedAt).toLocaleDateString()} by {agr.digitalSignature}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 border border-dashed rounded-md">
                                <FileText className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                                <p>No agreements found.</p>
                                <p className="text-sm">When Techwell sends you an agreement, it will appear here.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
