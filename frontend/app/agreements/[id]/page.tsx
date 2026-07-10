"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Download, Loader2, Camera, UploadCloud } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import SignatureCanvas from 'react-signature-canvas'
import DOMPurify from 'isomorphic-dompurify'
import Image from 'next/image'

export default function ClientAgreementView() {
    const params = useParams()
    const id = params.id as string

    const [agreement, setAgreement] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [photo, setPhoto] = useState<string | null>(null)
    const sigCanvas = useRef<any>(null)

    async function fetchAgreement(agreementId: string) {
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


    useEffect(() => {
        if (id) fetchAgreement(id)
    }, [id])


    const handleClearSignature = () => {
        sigCanvas.current?.clear()
    }

    const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPhoto(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async () => {
        if (sigCanvas.current?.isEmpty()) {
            toast.error("Please provide your signature before submitting.")
            return
        }
        if (!photo) {
            toast.error("Please provide a live photo to confirm your identity.")
            return
        }
        
        const signatureBase64 = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png')

        try {
            setSubmitting(true)
            await axios.post(`/api/crm/agreements/public/${id}/sign`, { 
                signature: signatureBase64,
                photo: photo
            })
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
                <Loader2 className="h-8 w-8 animate-spin text-[#1469E2]" />
            </div>
        )
    }

    if (!agreement) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="max-w-md w-full p-8 text-center border-t-4 border-t-[#1469E2]">
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
                
                {/* Techwell Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-[#1469E2]">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <img src="/logo-dark.png" alt="Techwell Logo" className="h-12 w-auto object-contain" />
                        <div className="h-10 w-px bg-gray-200 hidden md:block"></div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{agreement.title}</h1>
                            <div className="flex items-center gap-3 mt-2">
                                <Badge variant="outline" className="text-gray-500 bg-gray-50">{agreement.agreementNum}</Badge>
                                <span className="text-sm font-medium text-[#78C1B5]">For: {agreement.customer?.name}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {isSigned ? (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none px-4 py-1.5 text-sm font-semibold">
                                <CheckCircle2 className="w-4 h-4 mr-1.5 inline" /> Fully Executed
                            </Badge>
                        ) : (
                            <Badge className="bg-[#1469E2]/10 text-[#1469E2] hover:bg-[#1469E2]/10 border-none px-4 py-1.5 text-sm font-semibold">
                                Pending Signature
                            </Badge>
                        )}
                        {isSigned && (
                            <Button variant="outline" size="sm" onClick={handleDownloadPdf} className="border-[#1469E2] text-[#1469E2] hover:bg-[#1469E2] hover:text-white transition-colors">
                                <Download className="w-4 h-4 mr-2" /> Download PDF
                            </Button>
                        )}
                    </div>
                </div>

                {/* Document Body */}
                <Card className="overflow-hidden border-2 border-[#1469E2]/20 shadow-lg relative">
                    {/* Decorative corners */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#78C1B5] m-2"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#78C1B5] m-2"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#78C1B5] m-2"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#78C1B5] m-2"></div>

                    <CardHeader className="bg-white border-b border-gray-100 pb-4 pt-10">
                        <CardTitle className="text-2xl text-center text-[#1469E2] uppercase tracking-widest font-serif">
                            Official Agreement
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 md:p-14 prose prose-sm md:prose-base max-w-none text-gray-800 bg-white"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(agreement.content) }}
                    />
                </Card>

                {/* Financials & Terms summary */}
                <Card className="border-gray-200 shadow-sm bg-white">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-center">
                                <p className="text-gray-500 mb-1">Base Value</p>
                                <p className="font-bold text-lg text-gray-900">₹{agreement.totalValue?.toLocaleString()}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-center">
                                <p className="text-gray-500 mb-1">Tax ({agreement.taxPercentage}%)</p>
                                <p className="font-bold text-lg text-gray-900">₹{agreement.taxAmount?.toLocaleString()}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-[#1469E2]/5 border border-[#1469E2]/20 text-center">
                                <p className="text-[#1469E2] font-semibold mb-1">Total Contract Value</p>
                                <p className="font-bold text-2xl text-[#1469E2]">₹{agreement.grandTotal?.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Identity & Signature Box */}
                {!isSigned && (
                    <Card className="border-[#1469E2]/30 shadow-xl bg-white overflow-hidden">
                        <div className="bg-[#1469E2] text-white p-4 text-center font-medium tracking-wide">
                            EXECUTE AGREEMENT
                        </div>
                        <CardContent className="p-6 md:p-10 space-y-8">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Photo Capture */}
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 flex items-center">
                                            <Camera className="w-5 h-5 mr-2 text-[#78C1B5]" /> Identity Verification
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">Please provide a live photo for KYC compliance.</p>
                                    </div>
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 p-4 flex flex-col items-center justify-center relative min-h-[200px] overflow-hidden group">
                                        {photo ? (
                                            <>
                                                <img src={photo} alt="Identity" className="w-full h-full object-cover absolute inset-0" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium">
                                                        Retake Photo
                                                        <input type="file" accept="image/*" capture="user" className="hidden" onChange={handlePhotoCapture} />
                                                    </label>
                                                </div>
                                            </>
                                        ) : (
                                            <label className="cursor-pointer flex flex-col items-center text-center p-4">
                                                <div className="w-12 h-12 rounded-full bg-[#1469E2]/10 flex items-center justify-center mb-3 text-[#1469E2]">
                                                    <UploadCloud className="w-6 h-6" />
                                                </div>
                                                <span className="text-sm font-semibold text-gray-700">Capture Live Photo</span>
                                                <span className="text-xs text-gray-400 mt-1">Supports mobile camera</span>
                                                <input type="file" accept="image/*" capture="user" className="hidden" onChange={handlePhotoCapture} />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* Signature */}
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 flex items-center">
                                            <CheckCircle2 className="w-5 h-5 mr-2 text-[#1469E2]" /> Digital Signature
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">Please draw your signature below.</p>
                                    </div>
                                    <div className="border-2 border-solid border-gray-200 rounded-xl overflow-hidden bg-white relative">
                                        <div className="absolute bottom-[20%] left-4 right-4 h-px bg-gray-200 pointer-events-none"></div>
                                        <SignatureCanvas 
                                            ref={sigCanvas} 
                                            canvasProps={{ className: 'w-full h-[200px] cursor-crosshair' }} 
                                        />
                                    </div>
                                    <div className="flex justify-end mt-1">
                                        <Button variant="ghost" size="sm" onClick={handleClearSignature} className="text-gray-500 hover:text-red-600 text-xs h-7">
                                            Clear Signature
                                        </Button>
                                    </div>
                                </div>
                            </div>

                        </CardContent>
                        <CardFooter className="bg-gray-50 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-xs text-gray-500 text-center md:text-left">
                                By clicking submit, I acknowledge that this digital signature and photo <br className="hidden md:block" />
                                hold the same legal weight as a physical signature.
                            </p>
                            <Button 
                                onClick={handleSubmit} 
                                disabled={submitting}
                                className="bg-[#1469E2] hover:bg-[#1469E2]/90 text-white px-10 py-6 text-lg rounded-xl shadow-lg shadow-[#1469E2]/20 w-full md:w-auto"
                            >
                                {submitting && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                                Agree & Submit
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {isSigned && agreement.clientSignature && (
                    <Card className="border-[#78C1B5]/30 shadow-md bg-white">
                        <CardHeader className="bg-[#78C1B5]/10 border-b border-[#78C1B5]/20">
                            <CardTitle className="text-lg text-[#0F4B41]">Execution Record</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {agreement.clientPhotoUrl && (
                                <div>
                                    <p className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Identity Capture</p>
                                    <div className="rounded-xl overflow-hidden border-2 border-gray-100 inline-block">
                                        <img src={agreement.clientPhotoUrl} alt="Client Photo" className="w-48 h-48 object-cover" />
                                    </div>
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Digital Signature</p>
                                <div className="max-w-xs bg-white border-2 border-gray-100 p-4 rounded-xl">
                                    <img src={agreement.clientSignature} alt="Client Signature" className="w-full h-auto max-h-32 object-contain filter contrast-125" />
                                    <div className="border-t border-gray-100 mt-3 pt-3 text-xs text-gray-500 flex flex-col gap-1">
                                        <span><strong>Date:</strong> {new Date(agreement.clientSignedAt).toLocaleString()}</span>
                                        <span><strong>IP:</strong> {agreement.clientIp || 'Verified'}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
