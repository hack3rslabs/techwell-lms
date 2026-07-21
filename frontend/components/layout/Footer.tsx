"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Mail, MapPin, Phone, Instagram, Linkedin, Youtube, ExternalLink, Star, ArrowRight, ChevronRight, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import api from "@/lib/api"

const platformLinks = [
    { label: 'Browse Courses', href: '/courses' },
    { label: 'Community Forum', href: '/community' },
    { label: "AI Interview Prep", href: "/interviews" },
    { label: "Resume Builder", href: "/resume-builder" },
    { label: "Jobs & Placements", href: "/jobs" },
    { label: "Career Guide", href: "/career-guide" },
    { label: "Final Year Projects", href: "/projects" },
    { label: "Student Verification", href: "/verify" },
    { label: 'Employer Hiring', href: '/employer' },
]

const companyLinks = [
    { label: "About Us", href: "/about" },
    { label: "Events & Webinars", href: "/events" },
    { label: "Services", href: "/services" },
    { label: "Products", href: "/products" },
    { label: "Our Partners", href: "/our-partners" },
    { label: "Partner Colleges", href: "/colleges" },
    { label: "Client Stories", href: "/clients" },
    { label: "Blog", href: "/blog" },
    { label: "Become a Franchise", href: "/franchise-request" },
]

const policyLinks = [
    { label: "Contact Us", href: "/contact" },
    { label: "Support Center", href: "/support" },
    { label: "Privacy Policy", href: "/help/privacy" },
    { label: "Terms & Conditions", href: "/help/terms" },
    { label: "Cookies", href: "/help/cookies" },
    { label: "GDPR", href: "/help/gdpr" },
]

