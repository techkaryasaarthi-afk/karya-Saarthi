export interface ServiceItem {
  id: string;
  title: string;
  priceRange: string;
  timeline: string;
  icon: string;
  description: string;
  deliverables: string[];
  technologies: string[];
  bestFor: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  client: string;
  industry: string;
  projectType: string;
  timeline: string;
  budget: string;
  category: "mobile" | "web" | "marketing" | "ai" | "academic" | "saas";
  challenge: string;
  solution: string[];
  techStack: string[];
  results: string[];
  testimonial: {
    quote: string;
    author: string;
    role: string;
  };
  liveLinks: {
    label: string;
    url: string;
  }[];
}

export interface TeamMember {
  name: string;
  role: string;
  experience: string;
  expertise: string[];
  education: string;
  email?: string;
  image?: string;
  social: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  bio: string;
  badge: string;
  highlights?: string[];
  quote?: string;
}

export interface Testimonial {
  id: string;
  client: string;
  company: string;
  role: string;
  rating: number;
  text: string;
  serviceUsed: string;
}

export const BRAND = {
  name: "Karya Saarthi",
  legalName: "Karya Saarthi | Karyanex Private Limited",
  meaning: 'Hindi: "Work Partner" / "Life Partner"',
  tagline: "Real Work. Real Learning. Real Growth.",
  mission:
    "No Indian student should fail because they lacked the right support. We empower students, startups, and businesses through real-world projects, expert solutions, and transparent partnerships where education meets execution.",
  vision:
    "Become India's leading platform for practical skill development and business solutions by 2030. Build a community of 1 million learners and 100,000+ successful project completions.",
  startedDate: "15 August 2025",
  registrationDate: "18 May 2026",
  aboutSummary:
    "Karya Saarthi was started in August 2025 by Saloni Kumari with zero investment from a small town in Bihar, and was officially incorporated on 18 May 2026 as Karyanex Private Limited (CIN: U85500BR2026PTC085054). As India's premier 'Teach + Complete' project solutions company where education meets execution, Karya Saarthi has completed 500+ projects, served 2,000+ clients, and achieved ₹25 Lakh revenue with ₹5 Lakh net profit—backed by a 7-member core team and 500+ expert vendors pan-India.",
  keyStats: {
    revenueFirst3Months: "₹25 Lakh",
    netProfit: "₹5 Lakh",
    clientsServed: "2,000+",
    rating: "4.8/5",
    satisfaction: "98%",
    totalProjects: "500+",
    cities: "50+",
    countries: "15+",
    teamMembers: "7 Core",
    vendors: "500+",
    ambassadors: "50+",
  },
  colors: {
    primaryDark: "#1A1A1A",
    primaryOrange: "#FF6B35",
    secondaryBlue: "#004E89",
    neutralLight: "#F7F7F7",
    accentGreen: "#1BAC6E",
    warningRed: "#E63946",
  },
};

