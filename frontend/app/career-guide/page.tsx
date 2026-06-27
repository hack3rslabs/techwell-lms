"use client"

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Compass, Check, ArrowLeft, Loader2, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
const PURPOSE_OPTIONS = [
    "Apply for a Job",
    "Looking for Placement Assistance",
    "Need Career Guidance",
    "Resume Review Required",
    "Mock Interview Required",
    "Looking for Internship Opportunities",
    "Employer Hiring Requirement"
]

const SKILL_OPTIONS = [
    "DevOps", "Cloud", "Cyber Security", "Networking", 
    "IT Support", "HR", "Marketing", "Front Office", 
    "Finance", "BPO", "Software Development", "Others"
]

export default function CareerGuidePage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [submitted, setSubmitted] = React.useState(false)

    // Form State
    const [purpose, setPurpose] = React.useState('')
    const [refBy, setRefBy] = React.useState('')

    // Basic Info
    const [name, setName] = React.useState('')
    const [mobile, setMobile] = React.useState('')
    const [whatsapp, setWhatsapp] = React.useState('')
    const [email, setEmail] = React.useState('')
    const [city, setCity] = React.useState('')
    const [state, setStateLoc] = React.useState('')
    const [qualification, setQualification] = React.useState('')
    const [empStatus, setEmpStatus] = React.useState('')

    // Candidate Profile
    const [experience, setExperience] = React.useState('')
    const [currentCompany, setCurrentCompany] = React.useState('')
    const [currentDesignation, setCurrentDesignation] = React.useState('')
    const [currentCTC, setCurrentCTC] = React.useState('')
    const [expectedCTC, setExpectedCTC] = React.useState('')
    const [noticePeriod, setNoticePeriod] = React.useState('')
    const [prefLocation, setPrefLocation] = React.useState('')
    const [prefRole, setPrefRole] = React.useState('')
    const [skills, setSkills] = React.useState<string[]>([])

    // Resume Section
    const [resumeFile, setResumeFile] = React.useState<File | null>(null)
    const [resumeUrl, setResumeUrl] = React.useState('') // Placeholder for URL or mapped from upload
    const [linkedin, setLinkedin] = React.useState('')
    const [github, setGithub] = React.useState('')

    // Dynamic Fields State
    const [dynFields, setDynFields] = React.useState<Record<string, string>>({})

    const [agreed, setAgreed] = React.useState(false)

    const handleDynChange = (key: string, val: string) => {
        setDynFields(prev => ({ ...prev, [key]: val }))
    }

    const handleSkillToggle = (skill: string) => {
        setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!purpose || !name || !mobile || !email || !city || !qualification || !agreed) {
            alert("Please fill all required fields and accept the declaration.")
            return
        }

        setIsSubmitting(true)

        try {
            // Construct deeply formatted notes
            let notes = `Purpose: ${purpose}\n`
            if (refBy) notes += `Reference By: ${refBy}\n`
            notes += `\n--- BASIC INFO ---\n`
            notes += `WhatsApp: ${whatsapp || 'N/A'}\n`
            notes += `State: ${state || 'N/A'}\n`
            notes += `Employment Status: ${empStatus || 'N/A'}\n`

            notes += `\n--- CANDIDATE PROFILE ---\n`
            notes += `Current Designation: ${currentDesignation || 'N/A'}\n`
            notes += `Preferred Job Location: ${prefLocation || 'N/A'}\n`
            notes += `LinkedIn: ${linkedin || 'N/A'}\n`
            notes += `GitHub/Portfolio: ${github || 'N/A'}\n`

            if (Object.keys(dynFields).length > 0) {
                notes += `\n--- SPECIFIC DETAILS ---\n`
                Object.entries(dynFields).forEach(([k, v]) => {
                    if (v) notes += `${k}: ${v}\n`
                })
            }

            // Map experience to predefined Enum values if possible, or just send as string
            let mappedExp = 'FRESHER'
            if (experience && !isNaN(Number(experience))) {
                const expNum = Number(experience)
                if (expNum >= 1 && expNum <= 3) mappedExp = '1_3_YEARS'
                else if (expNum > 3 && expNum <= 5) mappedExp = '3_5_YEARS'
                else if (expNum > 5) mappedExp = '5_PLUS_YEARS'
            } else if (empStatus === 'Fresher' || empStatus === 'Student') {
                mappedExp = 'FRESHER'
            }

            let uploadedResumeUrl = resumeUrl;
            if (resumeFile) {
                const formData = new FormData();
                formData.append('file', resumeFile);
                try {
                    const uploadRes = await api.post('/upload/public-resume', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    uploadedResumeUrl = uploadRes.data.url;
                } catch (err) {
                    console.error('Resume upload failed', err);
                    alert("Failed to upload resume. Please try again.");
                    setIsSubmitting(false);
                    return;
                }
            }

            const payload = {
                name,
                email,
                phone: mobile,
                source: refBy || 'Career Guide Form',
                leadType: 'JOB_ENQUIRY',
                location: `${city}${state ? `, ${state}` : ''}`,
                qualification,
                experienceLevel: mappedExp,
                currentCTC,
                expectedCTC,
                noticePeriod,
                interestedRole: prefRole,
                companyName: currentCompany || dynFields['Employer Company Name'] || '',
                resumeUrl: uploadedResumeUrl,
                skills,
                notes
            }

            await api.post('/leads/capture', payload)
            
            setSubmitted(true)
            setTimeout(() => {
                router.push('/')
            }, 4000)

        } catch (error) {
            console.error('Failed to submit form:', error)
            alert("Something went wrong. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen py-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="h-20 w-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="h-10 w-10 text-green-500" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Application Submitted!</h1>
                    <p className="text-xl text-muted-foreground max-w-md mx-auto">
                        Thank you for reaching out to Techwell. Our team will review your profile and get in touch with you shortly.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen py-20 bg-muted/30">
            <div className="container max-w-4xl">
                
                <div className="text-center mb-10">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
                        <Compass className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Techwell Career Hub</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Your one-stop destination for job applications, placement assistance, mock interviews, and employer hiring.
                    </p>
                </div>

                {/* Educational / Informational Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <Card className="border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-blue-700 dark:text-blue-400">Why Career Guidance?</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <p>Many talented individuals struggle to land their dream job not because they lack technical skills, but because of common pitfalls in their job search strategy.</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Common Resume Mistakes:</strong> Poor formatting, lack of quantifiable achievements, or irrelevant information can get your resume rejected by ATS.</li>
                                <li><strong>Lack of Communication Skills:</strong> Inability to articulate your thoughts clearly or showcase your true potential to the interviewer.</li>
                                <li><strong>Interview Fear:</strong> Nervousness and anxiety that prevent you from performing at your best during crucial moments.</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500 bg-purple-50/30 dark:bg-purple-950/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-purple-700 dark:text-purple-400">How We Can Help</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <p>Techwell provides end-to-end career support to bridge the gap between your current skills and industry expectations.</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Resume Building:</strong> Get your resume reviewed and optimized for Applicant Tracking Systems (ATS).</li>
                                <li><strong>Mock Interviews:</strong> Practice with industry experts to overcome interview fear and get constructive feedback.</li>
                                <li><strong>Placement Assistance:</strong> Direct referrals to our hiring partners and dedicated job application support.</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Primary Intent */}
                    <Card className="border-primary/50 shadow-sm border-2">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2 text-primary">
                                Purpose of Contacting Techwell? *
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {PURPOSE_OPTIONS.map(opt => (
                                    <div 
                                        key={opt}
                                        onClick={() => setPurpose(opt)}
                                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-2 ${
                                            purpose === opt 
                                            ? 'border-primary bg-primary/5 text-primary font-medium' 
                                            : 'border-border hover:border-primary/30 text-muted-foreground hover:bg-accent/50'
                                        }`}
                                    >
                                        <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${purpose === opt ? 'border-primary' : 'border-muted-foreground'}`}>
                                            {purpose === opt && <div className="h-2 w-2 rounded-full bg-primary" />}
                                        </div>
                                        <span className="text-sm">{opt}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-6 pt-6 border-t">
                                <label className="block text-sm font-medium mb-2">Reference By</label>
                                <Input 
                                    placeholder="e.g. Google, Friend Name, Facebook, Instagram, College..."
                                    value={refBy}
                                    onChange={(e) => setRefBy(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium mb-2">Full Name *</label>
                                <Input required value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Email Address *</label>
                                <Input required type="email" value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Mobile Number *</label>
                                <Input required type="tel" value={mobile} onChange={e => setMobile(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">WhatsApp Number</label>
                                <Input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">City *</label>
                                <Input required value={city} onChange={e => setCity(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">State</label>
                                <Input value={state} onChange={e => setStateLoc(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Highest Qualification *</label>
                                <Input required placeholder="e.g. B.Tech, MCA, B.Sc" value={qualification} onChange={e => setQualification(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Current Employment Status</label>
                                <Select value={empStatus} onValueChange={setEmpStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Student">Student</SelectItem>
                                        <SelectItem value="Fresher">Fresher</SelectItem>
                                        <SelectItem value="Employed">Employed</SelectItem>
                                        <SelectItem value="Unemployed">Unemployed</SelectItem>
                                        <SelectItem value="Freelancer">Freelancer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Candidate Profile */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Candidate Profile</CardTitle>
                            <CardDescription>Skip fields that are not applicable to you.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Total Experience (Years)</label>
                                    <Input type="number" step="0.5" placeholder="0 for Fresher" value={experience} onChange={e => setExperience(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Current Company</label>
                                    <Input value={currentCompany} onChange={e => setCurrentCompany(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Current Designation</label>
                                    <Input value={currentDesignation} onChange={e => setCurrentDesignation(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Preferred Job Role</label>
                                    <Input placeholder="e.g. Cloud Engineer, React Developer" value={prefRole} onChange={e => setPrefRole(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Current CTC</label>
                                    <Input placeholder="e.g. 5 LPA" value={currentCTC} onChange={e => setCurrentCTC(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Expected CTC</label>
                                    <Input placeholder="e.g. 8 LPA" value={expectedCTC} onChange={e => setExpectedCTC(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Notice Period</label>
                                    <Select value={noticePeriod} onValueChange={setNoticePeriod}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Notice Period" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Immediate">Immediate / 0 Days</SelectItem>
                                            <SelectItem value="15 Days">15 Days</SelectItem>
                                            <SelectItem value="30 Days">30 Days</SelectItem>
                                            <SelectItem value="60 Days">60 Days</SelectItem>
                                            <SelectItem value="90 Days">90 Days</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Preferred Job Location</label>
                                    <Input placeholder="e.g. Bangalore, Remote, Anywhere" value={prefLocation} onChange={e => setPrefLocation(e.target.value)} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-3">Key Skills (Select multiple)</label>
                                <div className="flex flex-wrap gap-2">
                                    {SKILL_OPTIONS.map(skill => (
                                        <Badge
                                            key={skill}
                                            variant={skills.includes(skill) ? "default" : "outline"}
                                            className="cursor-pointer hover:bg-primary/80 transition-colors py-1.5 px-3"
                                            onClick={() => handleSkillToggle(skill)}
                                        >
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Resume & Links */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Resume & Profiles</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">Upload Resume (PDF/DOCX) *</label>
                                <div className="flex items-center gap-2 border border-input rounded-md px-3 py-2 bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                                    <Upload className="w-5 h-5 text-muted-foreground" />
                                    <input 
                                        type="file" 
                                        accept=".pdf,.doc,.docx"
                                        onChange={e => setResumeFile(e.target.files?.[0] || null)}
                                        className="w-full text-sm outline-none bg-transparent cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                        required={!resumeUrl}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Please upload your latest resume. Max file size: 5MB</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">LinkedIn Profile URL</label>
                                <Input placeholder="https://linkedin.com/in/..." value={linkedin} onChange={e => setLinkedin(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Portfolio / GitHub URL</label>
                                <Input placeholder="https://github.com/..." value={github} onChange={e => setGithub(e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dynamic Fields */}
                    {purpose && (
                        <Card className="border-blue-500/30 bg-blue-50/30 dark:bg-blue-950/20">
                            <CardHeader>
                                <CardTitle className="text-lg text-blue-600 dark:text-blue-400">Additional Details for: {purpose}</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                
                                {purpose === "Apply for a Job" && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Job ID (Optional)</label>
                                            <Input onChange={e => handleDynChange('Job ID', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Applying For Position</label>
                                            <Input onChange={e => handleDynChange('Applying For Position', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Ready to Relocate?</label>
                                            <Select onValueChange={(val) => handleDynChange('Ready to Relocate', val)}>
                                                <SelectTrigger><SelectValue placeholder="Yes/No" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Yes">Yes</SelectItem>
                                                    <SelectItem value="No">No</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </>
                                )}

                                {purpose === "Looking for Placement Assistance" && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Techwell Student?</label>
                                            <Select onValueChange={(val) => handleDynChange('Techwell Student', val)}>
                                                <SelectTrigger><SelectValue placeholder="Yes/No" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Yes">Yes</SelectItem>
                                                    <SelectItem value="No">No</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Student ID (If Techwell)</label>
                                            <Input onChange={e => handleDynChange('Student ID', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Course Completed</label>
                                            <Input onChange={e => handleDynChange('Course Completed', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Passout Year</label>
                                            <Input onChange={e => handleDynChange('Passout Year', e.target.value)} />
                                        </div>
                                    </>
                                )}

                                {purpose === "Need Career Guidance" && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Area of Interest</label>
                                            <Input onChange={e => handleDynChange('Area of Interest', e.target.value)} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-2">Career Challenges</label>
                                            <Textarea rows={3} onChange={e => handleDynChange('Career Challenges', e.target.value)} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-2">Specific Questions</label>
                                            <Textarea rows={3} onChange={e => handleDynChange('Specific Questions', e.target.value)} />
                                        </div>
                                    </>
                                )}

                                {purpose === "Resume Review Required" && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Target Job Role</label>
                                            <Input onChange={e => handleDynChange('Target Job Role', e.target.value)} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-2">Resume Issues Faced</label>
                                            <Textarea rows={3} onChange={e => handleDynChange('Resume Issues Faced', e.target.value)} />
                                        </div>
                                    </>
                                )}

                                {purpose === "Mock Interview Required" && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Interview Role</label>
                                            <Input placeholder="e.g. React Developer" onChange={e => handleDynChange('Interview Role', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Experience Level</label>
                                            <Input placeholder="e.g. Fresher, 2 Years" onChange={e => handleDynChange('Interview Exp Level', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Preferred Date</label>
                                            <Input type="date" onChange={e => handleDynChange('Preferred Interview Date', e.target.value)} />
                                        </div>
                                    </>
                                )}

                                {purpose === "Looking for Internship Opportunities" && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">College Name</label>
                                            <Input onChange={e => handleDynChange('Internship College Name', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Graduation Year</label>
                                            <Input onChange={e => handleDynChange('Graduation Year', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Internship Domain</label>
                                            <Input placeholder="e.g. Web Dev, Marketing" onChange={e => handleDynChange('Internship Domain', e.target.value)} />
                                        </div>
                                    </>
                                )}

                                {purpose === "Employer Hiring Requirement" && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Company Name</label>
                                            <Input onChange={e => handleDynChange('Employer Company Name', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Contact Person</label>
                                            <Input onChange={e => handleDynChange('Contact Person', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Hiring Role</label>
                                            <Input onChange={e => handleDynChange('Hiring Role', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Number of Positions</label>
                                            <Input type="number" onChange={e => handleDynChange('Number of Positions', e.target.value)} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-2">Budget/CTC Range</label>
                                            <Input placeholder="e.g. 5-8 LPA" onChange={e => handleDynChange('Budget/CTC Range', e.target.value)} />
                                        </div>
                                    </>
                                )}

                            </CardContent>
                        </Card>
                    )}

                    {/* Final Declaration */}
                    <Card className="bg-transparent shadow-none border-none">
                        <CardContent className="px-0">
                            <div className="flex items-start space-x-3 bg-card p-4 rounded-lg border">
                                <Checkbox 
                                    id="terms" 
                                    className="mt-1"
                                    checked={agreed}
                                    onCheckedChange={(c) => setAgreed(c === true)}
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <label
                                        htmlFor="terms"
                                        className="text-sm font-medium leading-relaxed cursor-pointer"
                                    >
                                        I agree to be contacted by Techwell regarding career opportunities, placement assistance, training programs, and recruitment services.
                                    </label>
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                size="lg" 
                                className="w-full mt-6 h-14 text-lg font-semibold"
                                disabled={isSubmitting || !agreed || !purpose}
                            >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                                Submit Application
                            </Button>
                        </CardContent>
                    </Card>

                </form>

                <div className="mt-12 text-center pb-12">
                    <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline">
                        <ArrowLeft className="h-4 w-4" /> Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
