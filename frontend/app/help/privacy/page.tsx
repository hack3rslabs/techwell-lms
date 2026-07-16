"use client"

import Link from 'next/link'
import { Shield, Check, Lock, ShieldCheck, Database, ArrowLeft, Mail, User, Briefcase } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function PrivacyPage() {
    return (
        <div className="min-h-screen py-20">
            <div className="container max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-12">
                    <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Shield className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold">Privacy Policy</h1>
                        <p className="text-muted-foreground">Last Updated: February 1, 2026</p>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Section 1 */}
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">1</span>
                                Introduction
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Techwell (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy
                                explains how we collect, use, disclose, and safeguard your information when you use our
                                AI-powered interview preparation and learning platform.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Section 2 */}
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">2</span>
                                Information We Collect
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-primary mb-2">Personal Information</h3>
                                    <ul className="space-y-2 text-muted-foreground">
                                        <li className="flex items-start gap-2"><Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> Name and email address</li>
                                        <li className="flex items-start gap-2"><Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> Profile information (resume, job preferences)</li>
                                        <li className="flex items-start gap-2"><Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> Payment information (processed securely via Razorpay)</li>
                                        <li className="flex items-start gap-2"><Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> Educational institution (for college partnerships)</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-purple-500 mb-2">Interview Data</h3>
                                    <ul className="space-y-2 text-muted-foreground">
                                        <li className="flex items-start gap-2"><Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> Audio recordings (processed for speech-to-text only)</li>
                                        <li className="flex items-start gap-2"><Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> Video recordings (for camera-on practice sessions)</li>
                                        <li className="flex items-start gap-2"><Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> Text responses and transcripts</li>
                                        <li className="flex items-start gap-2"><Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> Performance scores and analytics</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 3 - GDPR */}
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">3</span>
                                GDPR Compliance
                            </h2>
                            <p className="text-muted-foreground mb-4">For users in the European Economic Area (EEA), we comply with the
                                General Data Protection Regulation (GDPR). Your rights include:</p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-muted/50 rounded-xl p-4 border">
                                    <h4 className="font-bold text-primary mb-1">Right to Access</h4>
                                    <p className="text-sm text-muted-foreground">Request copies of your personal data</p>
                                </div>
                                <div className="bg-muted/50 rounded-xl p-4 border">
                                    <h4 className="font-bold text-primary mb-1">Right to Rectification</h4>
                                    <p className="text-sm text-muted-foreground">Request correction of inaccurate data</p>
                                </div>
                                <div className="bg-muted/50 rounded-xl p-4 border">
                                    <h4 className="font-bold text-primary mb-1">Right to Erasure</h4>
                                    <p className="text-sm text-muted-foreground">Request deletion of your personal data</p>
                                </div>
                                <div className="bg-muted/50 rounded-xl p-4 border">
                                    <h4 className="font-bold text-primary mb-1">Right to Portability</h4>
                                    <p className="text-sm text-muted-foreground">Request transfer of your data</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 4 - Data Security */}
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">4</span>
                                Data Security
                            </h2>
                            <p className="text-muted-foreground mb-4">We implement industry-standard security measures:</p>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="text-center p-4">
                                    <div className="h-12 w-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                                        <Lock className="h-6 w-6 text-green-500" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">256-bit SSL/TLS Encryption</p>
                                </div>
                                <div className="text-center p-4">
                                    <div className="h-12 w-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                                        <ShieldCheck className="h-6 w-6 text-green-500" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">OWASP Top 10 Protection</p>
                                </div>
                                <div className="text-center p-4">
                                    <div className="h-12 w-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                                        <Database className="h-6 w-6 text-green-500" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">AES-256 Data Encryption</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 5 - Data Retention */}
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">5</span>
                                Data Retention
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                    <span className="text-muted-foreground">Account data</span>
                                    <span className="text-primary font-bold">Until deletion</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                    <span className="text-muted-foreground">Interview recordings</span>
                                    <span className="text-primary font-bold">90 days</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                    <span className="text-muted-foreground">Analytics data</span>
                                    <span className="text-primary font-bold">1 year (anonymized)</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                    <span className="text-muted-foreground">Payment records</span>
                                    <span className="text-primary font-bold">7 years (legal)</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 6 - Contact */}
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">6</span>
                                Contact Us
                            </h2>
                            <p className="text-muted-foreground mb-4">
                                If you have any questions about this Privacy Policy, please contact us at:
                                <br />
                                <Link href="mailto:info@techwell.co.in" className="text-primary hover:underline font-medium">
                                    info@techwell.co.in
                                </Link>
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link href="mailto:privacy@techwell.co.in">
                                    <Button variant="outline" className="gap-2">
                                        <Mail className="h-4 w-4" />
                                        Privacy Inquiries
                                    </Button>
                                </Link>
                                <Link href="mailto:hr@techwell.co.in">
                                    <Button variant="outline" className="gap-2">
                                        <Briefcase className="h-4 w-4" />
                                        HR Management
                                    </Button>
                                </Link>
                                <Link href="mailto:compliance@techwell.co.in">
                                    <Button variant="outline" className="gap-2">
                                        <User className="h-4 w-4" />
                                        Compliance Officer
                                    </Button>
                                </Link>
                            </div>
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