export const SERVICES: ServiceItem[] = [
  {
    id: "web-dev",
    title: "Website Development",
    priceRange: "₹10,000 - ₹2,00,000",
    timeline: "1-4 weeks",
    icon: "Globe",
    description:
      "Custom, high-performance websites built with modern technology stack (React, Node.js, Python, AWS). From startup landing pages to enterprise e-commerce platforms, we create websites that convert.",
    deliverables: [
      "Responsive design (mobile, tablet, desktop)",
      "SEO-optimized architecture",
      "Fast loading (< 3 seconds)",
      "Integrated CMS for easy updates",
      "Analytics dashboard",
      "30-day post-launch support",
    ],
    technologies: ["React", "Next.js", "Node.js", "Python", "MongoDB", "PostgreSQL", "AWS", "Vercel", "Firebase"],
    bestFor: "Startups, SMBs, Agencies, E-commerce businesses",
  },
  {
    id: "mobile-dev",
    title: "Mobile App Development",
    priceRange: "₹30,000 - ₹5,00,000",
    timeline: "2-8 weeks",
    icon: "Smartphone",
    description:
      "Native and cross-platform mobile apps (iOS & Android) from concept to production. We specialize in startup MVPs, enterprise solutions, and consumer apps with 100K+ downloads.",
    deliverables: [
      "Full app development (UI/UX design included)",
      "Backend API & database architecture",
      "Push notifications & analytics",
      "App Store & Play Store submission",
      "Post-launch optimization & support",
    ],
    technologies: ["React Native", "Flutter", "Swift", "Kotlin", "Firebase", "AWS", "Google Cloud"],
    bestFor: "Startups looking for MVP, E-commerce apps, SaaS platforms, Consumer apps",
  },
  {
    id: "digital-marketing",
    title: "Digital Marketing",
    priceRange: "₹5,000 - ₹50,000+ / month",
    timeline: "Ongoing (Monthly Retainer)",
    icon: "TrendingUp",
    description:
      "Data-driven digital marketing strategies to grow your business. Google Ads, Facebook/Instagram, LinkedIn, SEO, content marketing. We focus on measurable ROI, not vanity metrics.",
    deliverables: [
      "Ad campaign setup & management",
      "SEO optimization & content strategy",
      "Social media content calendar",
      "Monthly performance reports",
      "A/B testing & optimization",
      "Lead generation & conversion tracking",
    ],
    technologies: ["Google Ads", "Facebook Business Manager", "SEMrush", "Ahrefs", "Google Analytics 4", "Hotjar"],
    bestFor: "E-commerce, SaaS, Agencies, Service businesses, Startups",
  },
  {
    id: "ai-ml",
    title: "AI & Machine Learning Solutions",
    priceRange: "₹30,000 - ₹2,00,000+",
    timeline: "4-16 weeks",
    icon: "Cpu",
    description:
      "Custom AI/ML solutions tailored to your business needs. Chatbots, predictive analytics, recommendation engines, data analysis, automation. We turn data into actionable insights.",
    deliverables: [
      "Data collection & preprocessing",
      "Model training & optimization",
      "API integration",
      "Dashboard & reporting",
      "Model deployment & monitoring",
      "Monthly performance reviews",
    ],
    technologies: ["TensorFlow", "PyTorch", "Python", "Scikit-learn", "AWS SageMaker", "Google Cloud AI", "OpenAI APIs"],
    bestFor: "E-commerce (recommendation), Healthcare (predictions), Finance (analytics), Logistics (optimization)",
  },
  {
    id: "academic-support",
    title: "Research & Academic Support",
    priceRange: "₹5,000 - ₹25,000",
    timeline: "1-8 weeks",
    icon: "BookOpen",
    description:
      "End-to-end support for research papers, thesis, and academic projects. Literature review, data analysis, writing, publication assistance. 100% original work, zero plagiarism.",
    deliverables: [
      "Research proposal & outline",
      "Literature review (50+ sources)",
      "Data collection & analysis",
      "Paper writing (APA/MLA format)",
      "Publication guidance",
      "Plagiarism report (Turnitin verified)",
    ],
    technologies: ["Mendeley", "Zotero", "SPSS", "R", "Python", "Overleaf", "Grammarly"],
    bestFor: "PhD scholars, Master's students, Researchers, Academic institutions",
  },
  {
    id: "business-consulting",
    title: "Business Consulting",
    priceRange: "₹10,000 - ₹1,00,000+",
    timeline: "2-12 weeks",
    icon: "Briefcase",
    description:
      "Strategic consulting for startups, SMBs, and scale-ups. Go-to-market strategy, operations optimization, revenue growth, investor pitch prep. Founder-led approach with hands-on execution.",
    deliverables: [
      "Market analysis & competitive positioning",
      "Business model validation",
      "Growth strategy & roadmap",
      "KPI dashboard setup",
      "Pitch deck creation",
      "Monthly business reviews",
    ],
    technologies: ["Lean Canvas", "Jobs to be Done", "OKR framework", "Tableau", "Google Sheets"],
    bestFor: "Early-stage startups, Scale-ups, SMBs, Non-profits",
  },
];

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: "fitpro",
    title: "FitPro - Fitness App for Trainers",
    client: "FitPro (Personal Training Platform)",
    industry: "Health & Fitness",
    projectType: "Mobile App Development",
    timeline: "8 weeks",
    budget: "₹75,000",
    category: "mobile",
    challenge:
      "Fitness trainers needed an app to manage clients, track workouts, send nutrition plans, and receive payments. Existing solutions were expensive (₹5000+/month) or poorly designed. They needed a cost-effective, beautiful app that solved real trainer problems.",
    solution: [
      "Built native iOS & Android app using React Native",
      "Client management dashboard tracking 50+ clients per trainer",
      "Workout plan builder with drag-and-drop interface",
      "Progress tracking with photo compare and metric logs",
      "Seamless Razorpay API payment integration",
      "Push notifications for workout & meal reminders + offline mode",
    ],
    techStack: ["React Native", "Redux", "Node.js", "Express", "PostgreSQL", "AWS EC2", "Razorpay API", "Firebase"],
    results: [
      "App published on App Store & Play Store",
      "2,500+ downloads in first 30 days",
      "4.7/5 star rating across 150+ reviews",
      "500+ active trainers paying monthly",
      "₹2 Lakh monthly recurring revenue generated for client",
      "95% 90-day user retention rate",
    ],
    testimonial: {
      quote:
        "Karya Saarthi delivered exactly what we needed. The app is beautiful, fast, and my trainers love using it. We launched in 8 weeks and already have 500+ trainers paying monthly. Incredible value for money.",
      author: "Rahul Patel",
      role: "Founder, FitPro",
    },
    liveLinks: [
      { label: "App Store (iOS)", url: "https://apps.apple.com" },
      { label: "Google Play (Android)", url: "https://play.google.com" },
    ],
  },
  {
    id: "learnflow",
    title: "EduTech Startup - Complete Go-To-Market",
    client: "LearnFlow (EdTech Startup)",
    industry: "Online Education",
    projectType: "Consulting + Website + Digital Marketing",
    timeline: "12 weeks",
    budget: "₹1,50,000",
    category: "web",
    challenge:
      "Fresh EdTech startup had a good product (online courses for coding) but zero customers. They needed brand identity, website, marketing strategy, lead generation, and investor pitch on a tight budget and aggressive timeline.",
    solution: [
      "End-to-end GTM brand positioning & tagline creation",
      "High-converting Next.js website design & development",
      "SEO optimization & multi-channel content strategy",
      "Targeted Google Ads & B2B LinkedIn outreach campaigns",
      "Investor pitch deck creation & monthly KPI performance tracking",
    ],
    techStack: ["Next.js", "Tailwind CSS", "Vercel", "Google Analytics 4", "Hotjar", "Google Ads", "LinkedIn Ads", "Pipedrive"],
    results: [
      "Website launched (converts 8% of visitors to leads)",
      "1,200+ organic visitors per month by week 12",
      "45 qualified leads per month via Google Ads",
      "2 enterprise clients signed (₹5L+ contracts)",
      "Successfully pitched to 2 VCs (raising ₹50L seed round)",
      "500+ enrolled students in 12 weeks",
    ],
    testimonial: {
      quote:
        "We were completely lost on how to market our product. Karya Saarthi not only built our website and brand, but structured our go-to-market strategy. Within 3 months, we had our first enterprise client and investor interest. This changed everything.",
      author: "Priya Singh",
      role: "Founder, LearnFlow",
    },
    liveLinks: [
      { label: "Visit Website", url: "https://www.learnflowcourses.com" },
      { label: "View Case Study PDF", url: "#" },
    ],
  },
  {
    id: "handmade-stories",
    title: "E-Commerce Platform - Handmade Crafts Brand",
    client: "HandMade Stories (E-commerce Brand)",
    industry: "E-commerce / Handmade Goods",
    projectType: "Website Development + Digital Marketing",
    timeline: "6 weeks",
    budget: "₹85,000",
    category: "web",
    challenge:
      "Artisan crafts business was selling via Instagram DMs and WhatsApp with no official website, online payment system, inventory management, or CRM. Customer service was a chaotic nightmare.",
    solution: [
      "Custom Next.js storefront powered by Shopify API",
      "Real-time inventory management for 200+ handmade SKUs",
      "Multi-option checkout (Razorpay, Card, UPI, NetBanking, COD)",
      "Automated shipping integration with Shiprocket API",
      "Instagram & Facebook shop setup with automated email sequences",
    ],
    techStack: ["Next.js", "Tailwind CSS", "Shopify Storefront API", "Razorpay", "Instamojo", "Shiprocket API", "Facebook Pixel"],
    results: [
      "Professional e-commerce platform live with 12% conversion rate",
      "Online monthly sales scaled from ₹0 to ₹3 Lakh in 6 weeks",
      "Instagram followers grew from 5,000 to 25,000",
      "30% repeat customer rate",
      "Average order value increased to ₹1,500",
      "60% reduction in manual customer service handling",
    ],
    testimonial: {
      quote:
        "Before Karya Saarthi, I was managing orders on WhatsApp like chaos. Today, I have a real business with real numbers. My website is so beautiful, and customers trust me more. This investment paid for itself in the first month!",
      author: "Anjali Sharma",
      role: "Founder, HandMade Stories",
    },
    liveLinks: [
      { label: "Visit Online Store", url: "https://www.handmadestories.com" },
      { label: "Instagram Profile", url: "https://instagram.com/handmadestories_" },
    ],
  },
  {
    id: "quickdeliver",
    title: "Predictive AI/ML System for Logistics",
    client: "QuickDeliver (Logistics Startup)",
    industry: "Logistics / Supply Chain",
    projectType: "AI/ML Solution",
    timeline: "14 weeks",
    budget: "₹2,50,000",
    category: "ai",
    challenge:
      "Logistics provider was losing ₹20 Lakh annually due to delayed deliveries, failed demand forecasting, and inefficient route allocation across urban clusters.",
    solution: [
      "Robust data pipeline collecting & processing 50K+ historical delivery logs",
      "TensorFlow ML model predicting delivery ETA within +/- 15 minute accuracy",
      "Dynamic ML route optimization algorithm (saving 15% travel time per delivery)",
      "Hourly demand forecasting and anomaly detection alerting ops teams before delivery failures",
      "Real-time interactive monitoring dashboard built with React & Plotly",
    ],
    techStack: ["Python", "Pandas", "TensorFlow", "XGBoost", "ARIMA", "FastAPI", "PostgreSQL", "TimescaleDB", "AWS SageMaker", "React"],
    results: [
      "ETA accuracy improved from ±45 min to ±15 min",
      "15% reduction in total travel time per delivery route",
      "40% drop in failed deliveries due to proactive alerts",
      "₹20 Lakh annual cost savings (recovered AI investment in 2 months)",
      "NPS improved from 42 to 68",
      "System smoothly handles 10,000+ daily deliveries",
    ],
    testimonial: {
      quote:
        "The ML solution Karya Saarthi built literally saved our company. We were bleeding money on failed deliveries. Now we predict problems before they happen. The ROI is undeniable.",
      author: "Vikram Mehta",
      role: "CEO, QuickDeliver",
    },
    liveLinks: [{ label: "Detailed ML Architecture PDF", url: "#" }],
  },
  {
    id: "dr-neha-kapoor",
    title: "IEEE Research Paper & Publication",
    client: "Dr. Neha Kapoor (PhD Scholar, IIT Delhi)",
    industry: "Academic / Research",
    projectType: "Research Support + Publication",
    timeline: "16 weeks",
    budget: "₹28,000",
    category: "academic",
    challenge:
      "PhD scholar had groundbreaking research on AI/ML applications in precision agriculture but struggled with structured paper formatting, comprehensive literature synthesis, and peer-reviewed IEEE publication standards.",
    solution: [
      "Comprehensive literature review analyzing 200+ top-tier research papers",
      "Rigorous statistical significance testing & data structuring in Python",
      "End-to-end paper writing & formatting in IEEE LaTeX Overleaf template",
      "Peer-review response drafting across 3 revision iterations",
      "Turnitin plagiarism verification ensuring < 5% similarity threshold",
    ],
    techStack: ["Mendeley", "Zotero", "Python (NumPy, SciPy)", "Overleaf", "BibTeX", "Turnitin", "Grammarly"],
    results: [
      "Paper accepted in IEEE Transactions on AI (Top 5% Journal)",
      "Published in 16 weeks (vs industry standard 8-12 months)",
      "Zero plagiarism (Turnitin verified at 4% similarity)",
      "50+ citations achieved within the first year",
      "Scholar received prestigious international Postdoc fellowship offer",
    ],
    testimonial: {
      quote:
        "Karya Saarthi made the impossible possible. They not just helped me write—they taught me academic rigor. My paper is now published in a top journal, and my PhD journey is complete. I wouldn't have made it without them.",
      author: "Dr. Neha Kapoor",
      role: "PhD Scholar, IIT Delhi",
    },
    liveLinks: [{ label: "IEEE Publication Index", url: "https://ieee.org" }],
  },
  {
    id: "taskflow",
    title: "TaskFlow SaaS - MVP to ₹5Cr Series A",
    client: "TaskFlow (Project Management SaaS)",
    industry: "SaaS / Enterprise Software",
    projectType: "Full-stack Development + Consulting",
    timeline: "20 weeks",
    budget: "₹4,50,000",
    category: "saas",
    challenge:
      "Founders had a compelling project management vision for remote teams but zero software product. Needed full MVP development, product roadmap, GTM execution, and Series A fundraising prep.",
    solution: [
      "Phase 1: Full-stack MVP (React, Next.js, Node.js, Kanban boards, Slack/GCalendar integration)",
      "Phase 2: Product Strategy after interviewing 50+ remote team managers",
      "Phase 3: GTM campaign, ProductHunt Launch, 15-slide VC pitch deck, and financial projections",
    ],
    techStack: ["React", "Next.js", "Tailwind CSS", "Node.js", "Express", "GraphQL", "PostgreSQL", "Redis", "AWS", "Stripe API"],
    results: [
      "MVP launched on ProductHunt (Top 10 Product of the Day)",
      "500+ beta users in Month 1",
      "50 paying B2B customers generating ₹2 Lakh MRR within 6 months",
      "Raised ₹5 Crore Series A funding from Sequoia & Accel",
      "Team scaled from 2 founders to 15 full-time employees",
      "Company valuation reached ₹50 Crore",
    ],
    testimonial: {
      quote:
        "Karya Saarthi wasn't just a development vendor—they were our co-founders in spirit. They built the product, shaped the strategy, and prepared us for Series A. Without them, TaskFlow wouldn't exist. We're now raising ₹5Cr and growing 25% MoM.",
      author: "Arjun & Zara",
      role: "Co-founders, TaskFlow",
    },
    liveLinks: [
      { label: "Product Website", url: "https://www.taskflow.io" },
      { label: "ProductHunt Feature", url: "https://producthunt.com" },
    ],
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    client: "Rahul Patel",
    company: "FitPro",
    role: "Founder & Lead Trainer",
    rating: 5,
    text: "Karya Saarthi delivered exactly what we needed. The app is beautiful, fast, and my trainers love using it. We launched in 8 weeks and already have 500+ trainers paying monthly.",
    serviceUsed: "Mobile App Development",
  },
  {
    id: "t2",
    client: "Priya Singh",
    company: "LearnFlow",
    role: "Founder",
    rating: 5,
    text: "We were completely lost on how to market our product. Karya Saarthi not only built our website and brand, but structured our go-to-market strategy. Within 3 months, we had our first enterprise client.",
    serviceUsed: "EdTech GTM & Web Dev",
  },
  {
    id: "t3",
    client: "Anjali Sharma",
    company: "HandMade Stories",
    role: "Founder",
    rating: 5,
    text: "Before Karya Saarthi, I was managing orders on WhatsApp like chaos. Today, I have a real business with real numbers. My website is so beautiful, and customers trust me more!",
    serviceUsed: "E-Commerce Platform",
  },
  {
    id: "t4",
    client: "Vikram Mehta",
    company: "QuickDeliver",
    role: "CEO",
    rating: 5,
    text: "The ML solution Karya Saarthi built literally saved our company. We were bleeding money on failed deliveries. Now we predict problems before they happen. The ROI is undeniable.",
    serviceUsed: "AI/ML Logistics Optimization",
  },
  {
    id: "t5",
    client: "Dr. Neha Kapoor",
    company: "IIT Delhi",
    role: "PhD Scholar",
    rating: 5,
    text: "Karya Saarthi made the impossible possible. They not just helped me write—they taught me academic rigor. My paper is now published in a top journal, and my PhD journey is complete.",
    serviceUsed: "Research & Publication",
  },
  {
    id: "t6",
    client: "Arjun & Zara",
    company: "TaskFlow",
    role: "Co-founders",
    rating: 5,
    text: "Karya Saarthi wasn't just a development vendor—they were our co-founders in spirit. They built the product, shaped the strategy, and prepared us for Series A.",
    serviceUsed: "SaaS MVP Development",
  },
];

