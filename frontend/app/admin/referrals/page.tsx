"use client"

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, Users, Coins } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

interface TopReferrer {
    id: string;
    name: string;
    email: string;
    referralCode: string;
    referralCommissionBal: number;
    _count: { referralsMade: number };
}

interface AdminReferralStats {
    topReferrers: TopReferrer[];
    totalCommissionPaid: number;
}

export default function AdminReferralsPage() {
    const [stats, setStats] = React.useState<AdminReferralStats | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/api/referrals/stats');
                if (response.data.success) {
                    setStats(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch admin referral stats', error);
                toast.error('Failed to load statistics');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="p-6">
                <p className="text-muted-foreground">Could not load referral data.</p>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Referral Management</h1>
                <p className="text-muted-foreground mt-2">
                    Monitor system-wide referrals and top performing referrers.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Top Referrers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.topReferrers.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Commission Paid</CardTitle>
                        <Coins className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">₹{stats.totalCommissionPaid.toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Top Referrers</CardTitle>
                    <CardDescription>Users with the highest commission balance.</CardDescription>
                </CardHeader>
                <CardContent>
                    {stats.topReferrers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No referrals have been made yet.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Referral Code</TableHead>
                                    <TableHead>Total Referrals</TableHead>
                                    <TableHead className="text-right">Commission Balance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.topReferrers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono bg-muted px-2 py-1 rounded">{user.referralCode}</span>
                                        </TableCell>
                                        <TableCell>{user._count.referralsMade}</TableCell>
                                        <TableCell className="text-right font-medium text-green-600">
                                            ₹{user.referralCommissionBal.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
