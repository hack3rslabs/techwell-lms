"use client"

import Link from 'next/link'
import { Database, ArrowLeft, Mail } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function DataProcessingPage() {
    return (
        <div className="min-h-screen py-20">
            <div className="container max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-12">
                    <div className="h-14 w-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <Database className="h-7 w-7 text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold">Data Processing & Consent Policy</h1>
                        <p className="text-muted-foreground">Effective Date: [Current Date]</p>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Section 1 */}
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500 text-sm font-bold">1</span>
                                Purpose of Data Processing
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                This Data Processing & Consent Policy outlines the specific ways Techwell processes your personal data and the explicit consents you grant us by using our Platform. Our primary goal in processing data is to provide adaptive learning experiences, accurate AI-driven interview assessments, and seamless recruitment connections.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Section 2 */}
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500 text-sm font-bold">2</span>
                                Explicit Consent for AI Processing
                            </h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                By participating in AI mock interviews or using our AI tools, you explicitly consent to the following:
                            </p>
                            <ul className="space-y-4 text-muted-foreground list-disc list-inside">
                                <li><strong>Audio & Text Analysis:</strong> We process your voice recordings and text inputs using Natural Language Processing (NLP) to evaluate your communication skills, technical knowledge, and answer structure.</li>
                                <li><strong>Video & Behavioral Analysis:</strong> If your camera is enabled, we may process video feeds to assess professional presence and focus. We do <em>not</em> use this data for biometric identification.</li>
                                <li><strong>Model Training:</strong> You consent to your anonymized, aggregated data being used to fine-tune and improve our AI models to provide better feedback to all users.</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Section 3 */}
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500 text-sm font-bold">3</span>
                                Data Sharing Consent (Recruitment)
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                If you opt-in to our placement assistance or recruitment consultancy services, you consent to Techwell sharing your profile, resume, course progress, and AI interview performance scores with our network of partner Employers and Institutes. You can revoke this consent at any time from your account settings.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Section 4 */}
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500 text-sm font-bold">4</span>
                                Third-Party Sub-Processors
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We utilize carefully vetted third-party sub-processors (e.g., cloud storage providers, AI API providers) to deliver our services. These sub-processors are legally bound by strict data processing agreements to ensure your data is handled securely and in compliance with applicable data protection laws.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Section 5 */}
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500 text-sm font-bold">5</span>
                                Revoking Consent
                            </h2>
                            <p className="text-muted-foreground mb-4">
                                You may withdraw your consent for any of the above processing activities at any time by deleting your account or contacting us. Note that withdrawing consent may limit or prevent your use of certain features (like AI interviews).
                            </p>
                            <Link href="mailto:info@techwell.co.in">
                                <Button variant="outline" className="gap-2">
                                    <Mail className="h-4 w-4" />
                                    Contact Data Protection Officer
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
