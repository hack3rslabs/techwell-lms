"use client"
import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, Twitter, Linkedin, Youtube, Github, Instagram, ExternalLink } from 'lucide-react'

export function Footer() {
    const [year, setYear] = React.useState(2024)
    const [images, setImages] = React.useState<any[]>([])

    const fetchGallery = async () => {
        try {
            const res = await fetch('/api/admin/gallery')
            const data = await res.json()
            if (Array.isArray(data)) {
                setImages(data.slice(0, 6)) // Show top 6
            }
        } catch (error) {
            console.error('Failed to fetch gallery', error)
        }
    }

    React.useEffect(() => {
        setYear(new Date().getFullYear())
        fetchGallery()
    }, [])

    return (
        <footer className="bg-muted/50 border-t mt-auto">
            <div className="container py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <Image
                                src="/logo-light.png"
                                alt="TechWell"
                                width={120}
                                height={35}
                                className="dark:hidden"
                            />
                            <Image
                                src="/logo-dark.png"
                                alt="TechWell"
                                width={120}
                                height={35}
                                className="hidden dark:block"
                            />
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            AI-powered learning and interview preparation platform.
                            Launch your tech career with confidence.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://www.instagram.com/techwell_official/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a href="#" aria-label="YouTube" className="text-muted-foreground hover:text-primary transition-colors">
                                <Youtube className="h-5 w-5" />
                            </a>
                            <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Explore */}
                    <div>
                        <h4 className="font-semibold mb-4">Explore</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/courses" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Browse Courses
                                </Link>
                            </li>
                            <li>
                                <Link href="/projects" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Projects Market
                                </Link>
                            </li>
                            <li>
                                <Link href="/interviews" className="text-muted-foreground hover:text-foreground transition-colors">
                                    AI Interview Prep
                                </Link>
                            </li>
                            <li>
                                <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Plans & Pricing
                                </Link>
                            </li>
                            <li>
                                <Link href="/skillcast" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Skillcast Episodes
                                </Link>
                            </li>
                            <li>
                                <Link href="/career-guide" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Career Guide
                                </Link>
                            </li>
                            <li>
                                <Link href="/student/library" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Library
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/social-service" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Social Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/jobs" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Careers
                                </Link>
                            </li>
                            <li>
                                <Link href="/for-colleges" className="text-primary hover:text-primary/80 transition-colors font-medium">
                                    For Colleges
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <a href="https://elearnstack.com/daily_news" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Daily Updates
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact & Legal */}
                    <div>
                        <h4 className="font-semibold mb-4">Contact & Support</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4 mt-1 shrink-0" />
                                <a
                                    href="https://www.google.com/maps/place/Techwell(Twiis+Innovations)/@18.2899025,83.9033944,17z/data=!3m1!4b1!4m6!3m5!1s0x3a3c1517a45fc9e1:0x39c24e2311f003a!8m2!3d18.2899025!4d83.9033944!16s%2Fg%2F11c2j7m7xv?entry=ttu&g_ep=EgoyMDI2MDIxMS4wIKXMDSoASAFQAw%3D%3D"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary transition-colors leading-tight"
                                >
                                    Techwell HQ, Srikakulam<br />
                                    Andhra Pradesh, India
                                </a>
                            </li>
                            <li className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-4 w-4 shrink-0" />
                                +91 7997473473
                            </li>
                            <li className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4 shrink-0" />
                                <span className="break-all">support@techwell.co.in</span>
                            </li>
                            <li className="pt-2 border-t mt-2">
                                <Link href="/help" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                                    <ExternalLink className="h-3 w-3" /> Help Center
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                    Privacy Policy
                                </Link>
                                <span className="text-muted-foreground mx-2">•</span>
                                <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                    Terms
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Gallery */}
                    <div>
                        <h4 className="font-semibold mb-4">Gallery</h4>
                        <div className="grid grid-cols-3 gap-2">
                            {images.length > 0 ? (
                                images.map((image, i) => (
                                    <div key={image.id} className="aspect-square relative rounded-md overflow-hidden bg-muted/80 hover:opacity-80 transition-opacity cursor-pointer border">
                                        <Image
                                            src={image.url}
                                            alt={image.caption || "Gallery"}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))
                            ) : (
                                [...Array(6)].map((_, i) => (
                                    <div key={i} className="aspect-square relative rounded-md overflow-hidden bg-muted/80 border">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Image
                                                src="/logo-dark.png"
                                                alt="Gallery"
                                                fill
                                                className="object-cover opacity-20"
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                            Follow us on <a href="https://www.instagram.com/techwell_official/" className="text-primary hover:underline">Instagram</a>
                        </p>
                    </div>
                </div>

                <div className="border-t mt-12 pt-8 flex flex-col items-center gap-4 text-sm text-muted-foreground">
                    <p className="text-center font-medium">&copy; {new Date().getFullYear()} Techwell. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
