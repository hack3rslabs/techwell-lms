"use client"

import Link from 'next/link'
import { ShieldCheck, CheckCircle, Lock, Server, UserCheck, Clock, ArrowLeft, Mail } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function GDPRPage() {
    return (
        <div className="min-h-screen py-20">
            <div className="container max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-12">
                    <div className="h-14 w-14 rounded-xl bg-green-500/20 flex items-center justify-center">
                        <ShieldCheck className="h-7 w-7 text-green-500" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold">GDPR Compliance</h1>
                        <p className="text-muted-foreground">Your Data Rights Under GDPR</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Compliance Badge */}
                    <Card className="border-green-500/30 bg-green-500/5">
                        <CardContent className="pt-6">
                            <p className="text-green-500 flex items-center gap-2 font-bold text-lg">
                                <CheckCircle className="h-6 w-6" />
                                Techwell is fully GDPR compliant
                            </p>
                        </CardContent>
                    </Card>

                    {/* Your Rights */}
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-bold text-primary mb-4">Your Rights</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-muted/50 rounded-xl p-4 border">
                                    <h4 className="font-bold text-primary mb-1">Access</h4>
                                    <p className="text-sm text-muted-foreground">Request copies of your data</p>
                                </div>
                                <div className="bg-muted/50 rounded-xl p-4 border">
                                    <h4 className="font-bold text-purple-500 mb-1">Rectification</h4>
                                    <p className="text-sm text-muted-foreground">Correct inaccurate data</p>
                                </div>
                                <div className="bg-muted/50 rounded-xl p-4 border">
                                    <h4 className="font-bold text-orange-500 mb-1">Erasure</h4>
                                    <p className="text-sm text-muted-foreground">Request deletion of data</p>
                                </div>
                                <div className="bg-muted/50 rounded-xl p-4 border">
                                    <h4 className="font-bold text-green-500 mb-1">Portability</h4>
                                    <p className="text-sm text-muted-foreground">Transfer your data</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Data Protection */}
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-bold text-primary mb-4">Data Protection</h2>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                    <Lock className="h-5 w-5 text-green-500 shrink-0" />
                                    <span>End-to-end encryption for all sensitive data</span>
                                </li>
                                <li className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                    <Server className="h-5 w-5 text-green-500 shrink-0" />
                                    <span>EU data centers available for EEA users</span>
                                </li>
                                <li className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                    <UserCheck className="h-5 w-5 text-green-500 shrink-0" />
                                    <span>Dedicated Data Protection Officer</span>
                                </li>
                                <li className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                    <Clock className="h-5 w-5 text-green-500 shrink-0" />
                                    <span>72-hour breach notification commitment</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Legal Basis */}
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-bold text-primary mb-4">Legal Basis for Processing</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                    <span>Account & service provision</span>
                                    <span className="text-primary font-medium">Contract</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                    <span>Marketing communications</span>
                                    <span className="text-primary font-medium">Consent</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                    <span>Analytics & improvement</span>
                                    <span className="text-primary font-medium">Legitimate Interest</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                    <span>Tax & legal compliance</span>
                                    <span className="text-primary font-medium">Legal Obligation</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Exercise Your Rights */}
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-bold text-primary mb-3">Exercise Your Rights</h2>
                            <p className="text-muted-foreground mb-4">
                            If you have questions about these rights or wish to exercise them, please contact our Data Protection Officer at:
                            <br />
                            <Link href="mailto:info@techwell.co.in" className="text-primary hover:underline font-medium">
                                info@techwell.co.in
                            </Link>
                        </p>
                            <p className="text-sm text-muted-foreground mt-4">
                                We will respond to your request within 30 days as required by GDPR.
                            </p>
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
