"use client"

import Link from 'next/link'
import { BriefcaseBusiness, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function PlacementPolicyPage() {
    return (
        <div className="min-h-screen py-20">
            <div className="container max-w-4xl">
                <div className="flex items-center gap-4 mb-12">
                    <div className="h-14 w-14 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <BriefcaseBusiness className="h-7 w-7 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold">Placement Assistance Policy</h1>
                        <p className="text-muted-foreground">Effective Date: [Current Date]</p>
                    </div>
                </div>

                <div className="space-y-8">
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-sm font-bold">1</span>
                                Eligibility
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                To be eligible for Placement Assistance, students must maintain a minimum attendance rate in their enrolled courses, complete required assignments, and achieve a baseline score in our AI Mock Interviews. Eligibility criteria may vary by specific program.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-sm font-bold">2</span>
                                Code of Conduct during Interviews
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Candidates must attend all scheduled employer interviews punctually. A "No Show" without prior notice may result in the suspension of Placement Assistance services for up to 30 days. Professional attire and behavior are mandatory.
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
