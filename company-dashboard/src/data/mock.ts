export interface Candidate {
  id: string;
  rank: number;
  name: string;
  initials: string;
  avatarColor: string;
  school: string;
  degree: string;
  year: string;
  gradYear: string;
  fitScore: number;
  aiExplain: string;
  note?: string;
  fits: string[];
  fitDetails: { skill: string; explanation: string }[];
  lacks: string[];
  lackDetails: { skill: string; explanation: string }[];
  fitBreakdown: { skills: number; experience: number; interests: number; preferences: number };
  projects: { name: string; description: string; tech: string[] }[];
  experience: { role: string; company: string; duration: string; description: string }[];
  availability: string;
  preferences: string[];
  stage: KanbanStage;
  selected?: boolean;
  gpa: string;
  location: string;
  resumeSummary: string;
  resumeFile: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

export type KanbanStage = "Applied" | "Reviewed" | "Selected" | "In Conversation" | "Interview" | "Offer" | "Hired";

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  status: "Active" | "Paused" | "Closed";
  applicants: number;
  selected: number;
  conversations: number;
  posted: string;
  deadline: string;
  requiredSkills: string[];
  preferredSkills: string[];
  description: string;
  stipend: string;
}

export interface Message {
  id: string;
  sender: "company" | "candidate";
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateInitials: string;
  avatarColor: string;
  jobTitle: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: Message[];
}

export const COMPANY = {
  name: "TechNova",
  logo: "T",
  logoColor: "#4F46E5",
  industry: "AI Infrastructure",
  size: "200–400 employees",
  location: "Bangalore, Karnataka",
};

export const RECRUITER = {
  name: "Priya Sharma",
  initials: "PS",
  role: "Recruiter",
};

