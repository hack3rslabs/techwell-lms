"use client"

import Link from 'next/link'
import { Briefcase, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function EmployerTermsPage() {
    return (
        <div className="min-h-screen py-20">
            <div className="container max-w-4xl">
                <div className="flex items-center gap-4 mb-12">
                    <div className="h-14 w-14 rounded-xl bg-teal-500/20 flex items-center justify-center">
                        <Briefcase className="h-7 w-7 text-teal-500" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold">Employer Terms</h1>
                        <p className="text-muted-foreground">Effective Date: [Current Date]</p>
                    </div>
                </div>

                <div className="space-y-8">
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-500 text-sm font-bold">1</span>
                                Hiring Commitments
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Employers utilizing Techwell for recruitment agree to post legitimate job opportunities, communicate transparently with candidates, and honor offers made through the platform. Techwell serves as a facilitator and does not act as an employer.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-500 text-sm font-bold">2</span>
                                Candidate Data Usage
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Candidate profiles, resumes, and AI interview analytics provided to the Employer are strictly for recruitment purposes. Employers are prohibited from selling, distributing, or using this data for marketing or any non-recruitment purposes.
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
