"use client"

import Link from 'next/link'
import { Cookie, CheckCircle, Settings, BarChart3, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function CookiesPage() {
    return (
        <div className="min-h-screen py-20">
            <div className="container max-w-4xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-12">
                    <div className="h-14 w-14 rounded-xl bg-orange-500/20 flex items-center justify-center">
                        <Cookie className="h-7 w-7 text-orange-500" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold">Cookie Policy</h1>
                        <p className="text-muted-foreground">Last Updated: February 1, 2026</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* What Are Cookies */}
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-bold text-orange-500 mb-3">What Are Cookies?</h2>
                            <p className="text-muted-foreground">
                                Cookies are small text files stored on your device when you visit our
                                website to improve your experience.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Types We Use */}
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-bold text-orange-500 mb-4">Types We Use</h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                                    <div>
                                        <span className="font-bold">Essential:</span>
                                        <span className="text-muted-foreground ml-2">Required for site functionality</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                                    <Settings className="h-5 w-5 text-primary shrink-0" />
                                    <div>
                                        <span className="font-bold">Functional:</span>
                                        <span className="text-muted-foreground ml-2">Remember your preferences</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                    <BarChart3 className="h-5 w-5 text-purple-500 shrink-0" />
                                    <div>
                                        <span className="font-bold">Analytics:</span>
                                        <span className="text-muted-foreground ml-2">Understand usage patterns</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cookie Details Table */}
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-bold text-orange-500 mb-4">Cookie Details</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-semibold">Cookie Name</th>
                                            <th className="text-left py-3 px-4 font-semibold">Purpose</th>
                                            <th className="text-left py-3 px-4 font-semibold">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-muted-foreground">
                                        <tr className="border-b">
                                            <td className="py-3 px-4 font-mono text-xs">tw_session</td>
                                            <td className="py-3 px-4">User authentication</td>
                                            <td className="py-3 px-4">Session</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="py-3 px-4 font-mono text-xs">tw_theme</td>
                                            <td className="py-3 px-4">Dark/Light mode preference</td>
                                            <td className="py-3 px-4">1 year</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="py-3 px-4 font-mono text-xs">tw_analytics</td>
                                            <td className="py-3 px-4">Anonymous usage analytics</td>
                                            <td className="py-3 px-4">30 days</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 px-4 font-mono text-xs">tw_consent</td>
                                            <td className="py-3 px-4">Cookie consent status</td>
                                            <td className="py-3 px-4">1 year</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Managing Cookies */}
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-bold text-orange-500 mb-3">Managing Cookies</h2>
                            <p className="text-muted-foreground mb-4">
                                Control cookies via our cookie banner or browser settings. Blocking
                                essential cookies may affect functionality.
                            </p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-muted/50 rounded-xl p-4 border">
                                    <h4 className="font-semibold mb-1">Browser Settings</h4>
                                    <p className="text-sm text-muted-foreground">Most browsers allow you to block or delete cookies in settings</p>
                                </div>
                                <div className="bg-muted/50 rounded-xl p-4 border">
                                    <h4 className="font-semibold mb-1">Cookie Banner</h4>
                                    <p className="text-sm text-muted-foreground">Use our cookie banner to customize your preferences</p>
                                </div>
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
