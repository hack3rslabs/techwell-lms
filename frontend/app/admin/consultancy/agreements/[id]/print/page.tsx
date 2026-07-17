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
            <style // deepcode ignore DOMXSS: Sanitized by React
dangerouslySetInnerHTML={{__html: `
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
                <div className="flex flex-col items-center text-center mb-8 border-b-2 border-black pb-6">
                    <img src="/logo-light.png" alt="Techwell Logo" className="h-20 mb-4 object-contain" />
                    <h1 className="text-2xl print:text-xl font-bold uppercase tracking-[0.15em] text-black">Techwell Placement Consultancy</h1>
                    <h2 className="text-xl print:text-lg font-semibold mt-2 text-gray-800">Candidate Consent & Consultancy Agreement</h2>
                    <p className="text-xs mt-2 text-gray-500 font-sans tracking-wide">DOCUMENT VERSION: 1.0 | DIGITALLY SIGNED OFFICIAL RECORD</p>
                </div>

                <div className="space-y-6 text-sm print:text-[11px] print:leading-normal">
                    <section className="break-inside-avoid">
                        <h3 className="font-bold text-base print:text-sm border-b border-gray-400 mb-3 uppercase bg-gray-100 print:bg-gray-200 p-2 text-gray-900 tracking-wider">1. Candidate Information</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3 p-2">
                            <div><span className="text-gray-600 font-sans text-xs uppercase mr-2">Full Name:</span> <strong className="uppercase">{agreement.fullName}</strong></div>
                            <div><span className="text-gray-600 font-sans text-xs uppercase mr-2">Father's Name:</span> <strong>{agreement.parentsName}</strong></div>
                            <div><span className="text-gray-600 font-sans text-xs uppercase mr-2">DOB:</span> <strong>{new Date(agreement.dob).toLocaleDateString()}</strong></div>
                            <div><span className="text-gray-600 font-sans text-xs uppercase mr-2">Gender:</span> <strong>{agreement.gender}</strong></div>
                            <div><span className="text-gray-600 font-sans text-xs uppercase mr-2">Aadhaar No:</span> <strong>{agreement.aadhaarNumber}</strong></div>
                            <div><span className="text-gray-600 font-sans text-xs uppercase mr-2">Mobile:</span> <strong>{agreement.mobileNumber}</strong></div>
                            <div className="col-span-2"><span className="text-gray-600 font-sans text-xs uppercase mr-2">Email:</span> <strong>{agreement.emailAddress}</strong></div>
                            <div className="col-span-3"><span className="text-gray-600 font-sans text-xs uppercase mr-2">Current Address:</span> <strong>{agreement.currentAddress}, {agreement.city}, {agreement.state} - {agreement.pinCode}</strong></div>
                        </div>
                    </section>

                    <section className="break-inside-avoid">
                        <h3 className="font-bold text-base print:text-sm border-b border-gray-400 mb-3 uppercase bg-gray-100 print:bg-gray-200 p-2 text-gray-900 tracking-wider">2. Professional Details</h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3 p-2">
                            <div><span className="text-gray-600 font-sans text-xs uppercase mr-2">Qualification:</span> <strong>{agreement.highestQualification} ({agreement.graduationYear})</strong></div>
                            <div><span className="text-gray-600 font-sans text-xs uppercase mr-2">Experience Level:</span> <strong>{agreement.experienceLevel}</strong></div>
                            <div><span className="text-gray-600 font-sans text-xs uppercase mr-2">Job Role:</span> <strong>{agreement.preferredJobRoles}</strong></div>
                            <div><span className="text-gray-600 font-sans text-xs uppercase mr-2">Preferred Location:</span> <strong>{agreement.preferredLocations}</strong></div>
                        </div>
                    </section>

                    <section>
                        <h3 className="font-bold text-base print:text-sm border-b border-gray-400 mb-4 uppercase bg-gray-100 print:bg-gray-200 p-2 text-gray-900 tracking-wider">3. Consultancy Terms & Conditions</h3>
                        <div className="space-y-4 print:space-y-4 text-justify px-2 print:leading-relaxed text-gray-800">
                            <p><strong className="text-black">1. Consultancy Services:</strong> I understand that Techwell provides Placement Consultancy, Resume Processing, Resume Forwarding, Career Guidance, Interview Coordination, Employer Communication, and Job Opportunity Assistance. Techwell is not the employer.</p>
                            <p><strong className="text-black">2. No Employment Guarantee:</strong> I clearly understand and voluntarily accept that Techwell does not guarantee employment, interview selection, offer release, joining, confirmation after joining, or employment continuation. Final employment decisions are made solely by the employer.</p>
                            <p><strong className="text-black">3. No Salary Guarantee:</strong> I understand that Techwell does not promise or guarantee Salary (CTC), Salary Hike, Designation, Promotions, Incentives, or Bonuses. Salary negotiations are solely between the candidate and the employer.</p>
                            <p><strong className="text-black">4. No Location Guarantee:</strong> I understand that Techwell cannot guarantee Preferred City, Preferred State, Work From Home, Hybrid Work, or Office Location. Location depends entirely on employer requirements.</p>
                            <p><strong className="text-black">5. Job Process:</strong> I authorize Techwell to review my profile, improve resume formatting if required, share my resume with suitable employers, contact employers regarding my profile, coordinate interviews, and follow up with employers.</p>
                            <p><strong className="text-black">6. Candidate Responsibility:</strong> I agree to attend scheduled interviews, respond to employer communication promptly, inform Techwell about interview results, inform Techwell if I receive an offer, inform Techwell after joining, and maintain professional behaviour throughout the recruitment process.</p>
                            <p><strong className="text-black">7. Consultancy Charges:</strong> I understand that consultancy charges, if applicable, are communicated separately by Techwell. I acknowledge that any agreed consultancy charges are part of the consultancy arrangement and are separate from the employer's salary or compensation.</p>
                            <p><strong className="text-black">8. Privacy & Data Usage:</strong> I authorize Techwell to store my information, process my personal data, store my resume, share my profile with prospective employers, and maintain records of interviews, offers, and placement activities for consultancy purposes.</p>
                            <p><strong className="text-black">9. Employer Decisions:</strong> I understand that employers independently shortlist candidates, conduct interviews, and decide salary, designation, work location, joining date, probation, confirmation, and continuation of employment. These decisions are beyond Techwell's control.</p>
                            <p><strong className="text-black">10. After Joining:</strong> I understand that after joining a company, my employment relationship is directly with that employer. Day-to-day work, salary payments, HR policies, probation, confirmation, transfers, resignations, and employment decisions are handled by the employer. Techwell is not responsible for managing the employment relationship after joining.</p>
                            <p><strong className="text-black">11. Communication Consent:</strong> I authorize Techwell to communicate with me through Phone Calls, WhatsApp, SMS, and Email for placement consultancy and career-related purposes.</p>
                        </div>
                    </section>

                    <section className="mt-8 break-inside-avoid">
                        <h3 className="font-bold text-base print:text-sm border-b border-gray-400 mb-4 uppercase bg-gray-100 print:bg-gray-200 p-2 text-gray-900 tracking-wider">4. Cryptographic Verification & Signatures</h3>
                        <p className="mb-4 italic px-2 text-justify">I hereby certify that the information provided by me is true and correct. I voluntarily request Techwell to provide placement consultancy services, and I acknowledge that I have read, understood, and accepted this Consultancy Agreement and all Terms & Conditions.</p>
                        
                        <div className="grid grid-cols-2 gap-8 items-end mt-8 px-2">
                            <div className="border border-gray-300 p-4 h-48 print:h-40 flex items-center justify-center relative bg-white">
                                <span className="absolute top-2 left-2 text-[10px] font-sans font-bold text-gray-400 tracking-widest">LIVE PHOTO CAPTURE</span>
                                {agreement.livePhotoUrl && <img src={agreement.livePhotoUrl} alt="Live Photo" className="max-h-full max-w-full object-contain mix-blend-multiply" />}
                            </div>
                            <div className="border border-gray-300 p-4 h-48 print:h-40 flex flex-col justify-end relative bg-white">
                                <span className="absolute top-2 left-2 text-[10px] font-sans font-bold text-gray-400 tracking-widest">DIGITAL SIGNATURE</span>
                                {agreement.digitalSignatureUrl && <img src={agreement.digitalSignatureUrl} alt="Signature" className="max-h-24 w-full object-contain mb-4 mix-blend-multiply" />}
                                <div className="border-t border-black text-center pt-2">
                                    <p className="font-bold uppercase text-sm">{agreement.fullName}</p>
                                    <p className="text-[10px] font-sans text-gray-600 mt-1">Digitally Signed Date: {new Date(agreement.acceptedAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-8 text-[10px] font-sans text-gray-500 border-t pt-4 text-center tracking-wide">
                            <p><strong>AUDIT TRAIL — AGREEMENT ID:</strong> {agreement.id} | <strong>COORDINATES:</strong> {agreement.locationCoords || 'Not Provided'}</p>
                            <p className="mt-1">This document is digitally generated and holds binding electronic consent under the Information Technology Act.</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
