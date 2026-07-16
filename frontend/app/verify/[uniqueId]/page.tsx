"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ShieldCheck, Download, Loader2, Calendar, User, BookOpen, Clock } from "lucide-react";
import { certificateApi } from "@/lib/api";
import { format } from "date-fns";

export default function VerificationPortal() {
    const params = useParams();
    const uniqueId = params.uniqueId as string;

    const [loading, setLoading] = useState(true);
    const [certificate, setCertificate] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const verifyCertificate = async () => {
            try {
                // Adjust if your API is slightly different
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/certificates/verify/${uniqueId}`);
                if (!res.ok) throw new Error("Certificate not found or invalid");
                const data = await res.json();
                setCertificate(data);
            } catch (err: any) {
                setError(err.message || "Failed to verify certificate");
            } finally {
                setLoading(false);
            }
        };

        if (uniqueId) verifyCertificate();
    }, [uniqueId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    if (error || !certificate) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-xl border-t-4 border-t-red-500">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Verification Failed</h1>
                        <p className="text-slate-500">We could not find a valid certificate matching the ID: <span className="font-mono text-slate-900">{uniqueId}</span></p>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => window.location.href = "/"}>
                        Return Home
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-3xl w-full space-y-8">
                
                {/* Header Section */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-4">
                        <ShieldCheck className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Verified Credential</h1>
                    <p className="text-lg text-slate-500">This certificate is valid and was securely issued by the system.</p>
                </div>

                <Card className="bg-white shadow-2xl rounded-2xl overflow-hidden border-t-8 border-t-green-500">
                    <div className="p-8 sm:p-10 space-y-8">
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-8 border-b">
                            <div>
                                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Credential ID</h2>
                                <p className="text-2xl font-mono text-slate-800">{certificate.uniqueId}</p>
                            </div>
                            <Badge variant={certificate.status === 'ISSUED' ? 'default' : 'destructive'} className="px-4 py-2 text-sm font-semibold shadow-sm">
                                {certificate.status === 'ISSUED' ? 'ACTIVE & VALID' : 'REVOKED'}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-1">
                                        <User className="w-4 h-4" /> Issued To
                                    </h3>
                                    <p className="text-xl font-bold text-slate-900">{certificate.studentName}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-1">
                                        <BookOpen className="w-4 h-4" /> {certificate.referenceType === 'WEBINAR' ? 'Webinar' : 'Course'}
                                    </h3>
                                    <p className="text-lg font-semibold text-slate-800">{certificate.courseName}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-1">
                                        <Calendar className="w-4 h-4" /> Issue Date
                                    </h3>
                                    <p className="text-lg font-semibold text-slate-800">
                                        {format(new Date(certificate.issueDate), 'MMMM do, yyyy')}
                                    </p>
                                </div>
                                {certificate.credentialHash && (
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-1">
                                            <ShieldCheck className="w-4 h-4" /> Secure Hash
                                        </h3>
                                        <p className="text-xs font-mono text-slate-600 bg-slate-50 p-2 rounded break-all border">
                                            {certificate.credentialHash}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                    
                    <div className="bg-slate-50 p-6 border-t flex justify-center sm:justify-start items-center flex-wrap gap-4">
                        <p className="text-sm text-slate-500">
                            Verification powered by Corporate Blockchain Auth
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