export const CANDIDATES: Candidate[] = [
  {
    id: "c1",
    rank: 1,
    name: "Arjun Mehta",
    initials: "AM",
    avatarColor: "#EEF0FF",
    school: "IIT Delhi",
    degree: "B.Tech Computer Science & Engineering",
    year: "Third Year",
    gradYear: "2026",
    fitScore: 94,
    aiExplain: "Arjun's React depth and design-systems work map directly to this role. His Razorpay internship shows production-scale experience your team needs.",
    note: "I've been following TechNova's open-source work on GitHub — the design system tooling you're building is exactly the kind of problem I want to work on.",
    fits: ["React", "TypeScript", "Figma", "Tailwind CSS", "Design Systems", "Web Performance"],
    fitDetails: [
      { skill: "React", explanation: "2 shipped projects using your exact frontend stack, one serving 10k+ users." },
      { skill: "TypeScript", explanation: "Primary language across all portfolio projects since second year." },
      { skill: "Figma", explanation: "Designs and implements his own components — zero handoff gap." },
      { skill: "Tailwind CSS", explanation: "Built and maintains an open-source Tailwind component library with 300+ GitHub stars." },
      { skill: "Design Systems", explanation: "Led the design-system migration at Razorpay's consumer team." },
      { skill: "Web Performance", explanation: "Lighthouse scores above 95 across all personal projects." },
    ],
    lacks: ["GraphQL", "Storybook"],
    lackDetails: [
      { skill: "GraphQL", explanation: "No evidence of GraphQL in any project. You listed it as preferred, not required — low risk." },
      { skill: "Storybook", explanation: "Uses alternatives for component docs. Would transfer easily." },
    ],
    fitBreakdown: { skills: 95, experience: 91, interests: 94, preferences: 100 },
    projects: [
      { name: "Luminate Design System", description: "Open-source component library with 40+ components, adopted by 3 startups.", tech: ["React", "TypeScript", "Figma"] },
      { name: "Pulse Dashboard", description: "Real-time analytics dashboard for e-commerce metrics, 10k MAU.", tech: ["React", "D3.js", "WebSocket"] },
    ],
    experience: [
      { role: "Frontend Engineering Intern", company: "Razorpay", duration: "May–Jul 2024", description: "Built checkout components processing ₹50Cr+ in transactions per month. Improved LCP by 28%." },
      { role: "UI Dev", company: "IIT Delhi Web Team", duration: "2023–Present", description: "Maintains the university's design system and component library used across 12 departments." },
    ],
    availability: "May 20 – Aug 15, 2025 · Full-time",
    preferences: ["Bangalore or Hybrid", "Design-focused engineering", "Mentorship from seniors"],
    stage: "Selected",
    selected: true,
    gpa: "9.1 / 10",
    location: "Delhi NCR",
    resumeSummary: "Arjun's resume is unusually strong for a third-year. The Razorpay internship is production-grade frontend at scale. His open-source footprint signals genuine passion — not just coursework. Recommend fast-tracking.",
    resumeFile: "arjun-mehta-resume-2025.pdf",
    githubUrl: "https://github.com/arjunmehta",
    portfolioUrl: "https://arjunmehta.dev",
  },
  {
    id: "c2",
    rank: 2,
    name: "Kavya Reddy",
    initials: "KR",
    avatarColor: "#EEF0FF",
    school: "IIT Bombay",
    degree: "B.Tech Information Technology",
    year: "Final Year",
    gradYear: "2025",
    fitScore: 89,
    aiExplain: "Kavya shipped a React Native app at Zomato used by 2M+ users. Strong TypeScript and API instincts. Testing gap is a real but learnable area given her otherwise high signal.",
    note: "I shipped a React Native app at Zomato that's now in production serving 2M users. I'd love to bring that scale experience to TechNova's frontend team.",
    fits: ["React", "TypeScript", "CSS-in-JS", "REST APIs", "Git", "Node.js"],
    fitDetails: [
      { skill: "React", explanation: "Led the React Native migration for Zomato's internal delivery tracker." },
      { skill: "TypeScript", explanation: "Used strictly across all 3 internship projects with zero 'any' types." },
      { skill: "CSS-in-JS", explanation: "Authored a Styled Components theme system covering 6 brand themes." },
      { skill: "REST APIs", explanation: "Designed and consumed multiple REST APIs during her Zomato tenure." },
      { skill: "Git", explanation: "Maintains a clean git history with conventional commits — rare at this level." },
      { skill: "Node.js", explanation: "Built a personal project backend in Express handling 500 req/s." },
    ],
    lacks: ["Testing (Jest/Cypress)", "Accessibility (WCAG)"],
    lackDetails: [
      { skill: "Testing (Jest/Cypress)", explanation: "No test files found in any public repository. A gap worth a direct question in the screen." },
      { skill: "Accessibility (WCAG)", explanation: "No evidence of WCAG compliance work. You listed this as preferred — can be mentored." },
    ],
    fitBreakdown: { skills: 88, experience: 92, interests: 87, preferences: 90 },
    projects: [
      { name: "Velocity — Motion Tool", description: "Browser-based animation editor used by 800+ designers.", tech: ["React", "Canvas API", "TypeScript"] },
      { name: "Diner OS", description: "Full-stack restaurant management system deployed at 8 Mumbai eateries.", tech: ["Next.js", "PostgreSQL", "Tailwind"] },
    ],
    experience: [
      { role: "Software Engineering Intern", company: "Zomato", duration: "Jun–Aug 2024", description: "Built and shipped a React Native delivery tracker used by 2M+ delivery partners." },
    ],
    availability: "Jun 2 – Aug 29, 2025 · Full-time",
    preferences: ["Mumbai or Remote", "Product-facing engineering"],
    stage: "In Conversation",
    gpa: "8.7 / 10",
    location: "Mumbai",
    resumeSummary: "Kavya's Zomato internship is the strongest signal in this applicant pool. 2M-user production scale at final year is rare. Testing gap is real but learnable. Recommend a screen this week.",
    resumeFile: "kavya-reddy-resume-2025.pdf",
    githubUrl: "https://github.com/kavyareddy",
  },
  {
    id: "c3",
    rank: 3,
    name: "Rohan Sharma",
    initials: "RS",
    avatarColor: "#EEF0FF",
    school: "BITS Pilani",
    degree: "B.E. Computer Science",
    year: "Third Year",
    gradYear: "2026",
    fitScore: 86,
    aiExplain: "Rohan's Vue-to-React transition in his last project was seamless. Strong TypeScript instincts and a Nexora Labs internship that matches TechNova's stack closely.",
    note: "I transitioned from Vue to React in my Nexora internship and found the paradigm shift very natural — the component model carries over well.",
    fits: ["TypeScript", "Vue.js", "Python", "REST APIs", "Figma", "Responsive Design"],
    fitDetails: [
      { skill: "TypeScript", explanation: "Used across 4 projects spanning frontend and backend." },
      { skill: "Vue.js", explanation: "Primary framework — paradigm maps directly to React. Has already started transitioning." },
      { skill: "Python", explanation: "Secondary language, used for data scripts and Flask APIs." },
      { skill: "REST APIs", explanation: "Built and consumed REST APIs at Nexora Labs." },
      { skill: "Figma", explanation: "Comfortable with Figma for design handoff and prototyping." },
      { skill: "Responsive Design", explanation: "All portfolio projects score 95+ on mobile Lighthouse." },
    ],
    lacks: ["React (has Vue)", "Redux / State Mgmt"],
    lackDetails: [
      { skill: "React (has Vue)", explanation: "No React projects yet, but Vue expertise is directly transferable. Ramp time: ~2 weeks." },
      { skill: "Redux / State Mgmt", explanation: "Uses Pinia in Vue; has not worked with Redux. Low risk given the conceptual overlap." },
    ],
    fitBreakdown: { skills: 82, experience: 86, interests: 90, preferences: 88 },
    projects: [
      { name: "EcoTrack", description: "Carbon footprint tracker with 2,000 active users across Rajasthan colleges.", tech: ["Vue", "TypeScript", "Firebase"] },
      { name: "StudySync", description: "Collaborative study platform for the BITS Pilani CS cohort.", tech: ["Vue", "Node.js", "MongoDB"] },
    ],
    experience: [
      { role: "Frontend Intern", company: "Nexora Labs", duration: "May–Jul 2024", description: "Rebuilt the company's internal dashboard in TypeScript + Vue, cutting load time by 40%." },
    ],
    availability: "May 26 – Aug 22, 2025 · Full-time",
    preferences: ["Pune or Hybrid", "Product-facing work"],
    stage: "Reviewed",
    gpa: "8.9 / 10",
    location: "Pune",
    resumeSummary: "Rohan's Nexora internship closely mirrors TechNova's stack. The Vue-to-React gap is real but minimal given his TypeScript depth. Recommend moving forward.",
    resumeFile: "rohan-sharma-bits-2025.pdf",
    githubUrl: "https://github.com/rohansharma",
    portfolioUrl: "https://rohansharma.me",
  },
  {
    id: "c4",
    rank: 4,
    name: "Anika Patel",
    initials: "AP",
    avatarColor: "#EEF0FF",
    school: "NIT Trichy",
    degree: "B.Tech CSE",
    year: "Third Year",
    gradYear: "2026",
    fitScore: 81,
    aiExplain: "Anika blends design and engineering well for a third-year. Her HCI background and PixelForge internship bring a user-perspective lens your current frontend team lacks.",
    note: "I'm passionate about accessible design — I ran a WCAG 2.1 workshop for 120 students at NIT's tech fest last semester.",
    fits: ["React", "JavaScript", "UX Research", "Figma", "Prototyping", "HTML/CSS"],
    fitDetails: [
      { skill: "React", explanation: "Used in 2 personal projects and her PixelForge internship." },
      { skill: "JavaScript", explanation: "Primary language; strong fundamentals with ES2022+ features." },
      { skill: "UX Research", explanation: "Ran user research for 3 projects — surveys, usability testing, personas." },
      { skill: "Figma", explanation: "Led the design for a 5-person team project, from wireframes to handoff." },
      { skill: "HTML/CSS", explanation: "Clean, semantic markup with Lighthouse accessibility scores above 90." },
      { skill: "Prototyping", explanation: "Builds interactive Figma prototypes before any code." },
    ],
    lacks: ["TypeScript", "Backend Integration"],
    lackDetails: [
      { skill: "TypeScript", explanation: "Has not used TypeScript in any project. You require it — worth a quick skills assessment." },
      { skill: "Backend Integration", explanation: "All projects use mock data or Firebase. No experience with custom backend APIs." },
    ],
    fitBreakdown: { skills: 78, experience: 80, interests: 88, preferences: 82 },
    projects: [
      { name: "Campus Wayfinding App", description: "Accessible map for NIT Trichy, won Best Project at NIT's tech fest.", tech: ["React", "Mapbox", "ARIA"] },
      { name: "Chorus", description: "Real-time collaborative music app with WebRTC.", tech: ["React", "WebRTC", "Firebase"] },
    ],
    experience: [
      { role: "UX Engineering Intern", company: "PixelForge", duration: "May–Jul 2024", description: "Designed and built 3 accessible UI components for their design system, now used across 4 products." },
    ],
    availability: "Jun 16 – Sep 5, 2025 · Full-time",
    preferences: ["Chennai or Bangalore", "Accessibility or design-systems work"],
    stage: "Reviewed",
    gpa: "8.5 / 10",
    location: "Chennai",
    resumeSummary: "Anika's PixelForge work shows real design-engineering breadth. TypeScript gap is the primary blocker — worth a quick screen to assess how fast she learns. High upside for accessibility-focused work.",
    resumeFile: "anika-patel-nit-trichy-2025.pdf",
    portfolioUrl: "https://anikapatel.design",
  },
  {
    id: "c5",
    rank: 5,
    name: "Siddharth Nair",
    initials: "SN",
    avatarColor: "#EEF0FF",
    school: "VIT Vellore",
    degree: "B.Tech CSE",
    year: "Final Year",
    gradYear: "2025",
    fitScore: 74,
    aiExplain: "Siddharth has strong CS fundamentals and Python depth but limited frontend experience. He would need meaningful onboarding for a React/TypeScript role.",
    fits: ["JavaScript", "Python", "Data Structures", "Git", "HTML/CSS"],
    fitDetails: [
      { skill: "JavaScript", explanation: "Vanilla JS used in personal projects; no modern framework experience." },
      { skill: "Python", explanation: "Primary language — used in 4 projects including an ML pipeline." },
      { skill: "Data Structures", explanation: "Competitive programming background with 200+ LeetCode problems solved." },
      { skill: "Git", explanation: "Regular contributor with clean commit history." },
      { skill: "HTML/CSS", explanation: "Basic proficiency; projects are functional but not polished." },
    ],
    lacks: ["React", "TypeScript", "Component Architecture", "UI/UX"],
    lackDetails: [
      { skill: "React", explanation: "No React in any project or coursework. Significant ramp-up required." },
      { skill: "TypeScript", explanation: "Not evidenced in any public repository." },
      { skill: "Component Architecture", explanation: "Has not built or maintained a component library." },
      { skill: "UI/UX", explanation: "No design experience; his interfaces are functional but not user-tested." },
    ],
    fitBreakdown: { skills: 58, experience: 72, interests: 80, preferences: 88 },
    projects: [
      { name: "Campus Shuttle Optimizer", description: "ML model reducing commute times by 23% for VIT's shuttle network.", tech: ["Python", "scikit-learn", "Flask"] },
      { name: "Budget Buddy", description: "Personal finance tracker with vanilla JS frontend and Python backend.", tech: ["JavaScript", "Python", "SQLite"] },
    ],
    experience: [
      { role: "Research Assistant", company: "VIT AI Lab", duration: "2024–Present", description: "Implementing ML pipelines for NLP research. 1 paper submitted to EMNLP." },
    ],
    availability: "May 20 – Aug 8, 2025 · Full-time",
    preferences: ["Hyderabad or Remote", "ML or data-adjacent projects welcome"],
    stage: "Applied",
    gpa: "8.9 / 10",
    location: "Hyderabad",
    resumeSummary: "Siddharth's GPA and ML research are genuinely impressive, but this is a frontend-heavy role. Without React experience, ramp time would be 4+ weeks. Better suited for a backend or ML-adjacent opening.",
    resumeFile: "siddharth-nair-vit-2025.pdf",
  },
  {
    id: "c6",
    rank: 6,
    name: "Meera Krishnan",
    initials: "MK",
    avatarColor: "#EEF0FF",
    school: "Manipal University",
    degree: "B.Tech CSE",
    year: "Third Year",
    gradYear: "2026",
    fitScore: 68,
    aiExplain: "Meera knows HTML, CSS and JavaScript fundamentals but lacks modern framework experience. Her portfolio shows strong visual sensibility with limited production depth.",
    fits: ["HTML/CSS", "JavaScript", "Responsive Design", "Figma (basic)"],
    fitDetails: [
      { skill: "HTML/CSS", explanation: "Clean, well-structured markup across all personal projects." },
      { skill: "JavaScript", explanation: "Vanilla JS only — DOM manipulation, fetch API, basic ES6." },
      { skill: "Responsive Design", explanation: "All projects are mobile-responsive using media queries." },
      { skill: "Figma (basic)", explanation: "Uses Figma for wireframing; not for design systems." },
    ],
    lacks: ["React", "TypeScript", "REST API Integration", "Version Control (advanced)"],
    lackDetails: [
      { skill: "React", explanation: "No React in any project. Your role requires React proficiency from day one." },
      { skill: "TypeScript", explanation: "Has not used TypeScript in any context." },
      { skill: "REST API Integration", explanation: "Projects use static data only; no API consumption experience." },
      { skill: "Version Control (advanced)", explanation: "Uses Git for solo projects only; no branching or PR experience." },
    ],
    fitBreakdown: { skills: 42, experience: 55, interests: 78, preferences: 82 },
    projects: [
      { name: "Portfolio Site", description: "Personal portfolio with hand-crafted CSS animations.", tech: ["HTML", "CSS", "JavaScript"] },
      { name: "Recipe Finder", description: "Simple recipe search using TheMealDB API.", tech: ["HTML", "CSS", "JavaScript", "Fetch API"] },
    ],
    experience: [],
    availability: "Jun 2 – Aug 15, 2025 · Part-time or Full-time",
    preferences: ["Bangalore or Remote", "Flexible schedule"],
    stage: "Applied",
    gpa: "7.8 / 10",
    location: "Bangalore",
    resumeSummary: "Meera's fundamentals are solid but this role requires React and TypeScript from day one. Better suited for a junior HTML/CSS-focused role or a structured learning program.",
    resumeFile: "meera-krishnan-manipal-2025.pdf",
  },
  {
    id: "c7",
    rank: 7,
    name: "Dev Joshi",
    initials: "DJ",
    avatarColor: "#EEF0FF",
    school: "Delhi University",
    degree: "B.Com (Hons.) with CS Minor",
    year: "Final Year",
    gradYear: "2025",
    fitScore: 61,
    aiExplain: "Dev's business acumen and analytical skills are genuine strengths, but the technical depth for a frontend engineering role is a significant gap. Better suited for product or growth roles.",
    fits: ["Excel / Sheets", "SQL (basic)", "Project Management", "Stakeholder Communication"],
    fitDetails: [
      { skill: "Excel / Sheets", explanation: "Built complex financial models and dashboards at Swiggy." },
      { skill: "SQL (basic)", explanation: "Used for ad-hoc analysis — SELECT queries, JOINs, basic aggregations." },
      { skill: "Project Management", explanation: "Coordinated a 6-person cross-functional team during his Swiggy internship." },
      { skill: "Stakeholder Communication", explanation: "Presented findings to VP-level stakeholders at Swiggy." },
    ],
    lacks: ["JavaScript", "React", "TypeScript", "Frontend Development", "Git"],
    lackDetails: [
      { skill: "JavaScript", explanation: "No JavaScript in any project or coursework." },
      { skill: "React", explanation: "No framework experience of any kind." },
      { skill: "TypeScript", explanation: "Not evidenced anywhere." },
      { skill: "Frontend Development", explanation: "No frontend project in the portfolio." },
      { skill: "Git", explanation: "No evidence of Git usage." },
    ],
    fitBreakdown: { skills: 18, experience: 62, interests: 70, preferences: 76 },
    projects: [
      { name: "Retail Analytics Dashboard", description: "Excel-based sales dashboard for a local Delhi retailer.", tech: ["Excel", "SQL"] },
    ],
    experience: [
      { role: "Business Analyst Intern", company: "Swiggy", duration: "Jun–Aug 2024", description: "Analysed restaurant partner churn and presented a retention framework to the growth team." },
    ],
    availability: "Jun 2 – Aug 29, 2025 · Full-time",
    preferences: ["Delhi NCR or Remote", "Business + tech intersection"],
    stage: "Applied",
    gpa: "8.1 / 10",
    location: "Delhi NCR",
    resumeSummary: "Dev is a strong candidate for a business analyst or product role. The frontend engineering skill gap — no JavaScript, no framework, no Git — is too significant for this specific position.",
    resumeFile: "dev-joshi-du-2025.pdf",
  },
];

