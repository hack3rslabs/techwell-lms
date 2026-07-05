"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ShieldCheck, ShieldAlert, Award, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import axios from 'axios'
import { format } from 'date-fns'

export default function VerificationPortal() {
    const router = useRouter()
    const [searchId, setSearchId] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchId.trim()) return

        try {
            setLoading(true)
            setError(null)
            setResult(null)

            const res = await axios.get(`/api/certificates/verify/${searchId.trim()}`)
            setResult(res.data)
        } catch (err: any) {
            console.error(err)
            if (err.response?.status === 404) {
                setError("Certificate not found. Please check the ID and try again.")
            } else {
                setError("An error occurred during verification. Please try again.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 py-16 px-4 flex flex-col items-center selection:bg-amber-200">
            
            <div className="text-center mb-12">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-xl border border-slate-700">
                    <Award className="w-8 h-8 text-amber-500" />
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Credential Verification</h1>
                <p className="text-slate-500 max-w-lg mx-auto">
                    Verify the authenticity of Techwell Consulting certificates. Enter the unique Certificate ID or Registration ID below.
                </p>
            </div>

            <Card className="w-full max-w-xl shadow-xl border-0 ring-1 ring-slate-100">
                <CardHeader className="bg-white border-b border-slate-100 pb-8 pt-8">
                    <form onSubmit={handleVerify} className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input 
                                placeholder="e.g. TW-CERT-1A2B3C4D or C3HLABS-123" 
                                className="pl-10 h-12 bg-slate-50 border-slate-200 focus-visible:ring-slate-900 text-lg uppercase"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                            />
                        </div>
                        <Button 
                            type="submit" 
                            disabled={!searchId.trim() || loading}
                            className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify"}
                        </Button>
                    </form>
                </CardHeader>
                
                <CardContent className="p-0 bg-slate-50/50">
                    {error && (
                        <div className="p-8 text-center">
                            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Verification Failed</h3>
                            <p className="text-red-600 font-medium">{error}</p>
                        </div>
                    )}

                    {result && result.verified && (
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-6 justify-center">
                                <div className="bg-green-100 p-2 rounded-full">
                                    <ShieldCheck className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-green-700">Valid Certificate</h3>
                            </div>
                            
                            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm">
                                <div>
                                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Recipient</p>
                                    <p className="text-xl font-bold text-slate-900">{result.certificate.studentName}</p>
                                </div>
                                <div className="border-t border-slate-100 pt-4">
                                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Course Completed</p>
                                    <p className="text-lg font-medium text-slate-800">{result.certificate.courseName}</p>
                                    {result.certificate.courseCategory && (
                                        <span className="inline-block mt-2 text-xs font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded">
                                            {result.certificate.courseCategory}
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Issue Date</p>
                                        <p className="font-medium text-slate-700">
                                            {format(new Date(result.certificate.issueDate), 'MMM dd, yyyy')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Certificate ID</p>
                                        <p className="font-mono font-medium text-slate-700">{result.certificate.uniqueId}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-8 text-center">
                                <Button 
                                    onClick={() => router.push(`/certificates/${result.certificate.uniqueId}`)}
                                    variant="outline"
                                    className="border-slate-300 hover:bg-slate-100"
                                >
                                    View Original Certificate
                                </Button>
                            </div>
                        </div>
                    )}

                    {result && !result.verified && !error && (
                        <div className="p-8 text-center">
                            <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Certificate Invalid</h3>
                            <p className="text-slate-600">
                                {result.isRevoked ? "This certificate has been revoked by the issuer." : "This certificate has expired."}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <p className="text-center text-sm text-slate-400 mt-12">
                &copy; {new Date().getFullYear()} Techwell Consulting. All rights reserved.
            </p>
        </div>
    )
}