export function Footer() {
    const pathname = usePathname()

    const [email, setEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [settings, setSettings] = useState<any>(null)

    useEffect(() => {
        api.get('/settings/public').then(res => setSettings(res.data)).catch(console.error)
    }, [])

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return
        setIsSubmitting(true)
        try {
            const res = await api.post('/admin/marketing/newsletter/subscribe', { email })
            if (res.data.success) {
                toast.success(res.data.message || "Subscribed successfully!")
                setEmail("")
            } else {
                toast.error(res.data.message || "Failed to subscribe")
            }
        } catch (err) {
            toast.error("An error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (pathname?.startsWith("/admin")) {
        return null
    }

    const finalCompanyLinks = [...companyLinks]
    if (settings?.showAffiliate && settings?.affiliateUrl) {
        finalCompanyLinks.push({ 
            label: settings.affiliateTitle || 'Affiliate Program', 
            href: settings.affiliateUrl 
        })
    }

    return (
        <footer className="mt-auto relative overflow-hidden bg-slate-950 text-slate-300 border-t border-white/10 pt-10 pb-8">
            {/* Ambient Glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

            <div className="container relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                
                {/* Newsletter Subscription Banner */}
                <div className="relative group overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-8 mb-10 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
                        <div className="flex-1 space-y-2 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2 border border-indigo-500/30">
                                <Sparkles className="w-3.5 h-3.5" /> Newsletter
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Stay ahead in Tech.</h3>
                            <p className="text-slate-400 text-sm max-w-lg mx-auto lg:mx-0">Get the latest industry insights, career tips, and exclusive course offers delivered directly to your inbox.</p>
                        </div>
                        <div className="w-full max-w-md shrink-0">
                            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full">
                                <Input 
                                    type="email" 
                                    placeholder="Enter your email address" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-black/40 border-white/10 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 text-white placeholder:text-slate-500 h-12 rounded-xl transition-all"
                                    required
                                />
                                <Button type="submit" disabled={isSubmitting} className="h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all font-semibold">
                                    {isSubmitting ? "Wait..." : "Subscribe"}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 mb-10">
                    {/* Column 1: Brand & Socials */}
                    <div className="space-y-5 lg:col-span-1">
                        <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
                            <Image
                                src="/logo-dark.png"
                                alt="Techwell"
                                width={140}
                                height={38}
                                className="object-contain"
                            />
                        </Link>

                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                            Techwell empowers global businesses with elite IT Services, bridging the talent gap through Corporate Training.
                        </p>

                        <div className="flex gap-3 pt-2">
                            <a href="https://www.instagram.com/techwell_official/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#E1306C] hover:border-transparent transition-all shadow-lg hover:shadow-[#E1306C]/30 hover:-translate-y-1">
                                <Instagram className="h-4 w-4" />
                            </a>
                            <a href="https://www.linkedin.com/in/techwell-it" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#0077B5] hover:border-transparent transition-all shadow-lg hover:shadow-[#0077B5]/30 hover:-translate-y-1">
                                <Linkedin className="h-4 w-4" />
                            </a>
                            <a href="https://www.youtube.com/@techwellInstitutes/featured" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#FF0000] hover:border-transparent transition-all shadow-lg hover:shadow-[#FF0000]/30 hover:-translate-y-1">
                                <Youtube className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Reach Us */}
                    <div className="space-y-5 lg:col-span-1 flex flex-col h-full">
                        <h4 className="mb-1 text-sm font-bold tracking-widest text-white uppercase opacity-90">Reach Us</h4>
                        
                        <div className="grid gap-4 text-sm text-slate-300">
                            <a href="mailto:info@techwell.co.in" className="flex items-center gap-3 hover:text-white group transition-colors">
                                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:border-indigo-500/50 transition-all">
                                    <Mail className="h-3.5 w-3.5 text-indigo-400 group-hover:text-indigo-300" />
                                </div>
                                <span className="font-medium">info@techwell.co.in</span>
                            </a>
                            <a href="tel:+917997473473" className="flex items-center gap-3 hover:text-white group transition-colors">
                                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-teal-500/20 group-hover:border-teal-500/50 transition-all">
                                    <Phone className="h-3.5 w-3.5 text-teal-400 group-hover:text-teal-300" />
                                </div>
                                <span className="font-medium">+91 7997473473</span>
                            </a>
                            <div className="flex items-start gap-3 group">
                                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-rose-500/20 group-hover:border-rose-500/50 transition-all shrink-0">
                                    <MapPin className="h-3.5 w-3.5 text-rose-400 group-hover:text-rose-300" />
                                </div>
                                <span className="leading-snug pt-1 font-medium">India-based training and enterprise services</span>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex flex-col gap-2.5 pt-3">
                            <a href="https://share.google/hEEd5G027yQXanCDt" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between p-2.5 rounded-xl border border-white/10 bg-black/20 hover:bg-white/5 hover:border-white/20 transition-all shadow-md w-full max-w-[200px]">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded bg-white p-1 flex items-center justify-center shrink-0">
                                        <svg viewBox="0 0 24 24" className="w-full h-full"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 group-hover:text-white transition-colors">Google</span>
                                </div>
                                <div className="flex text-amber-500 drop-shadow-sm">
                                    <Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" />
                                </div>
                            </a>
                            <a href="https://www.justdial.com/Srikakulam/Techwell-It-Solutions-Opposite-Psnmh-Schoolabove-Andhra-Bank-Atm-O-Arasavilli/9999P8942-8942-161117181501-G1M1_BZDET" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between p-2.5 rounded-xl border border-white/10 bg-black/20 hover:bg-white/5 hover:border-white/20 transition-all shadow-md w-full max-w-[200px]">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 group-hover:text-white transition-colors ml-1">Justdial</span>
                                </div>
                                <div className="flex text-amber-500 drop-shadow-sm">
                                    <Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" />
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Columns 3, 4, 5: Links */}
                    <FooterLinkGroup title="Platform" links={platformLinks} />
                    <FooterLinkGroup title="Company" links={finalCompanyLinks} />
                    <FooterLinkGroup title="Support" links={policyLinks} />
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
                    <p>© {new Date().getFullYear()} Techwell. All rights reserved. Crafted with precision.</p>
                    <a href="https://elearnstack.com" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1.5 hover:text-white transition-colors py-1 px-3 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20">
                        <span>Explore Elearnstack Platform</span>
                        <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-white transition-colors" />
                    </a>
                </div>
            </div>
        </footer>
    )
}

function FooterLinkGroup({
    title,
    links,
}: {
    title: string
    links: Array<{ label: string; href: string }>
}) {
    return (
        <div className="flex flex-col h-full">
            <h4 className="mb-5 text-sm font-bold tracking-widest text-white uppercase opacity-90">{title}</h4>
            <ul className="space-y-2.5 text-sm">
                {links.map((link) => (
                    <li key={link.label}>
                        <Link href={link.href} className="group inline-flex items-center text-slate-400 transition-all hover:text-white">
                            <ChevronRight className="w-3.5 h-3.5 opacity-0 -ml-4 mr-1 group-hover:opacity-100 group-hover:ml-0 transition-all text-indigo-400" />
                            <span>{link.label}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}