export const JOBS: Job[] = [
  {
    id: "j1",
    title: "Frontend Engineering Intern",
    department: "Engineering",
    location: "Bangalore, Karnataka · Hybrid",
    type: "Full-time · 10 weeks",
    status: "Active",
    applicants: 7,
    selected: 1,
    conversations: 2,
    posted: "12 Mar 2025",
    deadline: "4 Apr 2025",
    requiredSkills: ["React", "TypeScript", "HTML/CSS", "Git"],
    preferredSkills: ["Tailwind CSS", "Figma", "REST APIs", "Testing"],
    description: "Join TechNova's product team to build and refine the UI components powering our AI infrastructure platform. You'll work directly with senior engineers and our design team.",
    stipend: "₹35,000/month",
  },
  {
    id: "j2",
    title: "Product Design Intern",
    department: "Design",
    location: "Bangalore, Karnataka · On-site",
    type: "Full-time · 12 weeks",
    status: "Active",
    applicants: 14,
    selected: 0,
    conversations: 3,
    posted: "8 Mar 2025",
    deadline: "10 Apr 2025",
    requiredSkills: ["Figma", "UX Research", "Prototyping", "Design Systems"],
    preferredSkills: ["Framer", "Motion Design", "User Testing", "Copywriting"],
    description: "Shape the visual and interaction design of TechNova's next-generation developer tools. Own end-to-end design flows from research through final handoff.",
    stipend: "₹30,000/month",
  },
  {
    id: "j3",
    title: "Growth Marketing Intern",
    department: "Marketing",
    location: "Remote",
    type: "Full-time · 8 weeks",
    status: "Paused",
    applicants: 22,
    selected: 2,
    conversations: 5,
    posted: "28 Feb 2025",
    deadline: "25 Mar 2025",
    requiredSkills: ["Content Strategy", "Analytics", "SEO", "Social Media"],
    preferredSkills: ["HubSpot", "Figma (basic)", "A/B Testing", "Copywriting"],
    description: "Drive TechNova's developer community growth through content, events, and organic channels. Own and measure experiments across the full growth funnel.",
    stipend: "₹20,000/month",
  },
];

