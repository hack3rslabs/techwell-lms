import type { Metadata } from 'next'
import Link from 'next/link'
import { GraduationCap, Users, Award, Target, ArrowRight, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WhyTrust } from '@/components/home/WhyTrust'
import { CredentialsSection } from '@/components/home/CredentialsSection'
import axios from 'axios'
import { Linkedin } from 'lucide-react'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://techwell.co.in'

export const metadata: Metadata = {
    title: 'About Techwell | Transforming Tech Education with AI Since 2015',
    description:
        'Learn about Techwell\'s mission to make world-class tech education accessible. Trusted by 10,000+ students, 95% placement rate, 500+ partner companies. Founded in 2015.',
    keywords: [
        'About Techwell',
        'Tech Education Platform India',
        'AI Learning Company',
        'Techwell History',
        'Tech Career Training',
        'Placement Support India',
    ],
    alternates: { canonical: `${BASE_URL}/about` },
    openGraph: {
        title: 'About Techwell | AI-Powered Tech Education',
        description: 'Discover how Techwell is transforming tech careers across India with AI-driven learning and placement support.',
        url: `${BASE_URL}/about`,
        type: 'website',
        images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630, alt: 'About Techwell' }],
    },
}

const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Techwell',
    url: `${BASE_URL}/about`,
    description: 'Techwell is an AI-powered tech education and career platform founded in 2015.',
    mainEntity: {
        '@type': 'EducationalOrganization',
        name: 'Techwell',
        url: BASE_URL,
        logo: `${BASE_URL}/logo-light.png`,
        foundingDate: '2015',
        description: 'Empowering tech careers through AI-enhanced education, adaptive courses, and placement support.',
        numberOfEmployees: { '@type': 'QuantitativeValue', value: 50 },
        address: { '@type': 'PostalAddress', addressCountry: 'IN' },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            reviewCount: '2500',
        },
    },
}

const stats = [
    { value: '10,000+', label: 'Students Trained' },
    { value: '95%',     label: 'Placement Rate' },
    { value: '500+',    label: 'Partner Companies' },
    { value: '50+',     label: 'Expert Instructors' },
]

const values = [
    { icon: Target,      title: 'Mission-Driven', description: 'Empowering careers through accessible, AI-enhanced education.' },
    { icon: Users,       title: 'Community First', description: 'Building a supportive network of learners and mentors.' },
    { icon: Award,       title: 'Excellence',      description: 'Delivering industry-relevant curriculum with proven outcomes.' },
    { icon: GraduationCap, title: 'Innovation',   description: 'Leveraging AI to personalize every learning journey.' },
]

