'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Download, CheckCircle, Award, Share2, ShieldCheck, Calendar, Hash } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { api } from '@/lib/api';
import Image from 'next/image';

export default function CertificatePublicPage() {
    const params = useParams();
    const uniqueId = params.id as string;
    
    const [certificate, setCertificate] = useState<any>(null);
    const [template, setTemplate] = useState<any>(null);
    const [layout, setLayout] = useState<any[]>([]);
    const [templateStyle, setTemplateStyle] = useState({ borderColor: '#cfb53b', borderWidth: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    
    const certRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchFullData = async () => {
            try {
                const res = await api.get(`/certificates?search=${uniqueId}`);
                if (res.data.certificates && res.data.certificates.length > 0) {
                    const cert = res.data.certificates[0];
                    setCertificate(cert);
                    if (cert.template) {
                        setTemplate(cert.template);
                        const rawData = cert.template.canvasData || cert.template.layout;
                        if (rawData) {
                            try {
                                const parsed = JSON.parse(rawData);
                                if (Array.isArray(parsed)) {
                                    setLayout(parsed);
                                } else {
                                    setLayout(parsed.elements || []);
                                    if (parsed.style) setTemplateStyle(parsed.style);
                                }
                            } catch(e) {}
                        }
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFullData();
    }, [uniqueId]);

    const handleDownloadPdf = async () => {
        if (!certRef.current) return;
        setIsGenerating(true);
        
        try {
            const canvas = await html2canvas(certRef.current, {
                scale: 3, // Premium high-res
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            
            const pdf = new jsPDF({
                orientation: template?.orientation === 'VERTICAL' ? 'portrait' : 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${certificate.studentName || 'Student'}_Certificate_${uniqueId}.pdf`);
            
            // Log download event (ignore error if unauthenticated)
            api.post(`/certificates/${certificate.id}/download-event`, {}).catch(() => {});
        } catch (error) {
            console.error('Failed to generate PDF', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const renderText = (label: string) => {
        if (!label) return '';
        let text = label;
        
        // Legacy support
        text = text.replace('{Student Name}', certificate?.studentName || certificate?.user?.name || '');
        text = text.replace('{Course Name}', certificate?.courseName || certificate?.course?.title || '');
        text = text.replace('{Issue Date}', certificate?.issueDate ? new Date(certificate.issueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '');
        text = text.replace('{Certificate ID}', certificate?.uniqueId || '');

        // New token support
        text = text.replace('{{STUDENT_NAME}}', certificate?.studentName || certificate?.user?.name || '');
        text = text.replace('{{COURSE_NAME}}', certificate?.courseName || certificate?.course?.title || '');
        text = text.replace('{{CERT_TITLE}}', certificate?.template?.name || 'Certificate of Completion');
        text = text.replace('{{ISSUE_DATE}}', certificate?.issueDate ? new Date(certificate.issueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '');
        text = text.replace('{{CERT_ID}}', certificate?.uniqueId || '');
        text = text.replace('{{SIGNATORY_NAME}}', certificate?.signatoryName || 'U Purushottama Rao');
        text = text.replace('{{SIGNATORY_TITLE}}', certificate?.signatoryTitle || 'Managing Director');
        
        return text;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                <p className="text-slate-300 animate-pulse text-lg tracking-wide font-light">Verifying credentials...</p>
            </div>
        );
    }

    if (!certificate || !template) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <ShieldCheck className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">Invalid Certificate</h1>
                <p className="text-slate-400 text-lg max-w-md">We could not find a valid record for this certificate ID in our registry. Please check the URL and try again.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-blue-200">
            {/* Corporate Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image src="/logo.png" alt="Techwell Logo" width={150} height={40} className="object-contain" priority />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Registry Verified
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12 lg:py-20 flex flex-col lg:flex-row gap-12 max-w-7xl">
                {/* Left Column: Certificate Details */}
                <div className="w-full lg:w-1/3 flex flex-col gap-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-bold tracking-wide uppercase mb-6">
                            <Award className="w-4 h-4" />
                            Official Credential
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
                            Certificate of Completion
                        </h1>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            This document officially certifies that <span className="font-semibold text-slate-900">{renderText('{Student Name}')}</span> has successfully completed the required coursework and examinations.
                        </p>
                    </div>

                    <div className="grid gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                    <Hash className="w-5 h-5 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Credential ID</p>
                                    <p className="text-slate-900 font-mono font-semibold tracking-wide break-all">{certificate.uniqueId}</p>
                                </div>
                            </div>
                            
                            <div className="h-px bg-slate-100 w-full" />
                            
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                    <Calendar className="w-5 h-5 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Issue Date</p>
                                    <p className="text-slate-900 font-semibold">{renderText('{Issue Date}')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button 
                                onClick={handleDownloadPdf} 
                                disabled={isGenerating}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl text-lg font-medium shadow-lg shadow-blue-200 transition-all active:scale-95"
                            >
                                {isGenerating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Download className="w-5 h-5 mr-2" />}
                                Download PDF
                            </Button>
                            
                            <Button 
                                variant="outline"
                                className="flex-1 h-12 rounded-xl text-lg font-medium border-slate-300 text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Link copied to clipboard!');
                                }}
                            >
                                <Share2 className="w-5 h-5 mr-2" />
                                Share Link
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Visual Certificate */}
                <div className="w-full lg:w-2/3 flex items-center justify-center">
                    <div className="relative group perspective-1000 w-full flex justify-center">
                        {/* Decorative glow behind certificate */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 to-purple-400 opacity-20 blur-3xl transform group-hover:opacity-30 transition-opacity duration-700 rounded-[2rem]" />
                        
                        {/* The Certificate Display Container */}
                        <div className="relative shadow-2xl rounded-sm overflow-hidden border border-slate-200/50 transform transition-transform duration-500 hover:scale-[1.02] bg-white"
                             style={{
                                 width: '100%',
                                 maxWidth: template.orientation === 'VERTICAL' ? '600px' : '900px',
                                 aspectRatio: template.orientation === 'VERTICAL' ? '1 / 1.414' : '1.414 / 1',
                             }}>
                             
                            {/* Hidden actual high-res render div for HTML2Canvas */}
                            <div className="absolute opacity-0 pointer-events-none" style={{ left: '-9999px' }}>
                                <div 
                                    ref={certRef}
                                    className="bg-white relative overflow-hidden"
                                    style={{
                                        width: template.orientation === 'VERTICAL' ? '1123px' : '1587px',
                                        height: template.orientation === 'VERTICAL' ? '1587px' : '1123px',
                                        backgroundColor: '#ffffff',
                                        backgroundImage: `url(${template.designUrl})`,
                                        backgroundSize: '100% 100%',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        border: `${templateStyle.borderWidth * 1.5}px solid ${templateStyle.borderColor}`
                                    }}
                                >
                                    {layout.map((el, i) => (
                                        <div
                                            key={`print-${i}`}
                                            className="absolute whitespace-nowrap"
                                            style={{
                                                left: `${el.x}%`,
                                                top: `${el.y}%`,
                                                transform: 'translate(-50%, -50%)',
                                                fontSize: `${el.fontSize * 1.5}px`, // Scale up for print resolution
                                                color: el.color,
                                                fontWeight: 'bold',
                                                fontFamily: 'system-ui, -apple-system, sans-serif'
                                            }}
                                        >
                                            {el.type === 'qr' ? (
                                                <div className="flex flex-col items-center justify-center text-xs">
                                                    <div className="font-mono text-xl tracking-widest mb-1">||| || ||| |</div>
                                                    <div>{certificate.uniqueId}</div>
                                                </div>
                                            ) : el.type === 'image' ? (
                                                <div className="flex items-center justify-center bg-white rounded-md p-2 shadow-sm" style={{ width: el.fontSize * 6, height: el.fontSize * 6 }}>
                                                    <Image src="/logo-dark.png" alt="Logo" width={160} height={160} className="object-contain" />
                                                </div>
                                            ) : (
                                                renderText(el.value || el.label)
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Viewport Render (Responsive, fluid scaling) */}
                            <div className="absolute inset-0 w-full h-full" style={{ containerType: 'inline-size' }}>
                                {/* Background Image */}
                                <img src={template.designUrl} alt="Certificate Background" className="absolute inset-0 w-full h-full object-cover z-0" />
                                
                                {/* Overlay Text */}
                                <div className="absolute inset-0 z-10">
                                    {layout.map((el, i) => (
                                        <div
                                            key={`view-${i}`}
                                            className="absolute whitespace-nowrap"
                                            style={{
                                                left: `${el.x}%`,
                                                top: `${el.y}%`,
                                                transform: 'translate(-50%, -50%)',
                                                color: el.color,
                                                fontWeight: 'bold',
                                                // Assuming original builder was ~800px wide, 1px = ~0.125cqw
                                                fontSize: `calc(${el.fontSize} * 0.125cqw)`, 
                                                fontFamily: 'system-ui, -apple-system, sans-serif'
                                            }}
                                        >
                                            {el.type === 'qr' ? (
                                                <div className="flex flex-col items-center justify-center text-[0.6rem]">
                                                    <div className="font-mono text-lg tracking-widest mb-1">||| || ||| |</div>
                                                    <div>{certificate.uniqueId}</div>
                                                </div>
                                            ) : el.type === 'image' ? (
                                                <div className="flex items-center justify-center bg-white rounded-md p-1 shadow-sm" style={{ width: `calc(${el.fontSize} * 0.5cqw)`, height: `calc(${el.fontSize} * 0.5cqw)` }}>
                                                    <Image src="/logo-dark.png" alt="Logo" width={80} height={80} className="object-contain" />
                                                </div>
                                            ) : (
                                                renderText(el.value || el.label)
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