export const KANBAN_STAGES: KanbanStage[] = [
  "Applied", "Reviewed", "Selected", "In Conversation", "Interview", "Offer", "Hired"
];

export const CONVERSATIONS: Conversation[] = [
  {
    id: "conv1",
    candidateId: "c1",
    candidateName: "Arjun Mehta",
    candidateInitials: "AM",
    avatarColor: "#EEF0FF",
    jobTitle: "Frontend Engineering Intern",
    lastMessage: "Thursday at 2pm IST works perfectly for me!",
    lastTime: "2m ago",
    unread: 1,
    messages: [
      { id: "m1", sender: "company", text: "Hi Arjun! Congratulations — you've been selected for the Frontend Engineering Intern role at TechNova. We were really impressed by your React and design-systems work, especially the Luminate project. I'd love to set up an intro call to walk you through the team and next steps. Are you free this week?", time: "Yesterday, 3:42 PM" },
      { id: "m2", sender: "candidate", text: "Hi Priya! Thank you so much — I'm really excited about TechNova! Yes, I'm available this week. I'm free Thursday afternoon or Friday morning. What works for the team?", time: "Yesterday, 5:11 PM" },
      { id: "m3", sender: "company", text: "Thursday works great! Does 2pm IST suit you? We'll send a Google Meet link ahead of time.", time: "Today, 9:14 AM" },
      { id: "m4", sender: "candidate", text: "Thursday at 2pm IST works perfectly for me!", time: "Today, 9:31 AM" },
    ],
  },
  {
    id: "conv2",
    candidateId: "c2",
    candidateName: "Kavya Reddy",
    candidateInitials: "KR",
    avatarColor: "#EEF0FF",
    jobTitle: "Frontend Engineering Intern",
    lastMessage: "Looking forward to connecting with the team.",
    lastTime: "1h ago",
    unread: 0,
    messages: [
      { id: "m1", sender: "company", text: "Hi Kavya! We really enjoyed reviewing your work — the Zomato internship stood out strongly. We'd love to have a conversation about the Frontend Engineering Intern role. Are you available for a quick intro call this week?", time: "Today, 8:00 AM" },
      { id: "m2", sender: "candidate", text: "Hi Priya! Absolutely — I've been following TechNova for a while and would love to learn more. I'm quite flexible this week. What times work for the team?", time: "Today, 8:45 AM" },
      { id: "m3", sender: "company", text: "How about Wednesday at 11am IST? We can do a relaxed 30-minute chat with our engineering lead.", time: "Today, 9:00 AM" },
      { id: "m4", sender: "candidate", text: "Wednesday at 11am IST is perfect. Looking forward to connecting with the team.", time: "Today, 9:15 AM" },
    ],
  },
];

