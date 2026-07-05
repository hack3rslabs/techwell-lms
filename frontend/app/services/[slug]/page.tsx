import React from 'react'
import { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, ArrowRight, ShieldCheck, Cpu, Code2, Cloud, Megaphone, Laptop, ArrowUpRight, Bot } from 'lucide-react'
import Image from 'next/image'
import DOMPurify from 'isomorphic-dompurify'

import CyberSecurityLandingPage from '@/components/services/CyberSecurityLandingPage'
import ITSolutionsLandingPage from '@/components/services/ITSolutionsLandingPage'
import SoftwareSolutionsLandingPage from '@/components/services/SoftwareSolutionsLandingPage'
import DigitalMarketingLandingPage from '@/components/services/DigitalMarketingLandingPage'

// --- CONTENT DATABASE ---
// We write extensive, 700+ word SEO-oriented copy for each service to demonstrate authority.

const SERVICE_DATA = {
  'it-infrastructure': {
    title: 'Enterprise IT Solutions',
    shortDesc: 'Comprehensive IT Solutions backed by 10 years of market leadership. We provide Remote IT Support, IT Asset Management, AMC, and extensive Infrastructure Installation.',
    icon: SettingsIcon,
    themeColor: 'primary',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=2000',
    inlineImage: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800',
    keywords: 'Enterprise IT Solutions, IT Infrastructure Support, Remote IT Support, IT Asset Management, Asset Audit, AMC Services, Infra installation, Corporate IT Strategy',
    content: {
      introduction: `At Techwell, our comprehensive <strong>Enterprise IT Solutions</strong> are engineered to serve as the unshakeable digital foundation for modern businesses. Understanding exactly what falls under these critical services is the first step toward fundamentally transforming your organization's technological backbone.<br/><br/>We specialize in delivering end-to-end <strong>IT Support</strong>, ensuring that whether your workforce is experiencing a minor software configuration glitch or a catastrophic hardware failure, our elite engineering team is immediately equipped to handle it swiftly and efficiently. Our advanced remote support capabilities mean that no matter where your geographically dispersed team is located across the globe, we can seamlessly and securely log into their devices to resolve issues in real-time, effectively minimizing costly downtime and maximizing overall corporate productivity.<br/><br/>In addition to our rapid-response day-to-day troubleshooting, we take a highly strategic, long-term approach to managing your technology investments through our premier <strong>IT Asset Management</strong> and <strong>Asset Audit services</strong>. These bespoke offerings provide corporate stakeholders with complete, transparent visibility into their entire hardware and software inventory, ensuring strict regulatory compliance, optimizing complex licensing costs, and accurately forecasting necessary future technology upgrades.<br/><br/>We also provide highly robust <strong>Annual Maintenance Contracts (AMC)</strong> which offer a reliable, fail-safe safety net for your infrastructure. This guarantees that your mission-critical servers, executive workstations, and complex network devices are consistently monitored, patched, and maintained by seasoned experts. Furthermore, our comprehensive <strong>Infra Installation services</strong> cover absolutely everything from precise, high-speed fiber optic cabling to deploying massive enterprise-grade routers and highly available clustered servers. Techwell guarantees seamless integration and optimal performance from day one, empowering your business to scale without technical limitations.`,
      expertise: `Techwell has been a trusted leader in the market for <strong>over 10 years</strong>, delivering enterprise-grade solutions and accumulating a vast wealth of experience that allows us to anticipate complex technical problems long before they occur.<br/><br/>Over the past decade, we have established a proven track record of excellence, partnering with hundreds of corporations to implement IT solutions that are both infinitely scalable and incredibly resilient. Our long-standing, <strong>10-year presence in the competitive technology industry</strong> means we have successfully navigated the rapid evolution of IT—from rudimentary local area networks to highly complex, distributed, hybrid-cloud infrastructures. What we do goes far beyond simply fixing broken equipment; we meticulously engineer proactive reliability into every single layer of your daily operations.<br/><br/>Our senior technicians and systems architects hold the most advanced industry certifications (including Cisco, Microsoft, and CompTIA) and undergo continuous, rigorous training to stay significantly ahead of the latest technological trends and emerging operational frameworks. Whether it entails configuring complex enterprise-wide Wi-Fi networks across massive industrial campuses, or executing a meticulous, painstaking <strong>Asset Audit</strong> for thousands of diverse endpoints spread across multiple global corporate branches, our elite team executes every project with flawless precision and deep technical acumen.`,
      methodology: `Our proven approach to delivering world-class IT Solutions is highly methodical, transparent, and entirely client-centric.<br/><br/>We begin every engagement with a thorough, holistic assessment of your current technological environment, dedicating time to understanding not just the raw hardware and software, but exactly how that technology actively supports and drives your unique business processes. Following this deep-dive analysis, we develop a customized <strong>Annual Maintenance Contract (AMC)</strong> tailored specifically to your exact operational demands and budgetary constraints.<br/><br/>Our proactive, automated maintenance schedules are intelligently designed to intervene and repair systems long before hardware reaches critical failure points. For entirely new corporate setups, our <strong>Infra installation protocols</strong> strictly follow international industry standards, ensuring incredibly neat, fully documented, and highly efficient network architectures.<br/><br/>By seamlessly combining robust, responsive IT Support with proactive, intelligent Asset Management, we guarantee that your technology consistently serves as a powerful, reliable catalyst for corporate growth rather than a source of operational frustration. <strong>Your success is our mission, and our 10 years of market dominance proves our unwavering commitment to that goal.</strong>`,
      features: [
        'Comprehensive On-Site and Remote IT Support for Global Teams',
        'Detailed IT Asset Management and Lifecycle Tracking',
        'Thorough Asset Auditing and Regulatory Compliance Checks',
        'Reliable, SLA-Backed Annual Maintenance Contracts (AMC)',
        'Professional, Enterprise-Grade Network and Infra Installation',
        '24/7 Proactive System Monitoring and Preventative Maintenance'
      ],
      conclusion: `Choosing Techwell for your Enterprise IT Solutions means partnering with a prestigious technology firm that brings <strong>over 10 years of proven, industry-leading expertise</strong> directly to your corporate doorstep.<br/><br/>From rapid-response remote support that effortlessly keeps your remote workforce connected and productive, to meticulous Asset Audits that heavily optimize your annual IT budget, we provide a completely holistic IT framework. Let Techwell confidently handle the immense complexities of AMC and Infra installation so your executive team can focus entirely on driving your business forward with absolute, unwavering confidence.`
    }
  },
  'software-development': {
    title: 'Custom Software Solutions',
    shortDesc: 'Custom software development backed by 10 years of expertise. We build robust web applications, ERPs, and business operation problem-solving tools.',
    icon: Code2Icon,
    themeColor: 'primary',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=2000',
    inlineImage: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&q=80&w=800',
    keywords: 'Custom Software Solutions, Enterprise Web Development, Custom ERP Systems, Business Process Automation, Legacy System Integration, Scalable Software Architectures',
    content: {
      introduction: `In today’s rapidly evolving and fiercely competitive digital landscape, generic, off-the-shelf software consistently fails to address the highly nuanced, complex demands of unique business operations.<br/><br/>At Techwell, our elite Software Solutions division is exclusively dedicated to engineering <strong>custom-required softwares</strong> that are precisely tailored to meet your specific, intricate client requests. We firmly believe that technology should seamlessly adapt to your business workflows, not the other way around.<br/><br/>Our extensive, prestigious portfolio includes highly robust web development projects that create deeply engaging, incredibly high-performance digital storefronts, dynamic corporate portals, and complex SaaS platforms. Furthermore, we specialize in architecting comprehensive, enterprise-grade <strong>Enterprise Resource Planning (ERP) systems</strong> that successfully unify heavily fragmented corporate departments into a single, cohesive, highly efficient operational engine.<br/><br/>We also excel at developing specialized, bespoke applications designed specifically to serve as powerful <strong>business operation problem-solving tools</strong>, completely eliminating operational bottlenecks, reducing human error, and automating incredibly tedious manual workflows. Our software doesn't just function; it revolutionizes how you do business.`,
      expertise: `Techwell has been a trusted leader in the market for <strong>over 10 years</strong>, delivering enterprise-grade software solutions to highly demanding clients across multiple global industries.<br/><br/>Over the last decade, our world-class engineering team has boasted deep, unparalleled expertise across a massively wide spectrum of modern programming languages, cutting-edge frameworks, and complex database architectures. When we undertake custom software development, we leverage only the most appropriate, future-proof technology stack—be it Next.js and React for lightning-fast, highly interactive web development, or incredibly robust Node.js, Python, and Go backends for complex, high-throughput ERP data processing.<br/><br/><strong>Over our 10 years in business</strong>, we have successfully delivered applications that flawlessly handle massive high-volume financial transactions, manage incredibly intricate global supply chain inventory systems, and completely streamline multi-national human resources departments. What truly sets Techwell apart from the competition is our profound ability to listen closely to a client's request, deeply analyze the underlying fundamental business challenge, and successfully translate that insight into a sleek, highly functional, beautifully designed application. Our bespoke problem-solving applications are globally renowned for their highly intuitive user interfaces and absolutely bulletproof backend architectures.`,
      methodology: `Our elite software development methodology is highly collaborative, intensely data-driven, and entirely agile.<br/><br/>The transformative journey begins with deep, comprehensive consultation sessions with your corporate stakeholders to fully understand your specific business operation problem at a granular level. We then meticulously draft a massive, highly detailed technical specification document that thoroughly outlines the entire custom-required software architecture.<br/><br/>During the intensive web development and application building phases, we work in rapid, highly efficient <strong>iterative sprints</strong>, providing you with continuous, transparent updates and fully functioning prototypes. This rigorous agile process ensures that the complex ERP or bespoke application we are actively building remains perfectly, seamlessly aligned with your constantly evolving client requests.<br/><br/>Furthermore, rigorous Automated and Manual Quality Assurance (QA) testing is deeply integrated throughout the entire development lifecycle, absolutely guaranteeing that the final software solution delivered to you is highly secure, infinitely scalable, and completely free of critical defects upon public launch.`,
      features: [
        'Custom Required Software Engineering Based on Specific Client Requests',
        'High-Performance, Scalable Web Development and SaaS Platforms',
        'Comprehensive Enterprise Resource Planning (ERP) Systems',
        'Bespoke Business Operation Problem-Solving Applications',
        'Highly Intuitive UI/UX Design for Complex Corporate Applications',
        'Seamless API Integration with Existing Legacy Corporate Systems'
      ],
      conclusion: `Your corporate business challenges are entirely unique, and your foundational technology should absolutely reflect that reality.<br/><br/>Techwell’s custom Software Solutions provide the massive competitive edge you desperately need by fully automating tedious processes, seamlessly unifying siloed data through custom ERPs, and delivering utterly flawless web development.<br/><br/>Whatever complex problem your business operation currently faces, our team brings <strong>10 years of elite expertise</strong> to engineer an application that solves it permanently, elegantly, and highly efficiently.`
    }
  },
  'cyber-security': {
    title: 'Enterprise Cyber Security',
    shortDesc: 'Protect your enterprise with 10 years of Cyber Security expertise. We offer Application Security testing, Endpoint Protection, and Network Security.',
    icon: ShieldIcon,
    themeColor: 'primary',
    image: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&q=80&w=2000',
    inlineImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
    keywords: 'Enterprise Cyber Security, Application Security Testing, Endpoint Protection, Network Security Protocols, Zero-Trust Architecture, Vulnerability Assessments',
    content: {
      introduction: `As modern businesses increasingly rely on complex digital infrastructure and cloud-based systems, the global cyber threat landscape has grown exponentially more sophisticated, aggressive, and incredibly dangerous.<br/><br/>Techwell’s elite Cyber Security services are meticulously engineered to provide an absolutely impenetrable, multi-layered shield around your corporation's most critical digital assets and highly sensitive intellectual property. Our incredibly comprehensive, defense-in-depth approach ensures that every single vulnerability is rapidly identified, contained, and neutralized long before it can ever be maliciously exploited by bad actors.<br/><br/>We heavily specialize in conducting deep, rigorous <strong>Application Security testing</strong>, meticulously and exhaustively analyzing your proprietary corporate software to uncover dangerous, hidden vulnerabilities such as SQL injections, complex cross-site scripting (XSS), insecure direct object references, and deeply flawed authentication mechanisms.<br/><br/>Beyond securing the vital application layer, we deploy incredibly robust, next-generation <strong>endpoint security</strong> measures to fundamentally protect every single device connected to your corporate network—ranging from highly sensitive executive laptops to personal mobile devices used in BYOD environments. Furthermore, our highly advanced <strong>Network Security protocols</strong> constantly monitor, analyze, and filter all inbound and outbound corporate traffic, absolutely ensuring that malicious actors are kept firmly outside your secured digital perimeter at all times.`,
      expertise: `Techwell has been a trusted leader in the market for <strong>over 10 years</strong>, providing elite cyber security defenses to corporations and deeply understanding how threat actors operate.<br/><br/>Our world-class team of cybersecurity experts and ethical hackers possesses decades of combined, highly specialized experience in successfully defending massive enterprise networks against both automated botnet attacks and highly targeted, state-sponsored Advanced Persistent Threats (APTs).<br/><br/>Over the past 10 years, when conducting our rigorous Application Security testing, we utilize a powerful combination of cutting-edge, proprietary automated scanning tools and rigorous, deeply creative <strong>manual penetration testing</strong> executed by certified ethical hackers. This dual-pronged, highly exhaustive approach ensures that even the most obscure, deeply hidden vulnerabilities are brought to light.<br/><br/>In the critical realm of endpoint security, we deploy cutting-edge next-generation antivirus (NGAV) solutions, advanced behavioral threat detection algorithms, and automated Extended Detection and Response (XDR) systems that isolate compromised devices instantly upon detection. Our unparalleled Network Security expertise involves configuring highly sophisticated next-generation firewalls, establishing military-grade Virtual Private Networks (VPNs), and implementing highly intelligent Intrusion Detection and Prevention Systems (IDS/IPS) that leverage machine learning to analyze traffic patterns in real-time to completely thwart potential data breaches.`,
      methodology: `Our proven, battle-tested methodology for implementing Enterprise Cyber Security is highly proactive, deeply exhaustive, and incredibly strict.<br/><br/>We begin every engagement with a holistic, top-to-bottom security audit of your entire current digital environment, meticulously mapping out every single application, endpoint, database, and network node. During the intensive Application Security testing phase, our ethical hackers actively simulate highly aggressive real-world cyber attacks to thoroughly evaluate your software’s true resilience under immense pressure.<br/><br/>We then systematically harden your entire infrastructure by rolling out incredibly strict <strong>Zero-Trust endpoint security policies</strong> and deploying massive, enterprise-grade firewalls to massively reinforce your Network Security posture.<br/><br/>Post-deployment, our elite, global Security Operations Center (SOC) provides continuous, unbroken <strong>24/7/365 active monitoring</strong>, ensuring that absolutely any suspicious or anomalous network activity is immediately investigated, contained, and mitigated by our response team. We also provide highly comprehensive, board-level remediation reports, actively helping your internal engineering teams permanently patch vulnerabilities and securely rewrite legacy code.`,
      features: [
        'Rigorous, In-Depth Application Security Testing and Code Audits',
        'Next-Generation Endpoint Security and XDR Solutions',
        'Comprehensive, Enterprise-Grade Network Security and Firewalls',
        '24/7/365 Proactive Threat Monitoring and Rapid Incident Response',
        'Deep Vulnerability Assessments and Manual Penetration Testing',
        'Strict Zero-Trust Security Architecture Implementation'
      ],
      conclusion: `In today's highly hostile digital age, a single, unforeseen security breach can cause utterly irreparable, catastrophic damage to your business operations, financial standing, and hard-earned corporate reputation.<br/><br/>With Techwell’s highly advanced, battle-tested Cyber Security solutions—backed by <strong>over 10 years of proven market excellence</strong>—you gain the ultimate peace of mind knowing that your entire organization is constantly protected by industry-leading Application Security testing, highly vigilant endpoint security, and unyielding, impenetrable Network Security.<br/><br/>Let Techwell fortify your digital perimeter so you can confidently operate and aggressively expand your business with absolute, unshakeable confidence.`
    }
  },
  'digital-marketing': {
    title: 'Digital Marketing & Growth',
    shortDesc: 'Comprehensive Digital Marketing solutions designed to exponentially scale your brand, drive high-intent traffic, and maximize ROI through data-driven strategies.',
    icon: MegaphoneIcon,
    themeColor: 'primary',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2000',
    inlineImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
    keywords: 'Digital Marketing, SEO, Social Media Marketing, Performance Marketing, Content Strategy, Brand Growth',
    content: {
      introduction: `In the intensely competitive digital era, having a phenomenal product or service is simply no longer enough if your target audience cannot easily find you. <strong>Digital Marketing</strong> is the essential, high-octane fuel that actively drives scalable, predictable revenue growth.<br/><br/>At Techwell, our elite marketing division does not believe in vanity metrics or generic, one-size-fits-all campaigns. We specialize in engineering highly complex, fiercely targeted, multi-channel performance marketing systems that are specifically designed to dominate your market niche and directly impact your corporate bottom line.<br/><br/>Our comprehensive digital strategies encompass aggressive, highly technical <strong>Search Engine Optimization (SEO)</strong> to ensure you capture high-intent organic traffic, coupled with meticulously optimized <strong>Pay-Per-Click (PPC)</strong> campaigns that deliver massive immediate ROI. We also architect profoundly engaging <strong>Social Media Marketing</strong> frameworks that transform casual browsers into fiercely loyal brand advocates, supported by a world-class <strong>Content Strategy</strong> that establishes your enterprise as the undisputed thought leader in your industry.`,
      expertise: `Our marketing success is deeply rooted in our relentless, obsessive reliance on raw data and advanced analytics.<br/><br/>Over the years, we have successfully managed millions of dollars in ad spend, rigorously testing, tracking, and infinitely refining our conversion architectures across Google, Meta, LinkedIn, and emerging digital platforms. Our marketing architects don't just guess; they leverage highly advanced machine learning tools and deep predictive analytics to accurately forecast consumer behavior and instantly capitalize on highly profitable market trends.<br/><br/>From conducting incredibly granular keyword research that uncovers hidden, highly lucrative search verticals, to executing flawless, high-converting A/B split tests on enterprise landing pages, our highly systematic approach guarantees that absolutely every single dollar of your marketing budget is maximized for the highest possible return.`,
      methodology: `Our execution is heavily phased, intensely collaborative, and fully transparent.<br/><br/>We initiate every partnership with a brutal, uncompromising audit of your current digital footprint, dissecting your competitors' strategies to identify massive gaps in the market. We then construct a highly detailed, 12-month digital growth roadmap.<br/><br/>Once deployed, our campaigns are continuously monitored by dedicated growth managers who provide you with real-time, highly visual reporting dashboards. We don't just run ads; we continuously optimize the entire customer journey from the very first click to the final, high-value corporate sale.`,
      features: [
        'Advanced, Technical Search Engine Optimization (SEO)',
        'High-ROI, Data-Driven Performance Marketing (PPC)',
        'Enterprise Social Media Strategy and Brand Building',
        'Conversion Rate Optimization (CRO) for Landing Pages',
        'Comprehensive Content Strategy and Thought Leadership',
        'Advanced Web Analytics and Real-Time ROI Reporting'
      ],
      conclusion: `Stop wasting your marketing budget on disjointed, ineffective strategies that fail to generate real business.<br/><br/>Partner with Techwell to deploy a highly sophisticated, deeply analytical digital marketing engine that systematically captures market share and drives explosive revenue growth.`
    }
  },
  'ai-automation': {
    title: 'Enterprise AI Automation',
    shortDesc: 'Unlock unprecedented operational velocity with custom AI Agents, RAG (Retrieval-Augmented Generation) pipelines, and n8n workflow automations.',
    icon: BotIcon,
    themeColor: 'primary',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=2000',
    inlineImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
    keywords: 'AI Automation, Retrieval-Augmented Generation, RAG, n8n workflows, Autonomous Agents, LLM Fine-Tuning, Business Process Automation, ChatGPT Enterprise',
    content: {
      introduction: `In the modern digital economy, human cognitive bandwidth is arguably the most valuable, yet vastly constrained, corporate resource. The advent of highly advanced Large Language Models (LLMs) has completely shattered traditional operational limitations.<br/><br/>At Techwell, our elite <strong>AI Automation</strong> division specializes in architecting and deploying completely bespoke, highly autonomous intelligence systems that fundamentally redefine how your enterprise processes data, interacts with clients, and executes complex daily workflows.<br/><br/>We are unparalleled experts in developing highly sophisticated <strong>Retrieval-Augmented Generation (RAG)</strong> pipelines. Unlike generic, off-the-shelf AI chatbots that frequently hallucinate and lack specific corporate context, our custom RAG architectures securely embed your proprietary, confidential corporate data directly into the AI's reasoning engine. This allows your internal teams and external clients to query vast, incredibly complex corporate databases, legal documents, and historical archives in natural language, receiving instant, hyper-accurate, perfectly cited responses.<br/><br/>Furthermore, we leverage cutting-edge integration platforms like <strong>n8n</strong> to seamlessly weave these advanced cognitive capabilities directly into your existing technological ecosystem. Our AI systems do not just answer questions; they actively trigger robust, multi-step automated workflows—updating CRMs, generating tailored financial reports, dynamically routing massive volumes of customer support tickets, and executing complex, logic-gated decisions without any human intervention.`,
      expertise: `Techwell’s deep mastery of applied artificial intelligence is rooted in our profound understanding of both advanced machine learning architectures and complex enterprise business logic.<br/><br/>We do not simply resell API wrappers. Our world-class engineering team aggressively customizes, fine-tunes, and heavily optimizes advanced models (including OpenAI’s GPT-4, Anthropic’s Claude, and robust open-source alternatives like Llama 3) to precisely match your highly specific operational vernacular and strict security compliance requirements.<br/><br/>Our immense expertise in <strong>n8n workflow automation</strong> allows us to visually construct incredibly intricate, infinitely scalable logic chains that connect hundreds of disparate software platforms. Whether you need an autonomous agent that instantly analyzes incoming legal contracts and highlights risky clauses, or an AI-driven sales assistant that automatically researches prospects on LinkedIn and drafts hyper-personalized outreach sequences, our team possesses the elite technical acumen required to bring these sci-fi capabilities into your daily reality.<br/><br/>We prioritize absolute data sovereignty. Our AI architectures are meticulously designed with strict, military-grade data sandboxing, ensuring that your highly sensitive intellectual property is never inadvertently leaked or utilized to train public foundational models.`,
      methodology: `Our deployment methodology for Enterprise AI Automation is highly structured, deeply analytical, and laser-focused on immediate ROI.<br/><br/>The engagement commences with a highly rigorous, top-down <strong>Cognitive Audit</strong> of your current business operations. We systematically identify incredibly high-friction, repetitive cognitive tasks that are currently bottlenecking your human workforce. Following this deep-dive analysis, we architect a highly detailed, phased automation roadmap.<br/><br/>During the rapid development phase, we meticulously construct the underlying vector databases and heavily optimize the embedding algorithms required for your custom <strong>RAG pipeline</strong>. We then leverage <strong>n8n</strong> to build the connective tissue, seamlessly integrating the new AI capabilities directly into your existing Slack channels, Salesforce instances, or custom ERPs.<br/><br/>Before full deployment, we conduct highly exhaustive "red-teaming" and aggressive logic testing to ensure the AI agents behave perfectly under stress and handle edge cases gracefully. Post-launch, we provide continuous model evaluation and active prompt optimization, ensuring your autonomous systems grow exponentially smarter and more efficient over time.`,
      features: [
        'Custom Retrieval-Augmented Generation (RAG) Architectures',
        'Complex, Multi-Platform n8n Workflow Automation',
        'Development of Highly Autonomous AI Agents',
        'Secure, Sandboxed LLM Fine-Tuning and Prompt Engineering',
        'Intelligent Document Processing and Data Extraction',
        'Seamless Integration with Legacy CRMs and ERPs'
      ],
      conclusion: `The AI revolution is no longer a distant future; it is the immediate, absolute present. Enterprises that fail to aggressively adopt advanced cognitive automation will rapidly find themselves heavily outpaced and fundamentally outmaneuvered by highly optimized competitors.<br/><br/>By partnering with Techwell, you instantly acquire a massively powerful, highly customized digital workforce that never sleeps, never makes careless administrative errors, and processes data at an incomprehensible velocity.<br/><br/>Let us engineer the autonomous systems of tomorrow for your business today, permanently liberating your human talent to focus exclusively on highly strategic, creative growth initiatives.`
    }
  }
}

