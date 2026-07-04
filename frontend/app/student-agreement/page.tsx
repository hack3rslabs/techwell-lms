"use client"

import Link from 'next/link'
import { GraduationCap, ArrowLeft, Mail } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function StudentAgreementPage() {
    return (
        <div className="min-h-screen py-20">
            <div className="container max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-12">
                    <div className="h-14 w-14 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                        <GraduationCap className="h-7 w-7 text-indigo-500" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold">Student Agreement</h1>
                        <p className="text-muted-foreground">Effective Date: [Current Date]</p>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Section 1 */}
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-500 text-sm font-bold">1</span>
                                General Responsibilities
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                As a registered student on Techwell, you agree to engage with the learning materials, AI mock interviews, and recruitment processes honestly and professionally. You must ensure that all profile information, academic records, and resumes provided are accurate and truthful.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Section 2 */}
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-500 text-sm font-bold">2</span>
                                Academic Integrity & AI Use
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Our AI interview simulator is designed for practice. You agree not to use automated scripts, real-time AI prompters, or third-party assistance to artificially inflate your scores during proctored assessments. Techwell reserves the right to invalidate any scores suspected of being achieved through unfair means.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Section 3 */}
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-500 text-sm font-bold">3</span>
                                Placement Assistance 
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                While Techwell provides placement assistance and connects students with potential employers, we do not guarantee employment or specific salary packages. Acceptance of a job offer facilitated through our platform implies a commitment to join the employer; reneging on accepted offers may result in suspension from future placement drives.
                            </p>
                        </CardContent>
                    </Card>

                    <div className="mt-12 text-center">
                        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline">
                            <ArrowLeft className="h-4 w-4" /> Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
