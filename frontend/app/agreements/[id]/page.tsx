"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Download, Loader2 } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import SignatureCanvas from 'react-signature-canvas'
import DOMPurify from 'isomorphic-dompurify'

export default function ClientAgreementView() {
    const params = useParams()
    const id = params.id as string

    const [agreement, setAgreement] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const sigCanvas = useRef<any>(null)

    useEffect(() => {
        if (id) fetchAgreement(id)
    }, [id])

    const fetchAgreement = async (agreementId: string) => {
        try {
            setLoading(true)
            const res = await axios.get(`/api/crm/agreements/public/${agreementId}`)
            setAgreement(res.data)
        } catch (error) {
            console.error(error)
            toast.error("Failed to load agreement. It may not exist or the link is invalid.")
        } finally {
            setLoading(false)
        }
    }

    const handleClearSignature = () => {
        sigCanvas.current?.clear()
    }

    const handleSubmit = async () => {
        if (sigCanvas.current?.isEmpty()) {
            toast.error("Please provide your signature before submitting.")
            return
        }
        
        const signatureBase64 = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png')

        try {
            setSubmitting(true)
            await axios.post(`/api/crm/agreements/public/${id}/sign`, { signature: signatureBase64 })
            toast.success("Agreement signed successfully!")
            fetchAgreement(id)
        } catch (error) {
            console.error(error)
            toast.error("Failed to submit agreement.")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDownloadPdf = async () => {
        try {
            toast.loading("Generating PDF...", { id: 'pdf' })
            const res = await axios.get(`/api/crm/agreements/${id}/pdf`, { responseType: 'blob' })
            
            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([res.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `${agreement?.agreementNum || 'Agreement'}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            toast.success("PDF Downloaded!", { id: 'pdf' })
        } catch (error) {
            console.error(error)
            toast.error("Failed to generate PDF", { id: 'pdf' })
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!agreement) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="max-w-md w-full p-8 text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Agreement Not Found</h2>
                    <p className="text-muted-foreground">The link you followed may be incorrect or expired.</p>
                </Card>
            </div>
        )
    }

    const isSigned = agreement.status === 'SIGNED' || agreement.status === 'ACTIVE'

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{agreement.title}</h1>
                        <div className="flex items-center gap-3 mt-2">
                            <Badge variant="outline" className="text-gray-500">{agreement.agreementNum}</Badge>
                            <span className="text-sm text-gray-500">For: {agreement.customer?.name}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {isSigned ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-4 py-1.5 text-sm">
                                <CheckCircle2 className="w-4 h-4 mr-1.5 inline" /> Fully Executed
                            </Badge>
                        ) : (
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-4 py-1.5 text-sm">
                                Pending Signature
                            </Badge>
                        )}
                        {isSigned && (
                            <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                                <Download className="w-4 h-4 mr-2" /> Download PDF
                            </Button>
                        )}
                    </div>
                </div>

                {/* Document Body */}
                <Card className="overflow-hidden border-gray-200 shadow-md">
                    <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
                        <CardTitle className="text-lg text-center text-gray-700 uppercase tracking-widest">
                            Service Agreement
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 md:p-12 prose prose-sm md:prose-base max-w-none text-gray-800"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(agreement.content) }}
                    />
                </Card>

                {/* Financials & Terms summary */}
                <Card className="border-gray-200 shadow-sm">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                            <div>
                                <p className="text-gray-500 mb-1">Base Value</p>
                                <p className="font-semibold text-gray-900">₹{agreement.totalValue?.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Tax ({agreement.taxPercentage}%)</p>
                                <p className="font-semibold text-gray-900">₹{agreement.taxAmount?.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Total Contract Value</p>
                                <p className="font-bold text-xl text-indigo-600">₹{agreement.grandTotal?.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Signature Box */}
                {!isSigned && (
                    <Card className="border-indigo-100 shadow-md bg-white">
                        <CardHeader className="bg-indigo-50/50 border-b border-indigo-100">
                            <CardTitle className="text-lg">Sign Document</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <p className="text-sm text-gray-600 mb-4">
                                By signing below, you agree to the terms and conditions outlined in the agreement above.
                            </p>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50">
                                <SignatureCanvas 
                                    ref={sigCanvas} 
                                    canvasProps={{ className: 'w-full h-48 cursor-crosshair' }} 
                                />
                            </div>
                            <div className="flex justify-end mt-2">
                                <Button variant="link" size="sm" onClick={handleClearSignature} className="text-gray-500">
                                    Clear Signature
                                </Button>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-gray-50 border-t border-gray-100 p-6 flex justify-between items-center">
                            <p className="text-xs text-gray-400">
                                This acts as a legally binding digital signature.
                            </p>
                            <Button 
                                onClick={handleSubmit} 
                                disabled={submitting}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
                            >
                                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Agree & Sign
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {isSigned && agreement.clientSignature && (
                    <Card className="border-gray-200 shadow-sm bg-gray-50">
                        <CardContent className="p-6">
                            <p className="text-sm text-gray-500 mb-4 font-medium">Digital Signature Record</p>
                            <div className="max-w-xs bg-white border border-gray-200 p-4 rounded-lg">
                                {/* image below */}
                                <img src={agreement.clientSignature} alt="Client Signature" className="w-full h-auto max-h-32 object-contain" />
                                <div className="border-t border-gray-100 mt-2 pt-2 text-xs text-gray-400">
                                    Signed electronically.
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
