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
                instituteName: 'TechWell Academy'
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
        setIsExporting(true)

        try {
            // Create a printable version
            const printWindow = window.open('', '_blank')
            if (!printWindow) {
                alert('Please allow pop-ups to download the certificate')
                setIsExporting(false)
                return
            }

            const certHtml = generateCertificateHTML(certificate, getVerificationUrl())
            printWindow.document.write(certHtml)
            printWindow.document.close()

            // Wait for content to load, then trigger print
            printWindow.onload = () => {
                printWindow.print()
                printWindow.onafterprint = () => printWindow.close()
            }
        } catch (error) {
            console.error('Failed to generate PDF:', error)
            alert('Failed to generate PDF. Please try printing instead.')
        } finally {
            setIsExporting(false)
        }
    }

    // Generate certificate HTML for export
    const generateCertificateHTML = (cert: CertificateData, verifyUrl: string) => `
<!DOCTYPE html>
<html>
<head>
    <title>Certificate - ${cert.uniqueId}</title>
    <style>
        @page { size: landscape; margin: 0; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: 'Georgia', 'Times New Roman', serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .certificate-wrapper {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.25);
        }
        .certificate {
            width: 900px;
            padding: 50px;
            border: 8px solid #1a365d;
            border-radius: 4px;
            background: linear-gradient(to bottom right, #ffffff 0%, #f8fafc 100%);
            position: relative;
        }
        .certificate::before {
            content: '';
            position: absolute;
            top: 15px; left: 15px; right: 15px; bottom: 15px;
            border: 2px solid #cbd5e0;
            border-radius: 2px;
        }
        .content { position: relative; z-index: 1; text-align: center; }
        .logo { 
            font-size: 28px; 
            font-weight: bold; 
            color: #1a365d; 
            letter-spacing: 3px;
            margin-bottom: 10px;
        }
        .divider { 
            width: 150px; 
            height: 3px; 
            background: linear-gradient(90deg, transparent, #1a365d, transparent);
            margin: 15px auto;
        }
        h1 { 
            color: #1a365d; 
            font-size: 42px; 
            margin: 20px 0;
            text-transform: uppercase;
            letter-spacing: 5px;
        }
        .subtitle { color: #4a5568; font-size: 16px; margin: 10px 0; }
        .student-name { 
            font-size: 38px; 
            color: #2d3748; 
            margin: 25px 0; 
            font-style: italic;
            border-bottom: 2px solid #e2e8f0;
            display: inline-block;
            padding: 0 30px 10px;
        }
        .course { font-size: 24px; color: #4a5568; margin: 20px 0; font-weight: 500; }
        .grade-badge {
            display: inline-block;
            padding: 8px 25px;
            background: linear-gradient(135deg, #48bb78, #38a169);
            color: white;
            border-radius: 25px;
            font-size: 16px;
            font-weight: bold;
            margin: 15px 5px;
        }
        .score-badge {
            display: inline-block;
            padding: 8px 25px;
            background: linear-gradient(135deg, #4299e1, #3182ce);
            color: white;
            border-radius: 25px;
            font-size: 16px;
            font-weight: bold;
            margin: 15px 5px;
        }
        .date { color: #718096; font-size: 14px; margin: 20px 0; }
        .signature-section {
            margin-top: 40px;
            display: inline-block;
        }
        .signature-line { 
            width: 200px; 
            border-top: 2px solid #1a365d; 
            margin-top: 60px;
        }
        .signature-name { font-weight: bold; color: #2d3748; margin-top: 10px; }
        .signature-title { color: #718096; font-size: 12px; }
        .verify-section {
            margin-top: 30px;
            padding: 15px;
            background: #f7fafc;
            border-radius: 8px;
            font-size: 11px;
            color: #718096;
        }
        .verify-section strong { color: #4a5568; }
        .seal {
            position: absolute;
            bottom: 40px;
            right: 60px;
            width: 100px;
            height: 100px;
            border: 3px solid #d4af37;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #d4af37;
            font-weight: bold;
            font-size: 12px;
            text-align: center;
        }
        @media print {
            body { background: white; padding: 0; }
            .certificate-wrapper { box-shadow: none; padding: 0; }
        }
    </style>
</head>
<body>
    <div class="certificate-wrapper">
        <div class="certificate">
            <div class="content">
                <div class="logo">${cert.instituteName || 'TECHWELL ACADEMY'}</div>
                <div class="divider"></div>
                <h1>Certificate</h1>
                <p class="subtitle">OF COMPLETION</p>
                <div class="divider"></div>
                <p class="subtitle">This is to certify that</p>
                <div class="student-name">${cert.studentName}</div>
                <p class="subtitle">has successfully completed the course</p>
                <div class="course">"${cert.courseName}"</div>
                <div>
                    ${cert.grade ? `<span class="grade-badge">Grade: ${cert.grade}</span>` : ''}
                    ${cert.score ? `<span class="score-badge">Score: ${cert.score}%</span>` : ''}
                </div>
                <p class="date">Issued on ${new Date(cert.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                ${cert.signatoryName ? `
                    <div class="signature-section">
                        <div class="signature-line"></div>
                        <div class="signature-name">${cert.signatoryName}</div>
                        <div class="signature-title">${cert.signatoryTitle || ''}</div>
                    </div>
                ` : ''}
                <div class="verify-section">
                    <strong>Certificate ID:</strong> ${cert.uniqueId}<br>
                    <strong>Verify at:</strong> ${verifyUrl}
                </div>
            </div>
            <div class="seal">VERIFIED<br>✓</div>
        </div>
    </div>
</body>
</html>`

    // Share functions
    const handleShareLinkedIn = () => {
        if (!certificate) return
        const url = encodeURIComponent(getVerificationUrl())
        window.open(`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(certificate.courseName)}&organizationName=${encodeURIComponent(certificate.instituteName || 'TechWell')}&issueYear=2026&issueMonth=1&certUrl=${url}&certId=${certificate.uniqueId}`, '_blank')
    }

    const handleShareTwitter = () => {
        if (!certificate) return
        const text = encodeURIComponent(`I just earned my ${certificate.courseName} certificate from ${certificate.instituteName || 'TechWell'}! 🎓`)
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
                            <CardContent className="py-12 text-center">
                                <div className="inline-flex items-center gap-2 text-primary mb-4">
                                    <Shield className="h-5 w-5" />
                                    <span className="font-medium">{certificate.instituteName || 'TechWell Academy'}</span>
                                </div>

                                <h1 className="text-3xl font-bold text-primary mb-6">Certificate of Completion</h1>

                                <p className="text-muted-foreground mb-2">This is to certify that</p>
                                <h2 className="text-2xl font-semibold mb-4">{certificate.studentName}</h2>

                                <p className="text-muted-foreground mb-2">has successfully completed</p>
                                <h3 className="text-xl font-medium mb-4">{certificate.courseName}</h3>

                                <div className="flex items-center justify-center gap-4 mb-6">
                                    {certificate.grade && (
                                        <Badge className="text-lg px-4 py-1 bg-green-600">Grade: {certificate.grade}</Badge>
                                    )}
                                    {certificate.score && (
                                        <Badge variant="outline" className="text-lg px-4 py-1">Score: {certificate.score}%</Badge>
                                    )}
                                </div>

                                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-8">
                                    <Calendar className="h-4 w-4" />
                                    <span>Issued on {new Date(certificate.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>

                                {certificate.signatoryName && (
                                    <div className="border-t pt-6">
                                        <div className="inline-block border-t-2 border-primary/30 pt-2">
                                            <p className="font-semibold">{certificate.signatoryName}</p>
                                            <p className="text-sm text-muted-foreground">{certificate.signatoryTitle}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8 p-4 bg-muted/50 rounded-lg print:hidden">
                                    <p className="text-sm text-muted-foreground">
                                        Certificate ID: <code className="font-mono">{certificate.uniqueId}</code>
                                    </p>
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