export const ANALYTICS_DATA = {
  impressions: [
    { date: "12 Mar", value: 142 }, { date: "13 Mar", value: 198 },
    { date: "14 Mar", value: 234 }, { date: "15 Mar", value: 189 },
    { date: "16 Mar", value: 267 }, { date: "17 Mar", value: 301 },
    { date: "18 Mar", value: 278 }, { date: "19 Mar", value: 312 },
    { date: "20 Mar", value: 356 }, { date: "21 Mar", value: 289 },
    { date: "22 Mar", value: 398 }, { date: "23 Mar", value: 421 },
  ],
  applyRate: [
    { date: "12 Mar", value: 4.2 }, { date: "13 Mar", value: 5.1 },
    { date: "14 Mar", value: 6.3 }, { date: "15 Mar", value: 5.8 },
    { date: "16 Mar", value: 7.2 }, { date: "17 Mar", value: 8.1 },
    { date: "18 Mar", value: 7.6 }, { date: "19 Mar", value: 8.9 },
    { date: "20 Mar", value: 9.2 }, { date: "21 Mar", value: 8.4 },
    { date: "22 Mar", value: 10.1 }, { date: "23 Mar", value: 11.3 },
  ],
  avgFitScore: [
    { label: "Frontend Eng", value: 81 },
    { label: "Product Design", value: 74 },
    { label: "Growth Mktg", value: 69 },
  ],
  skillDemand: [
    { skill: "React", demand: 94 }, { skill: "TypeScript", demand: 88 },
    { skill: "Figma", demand: 76 },  { skill: "Python", demand: 71 },
    { skill: "Node.js", demand: 65 }, { skill: "GraphQL", demand: 58 },
    { skill: "Testing", demand: 52 },
  ],
  funnel: [
    { stage: "Applied", count: 43 }, { stage: "Reviewed", count: 31 },
    { stage: "Selected", count: 8 }, { stage: "In Conversation", count: 5 },
    { stage: "Interview", count: 2 }, { stage: "Offer", count: 1 },
  ],
};

export const ATTENTION_ITEMS = [
  { id: "a1", type: "deadline", message: "Frontend Engineering Intern closes in 2 days", action: "Extend deadline", jobId: "j1" },
  { id: "a2", type: "applicant", message: "14 new applicants for Product Design — none reviewed", action: "Review now", jobId: "j2" },
  { id: "a3", type: "message", message: "Arjun Mehta replied to your message", action: "View message", convId: "conv1" },
];

export function fitBand(score: number): { color: string; label: string } {
  if (score >= 85) return { color: "#16A34A", label: "Strong fit" };
  if (score >= 70) return { color: "#4F46E5", label: "Good fit"  };
  return               { color: "#9CA3AF", label: "Stretch"    };
}
