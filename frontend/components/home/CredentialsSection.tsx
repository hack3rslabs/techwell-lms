"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Shield, Award, BadgeCheck } from "lucide-react"

const trustLogos = [
    { name: "PMEGP (KVIC)", src: "/images/trust/PM-Employment-Generation-Program.webp", width: 140, height: 70 },
    { name: "UCO Bank", src: "/images/trust/uco bank logo.png", width: 140, height: 70 },
    { name: "Skill India", src: "/images/trust/skillindia.png", width: 140, height: 70 },
    { name: "NCS", src: "/images/trust/ministry-of-labour-NCS.svg", width: 140, height: 70 },
    { name: "MSME", src: "/images/trust/msme.png", width: 140, height: 70 },
    { name: "ISO", src: "/images/trust/iso.png", width: 100, height: 100 },
]

export function CredentialsSection() {
    return (
        <section className="py-20 bg-gradient-to-b from-primary/5 via-background to-background border-y border-primary/10">
            <div className="container px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center space-y-6 mb-12"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                            <Shield className="h-4 w-4 text-primary" />
                            <span className="text-sm font-bold uppercase tracking-widest text-primary">
                                Trusted & Verified
                            </span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                            Government Recognized &{" "}
                            <span className="text-primary">Nationally Certified</span>
                        </h2>

                        <div className="max-w-3xl mx-auto space-y-4">
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Techwell is a <strong className="text-foreground">PMEGP (Prime Minister&apos;s Employment Generation Programme)</strong> by <strong className="text-foreground">KVIC</strong> and sponsored by <strong className="text-foreground">UCO Bank</strong>,
                                Srikakulam.
                            </p>
                            <p className="text-base text-muted-foreground">
                                Certified under <strong className="text-foreground">MSME & ISO 9001:2015</strong>, and registered with <strong className="text-foreground">Skill India & NCS</strong>.
                                We don&apos;t just teach—we build careers backed by national recognition.
                            </p>
                        </div>
                    </motion.div>

                    {/* Logos Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl blur-3xl" />

                        <div className="relative bg-card/80 backdrop-blur-sm border border-primary/20 rounded-2xl p-8 md:p-12 shadow-xl">
                            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
                                {trustLogos.map((logo, index) => (
                                    <motion.div
                                        key={logo.name}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ scale: 1.15, y: -5 }}
                                        className="group relative flex items-center justify-center cursor-pointer"
                                    >
                                        {/* Glow effect on hover */}
                                        <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        <div className="relative h-16 w-28 md:h-20 md:w-36 bg-background/50 rounded-lg p-3 border border-transparent group-hover:border-primary/30 group-hover:bg-primary/5 transition-all duration-300">
                                            <Image
                                                src={logo.src}
                                                alt={`${logo.name} Logo`}
                                                fill
                                                className="object-contain transition-all duration-300 group-hover:brightness-110"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    const parent = target.parentElement;
                                                    if (parent) {
                                                        parent.classList.add('flex', 'items-center', 'justify-center', 'border-2', 'border-dashed', 'border-primary/30', 'rounded-lg', 'bg-primary/5');
                                                        parent.innerHTML = `<span class="text-xs font-bold text-primary text-center p-3">${logo.name}</span>`;
                                                    }
                                                }}
                                            />
                                        </div>

                                        {/* Tooltip on hover */}
                                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                                            <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md shadow-lg">
                                                <span className="text-xs font-semibold whitespace-nowrap">
                                                    {logo.name}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Project Completion Badge */}
                            <div className="mt-10 pt-8 border-t border-primary/10">
                                <div className="flex items-center justify-center gap-2 text-center">
                                    <BadgeCheck className="h-5 w-5 text-primary flex-shrink-0" />
                                    <p className="text-sm font-semibold text-foreground">
                                        PMEGP (KVIC) Funded & UCO Bank Sponsored
                                    </p>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 text-center">
                                    Project Period: 2018–2022 — Successfully Completed
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-wrap justify-center gap-4 mt-12"
                    >
                        <Button asChild size="lg" className="shadow-lg shadow-primary/20">
                            <Link href="/about">
                                <Award className="mr-2 h-4 w-4" />
                                Learn More About Us
                            </Link>
                        </Button>
                        <Button variant="outline" size="lg" asChild>
                            <Link href="/contact">Contact Support</Link>
                        </Button>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