export const TEAM: TeamMember[] = [
  {
    name: "Saloni Kumari",
    role: "Founder & Director",
    badge: "Founder & Director",
    experience: "Founder & Director (Aug 2025 – Present) | Karyanex Private Limited",
    expertise: ["Venture Leadership", "Education & Execution", "Strategic Growth", "B2B & Academic Projects", "Zero-to-One Scale"],
    education: "Pursuing BBA LLB | Alumna, Jawahar Navodaya Vidyalaya (JNV)",
    email: "founder@karyasaarthi.com",
    image: "/team/saloni-kumari.jpg",
    social: {
      linkedin: "https://www.linkedin.com/in/saloni-kumari-397458289",
    },
    quote: "No Indian student should fail because they lacked the right support.",
    highlights: [
      "Started with zero investment from a small town in Bihar in August 2025",
      "Officially registered as Karyanex Private Limited on 18 May 2026",
      "Scaled to 500+ completed projects, 2,000+ clients served, and ₹25 Lakh in revenue with ₹5 Lakh net profit",
      "Built a core team of 7 members and a network of 500+ expert vendors",
      "Leading India's first project solutions company where education meets execution",
    ],
    bio: "Saloni Kumari is the Founder and Director of Karya Saarthi – India's first project solutions company where education meets execution. Growing up in a small town in Bihar, she studied at Divine Light Public School for Class 10 and secured admission to Jawahar Navodaya Vidyalaya (JNV) for Class 12. Currently pursuing BBA LLB, Saloni started Karya Saarthi in August 2025 with zero investment. In less than a year, she built a company that has completed 500+ projects, served 2,000+ clients, and generated ₹25 Lakh in revenue with ₹5 Lakh net profit - all while still being a student herself. Today, Karya Saarthi operates pan-India online, serving students, professionals, businesses, and institutions.",
  },
  {
    name: "Pawandeep Kaur",
    role: "Co-Founder, Operations & Partnerships",
    badge: "Co-Founder",
    experience: "Operations, Execution & Academic Partnerships",
    expertise: ["Operations Management", "Process Optimization", "Client Relations", "Academic Coordination"],
    education: "Pursuing B.Sc. (Hons.) Chemistry, Delhi University (5th Sem)",
    email: "info.karyasaarthi@gmail.com",
    image: "/team/pawandeep-kaur.jpg",
    social: {
      linkedin: "https://www.linkedin.com/in/pawandeep-kaur-715897345",
    },
    bio: "Pawandeep co-founded Karya Saarthi and leads nationwide operations, academic partnerships, and delivery quality. Pursuing Chemistry (Hons.) at Delhi University, she ensures every project strictly adheres to deadlines and quality benchmarks.",
  },
  {
    name: "Damini Yadav",
    role: "Software Engineer & Front-End Developer",
    badge: "Tech & Software Lead",
    experience: "1.5 Years in Software Engineering, Front-End Development & Digital Marketing",
    expertise: ["Software Engineering", "Front-End Development", "Full-Stack Web Apps", "Next.js & React", "Digital Marketing"],
    education: "Software Engineering & Computer Applications",
    email: "info@karyasaarthi.com",
    image: "/team/damini-yadav.jpg",
    social: {
      linkedin: "https://www.linkedin.com/in/daminiyadav23",
    },
    bio: "Damini spearheads software architecture, frontend engineering, and high-performance technical solutions at Karya Saarthi. With 1.5+ years of hands-on expertise across software development and digital marketing, she crafts intuitive, modern platforms that drive business growth.",
  },
  {
    name: "Rakhi Bhatt",
    role: "Marketing Head",
    badge: "Marketing Head",
    experience: "Growth Marketing & Data-Driven Strategy",
    expertise: ["Growth Strategy", "Analytical Marketing", "Campaign Optimization", "Mathematical Modeling"],
    education: "Final-year B.Sc. (Hons.) Mathematics, University of Delhi",
    email: "Opt.karyasarthi@gmail.com",
    image: "/team/rakhi-bhatt.jpg",
    social: {
      linkedin: "https://www.linkedin.com/in/rakhibhatt29",
    },
    bio: "Rakhi leads marketing strategy and business growth at Karya Saarthi. A final-year Mathematics Honours student at Delhi University, she applies quantitative analytics and market modeling to scale outreach and maximize client ROI.",
  },
  {
    name: "Annu Priya",
    role: "Digital Marketing Lead",
    badge: "Growth Head",
    experience: "Performance Marketing & Digital Campaigns",
    expertise: ["Google Ads", "Social Media Growth", "SEO Strategy", "Campaign Management"],
    education: "Graduation in Economics Honours (3rd Year)",
    email: "support@karyasaarthi.com",
    image: "/team/annu-priya.jpg",
    social: {
      linkedin: "https://www.linkedin.com/in/annu-priya-992285352",
    },
    bio: "Annu oversees digital marketing campaigns, performance ad spend, and organic brand traction for Karya Saarthi. Pursuing Economics Honours, she develops data-backed promotional strategies that generate trackable client revenue.",
  },
  {
    name: "Divya Bhalla",
    role: "Marketing Executive & Client Relations",
    badge: "Client Relations Lead",
    experience: "Marketing Executive, Team Leadership, Marketing & Client Communication",
    expertise: ["Marketing Execution", "Team Leadership", "Client Communication", "Stakeholder Relations"],
    education: "M.A., B.Ed.",
    email: "info@karyasaarthi.net",
    image: "/team/divya-bhalla.jpg",
    social: {
      linkedin: "https://www.linkedin.com/in/divya-bhalla-5885982b1",
    },
    bio: "Divya leads marketing execution and client communication with extensive leadership experience and an M.A., B.Ed. background. She excels in stakeholder engagement, collaborative team leadership, and ensuring seamless client satisfaction.",
  },
];

