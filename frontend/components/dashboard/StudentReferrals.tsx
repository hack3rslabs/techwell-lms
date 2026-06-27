"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { referralApi } from '@/lib/api'
import { Copy, Gift, Share2, Users, IndianRupee, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

interface ReferralStats {
    referralCode: string | null
    referralCommissionBal: number
    referredCount: number
    rewards: Array<{
        id: string
        amount: number
        status: string
        createdAt: string
        referred: {
            name: string
        }
    }>
}

export function StudentReferrals() {
    const [stats, setStats] = useState<ReferralStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [copied, setCopied] = useState(false)

    const fetchStats = async () => {
        try {
            const res = await referralApi.getMe()
            setStats(res.data.data)
        } catch (error) {
            console.error(error)
            toast.error("Failed to load referral details.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [])

    const handleGenerate = async () => {
        setGenerating(true)
        try {
            const res = await referralApi.generateCode()
            toast.success("Referral code generated!")
            setStats(res.data.data)
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to generate code.")
        } finally {
            setGenerating(false)
        }
    }

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        toast.success("Code copied to clipboard!")
        setTimeout(() => setCopied(false), 2000)
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Gift className="h-5 w-5" /> Commission Earned
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">₹{stats?.referralCommissionBal || 0}</div>
                        <p className="text-indigo-100 mt-1 text-sm">Available for withdrawal or courses</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Users className="h-5 w-5" /> Friends Referred
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{stats?.referredCount || 0}</div>
                        <p className="text-blue-100 mt-1 text-sm">Total successful referrals</p>
                    </CardContent>
                </Card>
                
                <Card className="bg-white border-gray-200 shadow-sm relative overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                            <Share2 className="h-5 w-5 text-indigo-500" /> Your Code
                        </CardTitle>
                        <CardDescription>Share this code with your friends.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {stats?.referralCode ? (
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 font-mono text-center font-bold text-lg tracking-widest text-indigo-700">
                                    {stats.referralCode}
                                </div>
                                <Button 
                                    size="icon" 
                                    variant="outline" 
                                    onClick={() => handleCopy(stats.referralCode!)}
                                    className="h-12 w-12 shrink-0"
                                >
                                    {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-sm text-gray-500 mb-3">You don't have a referral code yet.</p>
                                <Button onClick={handleGenerate} disabled={generating} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                                    {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Gift className="h-4 w-4 mr-2" />}
                                    Generate Code
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Referral History</CardTitle>
                    <CardDescription>Track the status of your referrals and commissions.</CardDescription>
                </CardHeader>
                <CardContent>
                    {!stats?.rewards || stats.rewards.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Users className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No referrals yet</h3>
                            <p className="text-gray-500">Share your code with friends to start earning.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {stats.rewards.map(reward => (
                                <div key={reward.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                                            {reward.referred.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{reward.referred.name}</p>
                                            <p className="text-xs text-gray-500">{new Date(reward.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-emerald-600">₹{reward.amount}</p>
                                        <Badge variant="outline" className={reward.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                                            {reward.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
