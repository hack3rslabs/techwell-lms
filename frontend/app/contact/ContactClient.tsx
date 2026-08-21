"use client"

import * as React from 'react'
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react'
import { leadApi } from '@/lib/api'

const defaultLocations = [
    {
        id: 'vijayawada',
        city: 'Vijayawada',
        title: 'Business & Consultation Workspace',
        address: 'Flat No. F.F.A, Mallika Apartments, M.G. Road, Opp. D.V. Manor, Beside Sundaram Honda, Vijayawada – 520010, Andhra Pradesh.',
        phone: '+91 79974 73473',
        email: 'support@techwell.co.in',
    },
    {
        id: 'srikakulam',
        city: 'Srikakulam',
        title: 'Business & Consultation Workspace',
        address: 'Opp. SBI, Arasavalli Road, Ambedkar Junction, Srikakulam – 532001, Andhra Pradesh.',
        phone: '+91 79974 73473',
        email: 'support@techwell.co.in',
    }
]

const inquiryTypes = [
    { value: 'it-solutions', label: 'Software & IT Solutions' },
    { value: 'training', label: 'Course & Corporate Training' },
    { value: 'ai-interview-prep', label: 'AI Interview & Placements' },
    { value: 'general', label: 'General Enquiry' },
]

export default function ContactClient() {
    const [formData, setFormData] = React.useState({
        name: '', email: '', phone: '',
        inquiryType: 'general', subject: '', message: '',
    })
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [isSubmitted, setIsSubmitted] = React.useState(false)
    const [locations, setLocations] = React.useState(defaultLocations)

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/settings/public`)
                if (res.ok) {
                    const data = await res.json()
                    if (data.address) {
                        try {
                            const parsed = JSON.parse(data.address)
                            if (Array.isArray(parsed) && parsed.length > 0) setLocations(parsed)
                        } catch (e) {}
                    }
                }
            } catch (err) {}
        }
        fetchSettings()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await leadApi.capture(formData)
            setIsSubmitted(true)
            setFormData({ name: '', email: '', phone: '', inquiryType: 'general', subject: '', message: '' })
        } catch {
            alert('Failed to submit. Please try again or reach us directly via email.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen font-sans py-12 lg:py-24" style={{ backgroundColor: '#0d1b3e', backgroundImage: 'radial-gradient(circle at top right, #1469E2 0%, transparent 40%)' }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
                        Contact Us
                    </h1>
                    <p className="text-blue-100 text-lg">
                        Have a question or need assistance? Select a service below and fill out the form. Our specialists will reach out shortly!
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Left: Contact Form */}
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 md:p-10 text-white">
                        <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
                        {isSubmitted ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Message Received!</h3>
                                <p className="text-blue-100">Thank you for reaching out. Our team will get back to you shortly.</p>
                                <button 
                                    onClick={() => setIsSubmitted(false)}
                                    className="mt-6 text-blue-400 font-semibold hover:text-blue-300 transition-colors"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-blue-100">Service Required *</label>
                                    <select required value={formData.inquiryType} onChange={e => setFormData({ ...formData, inquiryType: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-white [&>option]:text-slate-900">
                                        {inquiryTypes.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-blue-100">Full Name *</label>
                                        <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-white placeholder-blue-100/50"
                                            placeholder="John Doe" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-blue-100">Email Address *</label>
                                        <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-white placeholder-blue-100/50"
                                            placeholder="john@example.com" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-blue-100">Phone Number (Optional)</label>
                                    <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-white placeholder-blue-100/50"
                                        placeholder="+91 98765 43210" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-blue-100">Message *</label>
                                    <textarea required rows={4} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all resize-none text-white placeholder-blue-100/50"
                                        placeholder="How can we help you?" />
                                </div>
                                <button type="submit" disabled={isSubmitting}
                                    className="w-full flex items-center justify-center gap-2 bg-[#1469E2] hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed border border-blue-500">
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    {isSubmitting ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Right: Contact Details */}
                    <div className="space-y-10 text-white pt-4">
                        <div>
                            <h2 className="text-2xl font-bold mb-8">Our Offices</h2>
                            <div className="space-y-8">
                                {locations.map(loc => (
                                    <div key={loc.id} className="flex gap-4">
                                        <div className="w-12 h-12 bg-white/10 text-blue-400 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-1">{loc.city}</h3>
                                            <p className="text-blue-100 text-sm mb-4 leading-relaxed">{loc.address}</p>
                                            <div className="space-y-3">
                                                {loc.phone && (
                                                    <a href={`tel:${loc.phone.replace(/\s+/g, '')}`} className="flex items-center gap-3 text-sm text-blue-100 hover:text-white transition-colors font-medium">
                                                        <Phone className="w-4 h-4 text-blue-400" />
                                                        {loc.phone}
                                                    </a>
                                                )}
                                                {loc.email && (
                                                    <a href={`mailto:${loc.email}`} className="flex items-center gap-3 text-sm text-blue-100 hover:text-white transition-colors font-medium">
                                                        <Mail className="w-4 h-4 text-blue-400" />
                                                        {loc.email}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
