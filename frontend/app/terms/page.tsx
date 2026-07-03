"use client"

import Link from 'next/link'
import { FileText, Check, X, AlertTriangle, CreditCard, RefreshCw, Calendar, XCircle, ArrowLeft, Mail } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TermsPage() {
    return (
        <div className="min-h-screen py-20">
            <div className="container max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-12">
                    <div className="h-14 w-14 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <FileText className="h-7 w-7 text-purple-500" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold">Terms of Service</h1>
                        <p className="text-muted-foreground">Last Updated: February 1, 2026</p>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Section 1 */}
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-500 text-sm font-bold">1</span>
                                Acceptance of Terms
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                By accessing or using Techwell, you agree to be bound by these Terms of Service. If you
                                disagree with any part of these terms, you may not access the service.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Section 2 */}
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-500 text-sm font-bold">2</span>
                                Description of Service
                            </h2>
                            <p className="text-muted-foreground mb-4">Techwell is an AI-powered interview preparation and learning platform designed
                                for practice and educational purposes. The service includes:</p>
                            <ul className="space-y-2 text-muted-foreground">
                                <li className="flex items-start gap-2"><Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> AI interviewer simulations with voice and text interaction</li>
                                <li className="flex items-start gap-2"><Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> Real-time feedback and performance analytics</li>
                                <li className="flex items-start gap-2"><Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> Resume analysis and personalized question generation</li>
                                <li className="flex items-start gap-2"><Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> Role-specific and company-specific interview preparation</li>
                                <li className="flex items-start gap-2"><Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> Adaptive learning courses and certificates</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Section 3 - Prohibited Uses */}
                    <Card className="border-red-500/30 bg-red-500/5">
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-red-500">
                                <span className="h-8 w-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500 text-sm font-bold">3</span>
                                Prohibited Uses
                            </h2>
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
                                <p className="text-red-500 font-bold flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    IMPORTANT: Techwell is strictly for PRACTICE purposes.
                                </p>
                            </div>
                            <p className="text-muted-foreground mb-4">You agree NOT to:</p>
                            <ul className="space-y-2 text-muted-foreground">
                                <li className="flex items-start gap-2"><X className="h-5 w-5 text-red-500 mt-0.5 shrink-0" /> <strong className="text-red-500">Use during actual live job interviews</strong></li>
                                <li className="flex items-start gap-2"><X className="h-5 w-5 text-red-500 mt-0.5 shrink-0" /> Use to deceive employers or interviewers</li>
                                <li className="flex items-start gap-2"><X className="h-5 w-5 text-red-500 mt-0.5 shrink-0" /> Record or stream actual interviews while using our service</li>
                                <li className="flex items-start gap-2"><X className="h-5 w-5 text-red-500 mt-0.5 shrink-0" /> Share AI-generated responses as your original work</li>
                                <li className="flex items-start gap-2"><X className="h-5 w-5 text-red-500 mt-0.5 shrink-0" /> Attempt to reverse engineer or copy our AI technology</li>
                            </ul>
                            <p className="text-red-500 mt-4 font-bold text-sm">
                                Violation of these terms will result in immediate account termination and may lead to legal action.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Section 4 */}
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-500 text-sm font-bold">4</span>
                                User Accounts
                            </h2>
                            <ul className="space-y-2 text-muted-foreground">
                                <li className="flex items-start gap-2"><Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> You must provide accurate and complete registration information</li>
                                <li className="flex items-start gap-2"><Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> You are responsible for maintaining the security of your account</li>
                                <li className="flex items-start gap-2"><Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> You must notify us immediately of any unauthorized access</li>
                                <li className="flex items-start gap-2"><Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> One account per person; account sharing is prohibited</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Section 5 */}
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-500 text-sm font-bold">5</span>
                                Subscription and Payments
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-muted/50 rounded-xl p-4 border">
                                    <CreditCard className="h-6 w-6 text-primary mb-2" />
                                    <p className="text-sm text-muted-foreground">Fees billed monthly in advance (INR)</p>
                                </div>
                                <div className="bg-muted/50 rounded-xl p-4 border">
                                    <RefreshCw className="h-6 w-6 text-purple-500 mb-2" />
                                    <p className="text-sm text-muted-foreground">30-day money-back guarantee</p>
                                </div>
                                <div className="bg-muted/50 rounded-xl p-4 border">
                                    <Calendar className="h-6 w-6 text-orange-500 mb-2" />
                                    <p className="text-sm text-muted-foreground">Cancel before next billing cycle</p>
                                </div>
                                <div className="bg-muted/50 rounded-xl p-4 border">
                                    <XCircle className="h-6 w-6 text-yellow-500 mb-2" />
                                    <p className="text-sm text-muted-foreground">No refunds for partial months</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 6 */}
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-500 text-sm font-bold">6</span>
                                Governing Law
                            </h2>
                            <p className="text-muted-foreground">
                                These Terms shall be governed by and construed in accordance with the laws of India. Any
                                disputes shall be subject to the exclusive jurisdiction of the courts in Bangalore, India.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Section 7 */}
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-500 text-sm font-bold">7</span>
                                Contact
                            </h2>
                            <p className="text-muted-foreground mb-4">For questions about these Terms:</p>
                            <Link href="mailto:legal@techwell.co.in">
                                <Button variant="outline" className="gap-2">
                                    <Mail className="h-4 w-4" />
                                    legal@techwell.co.in
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* Back Link */}
                <div className="mt-12 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline">
                        <ArrowLeft className="h-4 w-4" /> Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
