"use client"

import * as React from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, Download, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import api from '@/lib/api'

export default function CertificatePage() {
    const params = useParams()
    const _searchParams = useSearchParams()
    const router = useRouter()
    const { user: _user } = useAuth()

    // In a real app, we would fetch enrollment by ID to verify completion
    // For V1, we will mock the "Course Name" and "Completion Date" validation 
    // or assume they are passed/fetched. 
    // Let's fetch the course details based on ID which is likely courseID or EnrollmentID.

    // Assuming params.id is courseId for simplicity in this flow,
    // or better, fetch 'my enrollment' for this course.

    const _courseId = params.id as string

    interface Certificate {
        id: string
        uniqueId: string
        studentName: string
        courseName: string
        issueDate: string
        signatoryName?: string
        signatoryTitle?: string
        signatureUrl?: string
    }
    const [certificate, setCertificate] = React.useState<Certificate | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchCertificate = async () => {
            try {
                // Determine if ID is existing DB ID or needs verification
                // Since this page handles /certificate/[id], we assume ID.
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

    const handlePrint = () => {
        window.print()
    }

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>

    if (!certificate) return <div className="text-center p-20">Certificate not found.</div>

    const courseName = certificate.courseName
    const studentName = certificate.studentName
    const date = new Date(certificate.issueDate).toLocaleDateString()
    const certificateId = certificate.uniqueId
    const signatoryName = certificate.signatoryName || "Director"
    const signatoryTitle = certificate.signatoryTitle || "Academic Director"

    return (
        <div className="min-h-screen bg-neutral-100 flex flex-col items-center py-10 print:bg-white print:p-0">
            {/* No Print Controls */}
            <div className="w-full max-w-[800px] flex justify-between items-center mb-6 print:hidden px-4">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handlePrint} className="bg-primary text-primary-foreground">
                    <Download className="mr-2 h-4 w-4" /> Download/Print PDF
                </Button>
            </div>

            {/* Certificate Container */}
            <div className="bg-white text-black w-full max-w-[800px] aspect-[1.414/1] shadow-2xl p-10 relative border-[20px] border-double border-neutral-200 print:shadow-none print:border-4 print:w-full print:aspect-auto print:h-screen">
                {/* Decorative Corner */}
                <div className="absolute top-4 left-4 border-t-4 border-l-4 border-primary w-16 h-16"></div>
                <div className="absolute bottom-4 right-4 border-b-4 border-r-4 border-primary w-16 h-16"></div>

                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 border-2 border-neutral-100 h-full p-8">

                    {/* Logo / Header */}
                    <div className="mb-4">
                        <div className="text-4xl font-bold tracking-widest uppercase text-primary font-serif">
                            TechWell
                        </div>
                        <div className="text-sm text-muted-foreground tracking-widest uppercase mt-1">
                            Institute of Technology
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-5xl font-script text-neutral-800 font-serif">Certificate of Completion</h1>
                        <p className="text-neutral-500 uppercase tracking-widest text-sm">This is to certify that</p>
                    </div>

                    {/* Name */}
                    <div className="border-b-2 border-neutral-300 pb-2 px-10 w-3/4">
                        <h2 className="text-4xl font-bold capitalize text-neutral-900 font-serif italic">
                            {studentName}
                        </h2>
                    </div>

                    <div className="space-y-2">
                        <p className="text-neutral-500 uppercase tracking-widest text-sm">Has successfully completed the course</p>
                        <h3 className="text-2xl font-bold text-neutral-800 max-w-[80%] mx-auto">
                            {courseName}
                        </h3>
                    </div>

                    {/* Details */}
                    <div className="flex justify-between w-full px-10 pt-10 mt-auto">
                        <div className="text-left">
                            <p className="text-xs text-neutral-400 uppercase tracking-wider">Date</p>
                            <p className="text-base font-medium">{date}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-neutral-400 uppercase tracking-wider">Certificate ID</p>
                            <p className="text-base font-medium font-mono">{certificateId}</p>
                        </div>
                        <div className="text-right">
                            {/* Signature Line */}
                            <div className="border-b border-neutral-400 w-32 mb-1"></div>
                            <p className="text-xs text-neutral-400 uppercase tracking-wider">{signatoryName}</p>
                            <p className="text-[10px] text-neutral-400 uppercase tracking-wider">{signatoryTitle}</p>
                        </div>
                    </div>
                </div>
            </div>

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
