"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { consultancyApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Printer, ArrowLeft } from "lucide-react"

export default function PrintAgreementPage() {
    const params = useParams()
    const id = params.id as string
    
    const [agreement, setAgreement] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAgreement = async () => {
            try {
                const res = await consultancyApi.getInvitations()
                const found = res.data.invitations.find((i: any) => i.agreement?.id === id)
                if (found && found.agreement) {
                    setAgreement(found.agreement)
                    // Auto trigger print after a short delay to ensure images load
                    setTimeout(() => window.print(), 500)
                }
            } catch (error) {
                console.error("Failed to fetch agreement", error)
            } finally {
                setLoading(false)
            }
        }
        
        fetchAgreement()
    }, [id])

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading Document...</div>
    }

    if (!agreement) {
        return <div className="flex flex-col justify-center items-center h-screen space-y-4">
            <h1 className="text-2xl font-bold">Agreement Not Found</h1>
            <Button onClick={() => window.close()}>Close Tab</Button>
        </div>
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8 print:py-0 print:bg-white">
            <style dangerouslySetInnerHTML={{__html: `
                @page {
                    size: A4;
                    margin: 2.54cm !important; /* Strict 1-inch professional legal margins on all sides */
                }
                @media print {
                    /* Completely hide the admin sidebar and header */
                    header, aside, nav {
                        display: none !important;
                    }
                    /* Remove the margin left by the sidebar */
                    div[class*="md:ml-"] {
                        margin-left: 0 !important;
                    }
                    main {
                        padding: 0 !important;
                    }
                    
                    /* Force background colors to print */
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        background-color: white !important;
                    }
                }
            `}} />
            
            {/* Screen Actions (Hidden on Print) */}
            <div className="max-w-4xl mx-auto mb-4 flex justify-between print:hidden px-4">
                <Button variant="outline" onClick={() => window.close()}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Close Tab
                </Button>
                <Button onClick={() => window.print()}>
                    <Printer className="h-4 w-4 mr-2" /> Print PDF
                </Button>
            </div>

            {/* Document Content */}
            <div className="bg-white text-black p-12 print:p-0 print:max-w-none max-w-4xl mx-auto shadow-lg print:shadow-none font-serif leading-relaxed">
                <div className="flex flex-col items-center text-center mb-10 pb-6 border-b-2 border-black relative">
                    <img src="/logo-light.png" alt="Techwell Logo" className="h-20 mb-4 object-contain" />
                    <h1 className="text-2xl print:text-xl font-bold uppercase tracking-[0.15em] text-black underline underline-offset-4">Placement Consultancy Agreement</h1>
                    <p className="text-xs mt-3 text-gray-600 font-sans tracking-wide">DIGITALLY EXECUTED DOCUMENT | VERSION 1.0</p>
                </div>

                <div className="space-y-6 text-[13px] print:text-[12px] print:leading-normal text-justify px-2">
                    
                    <p>
                        This <strong>Placement Consultancy Agreement</strong> (hereinafter referred to as the "Agreement") is made, entered into, and executed electronically on this <strong>{new Date(agreement.acceptedAt).toLocaleDateString()}</strong> (the "Effective Date").
                    </p>

                    <div className="my-6">
                        <p className="font-bold uppercase text-center mb-4">BY AND BETWEEN</p>
                        <p>
                            <strong>TECHWELL PLACEMENT CONSULTANCY</strong>, a placement and career guidance agency (hereinafter referred to as "Techwell" or the "First Party", which expression shall, unless repugnant to the context or meaning thereof, be deemed to mean and include its successors and assigns);
                        </p>
                        
                        <p className="font-bold uppercase text-center my-4">AND</p>
                        
                        <p>
                            <strong>{agreement.gender === 'Male' ? 'Mr.' : agreement.gender === 'Female' ? 'Ms.' : ''} <span className="uppercase">{agreement.fullName}</span></strong>, S/o, D/o <strong>{agreement.parentsName}</strong>, aged about <strong>{new Date().getFullYear() - new Date(agreement.dob).getFullYear()} years</strong>, having Aadhaar Number <strong>{agreement.aadhaarNumber}</strong>, and residing at <strong>{agreement.currentAddress}, {agreement.city}, {agreement.state} - {agreement.pinCode}</strong> (hereinafter referred to as the "Candidate" or the "Second Party", which expression shall, unless repugnant to the context or meaning thereof, be deemed to mean and include his/her heirs, executors, and administrators).
                        </p>
                    </div>

                    <div className="space-y-3 my-6">
                        <p className="font-bold uppercase">WHEREAS:</p>
                        <ol className="list-[upper-alpha] pl-8 space-y-2">
                            <li>The First Party is engaged in the business of providing placement consultancy, profile processing, career guidance, and interview coordination services.</li>
                            <li>The Second Party is seeking employment opportunities and possesses the following professional profile:
                                <ul className="list-disc pl-6 mt-2 space-y-1">
                                    <li><strong>Highest Qualification:</strong> {agreement.highestQualification} ({agreement.graduationYear})</li>
                                    <li><strong>Experience Level:</strong> {agreement.experienceLevel} {agreement.totalExperience ? `(${agreement.totalExperience})` : ''}</li>
                                    <li><strong>Preferred Job Role:</strong> {agreement.preferredJobRoles}</li>
                                    <li><strong>Contact Coordinates:</strong> {agreement.mobileNumber} | {agreement.emailAddress}</li>
                                </ul>
                            </li>
                            <li>The Second Party has voluntarily approached the First Party and requested to avail its consultancy services subject to the terms and conditions set forth herein.</li>
                        </ol>
                    </div>

                    <p className="font-bold uppercase text-center my-6 border-y border-gray-400 py-2 bg-gray-50 print:bg-gray-100">NOW, THEREFORE, THE PARTIES HEREBY AGREE AS FOLLOWS:</p>

                    <div className="space-y-4 print:space-y-3">
                        <p><strong>1. Scope of Services:</strong> The First Party shall provide Placement Consultancy, Resume Processing, Resume Forwarding, Career Guidance, Interview Coordination, Employer Communication, and Job Opportunity Assistance. The Candidate acknowledges that Techwell is purely a consultancy and NOT the employer.</p>
                        <p><strong>2. No Employment Guarantee:</strong> The Candidate clearly understands and voluntarily accepts that Techwell does NOT guarantee employment, interview selection, offer release, joining, confirmation after joining, or employment continuation. Final employment decisions are the sole prerogative of the prospective employer.</p>
                        <p><strong>3. Compensation & Role:</strong> Techwell does not promise or guarantee any specific Salary (CTC), Salary Hike, Designation, Promotions, Incentives, or Bonuses. Salary negotiations shall be conducted solely between the Candidate and the employer.</p>
                        <p><strong>4. Location Preferences:</strong> Techwell cannot guarantee Preferred City, Preferred State, Work From Home, Hybrid Work, or Office Location. Location allocations depend entirely on the employer's requirements.</p>
                        <p><strong>5. Authorization:</strong> The Candidate hereby authorizes Techwell to review their profile, improve resume formatting if required, share the resume with suitable employers, contact employers regarding the profile, coordinate interviews, and follow up with employers on their behalf.</p>
                        <p><strong>6. Candidate Obligations:</strong> The Candidate agrees to attend all scheduled interviews, respond to employer communications promptly, inform Techwell regarding interview results, offer releases, and joining status, and maintain strictly professional behavior throughout the recruitment process.</p>
                        <p><strong>7. Consultancy Charges:</strong> The Candidate understands that consultancy charges, if applicable, are communicated separately by Techwell. Any agreed consultancy charges are part of the consultancy arrangement and are strictly separate from the employer's salary or compensation.</p>
                        <p><strong>8. Data Privacy & Usage:</strong> The Candidate authorizes Techwell to securely store their information, process personal data, retain their resume, share the profile with prospective employers, and maintain records of interviews, offers, and placement activities for consultancy purposes.</p>
                        <p><strong>9. Employer Independence:</strong> The Candidate acknowledges that employers independently shortlist candidates, conduct interviews, and decide salary, designation, work location, joining date, probation, confirmation, and continuation of employment. These decisions are entirely beyond Techwell's control.</p>
                        <p><strong>10. Post-Joining Relationship:</strong> The Candidate understands that upon joining a company, their employment relationship is directly and exclusively with that employer. Techwell is not responsible for day-to-day work, salary payments, HR policies, probation, confirmation, transfers, resignations, or any employment-related decisions after joining.</p>
                        <p><strong>11. Communication Consent:</strong> The Candidate authorizes Techwell to communicate with them via Phone Calls, WhatsApp, SMS, and Email for placement consultancy and career-related purposes.</p>
                    </div>

                    <div className="mt-10 break-inside-avoid">
                        <p className="font-bold uppercase text-center my-6 border-y border-gray-400 py-2 bg-gray-50 print:bg-gray-100">DECLARATION & EXECUTION</p>
                        
                        <p className="mb-6 italic text-justify">
                            <strong>IN WITNESS WHEREOF</strong>, I, <strong><span className="uppercase">{agreement.fullName}</span></strong>, hereby certify that the information provided by me is true and correct. I voluntarily request Techwell to provide placement consultancy services, and I acknowledge that I have read, understood, and accepted this Placement Consultancy Agreement and all the Terms & Conditions stated herein without any coercion or undue influence.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-12 items-end mt-8">
                            <div className="border-2 border-dashed border-gray-300 p-4 h-48 print:h-44 flex items-center justify-center relative bg-white">
                                <span className="absolute top-2 left-2 text-[10px] font-sans font-bold text-gray-400 tracking-widest">APPENDIX A: LIVE PHOTO CAPTURE</span>
                                {agreement.livePhotoUrl && <img src={agreement.livePhotoUrl} alt="Live Photo" className="max-h-full max-w-full object-contain mix-blend-multiply" />}
                            </div>
                            <div className="border-2 border-dashed border-gray-300 p-4 h-48 print:h-44 flex flex-col justify-end relative bg-white">
                                <span className="absolute top-2 left-2 text-[10px] font-sans font-bold text-gray-400 tracking-widest">APPENDIX B: DIGITAL SIGNATURE</span>
                                {agreement.digitalSignatureUrl && <img src={agreement.digitalSignatureUrl} alt="Signature" className="max-h-24 w-full object-contain mb-4 mix-blend-multiply" />}
                                <div className="border-t-2 border-black text-center pt-2">
                                    <p className="font-bold uppercase text-sm">SIGNATURE OF SECOND PARTY (CANDIDATE)</p>
                                    <p className="font-bold uppercase text-xs mt-1">{agreement.fullName}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-8 text-[9px] font-sans text-gray-500 border-t pt-4 text-center tracking-wide uppercase">
                            <p><strong>ELECTRONIC AUDIT TRAIL — AGREEMENT ID:</strong> {agreement.id} | <strong>TIMESTAMP:</strong> {new Date(agreement.acceptedAt).toISOString()} | <strong>IP/COORDINATES:</strong> {agreement.locationCoords || 'Not Provided'}</p>
                            <p className="mt-1">This document is digitally executed and holds binding electronic consent under the Information Technology Act, 2000. No physical signature from the First Party is required.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
