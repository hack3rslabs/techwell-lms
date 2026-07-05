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

    // Branding mappings based on selected template
    const designCode = data.template?.designUrl || 'CLASSIC_BLUE';
    
    let borderColor = "border-slate-100";
    let innerBorderColor = "border-primary/30";
    let cornerBorderColor = "border-primary";
    let glowColor = "bg-primary/5";
    let accentTextColor = "text-primary";
    let titleTextColor = "text-slate-900";
    
    if (designCode === 'RICH_GOLD') {
        borderColor = "border-amber-100";
        innerBorderColor = "border-amber-500/50";
        cornerBorderColor = "border-amber-500";
        glowColor = "bg-amber-500/10";
        accentTextColor = "text-amber-600";
        titleTextColor = "text-amber-900";
    } else if (designCode === 'PROFESSIONAL_SLATE') {
        borderColor = "border-slate-200";
        innerBorderColor = "border-slate-700/30";
        cornerBorderColor = "border-slate-800";
        glowColor = "bg-slate-500/5";
        accentTextColor = "text-slate-700";
        titleTextColor = "text-slate-900";
    }

    return (
        <div id="certificate-template" className="w-[1056px] h-[816px] bg-white relative overflow-hidden font-sans shadow-2xl mx-auto flex flex-col justify-center items-center print:shadow-none print:m-0 print:w-full print:h-screen print:max-w-none print:max-h-none print:page-break-inside-avoid">
            
            {/* Background design elements */}
            <div className={`absolute top-0 left-0 w-full h-full border-[20px] border-double ${borderColor} z-10 pointer-events-none print:border-[10px]`}></div>
            <div className={`absolute top-[20px] left-[20px] w-[calc(100%-40px)] h-[calc(100%-40px)] border-[1px] ${innerBorderColor} z-10 pointer-events-none`}></div>
            
            {/* Corner accents */}
            <div className={`absolute top-0 left-0 w-32 h-32 border-t-[12px] border-l-[12px] ${cornerBorderColor} z-20 pointer-events-none`}></div>
            <div className={`absolute bottom-0 right-0 w-32 h-32 border-b-[12px] border-r-[12px] ${cornerBorderColor} z-20 pointer-events-none`}></div>

            {/* Subtle background gradients */}
            <div className={`absolute top-0 right-0 w-96 h-96 ${glowColor} rounded-bl-full opacity-60 blur-3xl`}></div>
            <div className={`absolute bottom-0 left-0 w-96 h-96 ${glowColor} rounded-tr-full opacity-60 blur-3xl`}></div>

            <div className="z-20 w-full px-28 py-16 flex flex-col items-center text-center h-full">
                
                {/* Header Logo */}
                <div className="flex flex-col items-center mb-10 w-full">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-14 h-14 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-2xl shadow-md">
                            TW
                        </div>
                        <div className="text-left">
                            <h1 className="text-2xl font-extrabold text-slate-900 tracking-widest uppercase">Techwell</h1>
                            <p className="text-[10px] font-semibold tracking-[0.3em] text-primary uppercase">Institute of Technology</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center items-center w-full">
                    <h2 className="text-6xl font-serif text-slate-900 mb-8 font-medium italic tracking-wide">Certificate of Completion</h2>
                    
                    <p className="text-lg text-slate-500 uppercase tracking-[0.2em] mb-6 font-medium">This is to certify that</p>
                    
                    <h3 className={`text-5xl font-serif font-bold ${titleTextColor} mb-8 border-b-2 border-primary/20 pb-2 px-12 w-4/5`}>
                        {data.studentName}
                    </h3>
                    
                    <p className="text-lg text-slate-600 mb-6 max-w-3xl leading-relaxed">
                        has successfully completed the comprehensive training program and satisfied all the academic requirements for the course:
                    </p>
                    
                    <h4 className="text-3xl font-bold text-slate-800 mb-3 tracking-wide">
                        {data.courseName}
                    </h4>
                    {data.courseCategory && (
                        <p className={`text-sm ${accentTextColor} font-bold uppercase tracking-widest ${glowColor} px-4 py-1 rounded-full`}>{data.courseCategory}</p>
                    )}
                </div>

                {/* Footer section (Signatures & Verification) */}
                <div className="w-full flex justify-between items-end mt-12 pt-8">
                    
                    {/* Date Info */}
                    <div className="flex flex-col items-start w-1/3 text-left">
                        <p className="text-slate-900 font-bold border-b border-slate-300 pb-1 w-40 mb-2 text-lg">
                            {format(new Date(data.issueDate), 'MMMM dd, yyyy')}
                        </p>
                        <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold">Date of Issue</p>
                    </div>

                    {/* QR Code / Badge */}
                    <div className="flex flex-col items-center w-1/3">
                        <div ref={qrRef} className="bg-white p-2 shadow-sm border border-slate-100 rounded-xl"></div>
                        <p className="text-[10px] text-slate-400 mt-2 font-mono tracking-wider">ID: {data.uniqueId}</p>
                    </div>

                    {/* Signature */}
                    <div className="flex flex-col items-end w-1/3 text-right">
                        {/* Fake Signature Font */}
                        <p className="text-5xl font-['Brush_Script_MT',cursive] text-slate-800 mb-2 -rotate-3 opacity-90">
                            {data.signatoryName}
                        </p>
                        <div className="w-48 border-b border-slate-300 mb-2"></div>
                        <p className="text-[11px] text-slate-900 font-bold uppercase tracking-widest">{data.signatoryName}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{data.signatoryTitle}</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
