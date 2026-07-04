import * as React from 'react'
import Image from 'next/image'
import { ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { QRCodeSVG } from 'qrcode.react'

export interface CertificateData {
    id: string
    uniqueId: string
    studentName: string
    courseName: string
    courseCategory?: string
    issueDate: string
    startDate?: string
    endDate?: string
    expiryDate?: string
    grade?: string
    score?: number
    isValid: boolean
    signatoryName?: string
    signatoryTitle?: string
}

const CertificateQRCode = ({ certificate }: { certificate: CertificateData }) => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/verify/${certificate.uniqueId}` : `https://techwell.co.in/verify/${certificate.uniqueId}`
    const payload = url

    return (
        <div className="flex flex-col items-center select-none bg-white p-2 border border-slate-200 rounded">
            <QRCodeSVG value={payload} size={64} level="L" includeMargin={false} />
            <span className="text-[8px] font-mono tracking-[0.2em] text-slate-800 uppercase mt-1 font-bold">{certificate.uniqueId}</span>
        </div>
    );
};

export const CertificateTemplate = ({ certificate, logoUrl, stampUrl, stampPosition = 'bottom-right' }: { certificate: CertificateData, logoUrl?: string, stampUrl?: string, stampPosition?: string }) => {
    const date = new Date(certificate.issueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
    
    const startDate = certificate.startDate ? new Date(certificate.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null
    const endDate = certificate.endDate ? new Date(certificate.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null

    return (
        <div className="bg-[#ffffff] text-[#000000] w-full max-w-[940px] aspect-[1.414/1] shadow-2xl relative border-[24px] border-[#414488] p-8 flex flex-col justify-between overflow-hidden print:shadow-none print:border-[16px] print:border-[#414488] print:max-w-none print:w-[297mm] print:h-[210mm] print:m-0 print:p-8 select-none z-0 box-border">
            {/* Corporate Geometric Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none -z-10" 
                 style={{ backgroundImage: 'linear-gradient(#cacbcc 1px, transparent 1px), linear-gradient(90deg, #cacbcc 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-[#78c1b5]/20 via-[#0eeee9]/10 to-transparent rounded-bl-full pointer-events-none -z-10"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#1469e2]/10 via-[#414488]/10 to-transparent rounded-tr-full pointer-events-none -z-10"></div>

            {/* Branding Double Framing Accent */}
            <div className="absolute inset-2 border-[2px] border-[#d4af37]/80 pointer-events-none z-0"></div>
            <div className="absolute inset-3 border border-[#b8860b]/60 pointer-events-none z-0"></div>

            {/* Top Corner Details */}
            <div className="flex justify-between items-start z-10">
                {/* Brand Logo */}
                <div className="flex items-center gap-2">
                    <div className="relative h-20 w-64">
                        {logoUrl ? (
                            <img src={logoUrl} alt="Institute Logo" className="h-full object-contain object-left" />
                        ) : (
                            <>
                                <Image src="/logo-light.png" alt="Techwell Logo" fill className="object-contain object-left dark:hidden" priority />
                                <Image src="/logo-dark.png" alt="Techwell Logo" fill className="hidden object-contain object-left dark:block" priority />
                            </>
                        )}
                    </div>
                </div>
                {/* QR Code representation */}
                <CertificateQRCode certificate={certificate} />
            </div>

            {/* Central Certificate Copy */}
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-5 px-10 my-4 z-10">
                <div>
                    <div className="text-3xl md:text-4xl font-extrabold text-[#414488] tracking-wider uppercase font-serif whitespace-nowrap">
                        Certificate of Competency
                    </div>
                    <div className="w-48 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mt-3"></div>
                </div>

                <p className="text-[#414488]/70 uppercase tracking-[0.25em] text-xs font-bold">
                    This is to certify that
                </p>

                <div className="space-y-1">
                    <h2 className="text-4xl font-bold text-[#000000] font-serif tracking-wide border-b-2 border-[#cacbcc] pb-2 px-12 italic capitalize">
                        {certificate.studentName}
                    </h2>
                    <h3 className="text-xl font-bold text-[#1469e2] font-serif tracking-wide pt-2">
                        {certificate.courseName}
                    </h3>
                    {startDate && endDate && (
                        <p className="text-[#414488] font-bold text-sm tracking-wider uppercase pt-1">
                            Course Duration: {startDate} to {endDate}
                        </p>
                    )}
                </div>

                <div className="space-y-3 max-w-[75%]">
                    <p className="text-[#000000]/70 text-sm leading-relaxed font-medium">
                        has demonstrated proficiency and successfully fulfilled all core training requirements, laboratory examinations, and certification benchmarks.
                    </p>
                </div>

                {/* Grade indicator */}
                <div className="flex gap-3 mt-2">
                    {certificate.grade && (
                        <Badge className="bg-[#414488] text-[#ffffff] border border-[#414488] text-[10px] uppercase font-mono tracking-widest px-3 py-1 hover:bg-[#414488]/90">
                            Grade: {certificate.grade}
                        </Badge>
                    )}
                    {certificate.score && (
                        <Badge className="bg-[#78c1b5]/20 text-[#414488] border border-[#78c1b5] text-[10px] uppercase font-mono tracking-widest px-3 py-1 hover:bg-[#78c1b5]/30">
                            Score: {certificate.score}%
                        </Badge>
                    )}
                </div>
            </div>

            {/* Bottom Signature / Verification Panel */}
            <div className="grid grid-cols-3 items-end px-6 z-10">
                {/* Dates */}
                <div className="flex flex-col items-start justify-end pb-2">
                    <div className="inline-flex flex-col items-center min-w-[180px]">
                        <div className="font-serif font-semibold text-[#000000] text-sm leading-none mb-2 whitespace-nowrap">
                            {date}
                        </div>
                        <div className="w-full border-b-2 border-[#cacbcc]"></div>
                        <div className="mt-2 space-y-1">
                            <p className="text-[10px] font-bold text-[#1469e2] uppercase tracking-widest leading-none whitespace-nowrap">
                                Issue Date
                            </p>
                        </div>
                    </div>
                </div>

                {/* Validation Seal and Footer */}
                <div className="flex flex-col items-center justify-center relative top-2">
                    <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-[#d4af37] via-[#b8860b] to-[#8b6508] shadow-lg shadow-[#d4af37]/30 border-[3px] border-[#ffffff] select-none">
                        <div className="absolute inset-1 rounded-full border border-dashed border-[#ffffff]/70 flex items-center justify-center flex-col bg-[#000000]/10">
                            <ShieldCheck className="h-7 w-7 text-[#ffffff] drop-shadow-sm mb-0.5" />
                            <span className="text-[6px] font-bold text-[#ffffff] tracking-widest uppercase drop-shadow-sm">VERIFIED</span>
                        </div>
                    </div>
                    {/* Website Footer */}
                    <div className="mt-4 text-[#414488] font-bold tracking-widest text-[10px]">
                        www.techwell.co.in
                    </div>
                </div>

                {/* Signatures */}
                <div className="flex flex-col items-end justify-end pb-2">
                    <div className="inline-flex flex-col items-center min-w-[220px]">
                        <div className="font-serif italic text-2xl text-[#1469e2] select-none leading-none mb-2 whitespace-nowrap">
                            {certificate.signatoryName || "U Purushottama Rao"}
                        </div>
                        <div className="w-full border-b-2 border-[#cacbcc]"></div>
                        <div className="mt-2 space-y-1">
                            <p className="text-[10px] font-bold text-[#1469e2] uppercase tracking-widest leading-none whitespace-nowrap">
                                {certificate.signatoryTitle || "Course Director"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Official Stamp Overlay */}
            {stampUrl && stampPosition && (
                <div 
                    className={`absolute pointer-events-none select-none z-20 ${
                        stampPosition === 'bottom-right' ? 'bottom-8 right-8' :
                        stampPosition === 'bottom-left' ? 'bottom-8 left-8' :
                        stampPosition === 'bottom-center' ? 'bottom-8 left-1/2 -translate-x-1/2' :
                        stampPosition === 'top-right' ? 'top-8 right-8' :
                        stampPosition === 'top-left' ? 'top-8 left-8' :
                        stampPosition === 'center-watermark' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15 scale-150' :
                        'bottom-8 right-8'
                    }`}
                >
                    <img 
                        src={stampUrl} 
                        alt="Official Stamp" 
                        className={`object-contain ${stampPosition === 'center-watermark' ? 'h-64 w-64' : 'h-32 w-32 drop-shadow-md'}`}
                    />
                </div>
            )}
        </div>
    )
}
