import React, { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { format } from 'date-fns';

interface CertificateData {
    uniqueId: string;
    studentName: string;
    courseName: string;
    courseCategory?: string;
    issueDate: string;
    grade?: string;
    signatoryName: string;
    signatoryTitle: string;
    verificationUrl: string;
    template?: { designUrl: string; name?: string };
    franchise?: { name: string; logoUrl?: string | null };
}

interface CertificateTemplateProps {
    data: CertificateData;
}

export default function CertificateTemplate({ data }: CertificateTemplateProps) {
    const qrRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (qrRef.current) {
            qrRef.current.innerHTML = '';
            const qrCode = new QRCodeStyling({
                width: 90,
                height: 90,
                type: "svg",
                data: data.verificationUrl,
                image: "/techwell-icon.png", 
                dotsOptions: { color: "#0f172a", type: "rounded" },
                backgroundOptions: { color: "transparent" },
                imageOptions: { crossOrigin: "anonymous", margin: 4 }
            });
            qrCode.append(qrRef.current);
        }
    }, [data.verificationUrl]);

    // Using strict logo colors (Primary Techwell blue and slate). 
    // We avoid yellow, orange, red, pink as requested by the user.
    const borderColor = "border-primary";
    const innerBorderColor = "border-slate-300";
    const titleTextColor = "text-primary";
    
    // In case there is a dynamic template image
    const hasCustomBackground = data.template?.designUrl && !data.template.designUrl.startsWith('CLASSIC') && !data.template.designUrl.startsWith('RICH') && !data.template.designUrl.startsWith('PROFESSIONAL');

    return (
        <div id="certificate-template" className="w-[1056px] h-[816px] bg-white relative overflow-hidden font-sans shadow-2xl mx-auto flex flex-col justify-center items-center print:shadow-none print:m-0 print:w-full print:h-screen print:max-w-none print:max-h-none print:page-break-inside-avoid">
            
            {hasCustomBackground ? (
                // If a custom background image is uploaded, use object-contain to avoid stretching, and center it
                <div className="absolute inset-0 w-full h-full flex items-center justify-center p-4">
                    <img src={data.template!.designUrl} alt="Certificate Background" className="w-full h-full object-contain opacity-20 pointer-events-none" />
                </div>
            ) : null}

            {/* Strict, clean borders without overlaps */}
            <div className={`absolute top-0 left-0 w-full h-full border-[16px] ${borderColor} z-10 pointer-events-none print:border-[10px]`}></div>
            <div className={`absolute top-[24px] left-[24px] w-[calc(100%-48px)] h-[calc(100%-48px)] border-[2px] ${innerBorderColor} z-10 pointer-events-none`}></div>
            
            <div className="z-20 w-full px-20 py-16 flex flex-col items-center text-center h-full">
                
                {/* Header Logo(s) centered */}
                <div className="flex flex-col items-center mb-10 w-full gap-4">
                    <div className="flex items-center gap-6">
                        {/* Techwell Logo */}
                        <div className="flex items-center gap-3">
                            <img src="/logo-light.png" alt="Techwell Logo" className="h-16 object-contain" />
                        </div>

                        {data.franchise?.logoUrl && (
                            <div className="h-12 border-l-2 border-slate-300"></div>
                        )}
                        
                        {/* Franchise Logo (Right next to Techwell logo) */}
                        {data.franchise && data.franchise.logoUrl && (
                            <div className="flex items-center gap-3">
                                <img src={data.franchise.logoUrl} alt={data.franchise.name} className="h-16 max-w-[120px] object-contain" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center items-center w-full mt-4">
                    <h2 className="text-6xl font-serif text-slate-900 mb-8 font-medium tracking-wide">CERTIFICATE OF COMPLETION</h2>
                    
                    <p className="text-lg text-slate-600 uppercase tracking-[0.2em] mb-6 font-medium">This is to certify that</p>
                    
                    <h3 className={`text-5xl font-serif font-bold ${titleTextColor} mb-8 border-b border-slate-300 pb-2 px-12 inline-block min-w-[50%]`}>
                        {data.studentName}
                    </h3>
                    
                    <p className="text-lg text-slate-600 mb-6 max-w-3xl leading-relaxed">
                        has successfully completed the comprehensive training program and satisfied all the academic requirements for the course:
                    </p>
                    
                    <h4 className="text-3xl font-bold text-slate-800 mb-3 tracking-wide">
                        {data.courseName}
                    </h4>
                    {data.courseCategory && (
                        <p className={`text-sm text-primary font-bold uppercase tracking-widest px-4 py-1 mt-2`}>{data.courseCategory}</p>
                    )}
                </div>

                {/* Footer section (Signatures & Verification) */}
                <div className="w-full flex justify-between items-end mt-12 pt-8">
                    
                    {/* Date Info */}
                    <div className="flex flex-col items-start w-1/3 text-left pl-8">
                        <p className="text-slate-900 font-bold border-b border-slate-300 pb-1 w-48 mb-2 text-lg">
                            {format(new Date(data.issueDate), 'MMMM dd, yyyy')}
                        </p>
                        <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold">Date of Issue</p>
                    </div>

                    {/* QR Code centered in footer */}
                    <div className="flex flex-col items-center justify-center w-1/3">
                        <div ref={qrRef} className="bg-white p-2 shadow-sm border border-slate-200 rounded-xl"></div>
                        <p className="text-[10px] text-slate-500 mt-2 font-mono tracking-wider">ID: {data.uniqueId}</p>
                    </div>

                    {/* Signature */}
                    <div className="flex flex-col items-end w-1/3 text-right pr-8">
                        <p className="text-5xl font-['Brush_Script_MT',cursive] text-primary mb-2 -rotate-2 opacity-90">
                            {data.signatoryName}
                        </p>
                        <div className="w-56 border-b border-slate-300 mb-2"></div>
                        <p className="text-[11px] text-slate-900 font-bold uppercase tracking-widest">{data.signatoryName}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{data.signatoryTitle}</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
