"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Mail, MapPin, Phone, Instagram, Linkedin, Youtube, ExternalLink, Star, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "react-hot-toast"
import api from "@/lib/api"

const platformLinks = [
    { label: "Browse Courses", href: "/courses" },
    { label: "AI Interview Prep", href: "/interviews" },
    { label: "Resume Builder", href: "/resume-builder" },
    { label: "Jobs & Placements", href: "/jobs" },
    { label: "Career Guide", href: "/career-guide" },
    { label: "Student Verification", href: "/verify" },
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

    return (
        <footer className="mt-auto border-t border-border/60 bg-[linear-gradient(180deg,rgba(20,105,226,0.05),rgba(255,255,255,0))]">
            <div className="container py-14">
                                {/* Newsletter Subscription Banner */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-12 mb-12 border-b border-border/60">
                    <div className="flex-1 space-y-1 text-center md:text-left">
                        <h3 className="text-xl font-bold tracking-tight text-foreground">Subscribe to our Newsletter</h3>
                        <p className="text-muted-foreground text-sm">Get the latest insights, updates, and offers delivered directly to your inbox.</p>
                    </div>
                    <div className="w-full max-w-md shrink-0">
                        <form onSubmit={handleSubscribe} className="flex gap-2 w-full">
                            <Input 
                                type="email" 
                                placeholder="Enter your email address" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-background/50 border-border/60 focus:border-primary flex-1"
                                required
                            />
                            <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 px-6">
                                {isSubmitting ? "Subscribing..." : "Subscribe"}
                            </Button>
                        </form>
                    </div>
                </div>

                                <div className="grid gap-8 lg:grid-cols-5">
                    {/* Column 1: Brand & Socials */}
                    <div className="space-y-5 lg:col-span-1">
                        <Link href="/" className="relative flex h-10 w-[156px] items-center">
                            <Image
                                src="/logo-light.png"
                                alt="Techwell"
                                width={156}
                                height={42}
                                className="object-contain object-left dark:hidden"
                            />
                            <Image
                                src="/logo-dark.png"
                                alt="Techwell"
                                width={156}
                                height={42}
                                className="hidden object-contain object-left dark:block"
                            />
                        </Link>

                        <p className="text-muted-foreground text-sm max-w-sm">
                            Techwell empowers global businesses with elite IT Services & Software Solutions, while bridging the industry talent gap through Corporate Training.
                        </p>

                        <div className="flex gap-3 pt-2">
                            <a href="https://www.instagram.com/techwell_official/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-full border border-border/70 p-2 text-muted-foreground transition-colors hover:text-primary">
                                <Instagram className="h-4 w-4" />
                            </a>
                            <a href="https://www.linkedin.com/in/techwell-it" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="rounded-full border border-border/70 p-2 text-muted-foreground transition-colors hover:text-primary">
                                <Linkedin className="h-4 w-4" />
                            </a>
                            <a href="https://www.youtube.com/@techwellInstitutes/featured" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="rounded-full border border-border/70 p-2 text-muted-foreground transition-colors hover:text-primary">
                                <Youtube className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Contact & Badges */}
                    <div className="space-y-5 lg:col-span-1">
                        <h4 className="mb-4 text-sm font-semibold tracking-wide text-foreground">Reach Us</h4>
                        <div className="grid gap-3 text-sm text-muted-foreground">
                            <a href="mailto:info@techwell.co.in" className="flex items-center gap-2 hover:text-foreground transition-colors">
                                <Mail className="h-4 w-4 text-primary shrink-0" />
                                <span>info@techwell.co.in</span>
                            </a>
                            <a href="tel:+917997473473" className="flex items-center gap-2 hover:text-foreground transition-colors">
                                <Phone className="h-4 w-4 text-primary shrink-0" />
                                <span>+91 7997473473</span>
                            </a>
                            <div className="flex items-start gap-2">
                                <MapPin className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                                <span className="leading-snug">India-based training and enterprise technology services</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                            <a href="https://share.google/hEEd5G027yQXanCDt" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/50 transition-colors w-full max-w-[200px]">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Google</span>
                                <div className="flex text-amber-500">
                                    <Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" />
                                </div>
                            </a>
                            <a href="https://www.justdial.com/Srikakulam/Techwell-It-Solutions-Opposite-Psnmh-Schoolabove-Andhra-Bank-Atm-O-Arasavilli/9999P8942-8942-161117181501-G1M1_BZDET" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/50 transition-colors w-full max-w-[200px]">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Justdial</span>
                                <div className="flex text-amber-500">
                                    <Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" />
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Columns 3, 4, 5: Links */}
                    <FooterLinkGroup title="Platform" links={platformLinks} />
                    <FooterLinkGroup title="Company" links={companyLinks} />
                    <FooterLinkGroup title="Support" links={policyLinks} />
                </div>

                <div className="mt-10 flex flex-col gap-3 border-t border-border/60 pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                    <p>© 2015 to {new Date().getFullYear()} Techwell. All rights reserved.</p>
                    <a href="https://elearnstack.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                        <span>Explore Elearnstack</span>
                        <ExternalLink className="h-3.5 w-3.5" />
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
        <div>
            <h4 className="mb-4 text-sm font-semibold tracking-wide text-foreground">{title}</h4>
            <ul className="space-y-3 text-sm">
                {links.map((link) => (
                    <li key={link.href}>
                        <Link href={link.href} className="text-muted-foreground transition-colors hover:text-foreground">
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}
