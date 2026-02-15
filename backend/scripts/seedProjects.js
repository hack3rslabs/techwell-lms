
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Projects...');

    // Delete existing projects to avoid duplicates during dev
    // await prisma.project.deleteMany({}); 

    const projects = [
        // --- AI & ML ---
        {
            title: "AI-Powered Smart Traffic Management System",
            description: "A comprehensive system using computer vision to monitor traffic flow, detect violations (helmet, red light), and optimize traffic signal timings in real-time. Includes an admin dashboard for traffic police.",
            price: "₹15,000",
            originalPrice: "₹25,000",
            category: "AI & ML",
            techStack: ["Python", "OpenCV", "YOLOv8", "React", "Flask"],
            features: ["Real-time vehicle detection", "Automatic number plate recognition (ANPR)", "Violation detection", "Traffic density analysis"],
            projectType: "ACADEMIC",
            image: "/images/projects/traffic-ai.jpg",
            capex: "Hardware Requirement: GPU System (approx 80k)",
            demoLink: "https://youtube.com/demo1",
        },
        {
            title: "Crop Disease Prediction using Deep Learning",
            description: "Mobile-friendly application for farmers to detect crop diseases by uploading leaf images. Uses CNN models to classify diseases and suggest remedies.",
            price: "₹8,000",
            originalPrice: "₹12,000",
            category: "AI & ML",
            techStack: ["Python", "TensorFlow", "React Native", "FastAPI"],
            features: ["Offline support", "Multi-language support", "Remedy suggestions", "Community forum"],
            projectType: "ACADEMIC",
            image: "/images/projects/crop-disease.jpg"
        },

        // --- IoT ---
        {
            title: "Smart Home Automation with Energy Monitoring",
            description: "IoT-based home automation system controlling appliances via mobile app and voice. Features real-time energy consumption monitoring and alerts.",
            price: "₹12,000",
            originalPrice: "₹18,000",
            category: "IoT",
            techStack: ["ESP32", "Arduino", "Flutter", "Firebase", "MQTT"],
            features: ["Voice control", "Energy analytics dashboard", "Remote access", "Schedule automation"],
            capex: "Hardware Kit: ₹5,000",
            projectType: "ACADEMIC",
            image: "/images/projects/smart-home.jpg"
        },
        {
            title: "Industrial IoT based Machine Health Monitoring",
            description: "Predictive maintenance system for industrial motors using vibration and temperature sensors. Predicts failures before they occur.",
            price: "₹20,000",
            originalPrice: "₹30,000",
            category: "IoT",
            techStack: ["Raspberry Pi", "Python", "Node-RED", "InfluxDB"],
            features: ["Vibration analysis", "Real-time graphing", "Email alerts", "Predictive ML model"],
            projectType: "ACADEMIC",
            image: "/images/projects/industrial-iot.jpg"
        },

        // --- Cyber Security ---
        {
            title: "Network Intrusion Detection System (NIDS)",
            description: "AI-driven NIDS that monitors network traffic for suspicious activity and known attack patterns using machine learning.",
            price: "₹10,000",
            originalPrice: "₹15,000",
            category: "Cyber Security",
            techStack: ["Python", "Scikit-learn", "Wireshark", "React"],
            features: ["Packet sniffing", "Anomaly detection", "Attack classification", "Reporting dashboard"],
            projectType: "ACADEMIC",
            image: "/images/projects/cyber.jpg"
        },

        // --- Fullstack / Web ---
        {
            title: "E-Commerce Platform with AI Recommendations",
            description: "Full-featured multi-vendor e-commerce site with AI-based product recommendations, secure payments, and admin panel.",
            price: "₹18,000",
            originalPrice: "₹25,000",
            category: "Web Development",
            techStack: ["MERN Stack", "Redux", "Stripe", "Python (RecSys)"],
            features: ["Vendor dashboard", "User reviews", "Secure checkout", "Order tracking"],
            projectType: "ACADEMIC",
            image: "/images/projects/ecommerce.jpg"
        },

        // --- Government Schemes (KVIC / PMEGP) / Industrial DPRs ---
        {
            title: "E-Waste Recycling Plant - Detailed Project Report (DPR)",
            description: "Comprehensive Detailed Project Report for setting up an E-waste dismantling and segregation unit. Ideal for bank loans under PMEGP/CMEGP schems.",
            price: "₹5,000",
            originalPrice: "₹10,000",
            category: "Industrial DPR",
            techStack: ["Finance", "Business Analysis", "Excel"],
            features: ["Market Analysis", "Machinery Quotations", "Financial Projections (5 Years)", "DSCR Calculations"],
            capex: "Total Project Cost: ₹25 Lakhs",
            roi: "35% (Payback Period: 2.5 Years)",
            projectType: "BUSINESS_DPR",
            image: "/images/projects/ewaste.jpg"
        },
        {
            title: "Automatic Paper Plate Manufacturing Unit - DPR",
            description: "Bankable project report for automatic paper plate making business. tailored for Mudra Loan and PMEGP subsidy.",
            price: "₹3,500",
            originalPrice: "₹7,000",
            category: "Industrial DPR",
            techStack: ["Business Planning", "Financial Modeling"],
            features: ["Subsidy Guidance", "Raw Material Suppliers", "Unit Economics", "Break-even Analysis"],
            capex: "Total Project Cost: ₹10 Lakhs",
            roi: "45% (Payback Period: 1.8 Years)",
            projectType: "BUSINESS_DPR",
            image: "/images/projects/paper-plate.jpg"
        },
        {
            title: "Solar Power Plant (100KW) Installation Project",
            description: "Technical and financial proposal for setting up a 100KW grid-connected solar power plant.",
            price: "₹7,000",
            originalPrice: "₹12,000",
            category: "Renewable Energy",
            techStack: ["PVSyst", "AutoCAD", "Excel"],
            features: ["Yield Assessment", "Shadow Analysis", "Financial Viability", "BoM List"],
            capex: "Total Cost: ₹45 Lakhs",
            roi: "20% (Payback: 4 Years)",
            projectType: "INDUSTRIAL",
            image: "/images/projects/solar.jpg"
        },

        // --- NGO / Social Impact ---
        {
            title: "Women Empowerment & Skill Development Center",
            description: "Project proposal for NGO funding to set up a skill development center for rural women (Sewing, Computer Literacy).",
            price: "₹4,000",
            originalPrice: "₹8,000",
            category: "NGO Proposal",
            techStack: ["Social Work", "Grant Writing"],
            features: ["Beneficiary Identification", "Budget Breakdown", "Impact Assessment Framework", "CSR Compliance"],
            capex: "Grant Request: ₹15 Lakhs",
            roi: "Social Impact: 200 Women/Year",
            projectType: "NGO",
            image: "/images/projects/ngo.jpg"
        }
    ];

    for (const p of projects) {
        await prisma.project.create({
            data: p
        });
    }

    console.log('✅ Projects Seeded Successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
