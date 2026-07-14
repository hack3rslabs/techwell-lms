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
import { Loader2, Camera, CheckCircle, UploadCloud, ArrowRight, ArrowLeft, ShieldCheck, FileText, User, FileSignature } from "lucide-react"

export default function ConsultancyInvitePage() {
    const params = useParams()
    const token = params.token as string

    const [invitation, setInvitation] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [currentStep, setCurrentStep] = useState(1)
    const [submitting, setSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        fullName: "", parentsName: "", dob: "", gender: "", aadhaarNumber: "", panNumber: "",
        mobileNumber: "", alternateMobile: "", emailAddress: "",
        currentAddress: "", permanentAddress: "", city: "", state: "", pinCode: "",
        highestQualification: "", specialization: "", collegeUniversity: "", graduationYear: "", percentageCgpa: "",
        experienceLevel: "Fresher", currentCompany: "", totalExperience: "", relevantExperience: "",
        currentCtc: "", expectedCtc: "", noticePeriod: "", preferredJobRoles: "", preferredLocations: "", preferredIndustry: "",
        typedLegalName: "", resumeUrl: "", passportPhotoUrl: ""
    })

    // Upload & Verification States
    const [livePhotoUrl, setLivePhotoUrl] = useState<string | null>(null)
    const [resumeUploaded, setResumeUploaded] = useState(false)
    const [govIdUploaded, setGovIdUploaded] = useState(false)
    const [uploadingDoc, setUploadingDoc] = useState(false)
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
    const [hasSignature, setHasSignature] = useState(false)

    function generateCaptcha() {
        setCaptcha({ a: Math.floor(Math.random() * 20) + 1, b: Math.floor(Math.random() * 20) + 1 })
        setCaptchaAnswer("")
    }

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

    const updateStatus = async (status: string) => {
        try {
            await consultancyApi.updateStatus(token, status)
        } catch (error) {
            console.error("Failed to update status", error)
        }
    }

    const nextStep = () => {
        if (currentStep === 1) updateStatus("STARTED")
        if (currentStep === 2) updateStatus("SUBMITTED")
        setCurrentStep(prev => prev + 1)
        window.scrollTo(0, 0)
    }
    
    const prevStep = () => {
        setCurrentStep(prev => prev - 1)
        window.scrollTo(0, 0)
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

    const handleFileUpload = async (type: 'resume' | 'govid', e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const formDataPayload = new FormData();
            formDataPayload.append('file', file);
            
            setUploadingDoc(true);
            try {
                const res = await consultancyApi.uploadDocument(token, formDataPayload);
                if (type === 'resume') {
                    setFormData(prev => ({ ...prev, resumeUrl: res.data.url }));
                    setResumeUploaded(true);
                } else if (type === 'govid') {
                    setFormData(prev => ({ ...prev, passportPhotoUrl: res.data.url }));
                    setGovIdUploaded(true);
                }
                toast.success(`${type === 'resume' ? 'Resume' : 'Government ID'} uploaded successfully`);
            } catch (error) {
                toast.error("Failed to upload document");
            } finally {
                setUploadingDoc(false);
            }
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
        if (!hasSignature) missing.push("Signature")

        if (!hasScrolled) missing.push("Scroll to end of Terms")
        if (!Object.values(consents).every(v => v)) missing.push("All Consent Checkboxes")

        if (formData.typedLegalName.toLowerCase().trim() !== formData.fullName.toLowerCase().trim()) missing.push("Typed Legal Name must match Full Name")
        if (parseInt(captchaAnswer) !== (captcha.a + captcha.b)) missing.push("Math CAPTCHA")

        return missing
    }

    const isStep2Valid = () => {
        return formData.fullName && formData.parentsName && formData.dob && formData.gender && formData.aadhaarNumber && 
               formData.mobileNumber && formData.emailAddress && formData.currentAddress && formData.permanentAddress && 
               formData.city && formData.state && formData.pinCode && formData.highestQualification && formData.graduationYear && 
               formData.experienceLevel && formData.preferredJobRoles && formData.preferredLocations && resumeUploaded && govIdUploaded && livePhotoUrl;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        const missing = getMissingRequirements()
        if (missing.length > 0) {
            return toast.error("Please complete all mandatory fields: " + missing[0])
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
                advanceFee: invitation?.advanceFee,
                totalFee: invitation?.totalFee
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

    const steps = [
        { id: 1, name: "Overview", icon: ShieldCheck },
        { id: 2, name: "Details", icon: User },
        { id: 3, name: "Review", icon: FileText },
        { id: 4, name: "Consent", icon: FileSignature }
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4">
            <div className="max-w-4xl mx-auto mb-8">
                {/* Stepper */}
                <div className="flex items-center justify-between">
                    {steps.map((step, idx) => (
                        <div key={step.id} className="flex flex-col items-center flex-1 relative">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-colors ${currentStep >= step.id ? 'bg-primary text-primary-foreground' : 'bg-slate-200 text-slate-400'}`}>
                                <step.icon className="w-5 h-5" />
                            </div>
                            <span className={`text-xs mt-2 font-medium ${currentStep >= step.id ? 'text-primary' : 'text-slate-400'}`}>{step.name}</span>
                            {idx < steps.length - 1 && (
                                <div className={`absolute top-5 left-1/2 w-full h-[2px] -z-0 ${currentStep > step.id ? 'bg-primary' : 'bg-slate-200'}`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <Card className="max-w-4xl mx-auto shadow-xl bg-white border-t-8 border-t-primary rounded-lg overflow-hidden">
                <form onSubmit={handleSubmit}>
                    
                    {/* Step 1: Overview */}
                    {currentStep === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <CardHeader className="text-center border-b pb-8 pt-8 bg-slate-50/50">
                                <ShieldCheck className="w-16 h-16 mx-auto text-primary mb-4" />
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Techwell Placement Consultancy</h1>
                                <h2 className="text-xl font-semibold mt-2 text-slate-700">Candidate Onboarding & Consent</h2>
                                <p className="text-slate-500 mt-2 max-w-xl mx-auto">Welcome! Please complete this digital onboarding process to officially register for our placement and career services.</p>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 border rounded-xl bg-blue-50/50">
                                        <h3 className="font-bold text-blue-900 mb-2">What you will need:</h3>
                                        <ul className="space-y-2 text-sm text-blue-800 list-disc list-inside">
                                            <li>Your updated Resume (PDF/DOC)</li>
                                            <li>A valid Government ID (Aadhaar/PAN)</li>
                                            <li>Access to a webcam or mobile camera</li>
                                            <li>Your educational and professional details</li>
                                        </ul>
                                    </div>
                                    <div className="p-6 border rounded-xl bg-indigo-50/50">
                                        <h3 className="font-bold text-indigo-900 mb-2">Fee Structure:</h3>
                                        <div className="space-y-2 text-sm text-indigo-800">
                                            <p><strong>Total Fee:</strong> {invitation?.totalFee ? `₹${invitation.totalFee.toLocaleString()}` : 'Not Applicable'}</p>
                                            <p><strong>Advance Fee:</strong> {invitation?.advanceFee ? `₹${invitation.advanceFee.toLocaleString()}` : 'None'}</p>
                                            <p className="text-xs opacity-80 mt-2">*Fees are subject to the terms and conditions outlined in step 4.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-6">
                                    <Button type="button" onClick={nextStep} size="lg">Start Onboarding <ArrowRight className="ml-2 w-4 h-4" /></Button>
                                </div>
                            </CardContent>
                        </div>
                    )}

                    {/* Step 2: Details */}
                    {currentStep === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <CardHeader className="border-b bg-slate-50">
                                <CardTitle className="text-xl flex items-center"><User className="mr-2 w-5 h-5 text-primary"/> Candidate Details & Documents</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                {/* Basic Info */}
                                <section>
                                    <h3 className="text-lg font-bold border-b pb-2 mb-6 text-slate-800">1. Personal Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2"><label className="text-sm font-semibold">Full Name *</label><Input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} /></div>
                                        <div className="space-y-2"><label className="text-sm font-semibold">Father's / Mother's Name *</label><Input required value={formData.parentsName} onChange={e => setFormData({...formData, parentsName: e.target.value})} /></div>
                                        <div className="space-y-2"><label className="text-sm font-semibold">Date of Birth *</label><Input type="date" required value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} /></div>
                                        <div className="space-y-2"><label className="text-sm font-semibold">Gender *</label><Input required value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} placeholder="Male/Female/Other" /></div>
                                        <div className="space-y-2"><label className="text-sm font-semibold">Aadhaar Number *</label><Input required value={formData.aadhaarNumber} onChange={e => setFormData({...formData, aadhaarNumber: e.target.value})} /></div>
                                        <div className="space-y-2"><label className="text-sm font-semibold">Mobile Number *</label><Input required value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} /></div>
                                        <div className="space-y-2"><label className="text-sm font-semibold">Email Address *</label><Input type="email" required value={formData.emailAddress} onChange={e => setFormData({...formData, emailAddress: e.target.value})} /></div>
                                    </div>
                                </section>

                                {/* Address */}
                                <section>
                                    <h3 className="text-lg font-bold border-b pb-2 mb-6 text-slate-800">2. Address Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2 md:col-span-2"><label className="text-sm font-semibold">Current Address *</label><Input required value={formData.currentAddress} onChange={e => setFormData({...formData, currentAddress: e.target.value})} /></div>
                                        <div className="space-y-2 md:col-span-2"><label className="text-sm font-semibold">Permanent Address *</label><Input required value={formData.permanentAddress} onChange={e => setFormData({...formData, permanentAddress: e.target.value})} /></div>
                                        <div className="space-y-2"><label className="text-sm font-semibold">City *</label><Input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} /></div>
                                        <div className="space-y-2"><label className="text-sm font-semibold">State *</label><Input required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} /></div>
                                        <div className="space-y-2"><label className="text-sm font-semibold">PIN Code *</label><Input required value={formData.pinCode} onChange={e => setFormData({...formData, pinCode: e.target.value})} /></div>
                                    </div>
                                </section>

                                {/* Education & Experience */}
                                <section>
                                    <h3 className="text-lg font-bold border-b pb-2 mb-6 text-slate-800">3. Professional Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2"><label className="text-sm font-semibold">Highest Qualification *</label><Input required value={formData.highestQualification} onChange={e => setFormData({...formData, highestQualification: e.target.value})} /></div>
                                        <div className="space-y-2"><label className="text-sm font-semibold">Graduation Year *</label><Input type="number" required value={formData.graduationYear} onChange={e => setFormData({...formData, graduationYear: e.target.value})} /></div>
                                        <div className="space-y-2"><label className="text-sm font-semibold">Experience Level *</label><Input required value={formData.experienceLevel} onChange={e => setFormData({...formData, experienceLevel: e.target.value})} /></div>
                                        <div className="space-y-2"><label className="text-sm font-semibold">Target Job Role *</label><Input required value={formData.preferredJobRoles} onChange={e => setFormData({...formData, preferredJobRoles: e.target.value})} /></div>
                                        <div className="space-y-2"><label className="text-sm font-semibold">Preferred Locations *</label><Input required value={formData.preferredLocations} onChange={e => setFormData({...formData, preferredLocations: e.target.value})} /></div>
                                        <div className="space-y-2"><label className="text-sm font-semibold">Total Experience (Years)</label><Input value={formData.totalExperience} onChange={e => setFormData({...formData, totalExperience: e.target.value})} /></div>
                                    </div>
                                </section>

                                {/* Documents */}
                                <section>
                                    <h3 className="text-lg font-bold border-b pb-2 mb-6 text-slate-800">4. Document Verification</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="p-4 border rounded-lg bg-slate-50 flex flex-col items-center justify-center text-center">
                                            <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                                            <label className="text-sm font-semibold mb-2">Resume *</label>
                                            <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload('resume', e)} className="max-w-[200px]" disabled={uploadingDoc} />
                                            {resumeUploaded && <span className="text-xs text-green-600 mt-2 font-bold"><CheckCircle className="inline h-3 w-3 mr-1"/> Uploaded</span>}
                                        </div>
                                        
                                        <div className="p-4 border rounded-lg bg-slate-50 flex flex-col items-center justify-center text-center">
                                            <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                                            <label className="text-sm font-semibold mb-2">Gov ID (Aadhaar/PAN) *</label>
                                            <Input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload('govid', e)} className="max-w-[200px]" disabled={uploadingDoc} />
                                            {govIdUploaded && <span className="text-xs text-green-600 mt-2 font-bold"><CheckCircle className="inline h-3 w-3 mr-1"/> Uploaded</span>}
                                        </div>
                                        
                                        <div className="p-4 border rounded-lg bg-slate-50 flex flex-col items-center">
                                            <label className="text-sm font-semibold mb-2 flex items-center gap-2"><Camera className="h-4 w-4"/> Live Photo *</label>
                                            {livePhotoUrl ? (
                                                <div className="relative">
                                                    <img src={livePhotoUrl} alt="Captured" className="rounded-lg border max-w-[150px]" />
                                                    <Button type="button" size="sm" variant="secondary" className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] h-6" onClick={() => { setLivePhotoUrl(null); setWebcamEnabled(false); }}>Retake</Button>
                                                </div>
                                            ) : (
                                                <div className="w-full bg-slate-200 rounded-lg overflow-hidden relative border flex flex-col items-center justify-center p-2 min-h-[120px]">
                                                    {webcamEnabled ? (
                                                        <div className="w-full aspect-[4/3] relative">
                                                            <Webcam 
                                                                audio={false} 
                                                                ref={webcamRef} 
                                                                screenshotFormat="image/jpeg" 
                                                                className="w-full h-full object-cover" 
                                                                onUserMedia={() => setIsCameraReady(true)} 
                                                                onUserMediaError={() => { toast.error("Live Webcam access denied or unavailable."); setWebcamEnabled(false) }} 
                                                            />
                                                            <Button type="button" size="sm" className="absolute bottom-1 left-1/2 -translate-x-1/2 h-6 text-[10px]" onClick={capturePhoto} disabled={!isCameraReady}>
                                                                Snap
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button type="button" variant="outline" size="sm" onClick={() => setWebcamEnabled(true)}>Start Webcam</Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                <div className="flex justify-between pt-6 border-t">
                                    <Button type="button" variant="outline" onClick={prevStep}><ArrowLeft className="mr-2 w-4 h-4" /> Back</Button>
                                    <Button type="button" onClick={() => {
                                        if (isStep2Valid()) nextStep();
                                        else toast.error("Please fill all mandatory fields and upload required documents.");
                                    }}>Continue <ArrowRight className="ml-2 w-4 h-4" /></Button>
                                </div>
                            </CardContent>
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {currentStep === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <CardHeader className="border-b bg-slate-50">
                                <CardTitle className="text-xl flex items-center"><FileText className="mr-2 w-5 h-5 text-primary"/> Review Details</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <p className="text-slate-600 mb-6">Please carefully review your information before proceeding to the final agreement.</p>
                                
                                <div className="bg-slate-50 rounded-xl p-6 border grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                    <div><span className="text-slate-500">Full Name:</span> <span className="font-semibold">{formData.fullName}</span></div>
                                    <div><span className="text-slate-500">Email:</span> <span className="font-semibold">{formData.emailAddress}</span></div>
                                    <div><span className="text-slate-500">Phone:</span> <span className="font-semibold">{formData.mobileNumber}</span></div>
                                    <div><span className="text-slate-500">DOB:</span> <span className="font-semibold">{formData.dob}</span></div>
                                    <div><span className="text-slate-500">Aadhaar:</span> <span className="font-semibold">{formData.aadhaarNumber}</span></div>
                                    <div><span className="text-slate-500">Location:</span> <span className="font-semibold">{formData.city}, {formData.state}</span></div>
                                    <div><span className="text-slate-500">Target Role:</span> <span className="font-semibold">{formData.preferredJobRoles}</span></div>
                                    <div><span className="text-slate-500">Experience:</span> <span className="font-semibold">{formData.experienceLevel} ({formData.totalExperience} Yrs)</span></div>
                                </div>

                                <div className="flex items-center gap-4 p-4 border rounded-xl bg-green-50/50 text-green-800 text-sm">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <span>All mandatory documents (Resume, ID, Photo) have been securely uploaded.</span>
                                </div>

                                <div className="flex justify-between pt-6 border-t">
                                    <Button type="button" variant="outline" onClick={prevStep}><ArrowLeft className="mr-2 w-4 h-4" /> Edit Details</Button>
                                    <Button type="button" onClick={nextStep}>Proceed to Agreement <ArrowRight className="ml-2 w-4 h-4" /></Button>
                                </div>
                            </CardContent>
                        </div>
                    )}

                    {/* Step 4: Consent */}
                    {currentStep === 4 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <CardHeader className="border-b bg-slate-50">
                                <CardTitle className="text-xl flex items-center"><FileSignature className="mr-2 w-5 h-5 text-primary"/> Terms & Consent</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                
                                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md text-sm font-medium flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5" />
                                    You must read and scroll to the end of the agreement to unlock the consent checkboxes.
                                </div>

                                <div 
                                    className="h-64 overflow-y-auto p-6 border rounded-lg bg-white shadow-inner text-sm text-slate-700 space-y-4"
                                    onScroll={handleScroll}
                                >
                                    <h4 className="font-bold text-slate-900 text-lg">Placement Consultancy Terms of Service</h4>
                                    
                                    <div><h5 className="font-bold">1. Scope of Services</h5><p>Techwell provides career guidance, resume processing, and connects candidates with prospective employers. Techwell is a facilitator, not an employer.</p></div>
                                    <div><h5 className="font-bold">2. Candidate Obligations</h5><p>Candidates agree to provide accurate information and attend scheduled interviews promptly. Providing false information will result in termination of services.</p></div>
                                    <div><h5 className="font-bold">3. No Guarantee</h5><p>Techwell does not guarantee employment, salary negotiations, or final placements. Final decisions rest solely with the hiring companies.</p></div>
                                    <div><h5 className="font-bold">4. Data Privacy</h5><p>Your data is collected purely for recruitment purposes and will be shared with prospective employers strictly to facilitate hiring.</p></div>
                                    <div><h5 className="font-bold">5. Fees</h5><p>If applicable, the consultancy fee mentioned must be honored as per the agreed timeline.</p></div>

                                    <div className="text-center pt-6 pb-2 text-slate-400 italic">-- End of Agreement --</div>
                                </div>

                                {/* Checkboxes */}
                                <div className={`transition-opacity duration-300 space-y-3 bg-slate-50 p-6 border rounded-lg ${hasScrolled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                    <label className="flex items-start space-x-3 cursor-pointer">
                                        <Checkbox className="mt-1" checked={consents.readAgreement} onCheckedChange={(c) => setConsents({...consents, readAgreement: !!c})} />
                                        <span className="text-sm">I have read and understood the Terms of Service.</span>
                                    </label>
                                    <label className="flex items-start space-x-3 cursor-pointer">
                                        <Checkbox className="mt-1" checked={consents.infoTrue} onCheckedChange={(c) => setConsents({...consents, infoTrue: !!c})} />
                                        <span className="text-sm">I certify that all information I have provided is true and correct.</span>
                                    </label>
                                    <label className="flex items-start space-x-3 cursor-pointer">
                                        <Checkbox className="mt-1" checked={consents.acceptTerms} onCheckedChange={(c) => setConsents({...consents, acceptTerms: !!c})} />
                                        <span className="text-sm font-bold text-slate-900">I voluntarily accept this consultancy agreement.</span>
                                    </label>
                                </div>

                                {/* Final Verification block */}
                                <div className="bg-slate-900 text-white p-6 rounded-xl space-y-6">
                                    <h3 className="font-bold border-b border-slate-700 pb-2">Final Verification</h3>
                                    
                                    <div className="p-4 border border-slate-700 rounded-lg bg-slate-800 flex flex-col items-center">
                                        <label className="text-sm font-semibold mb-2">Draw your Digital Signature *</label>
                                        <div className="bg-white border rounded-lg overflow-hidden w-full max-w-[300px] relative">
                                            <SignatureCanvas ref={sigCanvas} canvasProps={{className: 'w-full h-32'}} onEnd={() => setHasSignature(true)} />
                                            <Button type="button" variant="ghost" size="sm" className="absolute top-1 right-1 text-xs h-6 px-2 text-slate-500" onClick={() => { sigCanvas.current.clear(); setHasSignature(false); }}>Clear</Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs uppercase text-slate-400 block mb-2">Type Full Legal Name *</label>
                                            <Input className="bg-slate-800 border-slate-600 text-white" placeholder="Exactly as per Government ID" value={formData.typedLegalName} onChange={e => setFormData({...formData, typedLegalName: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="text-xs uppercase text-slate-400 block mb-2">Security Challenge *</label>
                                            <div className="flex items-center gap-3">
                                                <span className="bg-slate-800 px-4 py-2 rounded-md font-mono border border-slate-600">{captcha.a} + {captcha.b} =</span>
                                                <Input className="bg-slate-800 border-slate-600 text-white w-20 text-center font-mono" value={captchaAnswer} onChange={e => setCaptchaAnswer(e.target.value)} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-4">
                                        <Button type="button" variant="outline" className="bg-slate-800 border-slate-600 hover:bg-slate-700 text-white" onClick={prevStep}>Back</Button>
                                        <Button type="submit" className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold" disabled={submitting || !hasSignature || !formData.typedLegalName || parseInt(captchaAnswer) !== (captcha.a + captcha.b) || !consents.readAgreement || !consents.infoTrue || !consents.acceptTerms}>
                                            {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Submitting...</> : "I Accept & Submit Registration"}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </div>
                    )}
                </form>
            </Card>
        </div>
    )
}
