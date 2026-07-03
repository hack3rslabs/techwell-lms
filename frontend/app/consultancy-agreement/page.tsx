"use client"

import Link from 'next/link'
import { FileSignature, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function ConsultancyAgreementPage() {
    return (
        <div className="min-h-screen py-20">
            <div className="container max-w-4xl">
                <div className="flex items-center gap-4 mb-12">
                    <div className="h-14 w-14 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                        <FileSignature className="h-7 w-7 text-cyan-500" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold">Recruitment Consultancy Agreement</h1>
                        <p className="text-muted-foreground">Effective Date: [Current Date]</p>
                    </div>
                </div>

                <div className="space-y-8">
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-500 text-sm font-bold">1</span>
                                Consultancy Services
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Techwell offers dedicated Recruitment Consultancy services to assist candidates in securing employment. By opting into this service, you authorize Techwell to represent you, optimize your profile, and submit your resume to prospective employers within our network.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-500 text-sm font-bold">2</span>
                                Fee Structure (If Applicable)
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Depending on the tier of service selected, Recruitment Consultancy may involve a one-time enrollment fee or an Income Share Agreement (ISA). Details of any financial obligations will be explicitly stated and agreed upon in a separate addendum prior to the commencement of consultancy services.
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
