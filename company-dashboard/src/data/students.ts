import type { Student } from '@inswipe/core';

export type KanbanStage =
  | 'Applied'
  | 'Reviewed'
  | 'Selected'
  | 'In Conversation'
  | 'Interview'
  | 'Offer'
  | 'Hired';

export const KANBAN_STAGES: KanbanStage[] = [
  'Applied',
  'Reviewed',
  'Selected',
  'In Conversation',
  'Interview',
  'Offer',
  'Hired',
];

/**
 * One application: the student's own profile (the shared `Student` shape the student app
 * writes) plus what belongs to this company's review of them. Nothing here is a fit score
 * — those are computed in `mock.ts` from the profile and the job, never hand-set.
 */
export interface Applicant {
  student: Student;
  jobId: string;
  avatarColor: string;
  gpa: string;
  /** where the student is based, for the location filter */
  location: string;
  /** "Third Year" — a display label the profile itself doesn't carry */
  year: string;
  resumeFile: string;
  /** AI resume summary written against this job's requirements (CLAUDE.md section 7) */
  resumeSummary: string;
  /** the optional note the student attached when they swiped right */
  note?: string;
  availability: string;
  preferenceNotes: string[];
  stage: KanbanStage;
  selected?: boolean;
}

export const APPLICANTS: Applicant[] = [
  {
    jobId: 'j1',
    avatarColor: '#EEF0FF',
    gpa: '9.1 / 10',
    location: 'Delhi NCR',
    year: 'Third Year',
    resumeFile: 'arjun-mehta-resume-2025.pdf',
    resumeSummary:
      'Read against this role: Arjun clears every required skill with shipped work behind it, not coursework. The Razorpay internship is production frontend at payments scale, and Luminate shows he can own a design system rather than just consume one. Testing is the only preferred skill missing. Recommend fast-tracking.',
    note: "I've been following TechNova's open-source work on GitHub — the design system tooling you're building is exactly the kind of problem I want to work on.",
    availability: 'May 20 – Aug 15, 2025 · Full-time',
    preferenceNotes: ['Bangalore or Hybrid', 'Design-focused engineering', 'Mentorship from seniors'],
    stage: 'Selected',
    selected: true,
    student: {
      id: 'arjun-mehta',
      name: 'Arjun Mehta',
      initial: 'A',
      email: 'arjun.mehta@iitd.ac.in',
      phone: '+91 98110 22XXX',
      university: 'IIT Delhi',
      degree: 'B.Tech Computer Science & Engineering',
      field: 'Computer Science & Engineering',
      gradYear: '2026',
      skills: [
        { name: 'React', evidence: 'strong' },
        { name: 'TypeScript', evidence: 'strong' },
        { name: 'HTML/CSS', evidence: 'strong' },
        { name: 'Git', evidence: 'strong' },
        { name: 'Tailwind CSS', evidence: 'strong' },
        { name: 'Figma', evidence: 'moderate' },
        { name: 'REST APIs', evidence: 'moderate' },
      ],
      projects: [
        {
          id: 'p1',
          name: 'Luminate Design System',
          description:
            'Open-source component library with 40+ components, adopted by three startups.',
          tech: ['React', 'TypeScript', 'Tailwind CSS', 'HTML/CSS'],
          github: 'https://github.com/arjunmehta/luminate',
          contribution: 'Sole maintainer. 300+ stars.',
        },
        {
          id: 'p2',
          name: 'Pulse Dashboard',
          description: 'Real-time analytics dashboard for e-commerce metrics, 10k monthly users.',
          tech: ['React', 'TypeScript', 'REST APIs', 'Git'],
          demo: 'https://pulse.arjunmehta.dev',
        },
      ],
      experience: [
        {
          id: 'e1',
          role: 'Frontend Engineering Intern',
          company: 'Razorpay',
          mode: 'On-site',
          period: 'May–Jul 2024',
          summary:
            'Built checkout components processing ₹50Cr+ in transactions a month. Improved LCP by 28% and moved the team onto TypeScript.',
        },
      ],
      education: {
        degree: 'B.Tech Computer Science & Engineering',
        university: 'IIT Delhi',
        period: '2022 – 2026',
        cgpa: '9.1',
      },
      preferences: {
        roles: ['Frontend', 'Design'],
        workMode: 'Hybrid',
        locations: ['Bangalore', 'Delhi NCR'],
        durationMonths: 3,
        minStipend: 30000,
      },
      resume: { filename: 'arjun-mehta-resume-2025.pdf', size: '284 KB', updated: '2 Mar 2025' },
      links: { github: 'https://github.com/arjunmehta', portfolio: 'https://arjunmehta.dev' },
    },
  },
  {
    jobId: 'j1',
    avatarColor: '#EEF0FF',
    gpa: '8.7 / 10',
    location: 'Mumbai',
    year: 'Final Year',
    resumeFile: 'kavya-reddy-resume-2025.pdf',
    resumeSummary:
      "Read against this role: Kavya covers every required skill, and the Zomato internship is the largest production surface in this pool — 2M+ users at final year is rare. She wants remote and you are hybrid in Bangalore, which is the real friction here, not her skills. No test files anywhere in her public work.",
    note: "I shipped a React Native app at Zomato that's now in production serving 2M users. I'd love to bring that scale experience to TechNova's frontend team.",
    availability: 'Jun 2 – Aug 29, 2025 · Full-time',
    preferenceNotes: ['Mumbai or Remote', 'Product-facing engineering'],
    stage: 'In Conversation',
    student: {
      id: 'kavya-reddy',
      name: 'Kavya Reddy',
      initial: 'K',
      email: 'kavya.reddy@iitb.ac.in',
      phone: '+91 99201 74XXX',
      university: 'IIT Bombay',
      degree: 'B.Tech Information Technology',
      field: 'Information Technology',
      gradYear: '2025',
      skills: [
        { name: 'React', evidence: 'strong' },
        { name: 'TypeScript', evidence: 'strong' },
        { name: 'HTML/CSS', evidence: 'strong' },
        { name: 'Git', evidence: 'strong' },
        { name: 'REST APIs', evidence: 'strong' },
        { name: 'Node.js', evidence: 'moderate' },
      ],
      projects: [
        {
          id: 'p1',
          name: 'Velocity — Motion Tool',
          description: 'Browser-based animation editor used by 800+ designers.',
          tech: ['React', 'TypeScript', 'HTML/CSS'],
          github: 'https://github.com/kavyareddy/velocity',
        },
        {
          id: 'p2',
          name: 'Diner OS',
          description: 'Full-stack restaurant management system deployed at eight Mumbai eateries.',
          tech: ['React', 'Tailwind CSS', 'REST APIs', 'Git'],
        },
      ],
      experience: [
        {
          id: 'e1',
          role: 'Software Engineering Intern',
          company: 'Zomato',
          mode: 'Hybrid',
          period: 'Jun–Aug 2024',
          summary:
            'Built and shipped a React delivery tracker used by 2M+ delivery partners, working across TypeScript and REST APIs.',
        },
      ],
      education: {
        degree: 'B.Tech Information Technology',
        university: 'IIT Bombay',
        period: '2021 – 2025',
        cgpa: '8.7',
      },
      preferences: {
        roles: ['Frontend', 'Full-stack'],
        workMode: 'Remote',
        locations: ['Mumbai'],
        durationMonths: 3,
        minStipend: 30000,
      },
      resume: { filename: 'kavya-reddy-resume-2025.pdf', size: '241 KB', updated: '28 Feb 2025' },
      links: { github: 'https://github.com/kavyareddy' },
    },
  },
  {
    jobId: 'j1',
    avatarColor: '#EEF0FF',
    gpa: '8.9 / 10',
    location: 'Pune',
    year: 'Third Year',
    resumeFile: 'rohan-sharma-bits-2025.pdf',
    resumeSummary:
      'Read against this role: Rohan has the TypeScript depth and the tooling instincts, but no React in any project — Vue is his framework. The Nexora internship shows he rebuilt a production dashboard in TypeScript, so the transferable half is genuine. Budget roughly two weeks of ramp on React specifically.',
    note: 'I transitioned from Vue to React in my Nexora internship and found the paradigm shift very natural — the component model carries over well.',
    availability: 'May 26 – Aug 22, 2025 · Full-time',
    preferenceNotes: ['Pune or Hybrid', 'Product-facing work'],
    stage: 'Reviewed',
    student: {
      id: 'rohan-sharma',
      name: 'Rohan Sharma',
      initial: 'R',
      email: 'rohan.sharma@bits-pilani.ac.in',
      phone: '+91 94140 61XXX',
      university: 'BITS Pilani',
      degree: 'B.E. Computer Science',
      field: 'Computer Science',
      gradYear: '2026',
      skills: [
        { name: 'TypeScript', evidence: 'strong' },
        { name: 'HTML/CSS', evidence: 'strong' },
        { name: 'Git', evidence: 'strong' },
        { name: 'Vue.js', evidence: 'strong' },
        { name: 'Python', evidence: 'moderate' },
        { name: 'REST APIs', evidence: 'strong' },
        { name: 'Figma', evidence: 'moderate' },
      ],
      projects: [
        {
          id: 'p1',
          name: 'EcoTrack',
          description: 'Carbon footprint tracker with 2,000 active users across Rajasthan colleges.',
          tech: ['Vue.js', 'TypeScript', 'HTML/CSS'],
          github: 'https://github.com/rohansharma/ecotrack',
        },
        {
          id: 'p2',
          name: 'StudySync',
          description: 'Collaborative study platform for the BITS Pilani CS cohort.',
          tech: ['Vue.js', 'REST APIs', 'Git'],
        },
      ],
      experience: [
        {
          id: 'e1',
          role: 'Frontend Intern',
          company: 'Nexora Labs',
          mode: 'Hybrid',
          period: 'May–Jul 2024',
          summary:
            "Rebuilt the company's internal dashboard in TypeScript, cutting load time by 40%, and documented the REST APIs behind it.",
        },
      ],
      education: {
        degree: 'B.E. Computer Science',
        university: 'BITS Pilani',
        period: '2022 – 2026',
        cgpa: '8.9',
      },
      preferences: {
        roles: ['Frontend'],
        workMode: 'Hybrid',
        locations: ['Pune'],
        durationMonths: 3,
        minStipend: 25000,
      },
      resume: { filename: 'rohan-sharma-bits-2025.pdf', size: '198 KB', updated: '5 Mar 2025' },
      links: { github: 'https://github.com/rohansharma', portfolio: 'https://rohansharma.me' },
    },
  },
  {
    jobId: 'j1',
    avatarColor: '#EEF0FF',
    gpa: '8.5 / 10',
    location: 'Chennai',
    year: 'Third Year',
    resumeFile: 'anika-patel-nit-trichy-2025.pdf',
    resumeSummary:
      'Read against this role: Anika is the only applicant here who both designs and builds, and her accessibility work is real rather than claimed. TypeScript is the blocker — it is a hard requirement and she has never used it. Her Git is self-declared with no collaborative history behind it. High upside if you can absorb the ramp.',
    note: "I'm passionate about accessible design — I ran a WCAG 2.1 workshop for 120 students at NIT's tech fest last semester.",
    availability: 'Jun 16 – Sep 5, 2025 · Full-time',
    preferenceNotes: ['Chennai or Bangalore', 'Accessibility or design-systems work'],
    stage: 'Reviewed',
    student: {
      id: 'anika-patel',
      name: 'Anika Patel',
      initial: 'A',
      email: 'anika.patel@nitt.edu',
      phone: '+91 90031 55XXX',
      university: 'NIT Trichy',
      degree: 'B.Tech Computer Science & Engineering',
      field: 'Computer Science & Engineering',
      gradYear: '2026',
      skills: [
        { name: 'React', evidence: 'strong' },
        { name: 'HTML/CSS', evidence: 'strong' },
        { name: 'JavaScript', evidence: 'strong' },
        { name: 'Git', evidence: 'weak' },
        { name: 'Figma', evidence: 'strong' },
        { name: 'UX Research', evidence: 'strong' },
        { name: 'Prototyping', evidence: 'strong' },
      ],
      projects: [
        {
          id: 'p1',
          name: 'Campus Wayfinding App',
          description: 'Accessible campus map for NIT Trichy. Won Best Project at the tech fest.',
          tech: ['React', 'HTML/CSS', 'Figma'],
          github: 'https://github.com/anikapatel/wayfinding',
        },
        {
          id: 'p2',
          name: 'Chorus',
          description: 'Real-time collaborative music app built with WebRTC.',
          tech: ['React', 'HTML/CSS'],
        },
      ],
      experience: [
        {
          id: 'e1',
          role: 'UX Engineering Intern',
          company: 'PixelForge',
          mode: 'Remote',
          period: 'May–Jul 2024',
          summary:
            'Designed and built three accessible UI components in React for their design system, now used across four products.',
        },
      ],
      education: {
        degree: 'B.Tech Computer Science & Engineering',
        university: 'NIT Trichy',
        period: '2022 – 2026',
        cgpa: '8.5',
      },
      preferences: {
        roles: ['Frontend', 'Design'],
        workMode: 'Hybrid',
        locations: ['Chennai', 'Bangalore'],
        durationMonths: 3,
        minStipend: 25000,
      },
      resume: { filename: 'anika-patel-nit-trichy-2025.pdf', size: '312 KB', updated: '1 Mar 2025' },
      links: { portfolio: 'https://anikapatel.design' },
    },
  },
  {
    jobId: 'j1',
    avatarColor: '#EEF0FF',
    gpa: '8.9 / 10',
    location: 'Hyderabad',
    year: 'Final Year',
    resumeFile: 'siddharth-nair-vit-2025.pdf',
    resumeSummary:
      'Read against this role: strong CS fundamentals and genuine ML research, but this is a React and TypeScript role and he has neither. His frontend is vanilla JavaScript. The GPA and the EMNLP submission are impressive in the abstract and largely irrelevant to what this job needs. Better suited to a backend or ML-adjacent opening.',
    availability: 'May 20 – Aug 8, 2025 · Full-time',
    preferenceNotes: ['Hyderabad or Remote', 'ML or data-adjacent projects welcome'],
    stage: 'Applied',
    student: {
      id: 'siddharth-nair',
      name: 'Siddharth Nair',
      initial: 'S',
      email: 'siddharth.nair@vitstudent.ac.in',
      phone: '+91 90007 38XXX',
      university: 'VIT Vellore',
      degree: 'B.Tech Computer Science & Engineering',
      field: 'Computer Science & Engineering',
      gradYear: '2025',
      skills: [
        { name: 'Python', evidence: 'strong' },
        { name: 'JavaScript', evidence: 'moderate' },
        { name: 'HTML/CSS', evidence: 'strong' },
        { name: 'Git', evidence: 'strong' },
        { name: 'Data Structures', evidence: 'strong' },
      ],
      projects: [
        {
          id: 'p1',
          name: 'Campus Shuttle Optimizer',
          description: "ML model cutting commute times by 23% across VIT's shuttle network.",
          tech: ['Python', 'Git'],
          github: 'https://github.com/siddharthnair/shuttle',
        },
        {
          id: 'p2',
          name: 'Budget Buddy',
          description: 'Personal finance tracker with a vanilla JS frontend and a Python backend.',
          tech: ['JavaScript', 'HTML/CSS', 'Python'],
        },
      ],
      experience: [
        {
          id: 'e1',
          role: 'Research Assistant',
          company: 'VIT AI Lab',
          mode: 'On-site',
          period: '2024 – present',
          summary:
            'Implementing ML pipelines in Python for NLP research. One paper submitted to EMNLP.',
        },
      ],
      education: {
        degree: 'B.Tech Computer Science & Engineering',
        university: 'VIT Vellore',
        period: '2021 – 2025',
        cgpa: '8.9',
      },
      preferences: {
        roles: ['Backend', 'Data'],
        workMode: 'Remote',
        locations: ['Hyderabad'],
        durationMonths: 3,
        minStipend: 25000,
      },
      resume: { filename: 'siddharth-nair-vit-2025.pdf', size: '176 KB', updated: '20 Feb 2025' },
      links: { github: 'https://github.com/siddharthnair' },
    },
  },
  {
    jobId: 'j1',
    avatarColor: '#EEF0FF',
    gpa: '7.8 / 10',
    location: 'Bangalore',
    year: 'Third Year',
    resumeFile: 'meera-krishnan-manipal-2025.pdf',
    resumeSummary:
      'Read against this role: clean fundamentals and a good eye, but no framework experience of any kind and no API work — every project uses static data. Her Git history is solo commits with no branches or reviews. This role needs React and TypeScript from day one. Worth keeping warm for a more junior opening.',
    availability: 'Jun 2 – Aug 15, 2025 · Part-time or full-time',
    preferenceNotes: ['Bangalore or Remote', 'Flexible schedule'],
    stage: 'Applied',
    student: {
      id: 'meera-krishnan',
      name: 'Meera Krishnan',
      initial: 'M',
      email: 'meera.krishnan@learner.manipal.edu',
      phone: '+91 88617 90XXX',
      university: 'Manipal Institute of Technology',
      degree: 'B.Tech Computer Science & Engineering',
      field: 'Computer Science & Engineering',
      gradYear: '2026',
      skills: [
        { name: 'HTML/CSS', evidence: 'strong' },
        { name: 'JavaScript', evidence: 'moderate' },
        { name: 'Git', evidence: 'weak' },
        { name: 'Figma', evidence: 'weak' },
      ],
      projects: [
        {
          id: 'p1',
          name: 'Portfolio Site',
          description: 'Personal portfolio with hand-written CSS animations.',
          tech: ['HTML/CSS', 'JavaScript'],
        },
        {
          id: 'p2',
          name: 'Recipe Finder',
          description: 'Recipe search built on TheMealDB, with a hand-rolled fetch layer.',
          tech: ['HTML/CSS', 'JavaScript'],
        },
      ],
      experience: [],
      education: {
        degree: 'B.Tech Computer Science & Engineering',
        university: 'Manipal Institute of Technology',
        period: '2022 – 2026',
        cgpa: '7.8',
      },
      preferences: {
        roles: ['Frontend'],
        workMode: 'Remote',
        locations: ['Bangalore'],
        durationMonths: 3,
        minStipend: 15000,
      },
      resume: { filename: 'meera-krishnan-manipal-2025.pdf', size: '154 KB', updated: '18 Feb 2025' },
      links: { github: 'https://github.com/meerakrishnan' },
    },
  },
  {
    jobId: 'j1',
    avatarColor: '#EEF0FF',
    gpa: '8.1 / 10',
    location: 'Delhi NCR',
    year: 'Final Year',
    resumeFile: 'dev-joshi-du-2025.pdf',
    resumeSummary:
      'Read against this role: Dev has real commercial instincts and presented to VP-level stakeholders at Swiggy as an intern, which is unusual. None of it is engineering. No JavaScript, no framework, no version control. This is a mis-application rather than a weak candidate — worth forwarding to whoever owns your product or growth openings.',
    availability: 'Jun 2 – Aug 29, 2025 · Full-time',
    preferenceNotes: ['Delhi NCR or Remote', 'Business and tech intersection'],
    stage: 'Applied',
    student: {
      id: 'dev-joshi',
      name: 'Dev Joshi',
      initial: 'D',
      email: 'dev.joshi@srcc.du.ac.in',
      phone: '+91 98718 04XXX',
      university: 'Delhi University',
      degree: 'B.Com (Hons.) with Computer Science minor',
      field: 'Commerce',
      gradYear: '2025',
      skills: [
        { name: 'Excel', evidence: 'strong' },
        { name: 'SQL', evidence: 'moderate' },
        { name: 'Analytics', evidence: 'moderate' },
        { name: 'Stakeholder Communication', evidence: 'strong' },
      ],
      projects: [
        {
          id: 'p1',
          name: 'Retail Analytics Dashboard',
          description: 'Sales dashboard for a Delhi retailer, built in Excel over a SQL extract.',
          tech: ['Excel', 'SQL'],
        },
      ],
      experience: [
        {
          id: 'e1',
          role: 'Business Analyst Intern',
          company: 'Swiggy',
          mode: 'Hybrid',
          period: 'Jun–Aug 2024',
          summary:
            'Analysed restaurant partner churn and presented a retention framework to the growth team.',
        },
      ],
      education: {
        degree: 'B.Com (Hons.)',
        university: 'Shri Ram College of Commerce, Delhi University',
        period: '2022 – 2025',
        cgpa: '8.1',
      },
      preferences: {
        roles: ['Product', 'Growth'],
        workMode: 'Remote',
        locations: ['Delhi NCR'],
        durationMonths: 3,
        minStipend: 20000,
      },
      resume: { filename: 'dev-joshi-du-2025.pdf', size: '167 KB', updated: '22 Feb 2025' },
      links: {},
    },
  },
];
