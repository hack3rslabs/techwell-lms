"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, ShieldCheck, ShieldAlert, Award, Calendar, User, FileText, ArrowRight, Loader2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'

interface VerifiedCert {
    uniqueId: string
    studentName: string
    courseName: string
    courseCategory: string
    issueDate: string
    expiryDate: string | null
    grade: string
    isValid: boolean
    signatoryName: string
    signatoryTitle: string
}

export default function VerificationPage() {
    const [searchId, setSearchId] = React.useState('')
    const [isLoading, setIsLoading] = React.useState(false)
    const [result, setResult] = React.useState<{ verified: boolean, certificate?: VerifiedCert, isExpired?: boolean } | null>(null)
    const [error, setError] = React.useState<string | null>(null)

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchId.trim()) return
        setIsLoading(true)
        setError(null)
        setResult(null)

        try {
            const res = await api.get(`/certificates/verify/${searchId.trim()}`)
            setResult(res.data)
        } catch (err: any) {
            console.error('Verification query failed:', err)
            setError(err.response?.data?.error || 'Certificate not found or invalid format.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-50">
            {/* Header branding */}
            <div className="text-center mb-8 space-y-2">
                <div className="flex justify-center items-center gap-2 mb-2">
                    <Award className="h-10 w-10 text-indigo-400" />
                    <span className="text-2xl font-black tracking-wider uppercase text-white font-serif">Techwell</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent">
                    Official Student Credential Verification
                </h1>
                <p className="text-slate-400 max-w-md text-sm mx-auto">
                    Verify the authenticity of Techwell graduation certificates and course completion credentials.
                </p>
            </div>

            {/* Input card */}
            <Card className="w-full max-w-md bg-slate-900 border-slate-800 shadow-xl shadow-indigo-500/5">
                <CardContent className="pt-6">
                    <form onSubmit={handleVerify} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-300 uppercase tracking-widest block">
                                Unique Certificate ID / Reg ID
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="e.g. TW-2026-0001"
                                    value={searchId}
                                    onChange={e => setSearchId(e.target.value)}
                                    className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 font-mono focus-visible:ring-indigo-500"
                                    required
                                />
                                <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 px-4 shrink-0">
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                    Verify
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Result display */}
            <div className="w-full max-w-md mt-6">
                {error && (
                    <Card className="bg-red-950/20 border-red-900/50 text-red-400">
                        <CardContent className="flex items-start gap-3 pt-6">
                            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-sm">Credential Mismatch</h3>
                                <p className="text-xs text-red-400/80 mt-1">{error}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {result && result.verified && result.certificate && (
                    <Card className="bg-slate-900 border-teal-500/30 overflow-hidden shadow-lg shadow-teal-500/5">
                        {/* Status bar */}
                        <div className="bg-teal-500/10 border-b border-teal-500/20 px-4 py-3 flex items-center gap-2 text-teal-400">
                            <ShieldCheck className="h-5 w-5" />
                            <span className="text-xs font-bold uppercase tracking-wider">Validated Credential Match</span>
                        </div>
                        
                        <CardContent className="pt-5 space-y-4">
                            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Student Name</span>
                                    <span className="text-base font-bold text-slate-100 font-serif">{result.certificate.studentName}</span>
                                </div>
                                <Badge className="bg-teal-950 border-teal-900 text-teal-300">Active</Badge>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-xs text-slate-300">
                                    <FileText className="h-4 w-4 text-slate-500" />
                                    <span><strong>Course:</strong> {result.certificate.courseName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-300">
                                    <Calendar className="h-4 w-4 text-slate-500" />
                                    <span><strong>Issue Date:</strong> {new Date(result.certificate.issueDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-300">
                                    <User className="h-4 w-4 text-slate-500" />
                                    <span><strong>Authority:</strong> {result.certificate.signatoryName} ({result.certificate.signatoryTitle})</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-2 border-t border-slate-800 flex justify-end">
                                <Link href={`/certificate/${result.certificate.uniqueId}`} className="w-full">
                                    <Button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border-0 flex items-center justify-center gap-1">
                                        View Certificate <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Link back home */}
            <Link href="/" className="mt-8 text-xs text-slate-500 hover:text-indigo-400 transition-colors">
                Back to Techwell Home
            </Link>
        </div>
    )
}