export const OUTCOMES_SUMMARY = [
  { metric: "Total Projects Delivered", value: "500+", detail: "Across Web, Mobile, AI & Marketing" },
  { metric: "Client Satisfaction Rate", value: "4.8 / 5 Stars", detail: "Based on 150+ verified reviews" },
  { metric: "On-Time Delivery", value: "98%", detail: "Strict milestone & SLA enforcement" },
  { metric: "Repeat Business", value: "30%", detail: "Long-term client partnerships" },
  { metric: "Revenue (First 3 Months)", value: "₹25 Lakh", detail: "Bootstrapped & profitable from Month 1" },
  { metric: "Geographic Footprint", value: "50+ Cities", detail: "15+ International countries" },
];

export const PROJECT_OUTCOMES_TABLE = [
  { project: "FitPro App", timeSaved: "24 Weeks vs 6 Mos", costSaved: "₹50K vs ₹3L typical", revenue: "₹2 Lakh MRR", reach: "2,500+ Downloads" },
  { project: "LearnFlow GTM", timeSaved: "4 Wks vs 12 Wks", costSaved: "₹1 Lakh Saved", revenue: "₹5 Lakh+ Revenue", reach: "500+ Students" },
  { project: "HandMade Stories", timeSaved: "2 Wks vs 8 Wks", costSaved: "₹2 Lakh Saved", revenue: "₹3 Lakh / Month", reach: "500+ Orders / Mo" },
  { project: "QuickDeliver ML", timeSaved: "+1800% Accuracy", costSaved: "₹20 Lakh Annually", revenue: "15% Travel Efficiency", reach: "10K+ Deliveries/Day" },
  { project: "IEEE Research", timeSaved: "16 Wks vs 1 Year", costSaved: "₹28K vs ₹1L+", revenue: "Postdoc Offer", reach: "50+ Citations" },
  { project: "TaskFlow SaaS", timeSaved: "20 Wks (Fast MVP)", costSaved: "₹4.5L All-inclusive", revenue: "₹5Cr Series A Raised", reach: "500+ Beta Users" },
];

export const CONTACT_INFO = {
  emails: {
    general: "info@karyasaarthi.com",
    sales: "projects@karyasaarthi.com",
    hr: "hr@karyasaarthi.com",
    partnerships: "partnerships@karyasaarthi.com",
  },
  phones: {
    office: "+91 9153780969",
    sales: "+91 9153780969",
    hr: "+91 9153780969",
    emergency: "+91 9153780969",
    whatsapp: "9153780968",
  },
  address: "Karya Saarthi | Karyanex Private Limited\nGali No 1, Uttarakhand Enclave, Burari, New Delhi 110084, India",
  socials: {
    linkedin: "https://linkedin.com/company/karyasaarthi",
    twitter: "https://twitter.com/karyasaarthi",
    instagram: "https://instagram.com/karyasaarthi_official",
    youtube: "https://youtube.com/@karyasaarthi",
  },
};
