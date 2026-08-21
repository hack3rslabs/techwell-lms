"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Youtube } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import api from "@/lib/api";
import Image from "next/image";

export function ShopFooter() {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        api.get('/settings/public').then(res => setSettings(res.data)).catch(console.error);
    }, []);

    const addressStr = useMemo(() => {
        if (settings?.address) {
            try {
                const parsed = JSON.parse(settings.address);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed[0].city + (parsed[0].state ? `, ${parsed[0].state}` : '');
                return settings.address;
            } catch (e) {
                return settings.address;
            }
        }
        return "123 Tech Park, Innovation Hub, Bangalore 560001";
    }, [settings?.address]);

    return (
        <footer className="bg-zinc-950 text-zinc-300 pt-16 pb-8 border-t border-zinc-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    
                    {/* Brand Col */}
                    <div>
                        <Link href="/shop" className="flex items-center gap-2 mb-6 hover:opacity-90 transition-opacity">
                            {settings?.logo ? (
                                <Image
                                    src={settings.logo}
                                    alt="Techwell"
                                    width={140}
                                    height={38}
                                    className="object-contain"
                                />
                            ) : (
                                <span className="font-bold text-2xl tracking-tight text-white">
                                    Techwell<span className="text-primary">Shop</span>
                                </span>
                            )}
                        </Link>
                        <p className="text-sm leading-relaxed mb-6">
                            Your one-stop destination for premium tech gear, student discounts, and exclusive learning resources.
                        </p>
                        <div className="flex gap-4">
                            {settings?.socialLinks ? (
                                <>
                                    {settings.socialLinks.facebook && <Link href={settings.socialLinks.facebook} className="hover:text-primary transition-colors" target="_blank"><Facebook className="h-5 w-5" /></Link>}
                                    {settings.socialLinks.twitter && <Link href={settings.socialLinks.twitter} className="hover:text-primary transition-colors" target="_blank"><Twitter className="h-5 w-5" /></Link>}
                                    {settings.socialLinks.instagram && <Link href={settings.socialLinks.instagram} className="hover:text-primary transition-colors" target="_blank"><Instagram className="h-5 w-5" /></Link>}
                                    {settings.socialLinks.linkedin && <Link href={settings.socialLinks.linkedin} className="hover:text-primary transition-colors" target="_blank"><Linkedin className="h-5 w-5" /></Link>}
                                    {settings.socialLinks.youtube && <Link href={settings.socialLinks.youtube} className="hover:text-primary transition-colors" target="_blank"><Youtube className="h-5 w-5" /></Link>}
                                </>
                            ) : (
                                <>
                                    <Link href="#" className="hover:text-primary transition-colors"><Facebook className="h-5 w-5" /></Link>
                                    <Link href="#" className="hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></Link>
                                    <Link href="#" className="hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></Link>
                                    <Link href="#" className="hover:text-primary transition-colors"><Linkedin className="h-5 w-5" /></Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Links Col 1 */}
                    <div>
                        <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Shop</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/shop/search?category=laptops" className="hover:text-white transition-colors">Laptops & PCs</Link></li>
                            <li><Link href="/shop/search?category=accessories" className="hover:text-white transition-colors">Accessories</Link></li>
                            <li><Link href="/shop/search?category=courses" className="hover:text-white transition-colors">Premium Courses</Link></li>
                            <li><Link href="/shop/search?hasStudentOffer=true" className="hover:text-white transition-colors">Student Offers</Link></li>
                        </ul>
                    </div>

                    {/* Links Col 2 */}
                    <div>
                        <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Support</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/shop/orders" className="hover:text-white transition-colors">Track Order</Link></li>
                            <li><Link href="/returns" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
                            <li><Link href="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Contact Col */}
                    <div>
                        <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Contact</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex gap-3">
                                <MapPin className="h-5 w-5 text-primary shrink-0" />
                                <span>{addressStr}</span>
                            </li>
                            <li className="flex gap-3 items-center">
                                <Phone className="h-5 w-5 text-primary shrink-0" />
                                <span>{settings?.phone || "+91 98765 43210"}</span>
                            </li>
                            <li className="flex gap-3 items-center">
                                <Mail className="h-5 w-5 text-primary shrink-0" />
                                <span>{settings?.email || "support@techwell.co.in"}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
                    <p>&copy; {new Date().getFullYear()} {settings?.siteName || "Techwell Inc."} All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/help/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/help/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
