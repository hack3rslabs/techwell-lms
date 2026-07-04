"use client"

import React, { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { consultancyApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Webcam from "react-webcam"
import SignatureCanvas from "react-signature-canvas"
import { Loader2, Camera, CheckCircle, UploadCloud, ShieldCheck } from "lucide-react"

export default function ConsultancyInvitePage() {
    const params = useParams()
    const token = params.token as string

    const [invitation, setInvitation] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    // Form State mapped to document requirements
    const [formData, setFormData] = useState({
        fullName: "", parentsName: "", dob: "", gender: "", aadhaarNumber: "",
        mobileNumber: "", alternateMobile: "", emailAddress: "",
        currentAddress: "", permanentAddress: "", city: "", state: "", pinCode: "",
        highestQualification: "", graduationYear: "",
        experienceLevel: "Fresher", currentCompany: "", totalExperience: "", relevantExperience: "",
        currentCtc: "", expectedCtc: "", noticePeriod: "", preferredJobRoles: "", preferredLocations: "",
        typedLegalName: ""
    })

    // Upload & Verification States
    const [livePhotoUrl, setLivePhotoUrl] = useState<string | null>(null)
    const [resumeUploaded, setResumeUploaded] = useState(false)
    const [govIdUploaded, setGovIdUploaded] = useState(false)
    const [webcamEnabled, setWebcamEnabled] = useState(false)
    const [isCameraReady, setIsCameraReady] = useState(false)

    // Agreement States
    const [hasScrolled, setHasScrolled] = useState(false)
    const [consents, setConsents] = useState({
        readAgreement: false,
        understandScope: false,
        noGuarantee: false,
        authorizeProcess: false,
        infoTrue: false,
        acceptTerms: false
    })

    // Math Captcha
    const [captcha, setCaptcha] = useState({ a: 0, b: 0 })
    const [captchaAnswer, setCaptchaAnswer] = useState("")

    const webcamRef = useRef<Webcam>(null)
    const sigCanvas = useRef<any>(null)

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const res = await consultancyApi.verifyInvitation(token)
                setInvitation(res.data.invitation)
                setFormData(prev => ({ 
                    ...prev, 
                    fullName: res.data.invitation.name || "",
                    emailAddress: res.data.invitation.email || "",
                    mobileNumber: res.data.invitation.phone || "",
                    preferredJobRoles: res.data.invitation.jobRole || "",
                    ...(res.data.invitation.prefilledData || {})
                }))
                generateCaptcha()
            } catch (error: any) {
                toast.error(error.response?.data?.message || "Invalid invitation")
                setInvitation(null)
            } finally {
                setLoading(false)
            }
        }
        if (token) verifyToken()
    }, [token])

    const generateCaptcha = () => {
        setCaptcha({ a: Math.floor(Math.random() * 20) + 1, b: Math.floor(Math.random() * 20) + 1 })
        setCaptchaAnswer("")
    }

    const capturePhoto = React.useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        if (!webcamRef.current) return toast.error("Camera not initialized.")
        const imageSrc = webcamRef.current.getScreenshot()
        if (imageSrc) {
            setLivePhotoUrl(imageSrc)
            setWebcamEnabled(false)
            setIsCameraReady(false)
        } else {
            toast.error("Failed to capture photo. Camera may not be fully ready yet.")
        }
    }, [])

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
        if (scrollHeight - scrollTop <= clientHeight + 150) {
            setHasScrolled(true)
        }
    }

    const handleFileUpload = (type: 'resume' | 'govid', e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            toast.success(`File selected successfully`)
            if (type === 'resume') setResumeUploaded(true)
            if (type === 'govid') setGovIdUploaded(true)
        }
    }

    const getMissingRequirements = () => {
        const missing = []
        if (!formData.fullName || !formData.parentsName || !formData.dob || !formData.gender || !formData.aadhaarNumber || !formData.mobileNumber || !formData.emailAddress || !formData.currentAddress || !formData.permanentAddress || !formData.city || !formData.state || !formData.pinCode) missing.push("Candidate Information")
        if (!formData.highestQualification || !formData.graduationYear) missing.push("Education Details")
        if (!formData.experienceLevel || !formData.preferredJobRoles || !formData.preferredLocations) missing.push("Professional Details")
        
        if (!resumeUploaded) missing.push("Resume Upload")
        if (!govIdUploaded) missing.push("Gov ID Upload")
        if (!livePhotoUrl) missing.push("Live Photo")
        if (sigCanvas.current?.isEmpty()) missing.push("Signature")

        if (!hasScrolled) missing.push("Scroll to end of Terms")
        if (!Object.values(consents).every(v => v)) missing.push("All Consent Checkboxes")

        if (formData.typedLegalName.toLowerCase().trim() !== formData.fullName.toLowerCase().trim()) missing.push("Typed Legal Name must match Full Name")
        if (parseInt(captchaAnswer) !== (captcha.a + captcha.b)) missing.push("Math CAPTCHA")

        return missing
    }

    const isFormValid = () => getMissingRequirements().length === 0

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (formData.typedLegalName.toLowerCase().trim() !== formData.fullName.toLowerCase().trim()) {
            return toast.error("Your typed legal name at the bottom must exactly match your Full Name.")
        }
        if (parseInt(captchaAnswer) !== (captcha.a + captcha.b)) {
            return toast.error("Incorrect Math CAPTCHA answer.")
        }
        if (!isFormValid()) {
            return toast.error("Please complete all mandatory fields, uploads, and declarations.")
        }
        
        setSubmitting(true)
        try {
            const digitalSignatureUrl = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png")
            let locationCoords = ""
            if ("geolocation" in navigator) {
                locationCoords = await new Promise((resolve) => {
                    navigator.geolocation.getCurrentPosition(
                        (position) => resolve(`${position.coords.latitude},${position.coords.longitude}`),
                        (error) => resolve("Denied/Unavailable")
                    )
                })
            }

            const payload = {
                ...formData,
                livePhotoUrl,
                digitalSignatureUrl,
                locationCoords,
                agreementVersion: "1.0",
                resumeUrl: "mock-resume-url", // Mocked URLs for now
                passportPhotoUrl: "mock-govid-url"
            }
            await consultancyApi.submitAgreement(token, payload)
            toast.success("Consent Form Submitted Successfully!")
            setIsSubmitted(true)
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to submit agreement")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="flex justify-center items-center h-screen bg-slate-50"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
    if (!invitation) return <div className="flex flex-col items-center justify-center h-screen bg-slate-50"><h1 className="text-3xl font-bold text-slate-800">Invalid or Expired Link</h1></div>

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-slate-100 py-12 px-4 flex items-center justify-center">
                <Card className="max-w-xl w-full border-0 shadow-lg bg-white">
                    <CardHeader className="text-center pb-6 pt-10">
                        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <CardTitle className="text-3xl font-bold uppercase text-slate-800">Submitted Successfully</CardTitle>
                        <p className="text-muted-foreground mt-4 text-lg">Your Candidate Consent & Placement Consultancy Agreement has been securely recorded.</p>
                    </CardHeader>
                    <CardContent className="text-center pb-10">
                        <div className="bg-amber-50 text-amber-800 p-4 rounded-lg text-sm border border-amber-200">
                            <p className="font-medium">This invitation link has now expired.</p>
                            <p className="mt-1">You may safely close this window.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <Card className="max-w-4xl mx-auto shadow-xl bg-white border-t-8 border-t-slate-900 rounded-lg">
                
                {/* Header */}
                <CardHeader className="text-center border-b pb-8 pt-8">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">TECHWELL PLACEMENT CONSULTANCY</h1>
                    <h2 className="text-xl font-semibold mt-2 text-slate-700">Candidate Consent & Consultancy Agreement</h2>
                    <div className="text-sm text-slate-500 mt-4 space-y-1">
                        <p>Document Version: 1.0</p>
                        <p>Agreement Type: Candidate Consent & Placement Consultancy Agreement</p>
                        {invitation?.totalFee && (
                            <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-lg inline-block text-left text-slate-800 shadow-sm">
                                <h3 className="font-bold text-indigo-900 mb-2 uppercase text-xs tracking-wider">Fee Structure</h3>
                                <p><strong>Total Consultancy Fee:</strong> ₹{invitation.totalFee.toLocaleString()}</p>
                                {invitation.advanceFee && <p><strong>Advance Fee Payable:</strong> ₹{invitation.advanceFee.toLocaleString()}</p>}
                            </div>
                        )}
                    </div>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="p-8 space-y-12">
                        
                        {/* 1. Candidate Information */}
                        <section>
                            <h3 className="text-xl font-bold border-b pb-2 mb-6 text-slate-800">Candidate Information (Mandatory)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2"><label className="text-sm font-semibold">Full Name (As per Government ID)</label><Input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} /></div>
                                <div className="space-y-2"><label className="text-sm font-semibold">Father's / Mother's Name</label><Input required value={formData.parentsName} onChange={e => setFormData({...formData, parentsName: e.target.value})} /></div>
                                <div className="space-y-2"><label className="text-sm font-semibold">Date of Birth</label><Input type="date" required value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} /></div>
                                <div className="space-y-2"><label className="text-sm font-semibold">Gender</label><Input required value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} placeholder="Male/Female/Other" /></div>
                                <div className="space-y-2"><label className="text-sm font-semibold">Aadhaar Number</label><Input required value={formData.aadhaarNumber} onChange={e => setFormData({...formData, aadhaarNumber: e.target.value})} /></div>
                                <div className="space-y-2"><label className="text-sm font-semibold">Mobile Number</label><Input required value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} /></div>
                                <div className="space-y-2"><label className="text-sm font-semibold">Alternate Mobile Number</label><Input value={formData.alternateMobile} onChange={e => setFormData({...formData, alternateMobile: e.target.value})} /></div>
                                <div className="space-y-2"><label className="text-sm font-semibold">Email Address</label><Input type="email" required value={formData.emailAddress} onChange={e => setFormData({...formData, emailAddress: e.target.value})} /></div>
                                
                                <div className="space-y-2 md:col-span-2"><label className="text-sm font-semibold">Current Address</label><Input required value={formData.currentAddress} onChange={e => setFormData({...formData, currentAddress: e.target.value})} /></div>
                                <div className="space-y-2 md:col-span-2"><label className="text-sm font-semibold">Permanent Address</label><Input required value={formData.permanentAddress} onChange={e => setFormData({...formData, permanentAddress: e.target.value})} /></div>
                                
                                <div className="space-y-2"><label className="text-sm font-semibold">City</label><Input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} /></div>
                                <div className="space-y-2"><label className="text-sm font-semibold">State</label><Input required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} /></div>
                                <div className="space-y-2"><label className="text-sm font-semibold">PIN Code</label><Input required value={formData.pinCode} onChange={e => setFormData({...formData, pinCode: e.target.value})} /></div>
                            </div>
                        </section>

                        {/* 2. Education */}
                        <section>
                            <h3 className="text-xl font-bold border-b pb-2 mb-6 text-slate-800">Education</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2"><label className="text-sm font-semibold">Highest Qualification</label><Input required value={formData.highestQualification} onChange={e => setFormData({...formData, highestQualification: e.target.value})} /></div>
                                <div className="space-y-2"><label className="text-sm font-semibold">Graduation Year</label><Input type="number" required value={formData.graduationYear} onChange={e => setFormData({...formData, graduationYear: e.target.value})} /></div>
                            </div>
                        </section>

                        {/* 3. Professional Details */}
                        <section>
                            <h3 className="text-xl font-bold border-b pb-2 mb-6 text-slate-800">Professional Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2"><label className="text-sm font-semibold">Fresher / Experienced</label><Input required value={formData.experienceLevel} onChange={e => setFormData({...formData, experienceLevel: e.target.value})} /></div>
                                <div className="space-y-2"><label className="text-sm font-semibold">Current Company</label><Input value={formData.currentCompany} onChange={e => setFormData({...formData, currentCompany: e.target.value})} /></div>
                                <div className="space-y-2"><label className="text-sm font-semibold">Total Experience</label><Input value={formData.totalExperience} onChange={e => setFormData({...formData, totalExperience: e.target.value})} /></div>
                                <div className="space-y-2"><label className="text-sm font-semibold">Relevant Experience</label><Input value={formData.relevantExperience} onChange={e => setFormData({...formData, relevantExperience: e.target.value})} /></div>
                                <div className="space-y-2"><label className="text-sm font-semibold">Current CTC</label><Input value={formData.currentCtc} onChange={e => setFormData({...formData, currentCtc: e.target.value})} /></div>
                                <div className="space-y-2"><label className="text-sm font-semibold">Expected CTC</label><Input value={formData.expectedCtc} onChange={e => setFormData({...formData, expectedCtc: e.target.value})} /></div>
                                <div className="space-y-2"><label className="text-sm font-semibold">Notice Period</label><Input value={formData.noticePeriod} onChange={e => setFormData({...formData, noticePeriod: e.target.value})} /></div>
                                <div className="space-y-2"><label className="text-sm font-semibold">Preferred Job Role</label><Input required value={formData.preferredJobRoles} onChange={e => setFormData({...formData, preferredJobRoles: e.target.value})} /></div>
                                <div className="space-y-2 md:col-span-2"><label className="text-sm font-semibold">Preferred Job Location(s)</label><Input required value={formData.preferredLocations} onChange={e => setFormData({...formData, preferredLocations: e.target.value})} /></div>
                            </div>
                        </section>

                        {/* 4. Uploads */}
                        <section>
                            <h3 className="text-xl font-bold border-b pb-2 mb-6 text-slate-800">Uploads (Mandatory)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                <div className="p-4 border rounded-lg bg-slate-50 flex flex-col items-center justify-center text-center">
                                    <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                                    <label className="text-sm font-semibold mb-2">Resume (PDF / DOC / DOCX)</label>
                                    <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload('resume', e)} className="max-w-[250px]" />
                                    {resumeUploaded && <span className="text-xs text-green-600 mt-2 font-bold"><CheckCircle className="inline h-3 w-3 mr-1"/> Uploaded</span>}
                                </div>
                                
                                <div className="p-4 border rounded-lg bg-slate-50 flex flex-col items-center justify-center text-center">
                                    <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                                    <label className="text-sm font-semibold mb-2">Government ID Proof</label>
                                    <Input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload('govid', e)} className="max-w-[250px]" />
                                    {govIdUploaded && <span className="text-xs text-green-600 mt-2 font-bold"><CheckCircle className="inline h-3 w-3 mr-1"/> Uploaded</span>}
                                </div>
                                
                                <div className="p-4 border rounded-lg bg-slate-50 flex flex-col items-center">
                                    <label className="text-sm font-semibold mb-2 flex items-center gap-2"><Camera className="h-4 w-4"/> Live Camera Photo</label>
                                    {livePhotoUrl ? (
                                        <div className="relative">
                                            <img src={livePhotoUrl} alt="Captured" className="rounded-lg border max-w-[200px]" />
                                            <Button type="button" size="sm" variant="secondary" className="absolute bottom-2 left-1/2 -translate-x-1/2" onClick={() => { setLivePhotoUrl(null); setWebcamEnabled(false); }}>Retake</Button>
                                        </div>
                                    ) : (
                                        <div className="w-full max-w-[200px] bg-slate-200 rounded-lg overflow-hidden relative border flex flex-col items-center justify-center p-4 min-h-[150px]">
                                            {webcamEnabled ? (
                                                <div className="w-full aspect-[4/3] relative">
                                                    <Webcam 
                                                        audio={false} 
                                                        ref={webcamRef} 
                                                        screenshotFormat="image/jpeg" 
                                                        className="w-full h-full object-cover" 
                                                        onUserMedia={() => setIsCameraReady(true)} 
                                                        onUserMediaError={() => { toast.error("Live Webcam access denied or unavailable. Please use the fallback."); setWebcamEnabled(false) }} 
                                                    />
                                                    <Button type="button" size="sm" className="absolute bottom-2 left-1/2 -translate-x-1/2" onClick={capturePhoto} disabled={!isCameraReady}>
                                                        {isCameraReady ? "Snap" : "Loading"}
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-3 w-full">
                                                    <Button type="button" variant="outline" className="w-full" onClick={() => setWebcamEnabled(true)}>Start Webcam</Button>
                                                    <div className="text-xs text-center text-slate-500 font-bold">- OR -</div>
                                                    <div className="relative w-full">
                                                        <Input 
                                                            type="file" 
                                                            accept="image/*" 
                                                            capture="user" 
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    const reader = new FileReader();
                                                                    reader.onloadend = () => setLivePhotoUrl(reader.result as string);
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }}
                                                        />
                                                        <Button type="button" variant="secondary" className="w-full pointer-events-none bg-blue-100 text-blue-700 hover:bg-blue-200">
                                                            Open Mobile Camera
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="p-4 border rounded-lg bg-slate-50 flex flex-col items-center">
                                    <label className="text-sm font-semibold mb-2">Digital Signature</label>
                                    <div className="bg-white border rounded-lg overflow-hidden w-full max-w-[250px] relative">
                                        <SignatureCanvas ref={sigCanvas} canvasProps={{className: 'w-full h-32'}} />
                                        <Button type="button" variant="ghost" size="sm" className="absolute top-1 right-1 text-xs h-6 px-2" onClick={() => sigCanvas.current.clear()}>Clear</Button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 5. Declarations and Terms */}
                        <section>
                            <h3 className="text-xl font-bold border-b pb-2 mb-4 text-slate-800">Candidate Declaration</h3>
                            <div className="p-4 bg-slate-50 border rounded-lg text-sm text-slate-700 space-y-2 mb-8">
                                <p>I hereby voluntarily request Techwell to provide placement consultancy and career assistance services.</p>
                                <p>I declare that all information, documents, certificates, resumes, salary details, employment history, educational qualifications, and personal information submitted by me are true, complete, and accurate to the best of my knowledge.</p>
                                <p>I understand that providing false, incomplete, or misleading information may result in cancellation of my consultancy process.</p>
                            </div>

                            <h3 className="text-xl font-bold border-b pb-2 mb-4 text-slate-800">Consultancy Terms & Conditions</h3>
                            
                            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md mb-4 text-sm font-medium">
                                You must read and scroll to the end of the agreement to unlock the consent checkboxes.
                            </div>

                            <div 
                                className="h-80 overflow-y-auto p-6 border rounded-lg bg-white shadow-inner text-sm text-slate-700 space-y-6"
                                onScroll={handleScroll}
                            >
                                <div>
                                    <h4 className="font-bold text-slate-900">1. Consultancy Services</h4>
                                    <p>I understand that Techwell provides:</p>
                                    <ul className="list-disc pl-5 mt-1 space-y-1">
                                        <li>Placement Consultancy</li>
                                        <li>Resume Processing</li>
                                        <li>Resume Forwarding</li>
                                        <li>Career Guidance</li>
                                        <li>Interview Coordination</li>
                                        <li>Employer Communication</li>
                                        <li>Job Opportunity Assistance</li>
                                    </ul>
                                    <p className="mt-2 font-semibold">Techwell is not the employer.</p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-900">2. No Employment Guarantee</h4>
                                    <p>I clearly understand and voluntarily accept that:</p>
                                    <ul className="list-disc pl-5 mt-1 space-y-1">
                                        <li>Techwell does not guarantee employment.</li>
                                        <li>Techwell does not guarantee interview selection.</li>
                                        <li>Techwell does not guarantee offer release.</li>
                                        <li>Techwell does not guarantee joining.</li>
                                        <li>Techwell does not guarantee confirmation after joining.</li>
                                        <li>Techwell does not guarantee employment continuation.</li>
                                    </ul>
                                    <p className="mt-2 font-semibold">Final employment decisions are made solely by the employer.</p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-900">3. No Salary Guarantee</h4>
                                    <p>I understand that Techwell does not promise or guarantee: Salary (CTC), Salary Hike, Designation, Promotions, Incentives, or Bonuses.</p>
                                    <p className="mt-1 font-semibold">Salary negotiations are solely between the candidate and the employer.</p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-900">4. No Location Guarantee</h4>
                                    <p>I understand that Techwell cannot guarantee: Preferred City, Preferred State, Work From Home, Hybrid Work, or Office Location.</p>
                                    <p className="mt-1 font-semibold">Location depends entirely on employer requirements.</p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-900">5. Job Process</h4>
                                    <p>I authorize Techwell to: Review my profile, Improve resume formatting if required, Share my resume with suitable employers, Contact employers regarding my profile, Coordinate interviews, and Follow up with employers.</p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-900">6. Candidate Responsibility</h4>
                                    <p>I agree to: Attend scheduled interviews, Respond to employer communication promptly, Inform Techwell about interview results, Inform Techwell if I receive an offer, Inform Techwell after joining, and Maintain professional behaviour throughout the recruitment process.</p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-900">7. Consultancy Charges</h4>
                                    <p>I understand that consultancy charges, if applicable, are communicated separately by Techwell. I acknowledge that any agreed consultancy charges are part of the consultancy arrangement and are separate from the employer's salary or compensation.</p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-900">8. Privacy & Data Usage</h4>
                                    <p>I authorize Techwell to: Store my information, Process my personal data, Store my resume, Share my profile with prospective employers, and Maintain records of interviews, offers, and placement activities for consultancy purposes.</p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-900">9. Employer Decisions</h4>
                                    <p>I understand that employers independently shortlist candidates, conduct interviews, and decide salary, designation, work location, joining date, probation, confirmation, and continuation of employment. These decisions are beyond Techwell's control.</p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-900">10. After Joining</h4>
                                    <p>I understand that after joining a company, my employment relationship is directly with that employer. Day-to-day work, salary payments, HR policies, probation, confirmation, transfers, resignations, and employment decisions are handled by the employer. Techwell is not responsible for managing the employment relationship after joining.</p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-900">11. Communication Consent</h4>
                                    <p>I authorize Techwell to communicate with me through Phone Calls, WhatsApp, SMS, and Email for placement consultancy and career-related purposes.</p>
                                </div>

                                <div className="text-center pt-6 pb-2 text-slate-400 italic">-- End of Agreement --</div>
                            </div>
                        </section>

                        {/* 6. Candidate Confirmation (Checkboxes) */}
                        <section className={`transition-opacity duration-300 ${hasScrolled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                            <h3 className="text-xl font-bold border-b pb-2 mb-4 text-slate-800">Candidate Confirmation</h3>
                            <div className="space-y-4 bg-slate-50 p-6 border rounded-lg">
                                <label className="flex items-start space-x-3 cursor-pointer">
                                    <Checkbox className="mt-1" checked={consents.readAgreement} onCheckedChange={(c) => setConsents({...consents, readAgreement: !!c})} />
                                    <span className="text-sm">I have carefully read the complete Consultancy Agreement.</span>
                                </label>
                                <label className="flex items-start space-x-3 cursor-pointer">
                                    <Checkbox className="mt-1" checked={consents.understandScope} onCheckedChange={(c) => setConsents({...consents, understandScope: !!c})} />
                                    <span className="text-sm">I understand the scope of Techwell's consultancy services.</span>
                                </label>
                                <label className="flex items-start space-x-3 cursor-pointer">
                                    <Checkbox className="mt-1" checked={consents.noGuarantee} onCheckedChange={(c) => setConsents({...consents, noGuarantee: !!c})} />
                                    <span className="text-sm">I understand that Techwell does not guarantee employment, interview selection, salary, company, designation, location, offer release, joining, or continued employment.</span>
                                </label>
                                <label className="flex items-start space-x-3 cursor-pointer">
                                    <Checkbox className="mt-1" checked={consents.authorizeProcess} onCheckedChange={(c) => setConsents({...consents, authorizeProcess: !!c})} />
                                    <span className="text-sm">I authorize Techwell to process my profile and share it with prospective employers for suitable opportunities.</span>
                                </label>
                                <label className="flex items-start space-x-3 cursor-pointer">
                                    <Checkbox className="mt-1" checked={consents.infoTrue} onCheckedChange={(c) => setConsents({...consents, infoTrue: !!c})} />
                                    <span className="text-sm">I confirm that all information submitted by me is true and accurate.</span>
                                </label>
                                <label className="flex items-start space-x-3 cursor-pointer">
                                    <Checkbox className="mt-1" checked={consents.acceptTerms} onCheckedChange={(c) => setConsents({...consents, acceptTerms: !!c})} />
                                    <span className="text-sm font-bold text-slate-900">I am accepting knowingly, aware of this process, I have read everything and accept.</span>
                                </label>
                            </div>
                        </section>

                        {/* 7. Final Declaration & Submission */}
                        <section className="bg-slate-800 text-white p-8 rounded-xl space-y-6">
                            <h3 className="text-xl font-bold border-b border-slate-600 pb-2">Final Declaration</h3>
                            <p className="text-sm text-slate-300">
                                I, <strong className="uppercase">{formData.fullName || "[Candidate Name]"}</strong>, hereby certify that the information provided by me is true and correct. I voluntarily request Techwell to provide placement consultancy services, and I acknowledge that I have read, understood, and accepted this Consultancy Agreement and all Terms & Conditions.
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-slate-400 block mb-2">Type Full Legal Name (To Sign)</label>
                                    <Input 
                                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 h-12" 
                                        placeholder="Exactly as per Government ID" 
                                        value={formData.typedLegalName}
                                        onChange={e => setFormData({...formData, typedLegalName: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-slate-400 block mb-2">Human Verification Challenge</label>
                                    <div className="flex items-center gap-3">
                                        <span className="bg-slate-700 px-4 py-3 rounded-md font-mono text-lg border border-slate-600 shadow-inner">
                                            {captcha.a} + {captcha.b} =
                                        </span>
                                        <Input 
                                            className="bg-slate-700 border-slate-600 text-white text-center font-mono text-lg h-12 w-24" 
                                            placeholder="?" 
                                            value={captchaAnswer}
                                            onChange={e => setCaptchaAnswer(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-700 mt-6">
                                <Button 
                                    type="submit" 
                                    size="lg" 
                                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg h-14 disabled:opacity-50"
                                    disabled={!isFormValid() || submitting}
                                >
                                    {submitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin"/> Processing Secure Document...</> : "I Accept & Submit"}
                                </Button>
                                {!isFormValid() && (
                                    <div className="mt-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                                        <p className="text-red-400 text-sm font-bold mb-2">Required to Submit:</p>
                                        <ul className="list-disc pl-5 text-xs text-red-300 space-y-1">
                                            {getMissingRequirements().map((req, i) => <li key={i}>{req}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </section>

                    </CardContent>
                </form>
            </Card>
        </div>
    )
}
