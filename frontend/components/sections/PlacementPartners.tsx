"use client"

import * as React from "react"
import { useState } from "react"
import _Image from "next/image"

const partners = [
    // FAANG & Big Tech
    { name: "Google", domain: "google.com" },
    { name: "Microsoft", domain: "microsoft.com" },
    { name: "Amazon", domain: "amazon.com" },
    { name: "Meta", domain: "meta.com" },
    { name: "Apple", domain: "apple.com" },
    { name: "Netflix", domain: "netflix.com" },

    // Major MNCs & IT Services
    { name: "TCS", domain: "tcs.com" },
    { name: "Infosys", domain: "infosys.com" },
    { name: "Wipro", domain: "wipro.com" },
    { name: "HCL Tech", domain: "hcltech.com" },
    { name: "Tech Mahindra", domain: "techmahindra.com" },
    { name: "Capgemini", domain: "capgemini.com" },
    { name: "Cognizant", domain: "cognizant.com" },
    { name: "Accenture", domain: "accenture.com" },
    { name: "Deloitte", domain: "deloitte.com" },
    { name: "IBM", domain: "ibm.com" },
    { name: "Oracle", domain: "oracle.com" },
    { name: "Cisco", domain: "cisco.com" },

    // Consulting & Staffing (3rd Party)
    { name: "Quess Corp", domain: "quesscorp.com" },
    { name: "Team Computers", domain: "teamcomputers.com" },
    { name: "Outworx", domain: "outworx.com" },
    { name: "Adecco", domain: "adecco.com" },
    { name: "Randstad", domain: "randstad.com" },
    { name: "Manpower", domain: "manpowergroup.com" },
    { name: "Kelly Services", domain: "kellyservices.com" },
    { name: "BlackRock", domain: "blackrock.com" },

    // Finance & Others
    { name: "Goldman Sachs", domain: "goldmansachs.com" },
    { name: "JP Morgan", domain: "jpmorgan.com" },
    { name: "Uber", domain: "uber.com" },
    { name: "Airbnb", domain: "airbnb.com" },
    { name: "Flipkart", domain: "flipkart.com" },
    { name: "Zomato", domain: "zomato.com" },
    { name: "Swiggy", domain: "swiggy.com" },
]

function PartnerLogo({ company }: { company: { name: string; domain: string } }) {
    const [error, setError] = useState(false);

    if (error) {
        return (
            <div className="text-xl font-bold text-muted-foreground whitespace-nowrap px-4 select-none">
                {company.name}
            </div>
        );
    }

    return (
        <_Image
            src={`https://logo.clearbit.com/${company.domain}?size=120`}
            alt={company.name}
            width={120}
            height={48}
            className="h-10 md:h-12 w-auto object-contain"
            onError={() => setError(true)}
        />
    );
}

export function PlacementPartners() {
    // Duplicate for marquee loop
    const marqueePartners = [...partners, ...partners];

    return (
        <div className="relative border-y bg-background/50 backdrop-blur-sm overflow-hidden py-10 group/section">
            <div className="container px-4 md:px-6">
                <div className="text-center mb-10">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">
                        Trusted by 500+ Leading Organizations
                    </p>
                </div>

                <div className="relative flex overflow-hidden group">
                    <div className="flex animate-marquee whitespace-nowrap gap-16 hover:[animation-play-state:paused] items-center">
                        {marqueePartners.map((company, i) => (
                            <div
                                key={`${company.name}-${i}`}
                                className="relative flex flex-col items-center justify-center min-w-[120px] h-[80px] opacity-90 hover:opacity-100 transition-all duration-300 cursor-pointer hover:scale-125 filter hover:drop-shadow-lg"
                                title={company.name}
                            >
                                <PartnerLogo company={company} />
                            </div>
                        ))}
                    </div>

                    {/* Gradient Masks */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10"></div>
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10"></div>
                </div>
            </div>
        </div>
    )
}
