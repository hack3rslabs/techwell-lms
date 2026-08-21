// ==============================================================
// TECHWELL SEO DATA MAP
// Keyword → Intent → Page → Content → Tools → Careers → CTAs
//
// ONE authoritative page per domain — covers dozens of
// semantically related queries through genuine, useful content.
// DO NOT keyword-stuff. Every field renders real UI.
// ==============================================================

export type SEOPageData = {
  title: string;
  description: string;
  h1: string;
  subheading: string;
  intro: string;
  features: { icon: string; title: string; body: string }[];
  tools?: string[];          // renders "Tools & Technologies Covered" badge grid
  careerPaths?: string[];    // renders "Career Opportunities" + Course→Career funnel
  quickAnswers?: { q: string; a: string }[]; // AI-citable Q&A answer boxes (Google AI Overviews / Perplexity)
  faqs: { q: string; a: string }[];
  ctaPrimary: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  crossLink?: { heading: string; text: string; cta: string; url: string };
  relatedLinks?: { label: string; href: string }[];
};

export const seoDataMap: Record<string, SEOPageData> = {

  // ============================================================
  // IT TRAINING HUB — master landing page linking all domains
  // Covers: IT training institute, job-oriented training, fresher training
  // ============================================================
  'it-training': {
    title: 'Professional IT Training | Industry-Ready Tech Courses | Techwell',
    description: 'Techwell offers industry-aligned IT training across Networking, Cloud, DevOps, Cyber Security, AI/ML, Full Stack, and more. Hands-on, job-oriented training with placement assistance.',
    h1: 'Professional IT Training — Industry-Ready Skills',
    subheading: 'Hands-on training built for real jobs, not just certificates.',
    intro: 'Techwell\'s IT Training programmes cover the complete spectrum of modern technology careers. Each course is built by practitioners with real industry experience — combining theory with live projects, tools, and career support. From networking fundamentals to AI engineering, our training prepares you for today\'s job market and connects you with employers seeking skilled candidates.',
    features: [
      { icon: '🛠️', title: 'Hands-On Projects', body: 'Every course includes portfolio-worthy real-world projects you can showcase in interviews.' },
      { icon: '🏭', title: 'Industry Practitioners', body: 'Trained by professionals with active industry roles — not just academic backgrounds.' },
      { icon: '📅', title: 'Flexible Formats', body: 'Online, offline, and weekend batch options to fit around your schedule.' },
      { icon: '🎓', title: 'Verifiable Certificates', body: 'Techwell completion certificates on every programme — shareable on LinkedIn and your resume.' },
    ],
    quickAnswers: [
      { q: 'What is Techwell?', a: 'Techwell is a professional IT training, career development, and placement services company based in Srikakulam and Visakhapatnam, Andhra Pradesh. Techwell has supported over 10,000 students and professionals in building IT careers through structured training, job assistance, and employer referrals.' },
      { q: 'What IT training courses does Techwell offer?', a: 'Techwell offers IT training across Networking, Desktop Support, Windows Server Administration, Linux, Cloud Computing (Azure and AWS), DevOps, DevSecOps, Application Security, Cyber Security and VAPT, Endpoint Management (Intune/SCCM/ManageEngine), SRE, IT Service Management (ITSM/ServiceNow), Full Stack Development, AI and Machine Learning, and Vibe Coding (AI-assisted development).' },
      { q: 'How does job assistance work at Techwell?', a: 'Techwell job assistance is a structured service that prepares candidates with ATS-optimised resumes, AI mock interview practice, and direct referrals to hiring employers in our network. It is a placement support service — not a job guarantee.' },
      { q: 'Where is Techwell located?', a: 'Techwell operates training centres in Srikakulam and Visakhapatnam (Vizag), Andhra Pradesh. Online training is available across India.' },
    ],
    faqs: [
      { q: 'Which IT training courses does Techwell offer?', a: 'We offer training in Networking, Desktop Support, Windows Server, Linux, Cloud (Azure/AWS), DevOps, DevSecOps, Application Security, Cyber Security/VAPT, Endpoint Management, SRE, Full Stack Development, AI/ML, and more. See our full course catalogue for details.' },
      { q: 'Is training available for complete beginners?', a: 'Many courses have beginner tracks. Check individual course descriptions for prerequisites.' },
      { q: 'Does training come with placement support?', a: 'Yes. Our training is integrated with resume building, AI mock interviews, and direct employer referrals through our placement assistance programme.' },
      { q: 'Where is Techwell IT training available?', a: 'We operate training centres in Srikakulam and Visakhapatnam (Vizag), Andhra Pradesh. Online training is available to students across India.' },
    ],
    ctaPrimary: { label: 'Browse All Courses', href: '/courses' },
    ctaSecondary: { label: 'Contact About Training', href: '/contact' },
    relatedLinks: [
      { label: 'Networking', href: '/networking' },
      { label: 'Cloud Computing', href: '/cloud-computing' },
      { label: 'DevOps', href: '/devops' },
      { label: 'Cyber Security', href: '/cyber-security' },
      { label: 'AI & ML', href: '/ai-ml' },
      { label: 'Full Stack Development', href: '/full-stack-development' },
      { label: 'Linux', href: '/linux' },
      { label: 'Windows Server', href: '/windows-server' },
      { label: 'Application Security', href: '/application-security' },
      { label: 'Endpoint Management', href: '/endpoint-management' },
      { label: 'SRE', href: '/site-reliability-engineering' },
    ],
  },

  // ============================================================
  // NETWORKING
  // Covers: computer networking, CCNA, CCNP, LAN/WAN, TCP/IP,
  //         routing & switching, firewall, network engineer jobs
  // ============================================================
  'networking': {
    title: 'Computer Networking Training | CCNA, Network Admin & Engineer | Techwell',
    description: 'Learn computer networking with Techwell. Covers networking fundamentals, CCNA concepts, routing & switching, network security, and career preparation for network engineer roles.',
    h1: 'Computer Networking Training',
    subheading: 'Build the foundation of every IT infrastructure career.',
    intro: 'Networking is the backbone of all IT systems — cloud, security, DevOps, and every modern application depends on a solid network. Techwell\'s Networking training covers computer networking fundamentals through to advanced topics like routing and switching, network security, firewall configuration, and troubleshooting. The training prepares you for network administrator and network engineer roles and provides the foundation for specialising in cloud, DevOps, or security.',
    features: [
      { icon: '🌐', title: 'Networking Fundamentals', body: 'OSI model, TCP/IP, DNS, DHCP, subnetting, IP addressing, and network architecture.' },
      { icon: '🔁', title: 'Routing & Switching', body: 'Static and dynamic routing, VLANs, spanning tree, and enterprise switching concepts.' },
      { icon: '🛡️', title: 'Network Security', body: 'Firewalls, ACLs, VPN, IDS/IPS basics, and network hardening techniques.' },
      { icon: '🔧', title: 'Hands-On Lab Practice', body: 'Practical exercises with industry-standard simulation environments and real hardware.' },
    ],
    tools: ['TCP/IP', 'DNS', 'DHCP', 'Cisco IOS', 'Packet Tracer', 'Wireshark', 'pfSense', 'VPN', 'VLAN', 'Subnetting', 'BGP', 'OSPF'],
    careerPaths: ['Network Engineer', 'Network Administrator', 'Network Support Engineer', 'Systems Engineer (Networking)', 'Cloud Network Engineer', 'Security Network Engineer'],
    faqs: [
      { q: 'Does Techwell networking training cover CCNA topics?', a: 'Our networking curriculum covers the core concepts that align with CCNA and similar industry standards — including routing, switching, IP addressing, and network security. We prepare you with practical knowledge; certification exam fees and registration are handled externally.' },
      { q: 'What careers can I pursue after networking training?', a: 'Network Engineer, Network Administrator, Network Support, Cloud Network Engineer, and Security Engineer are common progression paths. Many students use networking as the foundation before specialising in Cloud, DevOps, or Cyber Security.' },
      { q: 'Is networking training available for freshers?', a: 'Yes. Our networking course starts from fundamentals and is suitable for freshers with basic computer knowledge.' },
    ],
    ctaPrimary: { label: 'Explore Networking Courses', href: '/courses' },
    ctaSecondary: { label: 'View All IT Training', href: '/it-training' },
    crossLink: {
      heading: 'Practice Networking Assessments',
      text: 'Strengthen your networking knowledge with aptitude and technical assessments on eLearnStack.',
      cta: 'Practice on eLearnStack',
      url: 'https://elearnstack.com',
    },
    relatedLinks: [
      { label: 'Cloud Computing', href: '/cloud-computing' },
      { label: 'Cyber Security', href: '/cyber-security' },
      { label: 'Linux', href: '/linux' },
      { label: 'IT Training Hub', href: '/it-training' },
    ],
  },

  // ============================================================
  // DESKTOP / IT SUPPORT
  // Covers: desktop support, IT support, helpdesk, service desk,
  //         technical support, end user computing, IT support jobs
  // ============================================================
  'desktop-support': {
    title: 'Desktop Support & IT Helpdesk Training | Techwell',
    description: 'Learn desktop support, IT helpdesk, and technical support with Techwell. Practical training for IT Support Engineer, Desktop Support Engineer, and Service Desk roles.',
    h1: 'Desktop Support & IT Helpdesk Training',
    subheading: 'The practical skills every IT career starts with.',
    intro: 'Desktop Support and IT Helpdesk are the entry points for countless successful IT careers. Techwell\'s training covers everything a Support Engineer or Helpdesk Analyst needs: hardware and software troubleshooting, operating system support, user account management, ticketing systems, and customer communication skills. This training is particularly well-suited for freshers starting their IT career or candidates transitioning from non-IT backgrounds.',
    features: [
      { icon: '💻', title: 'Hardware & OS Troubleshooting', body: 'Diagnose and resolve hardware faults, Windows and application issues in real-world scenarios.' },
      { icon: '🎫', title: 'Ticketing & ITSM Tools', body: 'Work with industry-standard helpdesk and service management tools used in enterprise environments.' },
      { icon: '👥', title: 'End User Support', body: 'Professional communication, escalation processes, and service-level agreement (SLA) awareness.' },
      { icon: '🔒', title: 'User & Identity Management', body: 'Active Directory, user account management, password policies, and basic access control.' },
    ],
    tools: ['Windows 10/11', 'Active Directory', 'ServiceNow', 'Jira Service Desk', 'Remote Desktop', 'TeamViewer', 'Microsoft 365', 'BitLocker', 'BIOS/UEFI'],
    careerPaths: ['IT Support Engineer', 'Desktop Support Engineer', 'Helpdesk Analyst', 'Service Desk Analyst', 'Technical Support Specialist', 'IT Field Support Engineer'],
    faqs: [
      { q: 'Is desktop support training suitable for freshers with no IT experience?', a: 'Yes. This is one of our most beginner-friendly courses. We cover fundamentals from the ground up, making it ideal for freshers or candidates switching from non-IT fields.' },
      { q: 'What jobs can I get after completing IT support training?', a: 'Common entry points include IT Support Engineer, Desktop Support Analyst, Helpdesk Technician, and Service Desk Agent. These roles exist in virtually every company that uses technology — making employment opportunities broad.' },
    ],
    ctaPrimary: { label: 'Start IT Support Training', href: '/courses' },
    ctaSecondary: { label: 'View All IT Training', href: '/it-training' },
    crossLink: {
      heading: 'Practice Technical Support Assessments',
      text: 'Sharpen your troubleshooting knowledge with technical aptitude tests on eLearnStack.',
      cta: 'Practice Now',
      url: 'https://elearnstack.com',
    },
    relatedLinks: [
      { label: 'Windows Server', href: '/windows-server' },
      { label: 'Networking', href: '/networking' },
      { label: 'Endpoint Management', href: '/endpoint-management' },
      { label: 'IT Training Hub', href: '/it-training' },
    ],
  },

  // ============================================================
  // WINDOWS SERVER / SYSTEM ADMINISTRATION
  // Covers: Windows Server, system admin, Active Directory, PowerShell,
  //         Azure AD, Microsoft Entra ID, Group Policy, DNS DHCP
  // ============================================================
  'windows-server': {
    title: 'Windows Server & System Administration Training | Techwell',
    description: 'Master Windows Server administration, Active Directory, PowerShell, Azure AD, and Group Policy with Techwell. Build skills for System Administrator and Windows Engineer roles.',
    h1: 'Windows Server & System Administration Training',
    subheading: 'Core infrastructure skills powering enterprise IT environments.',
    intro: 'Windows Server administration is a critical skill in nearly every enterprise IT environment. Techwell\'s training covers Windows Server setup, configuration, and management — including Active Directory (AD DS), Microsoft Entra ID (Azure AD), DNS, DHCP, Group Policy, PowerShell automation, and server security hardening. This training builds the core infrastructure knowledge needed for System Administrator, IT Administrator, and Windows Engineer roles.',
    features: [
      { icon: '🖥️', title: 'Windows Server Administration', body: 'Installation, configuration, roles, features, and server management across Windows Server versions.' },
      { icon: '🔑', title: 'Active Directory & Identity', body: 'AD DS, Microsoft Entra ID (Azure AD), user and group management, OU structure, and RBAC.' },
      { icon: '⚙️', title: 'Group Policy & PowerShell', body: 'GPO design and implementation, PowerShell scripting for automation and system management.' },
      { icon: '🌐', title: 'DNS, DHCP & Infrastructure', body: 'DNS zone management, DHCP configuration, and Windows network infrastructure services.' },
    ],
    tools: ['Windows Server 2022', 'Active Directory', 'Microsoft Entra ID', 'PowerShell', 'Group Policy', 'DNS', 'DHCP', 'ADUC', 'WSUS', 'Hyper-V', 'Azure AD Connect'],
    careerPaths: ['System Administrator', 'Windows Administrator', 'IT Administrator', 'Infrastructure Engineer', 'Active Directory Engineer', 'Cloud Identity Engineer'],
    faqs: [
      { q: 'Does this training cover Microsoft Entra ID (Azure AD)?', a: 'Yes. The training includes both on-premises Active Directory and Microsoft Entra ID (formerly Azure AD) — covering hybrid identity scenarios that are common in modern enterprise environments.' },
      { q: 'Is PowerShell covered in the course?', a: 'Yes. PowerShell scripting for system administration tasks — including user management, GPO automation, and reporting — is a core component of the training.' },
    ],
    ctaPrimary: { label: 'Explore Windows Server Courses', href: '/courses' },
    ctaSecondary: { label: 'View All IT Training', href: '/it-training' },
    crossLink: {
      heading: 'Practice Windows & Sysadmin Assessments',
      text: 'Reinforce your knowledge with technical assessments covering Windows administration concepts on eLearnStack.',
      cta: 'Practice on eLearnStack',
      url: 'https://elearnstack.com',
    },
    relatedLinks: [
      { label: 'Linux', href: '/linux' },
      { label: 'Endpoint Management', href: '/endpoint-management' },
      { label: 'Cloud Computing', href: '/cloud-computing' },
      { label: 'IT Training Hub', href: '/it-training' },
    ],
  },

  // ============================================================
  // LINUX
  // Covers: Linux admin, Red Hat Linux, Linux server, Linux security,
  //         Linux networking, Linux administrator jobs
  // ============================================================
  'linux': {
    title: 'Linux Administration Training | Linux Server & System Admin | Techwell',
    description: 'Learn Linux system administration with Techwell. Covers Linux fundamentals, server management, networking, security hardening, and scripting for Linux Administrator and Engineer roles.',
    h1: 'Linux Administration Training',
    subheading: 'The operating system that powers cloud, DevOps, and enterprise infrastructure.',
    intro: 'Linux powers the majority of the world\'s servers, cloud infrastructure, and DevOps environments. Techwell\'s Linux training covers system administration from fundamentals through to production-level skills — including file systems, user management, networking, security hardening, shell scripting, and package management. Linux is an essential prerequisite for Cloud, DevOps, Cyber Security, and SRE careers.',
    features: [
      { icon: '🐧', title: 'Linux Fundamentals', body: 'File system hierarchy, command line proficiency, process management, and shell navigation.' },
      { icon: '👥', title: 'User & Permission Management', body: 'Users, groups, file permissions, sudo, PAM, and access control management.' },
      { icon: '🌐', title: 'Linux Networking', body: 'Network interface configuration, SSH, firewall (iptables/firewalld), and network troubleshooting.' },
      { icon: '🔒', title: 'Linux Security Hardening', body: 'SELinux, audit logs, syslog, service hardening, and basic intrusion detection.' },
    ],
    tools: ['Ubuntu', 'CentOS / RHEL', 'Bash Shell', 'iptables', 'firewalld', 'SSH', 'cron', 'systemd', 'vim', 'grep/awk/sed', 'Ansible', 'Docker'],
    careerPaths: ['Linux System Administrator', 'Linux Engineer', 'Cloud Infrastructure Engineer', 'DevOps Engineer', 'Site Reliability Engineer', 'Cyber Security Analyst'],
    faqs: [
      { q: 'Is Linux training suitable for Windows administrators?', a: 'Yes. We cover Linux from fundamentals, making it accessible to candidates coming from Windows-only backgrounds. The course is structured to bridge the knowledge gap progressively.' },
      { q: 'Why is Linux important for cloud and DevOps careers?', a: 'Virtually all cloud infrastructure (AWS, Azure, GCP) and DevOps tooling (Docker, Kubernetes, Jenkins) runs on Linux. Understanding Linux is a prerequisite for serious cloud and DevOps roles.' },
    ],
    ctaPrimary: { label: 'Explore Linux Courses', href: '/courses' },
    ctaSecondary: { label: 'DevOps Training', href: '/devops' },
    crossLink: {
      heading: 'Practice Linux & Technical Assessments',
      text: 'Test your Linux knowledge with technical aptitude and command-line assessments on eLearnStack.',
      cta: 'Practice on eLearnStack',
      url: 'https://elearnstack.com',
    },
    relatedLinks: [
      { label: 'Cloud Computing', href: '/cloud-computing' },
      { label: 'DevOps', href: '/devops' },
      { label: 'Cyber Security', href: '/cyber-security' },
      { label: 'IT Training Hub', href: '/it-training' },
    ],
  },

  // ============================================================
  // CLOUD COMPUTING
  // Covers: cloud training, Azure, AWS, cloud admin, cloud engineer,
  //         cloud security, cloud architecture, cloud jobs
  // ============================================================
  'cloud-computing': {
    title: 'Cloud Computing Training | Azure & AWS | Cloud Engineer | Techwell',
    description: 'Learn cloud computing with Techwell. Covers Microsoft Azure, AWS, cloud architecture, cloud security, and career preparation for Cloud Administrator and Cloud Engineer roles.',
    h1: 'Cloud Computing Training — Azure & AWS',
    subheading: 'Master the platforms powering modern businesses.',
    intro: 'Cloud computing is the defining infrastructure shift of the last decade — and cloud skills are among the most in-demand across the technology job market. Techwell\'s Cloud Computing training covers both Microsoft Azure and Amazon Web Services (AWS) — from foundational concepts and core services through to cloud architecture, security, cost optimisation, and DevOps integration. Training is structured to prepare you for cloud administrator and cloud engineer roles.',
    features: [
      { icon: '☁️', title: 'Azure & AWS Fundamentals', body: 'Core cloud concepts, service models (IaaS/PaaS/SaaS), regions, and pricing structures on both major platforms.' },
      { icon: '🏗️', title: 'Cloud Architecture', body: 'Designing scalable, resilient, and cost-effective cloud architectures using well-architected framework principles.' },
      { icon: '🔐', title: 'Cloud Security', body: 'Identity and access management (IAM), network security groups, encryption, compliance, and cloud security best practices.' },
      { icon: '🔄', title: 'Cloud DevOps Integration', body: 'Azure DevOps, AWS CodePipeline, CI/CD in the cloud, and infrastructure automation with Terraform.' },
    ],
    tools: ['Microsoft Azure', 'AWS', 'Azure Active Directory', 'Azure DevOps', 'AWS IAM', 'S3', 'EC2', 'Azure VMs', 'Terraform', 'Azure CLI', 'AWS CLI', 'CloudFormation', 'Azure Monitor'],
    careerPaths: ['Cloud Administrator', 'Cloud Engineer', 'Azure Administrator', 'AWS Solutions Architect', 'Cloud Security Engineer', 'DevOps Engineer (Cloud)', 'Cloud Infrastructure Engineer'],
    faqs: [
      { q: 'Should I learn Azure or AWS?', a: 'Both are in high demand. Azure is dominant in enterprise environments, especially those using Microsoft technologies. AWS has the largest market share overall. Techwell\'s training covers both, helping you understand the principles transferable across platforms.' },
      { q: 'Do I need prior experience for cloud training?', a: 'Basic IT knowledge (networking, operating systems) is helpful. We offer a fundamentals track that builds cloud literacy from the ground up before moving to architecture and security topics.' },
      { q: 'Does cloud training prepare me for Microsoft certifications?', a: 'Our training covers knowledge aligned with Azure Administrator (AZ-104) and similar certification domains. Certification exam fees and registration are handled externally.' },
    ],
    ctaPrimary: { label: 'Explore Cloud Courses', href: '/courses' },
    ctaSecondary: { label: 'DevOps Training', href: '/devops' },
    crossLink: {
      heading: 'Assess Your Cloud Knowledge',
      text: 'Test your Azure and AWS understanding with cloud-specific technical assessments on eLearnStack.',
      cta: 'Practice on eLearnStack',
      url: 'https://elearnstack.com',
    },
    relatedLinks: [
      { label: 'DevOps', href: '/devops' },
      { label: 'Linux', href: '/linux' },
      { label: 'Cyber Security', href: '/cyber-security' },
      { label: 'Site Reliability Engineering', href: '/site-reliability-engineering' },
      { label: 'IT Training Hub', href: '/it-training' },
    ],
  },

  // ============================================================
  // DEVOPS
  // Covers: DevOps, CI/CD, Jenkins, Git, Docker, Kubernetes,
  //         Terraform, Ansible, DevOps jobs, DevOps interview prep
  // ============================================================
  'devops': {
    title: 'DevOps Training | Docker, Kubernetes, CI/CD & Terraform | Techwell',
    description: 'Learn DevOps with Techwell. Covers CI/CD pipelines, Docker, Kubernetes, Terraform, Jenkins, Git, Ansible, and Azure DevOps. Hands-on projects and career support for DevOps Engineer roles.',
    h1: 'DevOps Training — Build, Automate, Deploy',
    subheading: 'The skills that bridge development, operations, and cloud.',
    intro: 'DevOps is one of the highest-paying and fastest-growing disciplines in technology. Techwell\'s DevOps training covers the complete toolchain: version control with Git, CI/CD pipelines with Jenkins and Azure DevOps, containerisation with Docker, orchestration with Kubernetes, infrastructure as code with Terraform, and configuration management with Ansible. Every module includes hands-on projects that form your DevOps portfolio.',
    features: [
      { icon: '🔁', title: 'CI/CD Pipelines', body: 'Build and maintain automated build, test, and deployment pipelines using Jenkins and Azure DevOps.' },
      { icon: '🐳', title: 'Docker & Containers', body: 'Containerise applications, build Docker images, and manage container environments in production.' },
      { icon: '☸️', title: 'Kubernetes Orchestration', body: 'Deploy, manage, and scale containerised applications across Kubernetes clusters.' },
      { icon: '🏗️', title: 'Infrastructure as Code', body: 'Provision and manage infrastructure declaratively using Terraform and Ansible.' },
    ],
    tools: ['Git', 'GitHub', 'Jenkins', 'Azure DevOps', 'Docker', 'Docker Compose', 'Kubernetes', 'Helm', 'Terraform', 'Ansible', 'Prometheus', 'Grafana', 'Linux', 'AWS', 'Azure'],
    careerPaths: ['DevOps Engineer', 'Cloud DevOps Engineer', 'Site Reliability Engineer', 'Platform Engineer', 'Build & Release Engineer', 'Infrastructure Engineer', 'DevSecOps Engineer'],
    quickAnswers: [
      { q: 'What is DevOps training?', a: 'DevOps training teaches engineers to bridge development and operations through automation, continuous integration and deployment (CI/CD), containerisation with Docker and Kubernetes, infrastructure as code with Terraform, and cloud platform integration. DevOps engineers are among the highest-paid professionals in IT.' },
      { q: 'What tools are covered in DevOps training?', a: 'DevOps training at Techwell covers Git, GitHub, Jenkins, Azure DevOps, Docker, Docker Compose, Kubernetes, Helm, Terraform, Ansible, Prometheus, Grafana, and both AWS and Azure cloud platforms.' },
      { q: 'What jobs does DevOps training lead to?', a: 'DevOps Engineer, Cloud DevOps Engineer, Platform Engineer, Site Reliability Engineer (SRE), Build and Release Engineer, and Infrastructure Engineer are common roles after completing DevOps training.' },
    ],
    faqs: [
      { q: 'What prerequisites do I need for DevOps training?', a: 'Familiarity with Linux command line and at least one programming or scripting language (Bash, Python) is recommended. Basic networking knowledge also helps. We can advise on prerequisite courses if needed.' },
      { q: 'Is Kubernetes included in the DevOps training?', a: 'Yes. Kubernetes is covered in depth — including cluster management, deployments, services, ingress, persistent storage, and Helm chart management.' },
      { q: 'Does Techwell help with DevOps interview preparation?', a: 'Yes. DevOps interview preparation is part of our career support — including technical mock interviews, CI/CD scenario questions, and live project experience you can discuss in interviews.' },
    ],
    ctaPrimary: { label: 'Explore DevOps Courses', href: '/courses' },
    ctaSecondary: { label: 'Cloud Computing Training', href: '/cloud-computing' },
    crossLink: {
      heading: 'Practice DevOps Technical Assessments',
      text: 'Test your DevOps, Linux, and cloud knowledge with targeted assessments on eLearnStack.',
      cta: 'Practice on eLearnStack',
      url: 'https://elearnstack.com',
    },
    relatedLinks: [
      { label: 'DevSecOps', href: '/devsecops' },
      { label: 'Cloud Computing', href: '/cloud-computing' },
      { label: 'Linux', href: '/linux' },
      { label: 'Site Reliability Engineering', href: '/site-reliability-engineering' },
      { label: 'IT Training Hub', href: '/it-training' },
    ],
  },

  // ============================================================
  // DEVSECOPS
  // Covers: DevSecOps, secure CI/CD, DevSecOps pipeline, DevSecOps jobs
  // ============================================================
  'devsecops': {
    title: 'DevSecOps Training | Secure CI/CD & Security Engineering | Techwell',
    description: 'Learn DevSecOps with Techwell. Covers secure CI/CD pipelines, SAST/DAST, container security, secrets management, and DevSecOps engineering career preparation.',
    h1: 'DevSecOps Training — Security Baked Into Every Build',
    subheading: 'Shift security left and integrate it into every stage of development.',
    intro: 'DevSecOps is the evolution of DevOps — integrating security practices directly into the CI/CD pipeline rather than treating security as an afterthought. Techwell\'s DevSecOps training teaches engineers how to build secure pipelines, implement SAST/DAST scanning, manage secrets, harden container environments, and comply with security policies throughout the software development lifecycle. It is a natural progression for DevOps engineers seeking to specialise in security.',
    features: [
      { icon: '🔒', title: 'Shift-Left Security', body: 'Integrate security checks at every stage — code, build, test, deploy — rather than only at the end.' },
      { icon: '🔍', title: 'SAST & DAST Scanning', body: 'Static and dynamic application security testing integrated into automated pipeline stages.' },
      { icon: '🐳', title: 'Container Security', body: 'Secure Docker images, Kubernetes policies, and runtime security for containerised environments.' },
      { icon: '🔑', title: 'Secrets Management', body: 'Manage API keys, credentials, and certificates securely using vault solutions and pipeline-native tools.' },
    ],
    tools: ['Jenkins', 'Azure DevOps', 'SonarQube', 'OWASP ZAP', 'Trivy', 'Snyk', 'HashiCorp Vault', 'Docker', 'Kubernetes', 'GitHub Actions', 'Checkov', 'Terraform'],
    careerPaths: ['DevSecOps Engineer', 'Security Engineer (DevOps)', 'Application Security Engineer', 'Cloud Security Engineer', 'Platform Security Engineer'],
    faqs: [
      { q: 'Is DevSecOps training suitable for DevOps engineers?', a: 'Yes. DevSecOps is the natural next step for DevOps engineers who want to specialise in security. A background in DevOps and CI/CD is beneficial before starting this training.' },
      { q: 'What is the difference between DevSecOps and Application Security?', a: 'DevSecOps focuses on integrating security into the CI/CD pipeline and development workflow. Application Security (AppSec) focuses on assessing and securing the application itself — code, API, web layer. There is significant overlap and both disciplines work together in modern organisations.' },
    ],
    ctaPrimary: { label: 'Explore DevSecOps Courses', href: '/courses' },
    ctaSecondary: { label: 'DevOps Training', href: '/devops' },
    crossLink: {
      heading: 'Practice Security & DevOps Assessments',
      text: 'Test your DevSecOps and security knowledge with technical assessments on eLearnStack.',
      cta: 'Practice on eLearnStack',
      url: 'https://elearnstack.com',
    },
    relatedLinks: [
      { label: 'DevOps', href: '/devops' },
      { label: 'Application Security', href: '/application-security' },
      { label: 'Cyber Security', href: '/cyber-security' },
      { label: 'IT Training Hub', href: '/it-training' },
    ],
  },

  // ============================================================
  // APPLICATION SECURITY
  // Covers: AppSec, OWASP, Secure SDLC, web app security,
  //         API security, application security engineer jobs
  // ============================================================
  'application-security': {
    title: 'Application Security Training | OWASP, AppSec & Secure SDLC | Techwell',
    description: 'Learn Application Security with Techwell. Covers OWASP Top 10, Secure SDLC, web application security, API security, and career preparation for Application Security Engineer roles.',
    h1: 'Application Security Training — Secure Code, Secure Applications',
    subheading: 'Find and fix vulnerabilities before attackers do.',
    intro: 'Application Security (AppSec) is the discipline of identifying, fixing, and preventing security vulnerabilities in software — from code review and threat modelling through to penetration testing of web applications and APIs. Techwell\'s Application Security training covers the OWASP Top 10, Secure Software Development Lifecycle (Secure SDLC), web application security testing, API security, and integration of security into development workflows.',
    features: [
      { icon: '🔟', title: 'OWASP Top 10', body: 'Deep understanding of the most critical web application vulnerabilities — injection, XSS, SSRF, broken authentication, and more.' },
      { icon: '🔄', title: 'Secure SDLC', body: 'Security integrated at requirements, design, development, testing, and deployment phases.' },
      { icon: '🔌', title: 'API Security', body: 'REST and GraphQL API security testing, authentication flaws, rate limiting, and OWASP API Security Top 10.' },
      { icon: '🧪', title: 'Web Application Testing', body: 'Practical testing using Burp Suite, OWASP ZAP, and manual testing techniques.' },
    ],
    tools: ['Burp Suite', 'OWASP ZAP', 'Nikto', 'SQLMap', 'Postman', 'SonarQube', 'Semgrep', 'Docker', 'OWASP Top 10', 'OWASP API Security'],
    careerPaths: ['Application Security Engineer', 'AppSec Analyst', 'Security Engineer (Software)', 'Penetration Tester (Web)', 'DevSecOps Engineer', 'Security Researcher'],
    faqs: [
      { q: 'What is the difference between Application Security and Cyber Security?', a: 'Cyber Security is a broad field covering network security, endpoint security, SOC, and more. Application Security specifically focuses on the security of software applications — finding vulnerabilities in code, APIs, and web applications. AppSec engineers typically work closely with development teams.' },
      { q: 'Is Burp Suite covered in the training?', a: 'Yes. Burp Suite Community and Pro are covered extensively — including interception, scanning, active/passive testing, and Burp Intruder for security testing scenarios.' },
    ],
    ctaPrimary: { label: 'Explore AppSec Courses', href: '/courses' },
    ctaSecondary: { label: 'Cyber Security Training', href: '/cyber-security' },
    crossLink: {
      heading: 'Practice Application Security Assessments',
      text: 'Reinforce your AppSec knowledge with web security and technical assessments on eLearnStack.',
      cta: 'Practice on eLearnStack',
      url: 'https://elearnstack.com',
    },
    relatedLinks: [
      { label: 'Cyber Security / VAPT', href: '/cyber-security' },
      { label: 'DevSecOps', href: '/devsecops' },
      { label: 'Full Stack Development', href: '/full-stack-development' },
      { label: 'IT Training Hub', href: '/it-training' },
    ],
  },

  // ============================================================
  // CYBER SECURITY / VAPT
  // Covers: cyber security, ethical hacking, VAPT, penetration testing,
  //         SOC, security analyst, network security, OWASP, Burp Suite
  // ============================================================
  'cyber-security': {
    title: 'Cyber Security Training | Ethical Hacking, VAPT & SOC | Techwell',
    description: 'Learn Cyber Security with Techwell. Covers ethical hacking, VAPT, penetration testing, network security, SOC operations, and career preparation for security engineer and analyst roles.',
    h1: 'Cyber Security Training — Defend, Detect, Respond',
    subheading: 'One of the highest-demand, highest-paying technology career fields.',
    intro: 'Cyber Security is a critical and fast-growing discipline — every organisation that uses technology needs security professionals to protect it. Techwell\'s Cyber Security training covers the full spectrum: networking security fundamentals, ethical hacking and VAPT (Vulnerability Assessment and Penetration Testing), web application security, SOC operations, SIEM, and incident response. Training is suitable for both freshers entering the field and IT professionals seeking to specialise.',
    features: [
      { icon: '🎯', title: 'Ethical Hacking & VAPT', body: 'Reconnaissance, scanning, exploitation, and post-exploitation using industry-standard tools and methodologies.' },
      { icon: '🌐', title: 'Network Security', body: 'Firewalls, IDS/IPS, VPN security, network monitoring, and traffic analysis.' },
      { icon: '📡', title: 'SOC Operations', body: 'Security Operations Centre workflows, alert triage, SIEM tools, log analysis, and incident response.' },
      { icon: '🔟', title: 'Web Application Security', body: 'OWASP Top 10, Burp Suite testing, manual web application and API security assessment.' },
    ],
    tools: ['Kali Linux', 'Burp Suite', 'Nmap', 'Nessus', 'Metasploit', 'Wireshark', 'OWASP ZAP', 'Splunk', 'Microsoft Sentinel', 'Nikto', 'SQLMap', 'Aircrack-ng'],
    careerPaths: ['Cyber Security Analyst', 'SOC Analyst (L1/L2)', 'Penetration Tester', 'VAPT Engineer', 'Network Security Engineer', 'Application Security Engineer', 'Security Engineer', 'Threat Intelligence Analyst'],
    quickAnswers: [
      { q: 'What is cyber security training?', a: 'Cyber security training teaches you to protect computer systems, networks, and applications from digital attacks. It covers ethical hacking, penetration testing (VAPT), network security, SOC operations, and incident response — preparing you for roles like Cyber Security Analyst, Penetration Tester, and SOC Analyst.' },
      { q: 'What is VAPT?', a: 'VAPT stands for Vulnerability Assessment and Penetration Testing. It is the practice of systematically identifying and exploiting security weaknesses in systems, networks, and applications — ethically, with authorisation — to find and fix vulnerabilities before real attackers can exploit them.' },
      { q: 'What jobs can I get after cyber security training?', a: 'Common roles after cyber security training include Cyber Security Analyst, SOC Analyst, Penetration Tester, VAPT Engineer, Network Security Engineer, Application Security Engineer, and Cloud Security Engineer. Cyber security is one of the fastest-growing and highest-paying fields in IT.' },
    ],
    faqs: [
      { q: 'What is VAPT training?', a: 'VAPT stands for Vulnerability Assessment and Penetration Testing. VAPT training teaches you to systematically identify weaknesses in systems, networks, and applications — using the same techniques that real attackers use, but ethically and with authorisation.' },
      { q: 'Does this training prepare for cyber security certifications?', a: 'Our training builds practical knowledge aligned with common certification domains. Certification exams (CEH, CompTIA Security+, OSCP etc.) are separate — we prepare you with the practical foundation.' },
      { q: 'Is cyber security training available for freshers?', a: 'Yes. Our beginner track starts from networking fundamentals and basic security concepts before progressing to ethical hacking and SOC operations.' },
      { q: 'Can I get a cyber security job after this training?', a: 'Our training is integrated with career support — resume building, mock interviews, and job assistance referrals. Cyber security roles are in high demand and this training prepares you for both entry-level analyst and specialist roles.' },
    ],
    ctaPrimary: { label: 'Explore Cyber Security Courses', href: '/courses' },
    ctaSecondary: { label: 'Application Security', href: '/application-security' },
    crossLink: {
      heading: 'Practice Cyber Security Assessments',
      text: 'Reinforce your security knowledge with technical assessments and aptitude practice on eLearnStack.',
      cta: 'Practice on eLearnStack',
      url: 'https://elearnstack.com',
    },
    relatedLinks: [
      { label: 'Application Security', href: '/application-security' },
      { label: 'DevSecOps', href: '/devsecops' },
      { label: 'Networking', href: '/networking' },
      { label: 'Cloud Computing', href: '/cloud-computing' },
      { label: 'IT Training Hub', href: '/it-training' },
    ],
  },

  // ============================================================
  // ENDPOINT MANAGEMENT
  // Covers: Intune, ManageEngine, SCCM/MECM, MDM, UEM,
  //         patch management, device deployment, endpoint admin jobs
  // ============================================================
  'endpoint-management': {
    title: 'Endpoint Management Training | Intune, SCCM & ManageEngine | Techwell',
    description: 'Learn endpoint management with Techwell. Covers Microsoft Intune, ManageEngine Endpoint Central, SCCM/MECM, MDM, patch management, and Endpoint Administrator career preparation.',
    h1: 'Endpoint Management Training — Intune, SCCM & ManageEngine',
    subheading: 'Manage, secure, and deploy devices at enterprise scale.',
    intro: 'Endpoint management is a rapidly growing specialisation — as organisations manage thousands of Windows, Mac, iOS, and Android devices across hybrid workforces. Techwell\'s Endpoint Management training covers the leading platforms: Microsoft Intune and Microsoft Endpoint Manager (MECM/SCCM), ManageEngine Endpoint Central, and unified endpoint management (UEM) principles. You will learn device enrolment, configuration profiles, patch management, software deployment, and endpoint security compliance.',
    features: [
      { icon: '📱', title: 'MDM & UEM', body: 'Mobile Device Management and Unified Endpoint Management across Windows, macOS, iOS, and Android.' },
      { icon: '🔧', title: 'Microsoft Intune', body: 'Intune device enrolment, compliance policies, app deployment, Conditional Access, and Autopilot.' },
      { icon: '🛠️', title: 'SCCM / MECM', body: 'Site configuration, OSD, software distribution, patch management, and reporting with MECM.' },
      { icon: '🔒', title: 'Endpoint Security', body: 'Endpoint compliance, BitLocker management, Microsoft Defender integration, and security baseline policies.' },
    ],
    tools: ['Microsoft Intune', 'Microsoft Endpoint Manager', 'ManageEngine Endpoint Central', 'SCCM/MECM', 'Windows Autopilot', 'Azure AD', 'Microsoft Defender', 'PowerShell', 'Group Policy', 'WDS'],
    careerPaths: ['Endpoint Administrator', 'Intune Engineer', 'SCCM Administrator', 'Device Management Engineer', 'Modern Workplace Engineer', 'Desktop Engineer (Senior)', 'IT Infrastructure Engineer'],
    faqs: [
      { q: 'Is Intune training covered separately from SCCM?', a: 'Yes. We cover both Microsoft Intune (cloud-based MDM/UEM) and SCCM/MECM (on-premises management) — as well as the co-management scenario where both are used together. This reflects modern enterprise environments.' },
      { q: 'Is ManageEngine Endpoint Central covered?', a: 'Yes. ManageEngine Endpoint Central is covered as a widely-used alternative to Microsoft\'s endpoint management stack — particularly relevant for SME and mid-enterprise environments.' },
    ],
    ctaPrimary: { label: 'Explore Endpoint Courses', href: '/courses' },
    ctaSecondary: { label: 'Windows Server Training', href: '/windows-server' },
    crossLink: {
      heading: 'Practice Endpoint & Windows Assessments',
      text: 'Sharpen your Intune and endpoint management knowledge with technical assessments on eLearnStack.',
      cta: 'Practice on eLearnStack',
      url: 'https://elearnstack.com',
    },
    relatedLinks: [
      { label: 'Windows Server', href: '/windows-server' },
      { label: 'Desktop Support', href: '/desktop-support' },
      { label: 'Cloud Computing', href: '/cloud-computing' },
      { label: 'IT Training Hub', href: '/it-training' },
    ],
  },

  // ============================================================
  // SITE RELIABILITY ENGINEERING / SRE / OBSERVABILITY
  // Covers: SRE, observability, Datadog, Splunk, Grafana, Prometheus,
  //         application monitoring, cloud monitoring, SRE jobs
  // ============================================================
  'site-reliability-engineering': {
    title: 'SRE Training | Site Reliability Engineering & Observability | Techwell',
    description: 'Learn Site Reliability Engineering (SRE) with Techwell. Covers observability, Datadog, Prometheus, Grafana, incident management, and SRE career preparation.',
    h1: 'Site Reliability Engineering (SRE) Training',
    subheading: 'Keep systems running, reliable, and observable at scale.',
    intro: 'Site Reliability Engineering (SRE) applies software engineering to operations — ensuring systems are reliable, scalable, and observable. Techwell\'s SRE training covers core SRE principles (SLOs, SLIs, SLAs, error budgets), observability and monitoring tooling, alerting strategy, incident management, and automation. This training bridges advanced DevOps and cloud skills into a specialised discipline that commands strong salaries in senior technology roles.',
    features: [
      { icon: '📊', title: 'Observability & Monitoring', body: 'Build comprehensive monitoring stacks using Prometheus, Grafana, Datadog, and distributed tracing.' },
      { icon: '⚡', title: 'SLOs & Error Budgets', body: 'Define and measure Service Level Objectives, Indicators, and manage reliability through error budget policy.' },
      { icon: '🚨', title: 'Incident Management', body: 'On-call best practices, runbook design, post-mortem analysis, and blameless incident culture.' },
      { icon: '🤖', title: 'Toil Elimination & Automation', body: 'Identify and automate operational toil using Python, Ansible, and infrastructure automation tooling.' },
    ],
    tools: ['Prometheus', 'Grafana', 'Datadog', 'Splunk', 'Elasticsearch', 'Jaeger', 'OpenTelemetry', 'PagerDuty', 'Kubernetes', 'Terraform', 'Python', 'Linux', 'AWS CloudWatch'],
    careerPaths: ['Site Reliability Engineer', 'DevOps SRE', 'Platform Engineer', 'Observability Engineer', 'Cloud Operations Engineer', 'Infrastructure Engineer (Senior)'],
    faqs: [
      { q: 'What is the difference between SRE and DevOps?', a: 'DevOps is a cultural and process framework for software delivery. SRE is a specific implementation of DevOps principles with a strong focus on reliability, observability, and eliminating operational toil through software engineering. SRE roles typically require advanced DevOps and cloud experience.' },
      { q: 'What prerequisites do I need for SRE training?', a: 'We recommend completing DevOps and Cloud training first. Familiarity with Linux, Docker/Kubernetes, and at least one scripting language (Python or Bash) is expected for SRE-level training.' },
    ],
    ctaPrimary: { label: 'Explore SRE Courses', href: '/courses' },
    ctaSecondary: { label: 'DevOps Training', href: '/devops' },
    crossLink: {
      heading: 'Practice SRE & Monitoring Assessments',
      text: 'Test your observability and reliability knowledge with technical assessments on eLearnStack.',
      cta: 'Practice on eLearnStack',
      url: 'https://elearnstack.com',
    },
    relatedLinks: [
      { label: 'DevOps', href: '/devops' },
      { label: 'Cloud Computing', href: '/cloud-computing' },
      { label: 'Linux', href: '/linux' },
      { label: 'IT Training Hub', href: '/it-training' },
    ],
  },

  // ============================================================
  // IT SERVICE MANAGEMENT / ITSM
  // Covers: ITSM, ITIL, ServiceNow, incident management,
  //         problem management, change management, service desk
  // ============================================================
  'it-service-management': {
    title: 'IT Service Management Training | ITSM, ITIL & ServiceNow | Techwell',
    description: 'Learn IT Service Management (ITSM) with Techwell. Covers ITIL framework, ServiceNow, incident management, change management, and ITSM career preparation.',
    h1: 'IT Service Management (ITSM) Training',
    subheading: 'Deliver IT services that work — efficiently and reliably.',
    intro: 'IT Service Management (ITSM) is the discipline that structures how IT services are planned, delivered, and managed in organisations. Techwell\'s ITSM training covers the ITIL framework — the globally recognised best practice standard — along with practical training on ServiceNow, the leading ITSM platform. The training covers the service lifecycle: incident management, problem management, change management, and service desk operations.',
    features: [
      { icon: '📋', title: 'ITIL Framework', body: 'ITIL 4 concepts: service value system, four dimensions, and the key ITIL practices across the service lifecycle.' },
      { icon: '🔔', title: 'Incident & Problem Management', body: 'Structured approaches to detecting, escalating, resolving, and preventing recurring incidents.' },
      { icon: '🔄', title: 'Change Management', body: 'Change Advisory Boards (CAB), change categories, risk assessment, and controlled change implementation.' },
      { icon: '🖥️', title: 'ServiceNow', body: 'Practical use of ServiceNow for ticket management, workflows, SLA tracking, and CMDB basics.' },
    ],
    tools: ['ServiceNow', 'Jira Service Management', 'Freshservice', 'ManageEngine ServiceDesk Plus', 'CMDB', 'Excel (SLA reporting)'],
    careerPaths: ['ITSM Analyst', 'Service Desk Manager', 'IT Operations Manager', 'Change Manager', 'Problem Manager', 'ServiceNow Administrator', 'ITIL Process Owner'],
    faqs: [
      { q: 'Is ITIL certification covered in this training?', a: 'Our training covers ITIL 4 Foundation concepts thoroughly. The ITIL 4 Foundation certification exam is an externally administered exam — we prepare you with the knowledge; registration and exam fees are separate.' },
      { q: 'Is ServiceNow included in the training?', a: 'Yes. Practical ServiceNow training — covering the ITSM module, ticket workflows, SLA configuration, and CMDB basics — is included.' },
    ],
    ctaPrimary: { label: 'Explore ITSM Courses', href: '/courses' },
    ctaSecondary: { label: 'Desktop Support Training', href: '/desktop-support' },
    relatedLinks: [
      { label: 'Desktop Support', href: '/desktop-support' },
      { label: 'Windows Server', href: '/windows-server' },
      { label: 'Endpoint Management', href: '/endpoint-management' },
      { label: 'IT Training Hub', href: '/it-training' },
    ],
  },

  // ============================================================
  // AI / ML — upgraded with tools + career path
  // ============================================================
  'ai-ml': {
    title: 'AI & Machine Learning Training | Generative AI & LLMs | Techwell',
    description: 'Learn AI, Machine Learning, and Generative AI with Techwell. Covers ML fundamentals, deep learning, LLMs, prompt engineering, and AI/ML career preparation.',
    h1: 'AI & Machine Learning Training',
    subheading: 'Skills for the most in-demand technology careers of this decade.',
    intro: 'Artificial Intelligence and Machine Learning are reshaping every industry. Techwell\'s AI/ML training covers the complete journey: machine learning fundamentals, deep learning, natural language processing, large language models (LLMs), generative AI, and AI automation. Practical projects use industry-standard frameworks and real datasets. Career paths after this training include AI Engineer, ML Engineer, Data Scientist, and AI Automation Specialist.',
    features: [
      { icon: '🧠', title: 'ML Foundations to Advanced', body: 'Linear and logistic regression, decision trees, neural networks, deep learning, and model evaluation.' },
      { icon: '🤖', title: 'Generative AI & LLMs', body: 'Large language models, prompt engineering, RAG architectures, and building AI-powered applications.' },
      { icon: '🛠️', title: 'Hands-On with Real Data', body: 'Projects using Python, TensorFlow, PyTorch, scikit-learn, and cloud AI platforms (Azure, AWS).' },
      { icon: '⚡', title: 'AI Automation Workflows', body: 'Building AI agents, automation pipelines, and integrating AI APIs into production applications.' },
    ],
    tools: ['Python', 'TensorFlow', 'PyTorch', 'scikit-learn', 'Hugging Face', 'LangChain', 'OpenAI API', 'Jupyter', 'Pandas', 'NumPy', 'Azure AI', 'AWS SageMaker'],
    careerPaths: ['AI Engineer', 'Machine Learning Engineer', 'Data Scientist', 'AI Automation Specialist', 'Prompt Engineer', 'NLP Engineer', 'Generative AI Developer'],
    faqs: [
      { q: 'Do I need prior experience to start AI/ML training?', a: 'A working knowledge of Python programming is recommended. We offer a Python foundations module as a prerequisite for candidates who need it.' },
      { q: 'What career roles does AI/ML training lead to?', a: 'AI Engineer, Machine Learning Engineer, Data Scientist, AI Automation Specialist, Prompt Engineer, NLP Engineer, and Generative AI Developer are all current high-demand roles this training prepares you for.' },
    ],
    ctaPrimary: { label: 'Explore AI/ML Courses', href: '/courses' },
    ctaSecondary: { label: 'Vibe Coding', href: '/vibe-coding' },
    crossLink: {
      heading: 'Practice Technical Assessments',
      text: 'Test your logical reasoning, Python aptitude, and technical knowledge with assessments on eLearnStack.',
      cta: 'Practice on eLearnStack',
      url: 'https://elearnstack.com',
    },
    relatedLinks: [
      { label: 'Full Stack Development', href: '/full-stack-development' },
      { label: 'Vibe Coding', href: '/vibe-coding' },
      { label: 'IT Training Hub', href: '/it-training' },
    ],
  },

  // ============================================================
  // FULL STACK DEVELOPMENT — upgraded with tools + career path
  // ============================================================
  'full-stack-development': {
    title: 'Full Stack Development Training | React, Node.js & Cloud | Techwell',
    description: 'Learn Full Stack Development with Techwell. Covers React, Next.js, Node.js, Python, databases, REST APIs, and cloud deployment. Build real projects and launch your developer career.',
    h1: 'Full Stack Development Training',
    subheading: 'Build complete applications — front to back.',
    intro: 'Full Stack Development is one of the most versatile and in-demand skill sets in technology. Techwell\'s Full Stack training covers the complete web application stack — React and Next.js on the frontend, Node.js and Python on the backend, SQL and NoSQL databases, REST APIs and GraphQL, authentication, and cloud deployment. Every student graduates with a working portfolio of real applications built from scratch.',
    features: [
      { icon: '🌐', title: 'Frontend Development', body: 'HTML, CSS, JavaScript, TypeScript, React, and Next.js — building responsive, production-quality interfaces.' },
      { icon: '⚙️', title: 'Backend & APIs', body: 'Node.js, Express, Python/FastAPI, REST APIs, GraphQL, authentication, and server architecture.' },
      { icon: '🗄️', title: 'Databases', body: 'PostgreSQL, MySQL, MongoDB — schema design, queries, indexing, and ORM usage.' },
      { icon: '☁️', title: 'Deployment & DevOps Basics', body: 'Docker, Git, CI/CD basics, and AWS/Azure deployment for production applications.' },
    ],
    tools: ['HTML/CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Express', 'Python', 'FastAPI', 'PostgreSQL', 'MongoDB', 'REST APIs', 'Docker', 'Git', 'AWS', 'Azure'],
    careerPaths: ['Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'Software Engineer', 'Web Developer', 'React Developer', 'Node.js Developer'],
    faqs: [
      { q: 'What does full stack development training cover?', a: 'The complete web development lifecycle: frontend (React, TypeScript), backend (Node.js, APIs), databases (SQL, NoSQL), deployment (AWS, Docker), and version control (Git).' },
      { q: 'Is Python or JavaScript more important for full stack?', a: 'JavaScript (and TypeScript) is the primary language for full stack web development — running on both frontend (React) and backend (Node.js). Python is increasingly used on the backend, especially for data-heavy or AI-integrated applications. We cover both.' },
    ],
    ctaPrimary: { label: 'Explore Full Stack Courses', href: '/courses' },
    ctaSecondary: { label: 'AI/ML Training', href: '/ai-ml' },
    crossLink: {
      heading: 'Practice Coding Assessments',
      text: 'Many developer interviews include an online coding test. Practice data structures, algorithms, and coding challenges on eLearnStack.',
      cta: 'Practice Coding Tests',
      url: 'https://elearnstack.com',
    },
    relatedLinks: [
      { label: 'AI/ML', href: '/ai-ml' },
      { label: 'Vibe Coding', href: '/vibe-coding' },
      { label: 'Application Security', href: '/application-security' },
      { label: 'IT Training Hub', href: '/it-training' },
    ],
  },

  // ============================================================
  // VIBE CODING — upgraded with tools + career path
  // ============================================================
  'vibe-coding': {
    title: 'Vibe Coding & AI-Assisted Development Training | Techwell',
    description: 'Learn AI-assisted coding, generative AI development tools, and vibe coding workflows. Techwell trains developers to build faster and smarter using AI tools like GitHub Copilot and Cursor.',
    h1: 'Vibe Coding — Build Faster with AI',
    subheading: 'AI-assisted development is reshaping how software is built.',
    intro: '"Vibe coding" is the practice of directing AI tools to generate, refine, and debug code — letting developers focus on architecture and intent rather than syntax. Techwell\'s training covers the skills, tools, and workflows needed to develop productively with AI: prompt engineering for code, AI-assisted debugging, review, and building full applications using AI-first development workflows. A strong foundation in programming remains essential — AI amplifies skilled developers.',
    features: [
      { icon: '⚡', title: 'AI Coding Tools', body: 'Master GitHub Copilot, Cursor, Windsurf, and AI-integrated IDEs used in modern software teams.' },
      { icon: '🧩', title: 'Prompt Engineering for Code', body: 'Write precise, effective prompts that generate production-quality code reliably and consistently.' },
      { icon: '🔄', title: 'AI Development Workflows', body: 'Build, test, debug, and review code using AI-assisted workflows from specification to deployment.' },
      { icon: '🚀', title: 'Real Application Building', body: 'Apply AI coding skills to build real applications — not toy examples.' },
    ],
    tools: ['GitHub Copilot', 'Cursor', 'Windsurf', 'Claude', 'Gemini Code Assist', 'ChatGPT', 'OpenAI API', 'VS Code', 'TypeScript', 'Python', 'React', 'Next.js'],
    careerPaths: ['AI-Augmented Developer', 'Full Stack Developer', 'AI Application Engineer', 'Software Engineer', 'AI Automation Developer'],
    faqs: [
      { q: 'What is vibe coding?', a: 'Vibe coding refers to a style of software development where the developer primarily directs and guides AI tools to generate, modify, and refine code — working faster by describing intent rather than writing every line manually.' },
      { q: 'Do I need existing programming skills for vibe coding training?', a: 'Yes. A foundational understanding of programming, logic, and software architecture is essential. Vibe coding amplifies productivity for developers who already understand what they are building — it does not replace the need to understand code.' },
    ],
    ctaPrimary: { label: 'Explore AI Dev Courses', href: '/courses' },
    ctaSecondary: { label: 'Full Stack Development', href: '/full-stack-development' },
    relatedLinks: [
      { label: 'AI/ML', href: '/ai-ml' },
      { label: 'Full Stack Development', href: '/full-stack-development' },
      { label: 'IT Training Hub', href: '/it-training' },
    ],
  },

  // ============================================================
  // CAREER & JOBS PAGES (unchanged from previous version)
  // ============================================================
  'freshers-jobs': {
    title: 'IT Jobs for Freshers & Graduates | Techwell Career Hub',
    description: 'Find the best IT and software jobs for freshers and recent graduates. Techwell connects 10,000+ students to top companies with direct placement assistance and career referrals.',
    h1: 'IT Jobs for Freshers & Graduates',
    subheading: 'Your first job is closer than you think.',
    intro: 'Kickstart your technology career with Techwell. Whether you have graduated with a BTech, BE, BCA, MCA, BSc, MSc, or any IT-related degree, our career team helps you find and secure the right entry-level position. We partner with employers to bring genuine fresher job opportunities directly to you — with resume support, interview coaching, and direct referrals.',
    features: [
      { icon: '💼', title: 'Entry Level IT Openings', body: 'Browse software developer, QA, cloud, and DevOps roles open for freshers.' },
      { icon: '🎯', title: 'Direct Employer Referrals', body: 'Our team refers your profile directly to hiring managers, bypassing crowded job boards.' },
      { icon: '📄', title: 'ATS Resume Support', body: 'Build an ATS-optimized resume that actually gets past the screening filters.' },
      { icon: '🤖', title: 'AI Mock Interview Prep', body: 'Practice technical and HR rounds with our AI Interview Simulator before the real thing.' },
    ],
    quickAnswers: [
      { q: 'How can freshers get IT jobs through Techwell?', a: 'Freshers can register on Techwell, build an ATS-optimised resume, practice with AI mock interviews, and get directly referred to hiring employers in the Techwell network. Techwell provides placement assistance — actively matching and referring candidates to job opportunities, not just listing jobs on a board.' },
      { q: 'What IT jobs are available for freshers?', a: 'Entry-level roles for freshers include Software Developer, QA Engineer, Cloud Support Associate, DevOps Junior, Network Engineer, IT Support Engineer, Cyber Security Analyst (Junior), and Data Analyst. Specific openings vary — browse current listings on the Techwell jobs page.' },
      { q: 'Does Techwell guarantee a job for freshers?', a: 'No. Techwell provides job assistance and placement support — preparing candidates and referring them to employers. Job outcomes depend on individual performance, qualifications, and employer decisions. We do not offer or imply employment guarantees.' },
    ],
    faqs: [
      { q: 'What qualifications do I need for fresher IT jobs?', a: 'Most entry-level IT roles accept graduates from BTech, BE, BCA, MCA, BSc CS, MSc IT, or related fields. Practical skills and certifications are increasingly valued alongside degree qualifications.' },
      { q: 'Does Techwell guarantee job placement?', a: 'We provide genuine placement assistance and candidate referrals. We do not guarantee employment — but we actively connect you with employers and prepare you thoroughly for the hiring process.' },
      { q: 'How does the candidate referral process work?', a: 'Once you register, our career team reviews your profile, aligns it with open opportunities, and refers your resume directly to our employer network. We also provide interview coaching ahead of every referral.' },
    ],
    ctaPrimary: { label: 'Explore Fresher Jobs', href: '/jobs' },
    ctaSecondary: { label: 'Build Your Resume', href: '/resume-builder' },
    crossLink: {
      heading: 'Preparing for MNC or Campus Assessments?',
      text: 'Most MNC recruiters include an aptitude and technical assessment round. Practice with eLearnStack\'s targeted test series.',
      cta: 'Practice on eLearnStack',
      url: 'https://elearnstack.com',
    },
    relatedLinks: [
      { label: 'AI Mock Interviews', href: '/ai-mock-interview' },
      { label: 'Resume Builder', href: '/resume-builder' },
      { label: 'Job Assistance', href: '/job-assistance' },
      { label: 'IT Training', href: '/it-training' },
    ],
  },
  'career-hub': {
    title: 'Career Hub for Students & Freshers | Techwell',
    description: 'Techwell Career Hub offers end-to-end career guidance, mentoring, and placement support for students and fresh graduates. Explore job roles, training, and real employer connections.',
    h1: 'Your Career Hub — From Campus to Corporate',
    subheading: 'Guidance, training, and real opportunities — all in one place.',
    intro: 'The Techwell Career Hub is your single destination for career growth. We provide structured career roadmaps, hands-on training, professional mentoring, and direct employer referrals. Whether you are a final-year student or a fresh graduate looking for your first IT role, our career specialists work with you at every step.',
    features: [
      { icon: '🗺️', title: 'Career Roadmaps', body: 'Clear career paths for IT, software, AI/ML, cyber security, cloud, and DevOps roles.' },
      { icon: '🧑‍🏫', title: 'Career Mentoring', body: 'Industry professionals provide honest, practical career guidance.' },
      { icon: '🏢', title: 'Employer Network', body: 'Access our growing network of companies looking for skilled fresh talent.' },
      { icon: '📊', title: 'Skill Assessment', body: 'Identify strengths and gaps through professional skill evaluations.' },
    ],
    faqs: [
      { q: 'What is the Techwell Career Hub?', a: 'A career services platform that brings together job listings, training programmes, resume building, AI mock interviews, and employer referrals specifically for students and fresh graduates.' },
    ],
    ctaPrimary: { label: 'Explore Career Hub', href: '/careers' },
    ctaSecondary: { label: 'Find Fresher Jobs', href: '/jobs' },
    crossLink: {
      heading: 'Boost Your Aptitude & Technical Skills',
      text: 'Career readiness includes test-taking ability. Practice aptitude, reasoning, and technical assessments on eLearnStack.',
      cta: 'Start Practising',
      url: 'https://elearnstack.com',
    },
    relatedLinks: [
      { label: 'Fresher Jobs', href: '/freshers-jobs' },
      { label: 'Interview Training', href: '/interview-training' },
      { label: 'IT Training', href: '/it-training' },
      { label: 'Campus to Career', href: '/campus-to-career' },
    ],
  },
  'campus-hiring': {
    title: 'Campus Hiring & Recruitment Platform | Techwell',
    description: 'Techwell connects employers with top college talent through efficient campus hiring, campus drives, and job melas across Andhra Pradesh.',
    h1: 'Campus Hiring Made Simple',
    subheading: 'Connect with the best fresh engineering and graduate talent.',
    intro: 'Techwell manages end-to-end campus recruitment — from college partnerships and campus drives to shortlisting, assessments, and offer rollouts. For colleges, we provide campus placement support and career services.',
    features: [
      { icon: '🎓', title: 'College Partnerships', body: 'Verified, qualified student talent pools from partner colleges.' },
      { icon: '📋', title: 'Drive Management', body: 'End-to-end campus drive coordination — scheduling, assessment, and result tracking.' },
      { icon: '⚡', title: 'Bulk & Mass Hiring', body: 'For large fresher intake targets — we coordinate job melas and bulk drives.' },
      { icon: '🔄', title: 'Off-Campus Recruitment', body: 'Reach candidates from colleges outside your planned list through our off-campus network.' },
    ],
    quickAnswers: [
      { q: 'What is campus hiring?', a: 'Campus hiring is the process of recruiting students directly from colleges and universities before or shortly after graduation. Companies partner with colleges — or with a recruitment intermediary like Techwell — to conduct placement drives, assess candidates, and make job offers.' },
      { q: 'How does Techwell help with campus hiring?', a: 'Techwell manages end-to-end campus recruitment — coordinating pre-placement talks, aptitude and technical assessments, interview scheduling, and offer management. Both employers and colleges can partner with Techwell for structured campus hiring.' },
    ],
    faqs: [
      { q: 'Can Techwell manage the entire campus recruitment process?', a: 'Yes. We handle pre-placement talks, assessment coordination, interview scheduling, candidate communication, and offer management.' },
      { q: 'What is a job mela?', a: 'A structured mass recruitment event where multiple companies hire candidates in a single venue or virtual format. Techwell organises both in-person and virtual job melas.' },
    ],
    ctaPrimary: { label: 'Start Campus Hiring', href: '/employer-register' },
    ctaSecondary: { label: 'Campus to Career', href: '/campus-to-career' },
    crossLink: {
      heading: 'Need to Assess Campus Candidates?',
      text: 'Run structured aptitude, reasoning, technical, and coding assessments for campus candidates using eLearnStack.',
      cta: 'Explore eLearnStack Assessments',
      url: 'https://elearnstack.com',
    },
    relatedLinks: [
      { label: 'Campus to Career', href: '/campus-to-career' },
      { label: 'Recruitment Consultancy', href: '/recruitment' },
    ],
  },
  'campus-recruitment': {
    title: 'Campus Recruitment Services | College Hiring | Techwell',
    description: 'Techwell provides professional campus recruitment services for employers and colleges. Structured assessment, drive management, and placement support.',
    h1: 'Campus Recruitment — Structured, Scalable, Effective',
    subheading: 'The right process turns campus talent into placed employees.',
    intro: 'Campus Recruitment requires more than just showing up on a college campus. Techwell\'s structured campus recruitment service handles every step — from pre-placement talks and aptitude/technical assessments to group discussions, technical interviews, and offer coordination. We work with both employers looking to hire and colleges looking to support their students.',
    features: [
      { icon: '📋', title: 'Pre-Placement Talks', body: 'Company presentations and career briefings to generate qualified candidate interest.' },
      { icon: '📊', title: 'Assessment Coordination', body: 'Aptitude, technical, and coding assessments coordinated with eLearnStack.' },
      { icon: '🤝', title: 'Interview Management', body: 'Panel scheduling, interview room coordination, and result communication.' },
      { icon: '📄', title: 'Offer & Joining', body: 'Offer letter coordination, joining date management, and post-offer candidate engagement.' },
    ],
    faqs: [
      { q: 'How is campus recruitment different from off-campus hiring?', a: 'Campus recruitment targets students at their college — through pre-arranged visits and drives. Off-campus hiring pulls candidates from our broader database regardless of their college. Both approaches are available through Techwell.' },
    ],
    ctaPrimary: { label: 'Start Campus Recruitment', href: '/employer-register' },
    ctaSecondary: { label: 'Campus Hiring', href: '/campus-hiring' },
    crossLink: {
      heading: 'Assessment for Campus Candidates',
      text: 'Structured aptitude, technical, and coding assessments for campus recruitment through eLearnStack.',
      cta: 'eLearnStack Assessments',
      url: 'https://elearnstack.com',
    },
    relatedLinks: [
      { label: 'Campus Hiring', href: '/campus-hiring' },
      { label: 'Job Mela', href: '/job-mela' },
      { label: 'Recruitment', href: '/recruitment' },
    ],
  },
  'campus-to-career': {
    title: 'Campus to Career | Fresher Career Development | Techwell',
    description: 'Techwell bridges the gap between campus and corporate with structured career pathways, professional training, and placement support.',
    h1: 'From Campus to Corporate — Bridging the Gap',
    subheading: 'We prepare you for the professional world from day one.',
    intro: 'The jump from campus to corporate is the biggest challenge for most fresh graduates. Techwell\'s Campus to Career programme provides career roadmaps, skills training, resume support, AI mock interview practice, and direct employer referrals.',
    features: [
      { icon: '🗓️', title: 'Pre-Placement Training', body: 'Aptitude, technical skills, group discussions, and interview readiness.' },
      { icon: '📈', title: 'Career Skill Development', body: 'Practical technical training in Full Stack, AI/ML, DevOps, Cyber Security, Cloud.' },
      { icon: '🤝', title: 'Industry Mentorship', body: 'Direct access to industry professionals who guide career choices and skill gaps.' },
      { icon: '🔗', title: 'Employer Connection', body: 'At the end of training, we connect prepared graduates with our employer partner network.' },
    ],
    faqs: [
      { q: 'Is this available for colleges or individuals?', a: 'Both. Colleges can partner to run the programme for their final-year cohort. Individuals can also enrol independently.' },
    ],
    ctaPrimary: { label: 'Explore the Programme', href: '/careers' },
    ctaSecondary: { label: 'View Training Courses', href: '/courses' },
    crossLink: {
      heading: 'Practice Campus Placement Tests',
      text: 'Many employers test aptitude and technical ability before interviews. Use eLearnStack to practise campus test series.',
      cta: 'Practice Now',
      url: 'https://elearnstack.com',
    },
    relatedLinks: [
      { label: 'Campus Hiring', href: '/campus-hiring' },
      { label: 'Fresher Jobs', href: '/freshers-jobs' },
      { label: 'IT Training', href: '/it-training' },
    ],
  },
  'job-assistance': {
    title: 'Job Assistance & Placement Support | Techwell',
    description: 'Techwell provides dedicated job assistance and placement support for freshers, graduates, and career changers. Resume support, interview coaching, and direct employer referrals.',
    h1: 'Dedicated Job Assistance & Placement Support',
    subheading: 'We guide your job search from application to offer.',
    intro: 'Getting a job requires more than applying online. Techwell\'s Job Assistance programme is a structured, personalised service that actively prepares and advocates for your placement. Our career specialists review your profile, build your resume, prepare you for interviews, and refer your candidacy directly to employers in our network. This is a referral and assistance service — not a job guarantee.',
    features: [
      { icon: '📋', title: 'Resume & Profile Review', body: 'ATS-optimised resume building with keyword alignment for your target roles.' },
      { icon: '🎤', title: 'Interview Coaching', body: 'Coaching on technical rounds, HR rounds, and MNC assessment-style interviews.' },
      { icon: '📨', title: 'Direct Employer Referral', body: 'Your profile is referred directly to relevant hiring managers.' },
      { icon: '🔄', title: 'Application Follow-up', body: 'We track statuses and help you navigate offer negotiations and joining processes.' },
    ],
    faqs: [
      { q: 'Is this a job guarantee programme?', a: 'No. Techwell provides placement assistance and candidate referral services. Job outcomes depend on performance, qualifications, and employer decisions.' },
    ],
    ctaPrimary: { label: 'Get Job Assistance', href: '/register' },
    ctaSecondary: { label: 'Build Resume', href: '/resume-builder' },
    crossLink: {
      heading: 'Prepare for Aptitude & Technical Tests',
      text: 'Many job applications include online assessment rounds. Practise aptitude, coding, and technical tests on eLearnStack.',
      cta: 'Start Practising',
      url: 'https://elearnstack.com',
    },
    relatedLinks: [
      { label: 'Placement Assistance', href: '/placement-assistance' },
      { label: 'AI Mock Interviews', href: '/ai-mock-interview' },
      { label: 'Resume Builder', href: '/resume-builder' },
    ],
  },
  'placement-assistance': {
    title: 'Placement Assistance for Freshers & Graduates | Techwell',
    description: 'Techwell offers professional placement assistance for freshers, graduates, and college students. Resume building, interview prep, and direct employer referrals.',
    h1: 'Placement Assistance — Prepare. Apply. Get Placed.',
    subheading: 'End-to-end support for your first career move.',
    intro: 'Techwell\'s Placement Assistance covers every step of the job-seeking journey — from building your resume and practising interviews to being referred to employers who match your profile.',
    features: [
      { icon: '📊', title: 'Profile Matching', body: 'Your skills are matched to relevant opportunities in our employer network.' },
      { icon: '📝', title: 'ATS Resume Building', body: 'Structured resumes that pass automated screening tools used by large recruiters.' },
      { icon: '🤖', title: 'AI Interview Preparation', body: 'AI-powered mock interviews simulating real technical and HR scenarios.' },
      { icon: '🎓', title: 'College Placement Support', body: 'Partnerships with colleges to provide placement support for final-year students.' },
    ],
    faqs: [
      { q: 'What is placement assistance?', a: 'A structured service where our team helps you prepare for and apply to jobs, and actively refers your profile to employers. It is not a guarantee of employment.' },
    ],
    ctaPrimary: { label: 'Get Placement Support', href: '/register' },
    ctaSecondary: { label: 'Campus Hiring', href: '/campus-hiring' },
    relatedLinks: [
      { label: 'Job Assistance', href: '/job-assistance' },
      { label: 'Fresher Jobs', href: '/freshers-jobs' },
      { label: 'Resume Builder', href: '/resume-builder' },
    ],
  },
  'job-consultancy': {
    title: 'IT Job Consultancy | Srikakulam, Visakhapatnam & Andhra Pradesh | Techwell',
    description: 'Techwell is a specialist IT job consultancy in Srikakulam, Visakhapatnam, and Andhra Pradesh. Career guidance, candidate referrals, and employer hiring support.',
    h1: 'IT Job Consultancy — Andhra Pradesh & Beyond',
    subheading: 'Connecting candidates and companies across the region.',
    intro: 'Techwell operates as a specialist IT job consultancy based in Srikakulam and Visakhapatnam, with reach across Andhra Pradesh, Telangana, and Hyderabad. We provide career consultancy for freshers and experienced professionals, and recruitment consultancy for companies looking to hire IT talent.',
    features: [
      { icon: '📍', title: 'Local Market Knowledge', body: 'Deep understanding of the Andhra Pradesh and Telangana technology job market.' },
      { icon: '🤝', title: 'Candidate & Employer Side', body: 'We represent both job seekers and companies — matching the right talent to the right roles.' },
      { icon: '💼', title: 'IT & Software Specialist', body: 'Specialist in IT, software development, cloud, cyber security, and DevOps roles.' },
      { icon: '🎓', title: 'Career Guidance', body: 'Career planning, upskilling guidance, and interview preparation.' },
    ],
    faqs: [
      { q: 'Where does Techwell operate as a job consultancy?', a: 'Primary offices in Srikakulam and Visakhapatnam, Andhra Pradesh. We serve candidates and companies across Andhra Pradesh, Telangana, and Hyderabad.' },
    ],
    ctaPrimary: { label: 'Contact Our Team', href: '/contact' },
    ctaSecondary: { label: 'Register as Candidate', href: '/register' },
    relatedLinks: [
      { label: 'Placement Assistance', href: '/placement-assistance' },
      { label: 'Job Assistance', href: '/job-assistance' },
      { label: 'Recruitment', href: '/recruitment' },
    ],
  },
  'recruitment': {
    title: 'Recruitment Consultancy & Talent Sourcing | Techwell',
    description: 'Techwell provides professional recruitment and talent sourcing services for companies hiring IT freshers and experienced professionals.',
    h1: 'Recruitment Consultancy & Talent Sourcing',
    subheading: 'Finding the right talent — efficiently and at scale.',
    intro: 'Techwell acts as a dedicated recruitment partner for companies looking to hire IT freshers, software developers, and technology professionals. We manage sourcing, screening, and referral — giving your team a shortlist of job-ready candidates.',
    features: [
      { icon: '🔍', title: 'Talent Sourcing', body: 'Verified candidates from our trained student and graduate network.' },
      { icon: '🏫', title: 'Campus Recruitment', body: 'Structured campus drives, off-campus hiring, and college partnerships.' },
      { icon: '⚡', title: 'Bulk & Mass Hiring', body: 'Scale your fresher intake with job melas, recruitment drives, and bulk processing.' },
      { icon: '✅', title: 'Pre-Screened Candidates', body: 'Shortlisted candidates who have been through resume review and interview preparation.' },
    ],
    faqs: [
      { q: 'What types of roles does Techwell recruit for?', a: 'Primarily IT, software development, cloud, cyber security, data, and DevOps roles — with a focus on fresher and early-career positions as well as junior-to-mid experienced profiles.' },
    ],
    ctaPrimary: { label: 'Hire with Techwell', href: '/employer-register' },
    ctaSecondary: { label: 'Job Mela', href: '/job-mela' },
    relatedLinks: [
      { label: 'Campus Hiring', href: '/campus-hiring' },
      { label: 'Job Consultancy', href: '/job-consultancy' },
    ],
  },
  'ai-mock-interview': {
    title: 'AI Mock Interview Platform | Technical & HR Interview Practice | Techwell',
    description: 'Practice for technical, HR, and MNC interviews with Techwell\'s AI Mock Interview simulator. Get instant feedback and real interview experience.',
    h1: 'AI Mock Interview — Practice Like It\'s Real',
    subheading: 'AI-powered interviews that prepare you for actual hiring rounds.',
    intro: 'Techwell\'s AI Mock Interview simulator gives you a realistic, pressure-free environment to practise your interview technique. Our AI asks adaptive questions — technical, HR, behavioural, and domain-specific — and provides instant, actionable feedback.',
    features: [
      { icon: '🤖', title: 'Adaptive AI Questioning', body: 'Difficulty adjusts based on your responses, just like a real interviewer.' },
      { icon: '⚡', title: 'Instant Feedback', body: 'Immediate evaluation of technical accuracy, communication clarity, and answer structure.' },
      { icon: '🎯', title: 'Domain-Specific Tracks', body: 'Specialised tracks for Full Stack, Cloud, DevOps, Cyber Security, Data, and more.' },
      { icon: '📊', title: 'Performance Reports', body: 'Detailed reports after each session identifying strengths and improvement areas.' },
    ],
    faqs: [
      { q: 'What types of interviews can I practice?', a: 'Technical coding interviews, system design, HR and behavioural interviews, domain-specific rounds, and MNC-style assessment interviews.' },
      { q: 'How is this different from a practice quiz?', a: 'The AI conducts a conversational, adaptive interview — not a static quiz. It follows up on your answers and assesses how you think, not just what you know.' },
    ],
    ctaPrimary: { label: 'Start AI Mock Interview', href: '/interviews' },
    ctaSecondary: { label: 'Interview Training', href: '/interview-training' },
    crossLink: {
      heading: 'Also Preparing for Aptitude & Coding Tests?',
      text: 'Many companies combine mock interviews with coding assessments. Practice both with eLearnStack.',
      cta: 'Practice Coding Tests',
      url: 'https://elearnstack.com',
    },
    relatedLinks: [
      { label: 'Interview Training', href: '/interview-training' },
      { label: 'Resume Builder', href: '/resume-builder' },
      { label: 'Fresher Jobs', href: '/freshers-jobs' },
    ],
  },
  'interview-training': {
    title: 'Interview Training & MNC Interview Preparation | Techwell',
    description: 'Structured interview training for technical, HR, and MNC rounds. Build interview confidence with Techwell\'s coaching, AI practice, and real feedback.',
    h1: 'Interview Training — From First Nerves to Final Offer',
    subheading: 'Build real interview confidence through structured practice.',
    intro: 'Interview performance separates placed candidates from rejected ones. Techwell\'s Interview Training covers every round — technical coding, system design, HR behavioural, and MNC rounds — through live coaching, AI mock interviews, and recorded feedback.',
    features: [
      { icon: '🧑‍💻', title: 'Technical Round Prep', body: 'Coding problems, data structures, algorithms, system design, and domain-specific questions.' },
      { icon: '💬', title: 'HR & Behavioural Coaching', body: 'STAR-method answers, confidence building, and communication clarity.' },
      { icon: '🏢', title: 'MNC Interview Simulation', body: 'Realistic simulation of multi-round MNC hiring processes with feedback.' },
      { icon: '📈', title: 'Improvement Tracking', body: 'Track performance over sessions and see measurable improvement.' },
    ],
    faqs: [
      { q: 'Is interview training available online?', a: 'Yes. Both live online coaching and self-paced AI mock interview practice are available.' },
    ],
    ctaPrimary: { label: 'Start Interview Training', href: '/courses' },
    ctaSecondary: { label: 'AI Mock Interview', href: '/ai-mock-interview' },
    crossLink: {
      heading: 'Prepare for Online Assessments',
      text: 'Many MNCs run an online aptitude or coding test before interviews. Practice with eLearnStack\'s MNC test series.',
      cta: 'Practice MNC Tests',
      url: 'https://elearnstack.com',
    },
    relatedLinks: [
      { label: 'AI Mock Interviews', href: '/ai-mock-interview' },
      { label: 'IT Training', href: '/it-training' },
      { label: 'Resume Builder', href: '/resume-builder' },
    ],
  },
  'resume-builder': {
    title: 'AI Resume Builder | ATS Resume for Freshers | Techwell',
    description: 'Build a professional, ATS-optimized resume with Techwell\'s AI Resume Builder. Designed for freshers and graduates targeting IT and software roles.',
    h1: 'AI Resume Builder — ATS-Ready, Employer-Approved',
    subheading: 'Your resume is your first interview. Make it count.',
    intro: 'Techwell\'s AI Resume Builder generates professional, ATS-optimised resumes tailored to your target role. Upload your information or existing resume, and our AI extracts, structures, and enhances it into a clean, professional format.',
    features: [
      { icon: '✅', title: 'ATS Optimised', body: 'Correct formatting and keyword alignment to pass automated screening.' },
      { icon: '🤖', title: 'AI Resume Parsing', body: 'Upload a PDF resume and our AI extracts and organises your information instantly.' },
      { icon: '🎯', title: 'Role-Specific Templates', body: 'Templates tuned for software development, cloud, cyber security, data, and more.' },
      { icon: '📋', title: 'Skills Highlighting', body: 'Automatically highlights in-demand skills based on current market expectations.' },
    ],
    faqs: [
      { q: 'What is an ATS resume?', a: 'ATS stands for Applicant Tracking System — software used by companies to automatically filter job applications. An ATS resume is formatted to be correctly read by these systems, improving your chances of reaching a human recruiter.' },
    ],
    ctaPrimary: { label: 'Build My Resume', href: '/resume-builder' },
    ctaSecondary: { label: 'Explore Fresher Jobs', href: '/jobs' },
    relatedLinks: [
      { label: 'AI Mock Interviews', href: '/ai-mock-interview' },
      { label: 'Job Assistance', href: '/job-assistance' },
      { label: 'Fresher Jobs', href: '/freshers-jobs' },
    ],
  },
  'it-consulting': {
    title: 'IT Consulting & Technology Solutions | Techwell',
    description: 'Techwell provides professional IT consulting including software development strategy, cloud consulting, cyber security advisory, and digital transformation support.',
    h1: 'IT Consulting & Technology Solutions',
    subheading: 'Strategic technology guidance for businesses of every size.',
    intro: 'Techwell\'s IT Consulting practice helps businesses navigate technology decisions with clarity — from technology strategy and software architecture reviews through to cloud migration planning and cyber security advisory.',
    features: [
      { icon: '📐', title: 'Technology Strategy', body: 'Align your technology roadmap with business goals.' },
      { icon: '☁️', title: 'Cloud Consulting', body: 'Cloud migration, architecture design, and optimisation across AWS and Azure.' },
      { icon: '🔐', title: 'Security Advisory', body: 'Cyber security assessments, policy development, and risk management guidance.' },
      { icon: '🏗️', title: 'Software Architecture', body: 'System design, architecture reviews, and technical due diligence.' },
    ],
    faqs: [
      { q: 'How do I engage Techwell for IT consulting?', a: 'Contact our team with a brief description of your requirement. We will schedule an initial consultation to understand your needs and propose an appropriate engagement.' },
    ],
    ctaPrimary: { label: 'Contact Our Consultants', href: '/contact' },
    ctaSecondary: { label: 'Software Development', href: '/software-development' },
    relatedLinks: [
      { label: 'Software Development', href: '/software-development' },
      { label: 'Cyber Security', href: '/cyber-security' },
    ],
  },
  'software-development': {
    title: 'Custom Software Development Services | Techwell',
    description: 'Techwell builds custom software solutions including web applications, APIs, enterprise platforms, and mobile applications.',
    h1: 'Custom Software Development',
    subheading: 'Software built to solve real business problems.',
    intro: 'Techwell\'s Software Development team designs and builds custom software solutions — from web applications and REST APIs to enterprise platforms — with modern technology stacks and a focus on scalability and security.',
    features: [
      { icon: '🌐', title: 'Web Application Development', body: 'Full-stack web applications with modern frontend frameworks and scalable backends.' },
      { icon: '🔌', title: 'API Development', body: 'REST and GraphQL APIs, third-party integrations, and microservices architecture.' },
      { icon: '🏢', title: 'Enterprise Platforms', body: 'LMS, CRM, ERP, and custom enterprise platforms built to specification.' },
      { icon: '🔒', title: 'Security by Design', body: 'Security integrated from architecture through deployment.' },
    ],
    faqs: [
      { q: 'What technology stack does Techwell use?', a: 'We primarily build with React/Next.js, Node.js/Python, PostgreSQL/MongoDB, and AWS/Azure. We adapt to project requirements.' },
    ],
    ctaPrimary: { label: 'Discuss Your Project', href: '/contact' },
    ctaSecondary: { label: 'IT Consulting', href: '/it-consulting' },
    relatedLinks: [
      { label: 'IT Consulting', href: '/it-consulting' },
      { label: 'Services', href: '/services' },
    ],
  },
  'python-training': {
    title: 'Python Training | Techwell',
    description: 'Learn Python programming with Techwell.',
    h1: 'Python Training',
    subheading: 'Professional training program for Python',
    intro: 'Enroll in our Python training to build your career.',
    features: [
      { icon: '✅', title: 'Hands-On Projects', body: 'Build real-world projects.' }
    ],
    faqs: [],
    ctaPrimary: { label: 'View Course Details', href: '/courses' },
  },
};

// ============================================================
// FALLBACK: for any slug not in the map
// ============================================================
export function getSeoData(slug: string): SEOPageData | null {
  if (seoDataMap[slug]) return seoDataMap[slug];
  return null;
}
