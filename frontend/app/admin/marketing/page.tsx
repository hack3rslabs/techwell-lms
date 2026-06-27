"use client"

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Share2, Facebook, MessageCircle, FormInput, Megaphone, FileText, Target } from 'lucide-react'

export default function MarketingHubPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                    <Megaphone className="h-8 w-8 text-indigo-600" />
                    Marketing Hub
                </h1>
                <p className="text-muted-foreground mt-2">
                    Centralized platform for integrations, campaign tracking, and lead acquisition forms.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Meta Integration */}
                <Card className="hover:shadow-lg transition-shadow border-indigo-100 dark:border-indigo-900/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Facebook className="h-6 w-6 text-blue-600" />
                            Meta Suite (Ads)
                        </CardTitle>
                        <CardDescription>
                            Connect Facebook and Instagram Lead Ads directly to your Central CRM.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                            <li>✓ Auto-sync Leads from FB Ads</li>
                            <li>✓ Track Campaign ROI</li>
                            <li>✓ Manage Webhook Secrets</li>
                        </ul>
                        <Link href="/admin/marketing/integrations">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                Manage Meta Integration <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* WhatsApp Integration */}
                <Card className="hover:shadow-lg transition-shadow border-emerald-100 dark:border-emerald-900/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <MessageCircle className="h-6 w-6 text-emerald-600" />
                            WhatsApp Business
                        </CardTitle>
                        <CardDescription>
                            Configure WhatsApp Business API for automated lead follow-ups.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                            <li>✓ Automated Welcome Messages</li>
                            <li>✓ Send Brochures/Course Info</li>
                            <li>✓ Chat History in CRM</li>
                        </ul>
                        <Link href="/admin/marketing/integrations">
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                                Manage WhatsApp API <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
                {/* Landing Pages */}
                <Card className="hover:shadow-lg transition-shadow border-indigo-100 dark:border-indigo-900/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <FileText className="h-6 w-6 text-indigo-600" />
                            Landing Pages
                        </CardTitle>
                        <CardDescription>
                            Create and manage custom promotional landing pages.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                            <li>✓ Drag and drop builder</li>
                            <li>✓ Custom SEO metadata</li>
                            <li>✓ Publish / Draft controls</li>
                        </ul>
                        <Link href="/admin/marketing/landing-pages">
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                                Manage Pages <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Lead Gen Forms */}
                <Card className="hover:shadow-lg transition-shadow border-orange-100 dark:border-orange-900/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <FormInput className="h-6 w-6 text-orange-600" />
                            Lead Gen Forms
                        </CardTitle>
                        <CardDescription>
                            Create dynamic forms to capture student leads.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                            <li>✓ Custom form fields</li>
                            <li>✓ Auto-sync to CRM Leads</li>
                            <li>✓ Embeddable on any page</li>
                        </ul>
                        <Link href="/admin/marketing/forms">
                            <Button className="w-full bg-orange-600 hover:bg-orange-700">
                                Manage Forms <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Campaigns & ROI */}
                <Card className="hover:shadow-lg transition-shadow border-red-100 dark:border-red-900/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Target className="h-6 w-6 text-red-600" />
                            Campaigns & ROI
                        </CardTitle>
                        <CardDescription>
                            Track marketing campaigns and calculate return on investment.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                            <li>✓ Track Email, SMS, Ads</li>
                            <li>✓ Budget tracking</li>
                            <li>✓ Auto-calculate ROI Score</li>
                        </ul>
                        <Link href="/admin/marketing/campaigns">
                            <Button className="w-full bg-red-600 hover:bg-red-700">
                                Manage Campaigns <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
