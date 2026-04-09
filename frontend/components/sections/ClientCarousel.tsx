"use client"

import * as React from 'react'

const clients = [
    'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Infosys', 'TCS', 'Wipro',
    'Accenture', 'Deloitte', 'Goldman Sachs', 'JP Morgan', 'Adobe', 'Netflix',
    'Uber', 'Flipkart', 'Swiggy', 'Razorpay', 'Paytm', 'Juspay'
]

export function ClientCarousel() {
    return (
        <section className="py-12 bg-muted/30 overflow-hidden">
            <div className="container mb-8 text-center">
                <h2 className="text-xl font-semibold text-muted-foreground">
                    Trusted by Leading Organizations
                </h2>
            </div>

            {/* Infinite Scroll Container */}
            <div className="relative">
                <div className="flex animate-scroll">
                    {/* First set */}
                    {clients.map((client, idx) => (
                        <div
                            key={`first-${idx}`}
                            className="flex-shrink-0 mx-8 px-6 py-3 bg-background rounded-lg shadow-sm border"
                        >
                            <span className="text-lg font-semibold text-muted-foreground whitespace-nowrap">
                                {client}
                            </span>
                        </div>
                    ))}
                    {/* Duplicate set for seamless loop */}
                    {clients.map((client, idx) => (
                        <div
                            key={`second-${idx}`}
                            className="flex-shrink-0 mx-8 px-6 py-3 bg-background rounded-lg shadow-sm border"
                        >
                            <span className="text-lg font-semibold text-muted-foreground whitespace-nowrap">
                                {client}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
        </section>
    )
}
