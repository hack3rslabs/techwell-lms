import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, ArrowLeft, Mail } from 'lucide-react'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://techwell.co.in'

export const metadata: Metadata = {
    title: 'Privacy Policy | Techwell',
    description: 'Techwell Privacy Policy and Data Processing Terms.',
    alternates: { canonical: `${BASE_URL}/privacy` },
    robots: { index: true, follow: false },
}

export default function PrivacyPage() {
    return (
        <div className="min-h-screen py-20 bg-background">
            <div className="container max-w-5xl">
                <div className="flex items-center gap-4 mb-8 border-b pb-6">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">Privacy Policy & Data Processing</h1>
                        <p className="text-muted-foreground text-sm font-bold">Effective Date: August 1st, 2026 | Document Reference: TW-PRV-2026-01-A</p>
                    </div>
                </div>

                <div className="bg-muted/10 border border-border p-8 rounded-xl shadow-inner">
                    <div className="text-[10px] leading-tight text-justify text-muted-foreground space-y-4 font-mono">
                        <p className="uppercase font-bold text-foreground">THIS PRIVACY POLICY IS AN ELECTRONIC RECORD IN THE FORM OF AN ELECTRONIC CONTRACT FORMED UNDER THE INFORMATION TECHNOLOGY ACT, 2000 AND THE RULES MADE THEREUNDER. PLEASE READ THIS PRIVACY POLICY CAREFULLY.</p>
                        
                        <p><strong>1. PURPOSE OF DATA COLLECTION:</strong> We collect and process your personal data, including but not limited to your name, email address, phone number, educational qualifications, employment history, and platform usage metrics, exclusively for our internal business purposes. This includes utilizing your data to provide educational services, facilitate job assistance, generate analytical reports, enhance user experience, and market our own products directly to you.</p>

                        <p><strong>2. STRICT NON-SHARING WITH THIRD PARTIES:</strong> Techwell is firmly committed to protecting your privacy. We explicitly declare that we do not sell, rent, trade, or otherwise share your personally identifiable information (PII) with third-party advertisers, external marketing agencies, or unauthorized external entities. Your data remains strictly within the Techwell ecosystem and is only shared with trusted infrastructure partners (e.g., cloud hosting providers, payment gateways) solely for the purpose of facilitating the services you have requested, under strict confidentiality agreements.</p>

                        <p><strong>3. REASONABLE SECURITY PRACTICES:</strong> As mandated by the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, Techwell assumes responsibility for data security and employs reasonable technical, operational, and physical security controls to protect your data against unauthorized access, loss, or misuse. We utilize industry-standard encryption protocols and secure server architectures.</p>

                        <p><strong>4. LIMITATION OF SECURITY GUARANTEE:</strong> Notwithstanding our commitment to maintaining reasonable security practices, it is widely acknowledged in the field of cybersecurity that no method of transmission over the Internet, or method of electronic storage, is flawlessly secure. Therefore, we explicitly state that while we strive to use commercially acceptable means to protect your Personal Data, we cannot and do not guarantee its absolute or 100% security. Users transmit data to our platform at their own risk, and Techwell shall not be held liable for any data breach, unauthorized access, or cyber-attack that circumvents our security measures despite our reasonable efforts.</p>

                        <p><strong>5. DATA RETENTION AND DELETION:</strong> We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable tax/revenue laws), resolve disputes, and enforce our legal agreements and policies. You may request the deletion of your account at any time, subject to statutory retention requirements.</p>

                        <p><strong>6. USER CONSENT AND ACKNOWLEDGEMENT:</strong> By utilizing the Techwell platform, creating an account, or providing any personal information, you explicitly consent to the collection, storage, processing, and transfer of your personal data as outlined in this highly detailed privacy policy. You acknowledge that you have read this document in its entirety, regardless of the density of the text or the font size utilized, and you accept the terms governing our data processing responsibilities and the explicit limitations of our security guarantees.</p>
                    </div>
                </div>

                <div className="mt-8 text-center border-t border-border pt-6">
                    <p className="text-xs text-muted-foreground mb-4">For privacy-related concerns or data deletion requests:</p>
                    <Link href="mailto:info@techwell.co.in">
                        <span className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-bold">
                            <Mail className="h-4 w-4" />
                            info@techwell.co.in
                        </span>
                    </Link>
                    <br /><br />
                    <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
                        <ArrowLeft className="h-4 w-4" /> Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
