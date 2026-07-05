"use client"

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Loader2, Download, ShieldCheck, AlertTriangle, Printer, Linkedin } from 'lucide-react'
import CertificateTemplate from '@/components/certificate/CertificateTemplate'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'

export default function CertificateViewer() {
    const params = useParams()
    const id = params.id as string

    const [certificate, setCertificate] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const [error, setError] = useState(false)

    useEffect(() => {
        if (id) {
            fetchCertificate(id)
        }
    }, [id])

    const fetchCertificate = async (uniqueId: string) => {
        try {
            setLoading(true)
            const res = await axios.get(`/api/certificates/verify/${uniqueId}`)
            if (res.data.verified) {
                setCertificate(res.data.certificate)
            } else {
                setError(true)
            }
        } catch (err) {
            console.error(err)
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async () => {
        const element = document.getElementById('certificate-template')
        if (!element) return

        try {
            setDownloading(true)
            toast.loading('Preparing high-quality PDF...', { id: 'pdf' })

            // Use html2canvas to take a snapshot of the certificate component
            const canvas = await html2canvas(element, {
                scale: 2, // High resolution
                useCORS: true,
                backgroundColor: '#ffffff'
            })

            const imgData = canvas.toDataURL('image/png')
            
            // A4 Landscape: 297mm x 210mm
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            })

            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = pdf.internal.pageSize.getHeight()

            // Calculate ratio to fit A4 perfectly
            const imgProps = pdf.getImageProperties(imgData)
            const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height)
            
            const finalWidth = imgProps.width * ratio
            const finalHeight = imgProps.height * ratio
            
            // Center the image
            const x = (pdfWidth - finalWidth) / 2
            const y = (pdfHeight - finalHeight) / 2

            pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight)
            pdf.save(`Techwell-Certificate-${certificate.uniqueId}.pdf`)
            
            toast.success('Certificate Downloaded!', { id: 'pdf' })
        } catch (err) {
            console.error(err)
            toast.error('Failed to generate PDF', { id: 'pdf' })
        } finally {
            setDownloading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
            </div>
        )
    }

    if (error || !certificate) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm text-center border border-red-100">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Certificate Not Found</h2>
                    <p className="text-slate-500 mb-6">
                        We could not verify this certificate. It may be invalid, expired, or the ID is incorrect.
                    </p>
                    <Button onClick={() => window.location.href = '/verify'} variant="outline" className="w-full">
                        Go to Verification Portal
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-100 py-12 px-4 flex flex-col items-center print:bg-white print:py-0 print:px-0">
            
            {/* Toolbar */}
            <div className="max-w-[1056px] w-full flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-8 print:hidden">
                <div className="flex items-center gap-3 mb-4 sm:mb-0">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900 leading-tight">Verified Certificate</h2>
                        <p className="text-xs text-slate-500">Authentic Techwell Credential</p>
                    </div>
                </div>
                
                <div className="flex gap-3 flex-wrap justify-center">
                    <Button 
                        variant="outline" 
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href)
                            toast.success("Link copied to clipboard")
                        }}
                    >
                        Copy Link
                    </Button>
                    <Button 
                        variant="outline"
                        className="border-[#0a66c2] text-[#0a66c2] hover:bg-[#0a66c2] hover:text-white"
                        onClick={() => {
                            const issueDate = new Date(certificate.issueDate)
                            const url = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(certificate.courseName)}&organizationName=Techwell%20Consulting&issueYear=${issueDate.getFullYear()}&issueMonth=${issueDate.getMonth() + 1}&certUrl=${encodeURIComponent(window.location.href)}&certId=${certificate.uniqueId}`
                            window.open(url, '_blank')
                        }}
                    >
                        <Linkedin className="w-4 h-4 mr-2" />
                        Add to Profile
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => window.print()}
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                    </Button>
                    <Button 
                        onClick={handleDownload} 
                        disabled={downloading}
                        className="bg-slate-900 hover:bg-slate-800 text-white"
                    >
                        {downloading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4 mr-2" />
                        )}
                        PDF
                    </Button>
                </div>
            </div>

            {/* Certificate Container with overflow handling for mobile */}
            <div className="w-full max-w-[1056px] overflow-x-auto pb-8 flex justify-center print:overflow-visible print:pb-0">
                {/* Scale down slightly on very small screens, though A4 landscape is tough on mobile */}
                <div style={{ transformOrigin: 'top center' }} className="sm:scale-100 scale-[0.3] md:scale-[0.7] lg:scale-100 print:scale-100">
                    <CertificateTemplate data={certificate} />
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page { margin: 0; size: landscape; }
                    body { background: white; -webkit-print-color-adjust: exact; }
                }
            `}</style>
        </div>
    )
}