// Icon Helpers
function SettingsIcon({className}: {className?: string}) { return <Laptop className={className} /> }
function Code2Icon({className}: {className?: string}) { return <Code2 className={className} /> }
function CloudIcon({className}: {className?: string}) { return <Cloud className={className} /> }
function ShieldIcon({className}: {className?: string}) { return <ShieldCheck className={className} /> }
function MegaphoneIcon({className}: {className?: string}) { return <Megaphone className={className} /> }
function BotIcon({className}: {className?: string}) { return <Bot className={className} /> }

// Dynamic Metadata Generation for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const data = SERVICE_DATA[resolvedParams.slug as keyof typeof SERVICE_DATA]
  
  if (!data) {
    return {
      title: 'Service Not Found | Techwell',
      description: 'The requested service could not be found.'
    }
  }

  return {
    title: `${data.title} | Techwell IT Services`,
    description: data.content.introduction.substring(0, 160) + '...',
    keywords: data.keywords,
    openGraph: {
      title: data.title,
      description: data.shortDesc,
      type: 'article'
    }
  }
}
export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const data = SERVICE_DATA[resolvedParams.slug as keyof typeof SERVICE_DATA]

  if (!data) {
    notFound()
  }

  // Dedicated single-page website for Cyber Security
  if (resolvedParams.slug === 'cyber-security') {
    return <CyberSecurityLandingPage data={data} />
  }

  // Dedicated single-page website for IT Solutions
  if (resolvedParams.slug === 'it-infrastructure') {
    return <ITSolutionsLandingPage data={data} />
  }

  // Dedicated single-page website for Software Solutions
  if (resolvedParams.slug === 'software-solutions') {
    return <SoftwareSolutionsLandingPage data={data} />
  }

  // Dedicated single-page website for Digital Marketing
  if (resolvedParams.slug === 'digital-marketing') {
    return <DigitalMarketingLandingPage data={data} />
  }

  const Icon = data.icon

  // Force corporate brand colors across all pages
  const colorStyles = 'text-primary bg-primary/10 border-primary/20 shadow-primary/20'
  const gradStyles = 'from-primary to-primary/60 dark:from-primary dark:to-primary/50'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] font-sans selection:bg-indigo-500/30 pb-12">
      
      {/* IMMERSIVE HERO SECTION */}
      <section className="relative w-full h-[55vh] min-h-[450px] flex items-center justify-center overflow-hidden">
        {data.image && (
          <Image 
            src={data.image}
            alt={data.title}
            fill
            className="object-cover"
            unoptimized
            priority
          />
        )}
        <div className="absolute inset-0 bg-slate-900/80 dark:bg-[#030712]/90 backdrop-blur-[2px]" />
        
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full pt-16">
          <Badge className="bg-white/10 text-white border-white/20 hover:bg-white/20 font-bold tracking-[0.2em] uppercase mb-8 px-5 py-2 shadow-sm backdrop-blur-md">
            Techwell Premium Services
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight mb-6 text-white drop-shadow-xl">
            {data.title}
          </h1>
          
          <p className="text-slate-200 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-light drop-shadow-md">
            {data.shortDesc}
          </p>
        </div>
      </section>

      {/* TWO-COLUMN CONTENT LAYOUT */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: DEEP CONTENT (8 columns) */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2rem] lg:rounded-[2.5rem] p-6 sm:p-8 md:p-12 shadow-2xl border border-slate-100 dark:border-slate-800/60 space-y-16 animate-in fade-in duration-1000 delay-200">
            
            {/* Introduction */}
            <div className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight max-w-none">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className={`p-3 rounded-2xl w-14 h-14 flex items-center justify-center shrink-0 ${colorStyles}`}>
                  <Cpu className="w-8 h-8" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white m-0">
                  The Foundation of Modern Operations
                </h2>
              </div>
              <p 
                className="text-slate-600 dark:text-slate-300 leading-loose text-[17px] font-light"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.content.introduction) }}
              />
            </div>

            {/* Expertise */}
            <div className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight max-w-none">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className={`p-3 rounded-2xl w-14 h-14 flex items-center justify-center shrink-0 ${colorStyles}`}>
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white m-0">
                  Our Proven Technical Expertise
                </h2>
              </div>
              <p 
                className="text-slate-600 dark:text-slate-300 leading-loose text-[17px] font-light"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.content.expertise) }}
              />
            </div>

            {/* In-content feature image */}
            {data.inlineImage && (
              <div className="w-full h-[350px] md:h-[450px] relative rounded-[2rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 group transition-all duration-700 hover:shadow-primary/10">
                <Image 
                  src={data.inlineImage}
                  alt={`${data.title} Expertise`}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
              </div>
            )}

            {/* Methodology */}
            <div className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight max-w-none">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className={`p-3 rounded-2xl w-14 h-14 flex items-center justify-center shrink-0 ${colorStyles}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white m-0">
                  Execution Methodology
                </h2>
              </div>
              <p 
                className="text-slate-600 dark:text-slate-300 leading-loose text-[17px] font-light"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.content.methodology) }}
              />
            </div>

            {/* Conclusion */}
            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-3xl p-8 md:p-10 border border-slate-100 dark:border-slate-800">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Partner with Excellence
              </h2>
              <p 
                className="text-slate-700 dark:text-slate-300 leading-relaxed text-[17px]"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.content.conclusion) }}
              />
            </div>
          </div>

          {/* RIGHT: STICKY SIDEBAR (4 columns) */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24 mb-12 lg:mb-0">
            
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 shadow-xl border border-slate-100 dark:border-slate-800/60">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <span className={`w-2 h-8 rounded-full ${colorStyles.split(' ')[1]}`} />
                Key Deliverables
              </h3>
              <div className="space-y-4">
                {data.content.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 group">
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 transition-colors ${colorStyles.split(' ')[1]} ${colorStyles.split(' ')[0]}`}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-[15px] leading-relaxed text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-[2rem] p-6 sm:p-8 shadow-xl border relative overflow-hidden ${colorStyles.split(' ')[1]} ${colorStyles.split(' ')[2]}`}>
              <div className="relative z-10 space-y-6">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Ready to elevate your enterprise?
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Connect directly with our elite engineering and consulting team to discuss how we can accelerate your growth.
                </p>
                <Button asChild className="w-full font-bold shadow-md h-12">
                  <Link href={`/contact?service=${encodeURIComponent(data.title)}`}>
                    Enquire Now
                    <ArrowUpRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}
