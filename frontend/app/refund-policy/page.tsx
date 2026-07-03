"use client"

import Link from 'next/link'
import { Banknote, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function RefundPolicyPage() {
    return (
        <div className="min-h-screen py-20">
            <div className="container max-w-4xl">
                <div className="flex items-center gap-4 mb-12">
                    <div className="h-14 w-14 rounded-xl bg-red-500/20 flex items-center justify-center">
                        <Banknote className="h-7 w-7 text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold">Refund & Cancellation Policy</h1>
                        <p className="text-muted-foreground">Effective Date: [Current Date]</p>
                    </div>
                </div>

                <div className="space-y-8">
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500 text-sm font-bold">1</span>
                                Subscriptions & Course Fees
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                All subscriptions and course enrollment fees are final and non-refundable unless stated otherwise during the checkout process. In the event of a duplicate payment or technical error during transaction processing, a full refund for the duplicated amount will be initiated within 7-10 business days.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500 text-sm font-bold">2</span>
                                Cancellations
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                You may cancel your subscription at any time to prevent future billing. Cancellation does not entitle you to a refund for the current billing cycle. Access to premium features will continue until the end of your paid period.
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
