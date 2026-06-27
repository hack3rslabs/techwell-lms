"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Briefcase, GraduationCap, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import api from '@/lib/api'

export default function OnboardingPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    // Form State
    const [interestType, setInterestType] = useState('JOB') // INTERNSHIP or JOB
    const [experienceLevel, setExperienceLevel] = useState('FRESHER') // FRESHER or EXPERIENCED
    
    // Demographics & Education
    const [candidateState, setCandidateState] = useState('')
    const [district, setDistrict] = useState('')
    const [pinCode, setPinCode] = useState('')
    const [education, setEducation] = useState('')
    const [passedOutYear, setPassedOutYear] = useState('')

    // Professional Details
    const [industry, setIndustry] = useState('')
    const [skills, setSkills] = useState('')
    const [currentCTC, setCurrentCTC] = useState('')
    const [expectedCTC, setExpectedCTC] = useState('')
    const [noticePeriod, setNoticePeriod] = useState('')
    const [interestedRole, setInterestedRole] = useState('')
    const [category, setCategory] = useState('IT_FULL_STACK') // Default category

    const handleNext = () => {
        if (step === 1 && interestType === 'INTERNSHIP') {
            setStep(3) // Skip experience level for internship
        } else {
            setStep(step + 1)
        }
    }

    const handleBack = () => {
        if (step === 3 && interestType === 'INTERNSHIP') {
            setStep(1)
        } else {
            setStep(step - 1)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean)

        try {
            await api.post('/api/candidates/onboard', {
                interestType,
                experienceLevel: interestType === 'INTERNSHIP' ? 'FRESHER' : experienceLevel,
                state: candidateState,
                district,
                pinCode,
                education,
                passedOutYear,
                industry,
                skills: skillsArray,
                currentCTC,
                expectedCTC,
                noticePeriod,
                interestedRole,
                category
            })
            setStep(5) // Success step
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to complete onboarding. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5 py-12">
            <Card className="w-full max-w-2xl border-muted shadow-xl backdrop-blur-sm bg-background/80 overflow-y-auto max-h-[90vh]">
                <CardHeader className="text-center pt-8 border-b pb-6">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                        Complete Your Profile
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                        Help us match you with the perfect career opportunities.
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-8 px-6 md:px-12 pb-8">
                    {error && (
                        <div className="mb-6 p-4 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg">
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-xl font-semibold text-center mb-6">What are you looking for?</h3>
                            <RadioGroup value={interestType} onValueChange={setInterestType} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <RadioGroupItem value="JOB" id="JOB" className="peer sr-only" />
                                    <Label htmlFor="JOB" className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all">
                                        <Briefcase className="mb-4 h-10 w-10 text-primary" />
                                        <span className="text-lg font-bold">Full-Time Job</span>
                                        <span className="text-xs text-muted-foreground mt-2 text-center">Looking for permanent employment</span>
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="INTERNSHIP" id="INTERNSHIP" className="peer sr-only" />
                                    <Label htmlFor="INTERNSHIP" className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all">
                                        <GraduationCap className="mb-4 h-10 w-10 text-primary" />
                                        <span className="text-lg font-bold">Internship</span>
                                        <span className="text-xs text-muted-foreground mt-2 text-center">Looking to gain initial experience</span>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                            <h3 className="text-xl font-semibold text-center mb-6">What is your experience level?</h3>
                            <RadioGroup value={experienceLevel} onValueChange={setExperienceLevel} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <RadioGroupItem value="FRESHER" id="FRESHER" className="peer sr-only" />
                                    <Label htmlFor="FRESHER" className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all">
                                        <span className="text-lg font-bold">Fresher</span>
                                        <span className="text-xs text-muted-foreground mt-2 text-center">0 - 1 years of experience</span>
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="EXPERIENCED" id="EXPERIENCED" className="peer sr-only" />
                                    <Label htmlFor="EXPERIENCED" className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all">
                                        <span className="text-lg font-bold">Experienced</span>
                                        <span className="text-xs text-muted-foreground mt-2 text-center">1+ years of experience</span>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                            <h3 className="text-xl font-semibold mb-6">Location & Education</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input id="state" value={candidateState} onChange={(e) => setCandidateState(e.target.value)} placeholder="e.g. Telangana" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="district">District / City</Label>
                                    <Input id="district" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="e.g. Hyderabad" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pinCode">Pin Code</Label>
                                    <Input id="pinCode" value={pinCode} onChange={(e) => setPinCode(e.target.value)} placeholder="e.g. 500081" required />
                                </div>
                            </div>

                            <hr className="my-6 border-muted" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="education">Highest Education</Label>
                                    <Input id="education" value={education} onChange={(e) => setEducation(e.target.value)} placeholder="e.g. B.Tech, MCA, Degree" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="passedOutYear">Passed Out Year</Label>
                                    <Input id="passedOutYear" value={passedOutYear} onChange={(e) => setPassedOutYear(e.target.value)} placeholder="e.g. 2024" required />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <form id="onboarding-form" onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                            <h3 className="text-xl font-semibold mb-6">Professional Details</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="industry">Industry</Label>
                                    <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. IT, Healthcare, Finance" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="interestedRole">Interested Role</Label>
                                    <Input id="interestedRole" value={interestedRole} onChange={(e) => setInterestedRole(e.target.value)} placeholder="e.g. Full Stack Developer" required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="skills">Top Skills (comma separated)</Label>
                                <Input id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. React, Node.js, Python" required />
                            </div>

                            {experienceLevel === 'EXPERIENCED' && interestType === 'JOB' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentCTC">Current CTC</Label>
                                        <Input id="currentCTC" value={currentCTC} onChange={(e) => setCurrentCTC(e.target.value)} placeholder="e.g. 5 LPA" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="expectedCTC">Expected CTC</Label>
                                        <Input id="expectedCTC" value={expectedCTC} onChange={(e) => setExpectedCTC(e.target.value)} placeholder="e.g. 8 LPA" required />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="noticePeriod">Notice Period</Label>
                                        <Input id="noticePeriod" value={noticePeriod} onChange={(e) => setNoticePeriod(e.target.value)} placeholder="e.g. 30 days, Immediate" required />
                                    </div>
                                </div>
                            )}

                            {experienceLevel === 'FRESHER' && (
                                <div className="space-y-2">
                                    <Label htmlFor="expectedCTC">Expected Salary/Stipend</Label>
                                    <Input id="expectedCTC" value={expectedCTC} onChange={(e) => setExpectedCTC(e.target.value)} placeholder="e.g. 3 LPA or 15k/month" required />
                                </div>
                            )}
                        </form>
                    )}

                    {step === 5 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-500" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Profile Complete!</h2>
                            <p className="text-muted-foreground max-w-md mb-8">
                                Welcome to Techwell Careers. Your profile has been setup successfully and our AI will start matching you with the best opportunities.
                            </p>
                            <Button size="lg" onClick={() => router.push('/dashboard')} className="px-8">
                                Go to Dashboard
                            </Button>
                        </div>
                    )}
                </CardContent>

                {step < 5 && (
                    <CardFooter className="flex justify-between border-t px-6 py-4 md:px-12 bg-muted/20">
                        {step > 1 ? (
                            <Button variant="outline" onClick={handleBack} disabled={isLoading}>
                                Back
                            </Button>
                        ) : (
                            <div></div>
                        )}
                        
                        {step < 4 ? (
                            <Button onClick={handleNext}>
                                Next <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button type="submit" form="onboarding-form" disabled={isLoading}>
                                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Complete Profile'}
                            </Button>
                        )}
                    </CardFooter>
                )}
            </Card>
        </div>
    )
}
