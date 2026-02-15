"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

const trustLogos = [
    { name: "PMEGP (KVIC)", src: "/images/trust/PM-Employment-Generation-Program.webp", width: 120, height: 60 },
    { name: "UCO Bank", src: "/images/trust/uco bank logo.png", width: 120, height: 60 },
    { name: "Skill India", src: "/images/trust/skillindia.png", width: 120, height: 60 },
    { name: "NCS", src: "/images/trust/ministry-of-labour-NCS.svg", width: 120, height: 60 },
    { name: "MSME", src: "/images/trust/msme.png", width: 120, height: 60 },
    { name: "ISO", src: "/images/trust/iso.png", width: 80, height: 80 },
]

export function TrustStrip() {
    return (
        <section className="w-full border-b bg-card/50 py-8">
            <div className="container px-4">
                <div className="flex flex-col items-center justify-center gap-8">
                    <div className="text-center">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">
                            Our Credentials & Recognitions
                        </h2>

                        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
                            {trustLogos.map((logo) => (
                                <div
                                    key={logo.name}
                                    className="group relative flex items-center justify-center grayscale transition-all duration-300 hover:grayscale-0 hover:scale-110"
                                >
                                    <div className="relative h-12 w-24 md:h-16 md:w-32">
                                        <Image
                                            src={logo.src}
                                            alt={`${logo.name} Logo`}
                                            fill
                                            className="object-contain opacity-70 transition-opacity group-hover:opacity-100"
                                            onError={(e) => {
                                                // Fallback for development until logos are uploaded
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const parent = target.parentElement;
                                                if (parent) {
                                                    parent.classList.add('flex', 'items-center', 'justify-center', 'border', 'rounded', 'bg-muted/20');
                                                    parent.innerHTML = `<span class="text-xs font-bold text-muted-foreground text-center p-2">${logo.name}</span>`;
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative mt-4">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-muted" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-background px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">
                                PMEGP (KVIC) Funded & UCO Bank Sponsored | Project Period: 2018–2022 — Successfully Completed
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