export default async function AboutPage() {
    let showTeam = false;
    let teamMembers: any[] = [];
    
    try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const [settingsRes, teamRes] = await Promise.all([
            fetch(`${apiBase}/settings/public`, { next: { revalidate: 60 } }).then(res => res.json()),
            fetch(`${apiBase}/team/public`, { next: { revalidate: 60 } }).then(res => res.json())
        ]);
        
        if (settingsRes?.showOurTeam) {
            showTeam = true;
            teamMembers = Array.isArray(teamRes) ? teamRes : [];
        }
    } catch (e) {
        console.error("Failed to load team data:", e);
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
            />
            <div className="min-h-screen">
                {/* Hero */}
                <section className="bg-gradient-to-br from-primary/10 via-background to-purple-500/10 py-20">
                    <div className="container text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border shadow-sm mb-6 animate-fade-in-up">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Techwell Founded in 2015</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            Transforming Tech Education with AI
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                            Techwell is on a mission to make world-class tech education accessible to everyone.
                            Our AI-powered platform adapts to your learning style and prepares you for real-world success.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link href="/courses">
                                <Button size="lg">
                                    Explore Courses
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button variant="outline" size="lg">
                                    Join Free
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Why Choose Techwell */}
                <WhyTrust />

                {/* Credentials Section */}
                <CredentialsSection />

                {/* Stats */}
                <section className="py-16 border-b">
                    <div className="container">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="text-center">
                                    <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Our Comprehensive Services */}
                <section className="py-20 bg-background border-b">
                    <div className="container max-w-5xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Comprehensive Ecosystem</h2>
                            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                                Techwell is more than just an educational platform. We are a fully integrated career and corporate solutions ecosystem. From shaping the minds of tomorrow to securing the enterprise networks of today, our services span the entire spectrum of technological advancement.
                            </p>
                        </div>
                        
                        <div className="space-y-10 text-muted-foreground leading-relaxed text-base md:text-lg">
                            {/* Training */}
                            <div className="bg-card p-8 md:p-10 rounded-3xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm">1</span>
                                    Elite Corporate & Student Training
                                </h3>
                                <p className="mb-4">
                                    At the heart of Techwell lies our foundational pillar: transformative education. We believe that true technological mastery requires more than just reading documentation; it demands hands-on, practical experience guided by industry veterans. Our training programs are meticulously designed to bridge the yawning gap between theoretical academic knowledge and the rigorous demands of the modern corporate environment.
                                </p>
                                <p>
                                    We offer extensive, AI-driven learning paths covering everything from Full-Stack Web Development, Cloud Architecture, and DevOps, to advanced Data Science and Artificial Intelligence algorithms. By simulating real-world agile environments, our students don't just learn syntax—they learn how to engineer scalable systems. Our adaptive learning engine personalizes the curriculum for each student, ensuring that both beginners and advanced professionals can rapidly accelerate their skill sets and become immediately deployable assets for any enterprise.
                                </p>
                            </div>

                            {/* Placement */}
                            <div className="bg-card p-8 md:p-10 rounded-3xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm">2</span>
                                    Dedicated Career Placement Platform
                                </h3>
                                <p className="mb-4">
                                    Education without opportunity is incomplete. This is why Techwell has engineered a robust, end-to-end placement ecosystem designed to connect our highly trained talent pool directly with global MNCs and innovative startups. Our placement services go far beyond simple job board listings. We provide an immersive career preparation experience that includes AI-powered resume parsing and optimization, realistic mock interview simulations with feedback from actual hiring managers, and comprehensive soft-skills coaching.
                                </p>
                                <p>
                                    With a 95% placement rate and a network of over 500 partner companies, we actively match candidates based on company culture, technical requirements, and long-term career trajectories. We host exclusive hiring drives, maintain a dynamic talent database for direct recruiter access, and offer continuous mentorship until our students secure their dream roles. Your success is our ultimate metric.
                                </p>
                            </div>

                            {/* Software Solutions */}
                            <div className="bg-card p-8 md:p-10 rounded-3xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm">3</span>
                                    Enterprise Software Solutions
                                </h3>
                                <p className="mb-4">
                                    Beyond individual empowerment, Techwell serves as a premier technology partner for businesses. We design, develop, and deploy bespoke enterprise software solutions that drive digital transformation and operational efficiency. Whether you need a highly scalable SaaS platform, a comprehensive Enterprise Resource Planning (ERP) system, or a specialized Learning Management System (LMS) for your institution, our engineering teams possess the deep domain expertise required to deliver flawless architecture.
                                </p>
                                <p>
                                    Our products, such as Ledger Book Invoicing and our College Campus Management portals, are built on modern, cloud-native tech stacks ensuring high availability, lightning-fast performance, and intuitive user experiences. We handle the entire software development lifecycle—from initial conceptualization and UX/UI design, to robust backend development, QA testing, and seamless deployment.
                                </p>
                            </div>

                            {/* IT Solutions */}
                            <div className="bg-card p-8 md:p-10 rounded-3xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm">4</span>
                                    Managed IT Solutions & Consulting
                                </h3>
                                <p className="mb-4">
                                    Modern enterprises require resilient and agile IT infrastructure. Techwell provides comprehensive Managed IT Solutions tailored to streamline your business operations. Our services encompass cloud migration strategies across AWS, Azure, and Google Cloud, ensuring your data is accessible, scalable, and cost-effective. We manage infrastructure deployment, automate CI/CD pipelines, and provide round-the-clock technical support and system monitoring.
                                </p>
                                <p>
                                    Our IT consulting arm works closely with stakeholders to audit existing architectures, identify bottlenecks, and implement modernization strategies. By taking the burden of IT management off your shoulders, we allow your core team to focus on strategic business growth while we ensure your technological backbone remains robust, modernized, and uninterrupted.
                                </p>
                            </div>

                            {/* Cyber Security */}
                            <div className="bg-card p-8 md:p-10 rounded-3xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm">5</span>
                                    Advanced Cyber Security Services
                                </h3>
                                <p className="mb-4">
                                    In an era where digital threats are increasingly sophisticated, safeguarding your enterprise data is non-negotiable. Techwell's Cyber Security division offers military-grade protection protocols and proactive threat mitigation strategies. We conduct exhaustive penetration testing, vulnerability assessments, and code-level security audits to identify and patch exploits before they can be weaponized by malicious actors.
                                </p>
                                <p>
                                    Our security framework includes the implementation of Zero Trust architectures, advanced endpoint protection, secure data encryption at rest and in transit, and comprehensive compliance management. We also provide corporate security awareness training, ensuring that your employees are equipped to recognize and neutralize social engineering attempts. With Techwell, your digital assets are fortified by the industry's most rigorous security standards.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Our Story */}
                <section className="py-20">
                    <div className="container">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                                <div className="space-y-4 text-muted-foreground">
                                    <p>
                                        Founded in 2015, Techwell emerged from a simple observation: traditional education
                                        wasn&apos;t keeping pace with the rapidly evolving tech industry. Graduates struggled
                                        to bridge the gap between academic knowledge and job-ready skills.
                                    </p>
                                    <p>
                                        Our founders, having experienced this gap firsthand, set out to create a platform
                                        that combines cutting-edge AI technology with practical, industry-relevant curriculum.
                                        The result is a learning experience that adapts to each student&apos;s pace and prepares
                                        them for real interviews at top tech companies.
                                    </p>
                                    <p>
                                        Today, Techwell has helped thousands of students land their dream jobs at companies
                                        like Google, Amazon, Microsoft, and leading Indian startups.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl h-80 flex items-center justify-center">
                                <GraduationCap className="h-32 w-32 text-primary/30" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values */}
                <section className="py-20 bg-muted/30">
                    <div className="container">
                        <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {values.map((value, idx) => (
                                <div key={idx} className="bg-card p-6 rounded-xl border hover:shadow-lg transition-shadow text-center">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                        <value.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="font-semibold mb-2">{value.title}</h3>
                                    <p className="text-sm text-muted-foreground">{value.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Our Team */}
                {showTeam && teamMembers.length > 0 && (
                    <section className="py-20 bg-background border-t border-border">
                        <div className="container">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
                                <p className="text-muted-foreground max-w-2xl mx-auto">
                                    The brilliant minds working tirelessly behind the scenes to deliver exceptional educational experiences and enterprise solutions.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                {teamMembers.filter(m => m.isActive).map((member) => (
                                    <div key={member.id} className="group relative rounded-2xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-xl transition-all duration-300">
                                        <div className="aspect-[4/5] w-full bg-muted/30 overflow-hidden relative">
                                            {member.photoUrl ? (
                                                <img 
                                                    src={member.photoUrl} 
                                                    alt={member.name} 
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/50">
                                                    <Users className="h-16 w-16 opacity-20" />
                                                </div>
                                            )}
                                            {member.linkedinUrl && (
                                                <div className="absolute top-4 right-4 translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
                                                    <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" className="bg-[#0A66C2] text-white p-2 rounded-full flex items-center justify-center shadow-lg hover:bg-[#004182]">
                                                        <Linkedin className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                                <p className="text-white/90 text-sm line-clamp-3">
                                                    {member.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                                            <p className="text-primary font-medium text-sm">{member.designation}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </>
    )
}
