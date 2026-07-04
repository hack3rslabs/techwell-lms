"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Award, Download, ExternalLink, Loader2, Share2, Linkedin, MessageCircle } from 'lucide-react'
import { certificateApi } from '@/lib/api'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function StudentCertificatesWallet() {
    const [certificates, setCertificates] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchCerts = async () => {
            try {
                // Students only get ISSUED certs per API changes
                const res = await certificateApi.getAll()
                setCertificates(res.data.certificates || [])
            } catch (error) {
                console.error("Failed to load certificates", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchCerts()
    }, [])

    const handleShareLinkedIn = (uniqueId: string) => {
        const url = `${window.location.origin}/certificate/${uniqueId}`
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
    }

    const handleShareWhatsApp = (uniqueId: string) => {
        const url = `${window.location.origin}/certificate/${uniqueId}`
        const text = `I just earned a new certificate from Techwell! Check it out here: ${url}`
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Credentials Wallet</h1>
                    <p className="text-muted-foreground">View, download, and share your earned certificates.</p>
                </div>
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-full font-medium flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    {certificates.length} Certificate{certificates.length !== 1 ? 's' : ''} Earned
                </div>
            </div>

            {certificates.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-12 border-dashed">
                    <Award className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No certificates yet</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                        Complete your courses to earn certificates. They will automatically appear here once issued.
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((cert) => (
                        <Card key={cert.id} className="overflow-hidden hover:shadow-lg transition-all group border border-neutral-200">
                            {/* Visual Representation */}
                            <div className="aspect-[1.414/1] bg-neutral-100 relative p-4 flex flex-col justify-center items-center text-center border-b border-neutral-200"
                                style={cert.template?.previewUrl ? { backgroundImage: `url(${cert.template.previewUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                            >
                                {/* Fallback visual if no template preview */}
                                {!cert.template?.previewUrl && (
                                    <>
                                        <Award className="h-10 w-10 text-primary mb-2 opacity-50" />
                                        <h4 className="font-serif font-bold text-lg leading-tight mb-1">{cert.courseName}</h4>
                                        <p className="text-xs text-muted-foreground uppercase">{cert.uniqueId}</p>
                                    </>
                                )}
                                
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button size="sm" variant="secondary" onClick={() => window.open(`/certificate/${cert.uniqueId}`, '_blank')}>
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View
                                    </Button>
                                    <Button size="sm" onClick={() => window.location.href = `/certificate/${cert.uniqueId}`}>
                                        <Download className="h-4 w-4 mr-2" />
                                        PDF
                                    </Button>
                                </div>
                            </div>
                            
                            <CardContent className="p-5">
                                <div className="mb-4">
                                    <h3 className="font-semibold text-lg line-clamp-1" title={cert.courseName}>{cert.courseName}</h3>
                                    <p className="text-sm text-muted-foreground">Issued: {new Date(cert.issueDate).toLocaleDateString()}</p>
                                </div>
                                
                                <div className="flex justify-between items-center pt-4 border-t border-neutral-100">
                                    <div className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                                        {cert.uniqueId}
                                    </div>
                                    
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-8">
                                                <Share2 className="h-3.5 w-3.5 mr-2" />
                                                Share
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleShareLinkedIn(cert.uniqueId)}>
                                                <Linkedin className="h-4 w-4 mr-2 text-blue-600" />
                                                LinkedIn
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleShareWhatsApp(cert.uniqueId)}>
                                                <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
                                                WhatsApp
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
