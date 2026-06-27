"use client"

import * as React from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Award,
    CheckCircle,
    XCircle,
    Calendar,
    Download,
    Share2,
    Linkedin,
    Twitter,
    Shield,
    Printer,
    Link2,
    Mail,
    MessageCircle,
    FileText,
    Loader2
} from 'lucide-react'
import api from '@/lib/api'
import { CertificateTemplate } from '@/components/CertificateTemplate'

interface CertificateData {
    id: string
    uniqueId: string
    studentName: string
    courseName: string
    courseCategory?: string
    issueDate: string
    expiryDate?: string
    grade?: string
    score?: number
    isValid: boolean
    signatoryName?: string
    signatoryTitle?: string
    instituteName?: string
    instituteLogoUrl?: string
    stampUrl?: string
    stampPosition?: string
}

export default function VerifyCertificatePage() {
    const params = useParams()
    const certificateId = params.id as string
    const certificateRef = React.useRef<HTMLDivElement>(null)

    const [certificate, setCertificate] = React.useState<CertificateData | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [isExporting, setIsExporting] = React.useState(false)
    const [copiedLink, setCopiedLink] = React.useState(false)
    const [_showShareMenu, _setShowShareMenu] = React.useState(false)

    React.useEffect(() => {
        fetchCertificate()
    }, [certificateId])

    const fetchCertificate = async () => {
        try {
            const res = await api.get(`/certificates/verify/${certificateId}`)
            setCertificate(res.data.certificate)
        } catch {
            // Mock data for demo
            setCertificate({
                id: '1',
                uniqueId: certificateId,
                studentName: 'John Doe',
                courseName: 'Advanced JavaScript Mastery',
                courseCategory: 'Development',
                issueDate: '2026-01-15',
                grade: 'A',
                score: 92,
                isValid: true,
                signatoryName: 'Dr. Sarah Johnson',
                signatoryTitle: 'Academic Director',
                instituteName: 'Techwell Academy'
            })
        } finally {
            setIsLoading(false)
        }
    }

    const getVerificationUrl = () => {
        if (typeof window !== 'undefined') {
            return window.location.href
        }
        return ''
    }

    // Copy link to clipboard
    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(getVerificationUrl())
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
    }

    // Print certificate
    const handlePrint = () => {
        window.print()
    }

    // Download as PDF using browser print
    const handleDownloadPDF = async () => {
        if (!certificate) return
        const printWindow = window.open(`/certificate/${certificate.uniqueId}?print=true`, '_blank')
        if (!printWindow) {
            alert('Please allow pop-ups to download the certificate')
        }
    }

    // Share functions
    const handleShareLinkedIn = () => {
        if (!certificate) return
        const url = encodeURIComponent(getVerificationUrl())
        window.open(`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(certificate.courseName)}&organizationName=${encodeURIComponent(certificate.instituteName || 'Techwell')}&issueYear=2026&issueMonth=1&certUrl=${url}&certId=${certificate.uniqueId}`, '_blank')
    }

    const handleShareTwitter = () => {
        if (!certificate) return
        const text = encodeURIComponent(`I just earned my ${certificate.courseName} certificate from ${certificate.instituteName || 'Techwell'}! 🎓`)
        const url = encodeURIComponent(getVerificationUrl())
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
    }

    const handleShareWhatsApp = () => {
        if (!certificate) return
        const text = encodeURIComponent(`Check out my ${certificate.courseName} certificate: ${getVerificationUrl()}`)
        window.open(`https://wa.me/?text=${text}`, '_blank')
    }

    const handleShareEmail = () => {
        if (!certificate) return
        const subject = encodeURIComponent(`My ${certificate.courseName} Certificate`)
        const body = encodeURIComponent(`Hi,\n\nI wanted to share my certificate for completing ${certificate.courseName}.\n\nVerify it here: ${getVerificationUrl()}\n\nCertificate ID: ${certificate.uniqueId}`)
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-12 print:bg-white print:py-0">
            <div className="container max-w-3xl print:max-w-none">
                {/* Verification Status - Hide on print */}
                <Card className={`mb-6 ${certificate?.isValid ? 'border-green-500' : 'border-red-500'} border-2 print:hidden`}>
                    <CardContent className="py-6">
                        <div className="flex items-center justify-center gap-3">
                            {certificate?.isValid ? (
                                <>
                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                    <div>
                                        <h2 className="text-xl font-bold text-green-700">Certificate Verified</h2>
                                        <p className="text-sm text-green-600">This certificate is authentic and valid</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-8 w-8 text-red-500" />
                                    <div>
                                        <h2 className="text-xl font-bold text-red-700">Invalid Certificate</h2>
                                        <p className="text-sm text-red-600">This certificate could not be verified</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {certificate && (
                    <>
                        {/* Certificate Display */}
                        <Card className="mb-6 print:shadow-none print:border-0" ref={certificateRef}>
                            <CardContent className="py-12 px-6 flex justify-center">
                                <div className="transform scale-[0.65] sm:scale-75 md:scale-90 lg:scale-100 origin-top">
                                    <CertificateTemplate 
                                        certificate={certificate} 
                                        logoUrl={certificate.instituteLogoUrl} 
                                        stampUrl={certificate.stampUrl}
                                        stampPosition={certificate.stampPosition}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions - Hide on print */}
                        <div className="space-y-4 print:hidden">
                            {/* Primary Actions */}
                            <div className="flex flex-wrap justify-center gap-3">
                                <Button onClick={handleDownloadPDF} disabled={isExporting}>
                                    {isExporting ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <FileText className="h-4 w-4 mr-2" />
                                    )}
                                    Download PDF
                                </Button>
                                <Button variant="outline" onClick={handlePrint}>
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleCopyLink}
                                    className={copiedLink ? 'bg-green-50 border-green-500 text-green-700' : ''}
                                >
                                    {copiedLink ? (
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                    ) : (
                                        <Link2 className="h-4 w-4 mr-2" />
                                    )}
                                    {copiedLink ? 'Copied!' : 'Copy Link'}
                                </Button>
                            </div>

                            {/* Share Options */}
                            <div className="relative">
                                <div className="flex flex-wrap justify-center gap-2">
                                    <p className="w-full text-center text-sm text-muted-foreground mb-2">Share on:</p>
                                    <Button variant="outline" size="sm" onClick={handleShareLinkedIn} className="bg-[#0077b5]/5 hover:bg-[#0077b5]/10 border-[#0077b5]/30">
                                        <Linkedin className="h-4 w-4 mr-2 text-[#0077b5]" />
                                        LinkedIn
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleShareTwitter} className="bg-[#1da1f2]/5 hover:bg-[#1da1f2]/10 border-[#1da1f2]/30">
                                        <Twitter className="h-4 w-4 mr-2 text-[#1da1f2]" />
                                        Twitter
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleShareWhatsApp} className="bg-[#25d366]/5 hover:bg-[#25d366]/10 border-[#25d366]/30">
                                        <MessageCircle className="h-4 w-4 mr-2 text-[#25d366]" />
                                        WhatsApp
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleShareEmail}>
                                        <Mail className="h-4 w-4 mr-2" />
                                        Email
                                    </Button>
                                </div>
                            </div>

                            {/* Add to LinkedIn Profile */}
                            <Card className="bg-gradient-to-r from-[#0077b5]/5 to-[#0077b5]/10 border-[#0077b5]/20">
                                <CardContent className="py-4 text-center">
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Add this certificate to your LinkedIn profile to showcase your achievements
                                    </p>
                                    <Button onClick={handleShareLinkedIn} className="bg-[#0077b5] hover:bg-[#006097]">
                                        <Linkedin className="h-4 w-4 mr-2" />
                                        Add to LinkedIn Credentials
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
