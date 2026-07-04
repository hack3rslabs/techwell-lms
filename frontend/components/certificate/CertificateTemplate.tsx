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
                width: 100,
                height: 100,
                type: "svg",
                data: data.verificationUrl,
                image: "/techwell-icon.png", // Assuming there is an icon
                dotsOptions: { color: "#1e293b", type: "rounded" },
                backgroundOptions: { color: "#ffffff" },
                imageOptions: { crossOrigin: "anonymous", margin: 5 }
            });
            qrCode.append(qrRef.current);
        }
    }, [data.verificationUrl]);

    return (
        <div className="w-[1000px] h-[707px] bg-white relative overflow-hidden font-sans shadow-2xl mx-auto flex flex-col justify-center items-center" id="certificate-template">
            {/* Background design elements */}
            <div className="absolute top-0 left-0 w-full h-full border-[15px] border-slate-900 z-10 pointer-events-none"></div>
            <div className="absolute top-[15px] left-[15px] w-[calc(100%-30px)] h-[calc(100%-30px)] border-[2px] border-amber-500 z-10 pointer-events-none"></div>
            
            <div className="absolute top-0 left-0 w-64 h-64 bg-slate-900 rounded-br-full opacity-10 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500 rounded-tl-full opacity-10 blur-3xl"></div>

            <div className="z-20 w-full px-24 py-16 flex flex-col items-center text-center h-full">
                
                {/* Header Logo */}
                <div className="flex flex-col items-center mb-8">
                    {/* Placeholder for Logo */}
                    <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-slate-900 rounded flex items-center justify-center mb-4 text-white font-bold text-2xl shadow-lg">
                        TW
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-wider uppercase">Techwell Consulting</h1>
                    <p className="text-sm font-medium tracking-[0.2em] text-slate-500 uppercase mt-1">Excellence in IT Training</p>
                </div>

                <div className="flex-1 flex flex-col justify-center items-center w-full">
                    <h2 className="text-5xl font-serif text-slate-900 mb-8 italic">Certificate of Completion</h2>
                    
                    <p className="text-lg text-slate-600 mb-4">This is to certify that</p>
                    
                    <h3 className="text-4xl font-bold text-amber-600 mb-6 uppercase tracking-wider underline decoration-amber-200 underline-offset-8">
                        {data.studentName}
                    </h3>
                    
                    <p className="text-lg text-slate-600 mb-4 max-w-2xl leading-relaxed">
                        has successfully completed the comprehensive training program and satisfied all requirements for the course:
                    </p>
                    
                    <h4 className="text-2xl font-bold text-slate-800 mb-2">
                        {data.courseName}
                    </h4>
                    {data.courseCategory && (
                        <p className="text-md text-amber-600 font-medium uppercase tracking-widest">{data.courseCategory}</p>
                    )}
                </div>

                {/* Footer section (Signatures & Verification) */}
                <div className="w-full flex justify-between items-end mt-12 pt-8 border-t border-slate-200">
                    
                    {/* Date Info */}
                    <div className="flex flex-col items-start w-1/3">
                        <p className="text-slate-900 font-bold border-b border-slate-400 pb-1 w-32 text-center mb-2">
                            {format(new Date(data.issueDate), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Date of Issue</p>
                    </div>

                    {/* QR Code / Badge */}
                    <div className="flex flex-col items-center w-1/3">
                        <div ref={qrRef} className="bg-white p-2 shadow-sm border border-slate-100 rounded-lg"></div>
                        <p className="text-[10px] text-slate-400 mt-2 font-mono">ID: {data.uniqueId}</p>
                    </div>

                    {/* Signature */}
                    <div className="flex flex-col items-center w-1/3 text-right">
                        {/* Fake Signature Font */}
                        <p className="text-4xl font-['Brush_Script_MT',cursive] text-slate-800 mb-2 -rotate-2">
                            {data.signatoryName}
                        </p>
                        <div className="w-48 border-b border-slate-400 mb-2 mx-auto"></div>
                        <p className="text-xs text-slate-900 font-bold uppercase tracking-wider">{data.signatoryName}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">{data.signatoryTitle}</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
