"use client"

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, Download, ArrowLeft, ShieldCheck, Award, Linkedin } from 'lucide-react'
import api from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

import { useSearchParams } from 'next/navigation'
import { CertificateTemplate } from '@/components/CertificateTemplate'

export default function CertificatePage() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()

    interface Certificate {
        id: string
        uniqueId: string
        studentName: string
        courseName: string
        courseCategory?: string
        grade?: string
        score?: number
        issueDate: string
        signatoryName?: string
        signatoryTitle?: string
        signatureUrl?: string
        instituteLogoUrl?: string
        stampUrl?: string
        stampPosition?: string
        isValid: boolean
    }
    
    const [certificate, setCertificate] = React.useState<Certificate | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchCertificate = async () => {
            try {
                const res = await api.get(`/certificates/${params.id}`)
                setCertificate(res.data.certificate)
            } catch (error) {
                console.error("Certificate fetch error", error)
            } finally {
                setIsLoading(false)
            }
        }
        if (params.id) {
            fetchCertificate()
        }
    }, [params.id])

    React.useEffect(() => {
        if (searchParams.get('print') === 'true' && certificate && !isLoading) {
            setTimeout(() => {
                window.print()
            }, 500)
        }
    }, [searchParams, certificate, isLoading])

    const handlePrint = () => {
        window.print()
    }

    const handleLinkedInShare = () => {
        if (!certificate) return;
        const issueDateObj = new Date(certificate.issueDate);
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        const verifyUrl = `${baseUrl}/verify/${certificate.uniqueId}`;
        
        const params = new URLSearchParams({
            startTask: 'CERTIFICATION_NAME',
            name: certificate.courseName,
            organizationName: 'Techwell',
            issueYear: issueDateObj.getFullYear().toString(),
            issueMonth: (issueDateObj.getMonth() + 1).toString(),
            certId: certificate.uniqueId,
            certUrl: verifyUrl
        });

        window.open(`https://www.linkedin.com/profile/add?${params.toString()}`, '_blank', 'width=800,height=600');
    }

    if (isLoading) return <div className="flex justify-center p-20 bg-slate-950 min-h-screen items-center"><Loader2 className="animate-spin text-indigo-400 h-8 w-8" /></div>

    if (!certificate) return <div className="text-center p-20 bg-slate-950 text-slate-400 min-h-screen">Certificate not found.</div>

    const courseName = certificate.courseName
    const studentName = certificate.studentName
    const date = new Date(certificate.issueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
    const certificateId = certificate.uniqueId
    const signatoryName = certificate.signatoryName || "Director"
    const signatoryTitle = certificate.signatoryTitle || "Academic Director"

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center py-10 print:bg-white print:p-0">
            {/* Control Panel */}
            <div className="w-full max-w-[940px] flex justify-between items-center mb-6 print:hidden px-4">
                <Button variant="outline" onClick={() => router.back()} className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
                <div className="flex gap-4">
                    <Button 
                        onClick={handleLinkedInShare} 
                        className="bg-[#0077b5] hover:bg-[#0077b5]/90 text-white shadow-lg shadow-[#0077b5]/20"
                    >
                        <Linkedin className="mr-2 h-4 w-4" /> Add to LinkedIn
                    </Button>
                    <Button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20">
                        <Download className="mr-2 h-4 w-4" /> Print/Save PDF
                    </Button>
                </div>
            </div>

            {/* Certificate Canvas */}
            <CertificateTemplate 
                certificate={certificate} 
                logoUrl={certificate.instituteLogoUrl} 
                stampUrl={certificate.stampUrl}
                stampPosition={certificate.stampPosition}
            />

            <style jsx global>{`
                @media print {
                    @page { margin: 0; size: landscape; }
                    body { background: white; }
                    .print\\:hidden { display: none; }
                }
            `}</style>
        </div>
    )
}
