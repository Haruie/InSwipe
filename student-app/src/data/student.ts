import type { Application, Conversation, Notification, Student } from './types';

export const initialStudent: Student = {
  name: 'Anika Sharma',
  initial: 'A',
  email: 'anika@srm.edu.in',
  phone: '+91 98102 47XXX',
  university: 'SRM Institute of Science & Technology',
  degree: 'B.Tech Computer Science',
  field: 'Computer Science & Engineering',
  gradYear: '2026',
  skills: [
    { name: 'React', evidence: 'strong' },
    { name: 'TypeScript', evidence: 'strong' },
    { name: 'JavaScript', evidence: 'strong' },
    { name: 'Node.js', evidence: 'moderate' },
    { name: 'REST APIs', evidence: 'moderate' },
    { name: 'SQL', evidence: 'moderate' },
    { name: 'Python', evidence: 'moderate' },
    { name: 'Git', evidence: 'strong' },
    { name: 'Figma', evidence: 'weak' },
  ],
  projects: [
    {
      id: 'meditrack',
      name: 'MediTrack — Patient Portal',
      description:
        'A full-stack web app for hospital appointment scheduling with real-time availability.',
      tech: ['React', 'Node.js', 'PostgreSQL', 'REST APIs'],
      github: 'github.com/anika/meditrack',
      contribution: 'Built the scheduling UI and the availability API end to end.',
    },
    {
      id: 'sketchsync',
      name: 'SketchSync',
      description:
        'Real-time collaborative whiteboard using WebSockets, built during a 36-hour hackathon.',
      tech: ['TypeScript', 'Socket.io', 'Canvas API', 'React'],
      demo: 'sketchsync.vercel.app',
      contribution: 'Led the frontend and the conflict-resolution logic for concurrent edits.',
    },
  ],
  experience: [
    {
      id: 'frappe',
      role: 'Frontend Developer Intern',
      company: 'Frappe',
      mode: 'Remote',
      period: 'May 2024 – Aug 2024 · 4 months',
      summary:
        'Built internal dashboard components in React; reduced page load time by 40%.',
    },
  ],
  education: {
    degree: 'B.Tech Computer Science & Engineering',
    university: 'SRM Institute of Science & Technology',
    period: '2022 – 2026',
    cgpa: 'CGPA 8.7 / 10',
  },
  preferences: {
    roles: ['Frontend', 'Full Stack'],
    workMode: 'Hybrid',
    locations: ['Bengaluru', 'Bangalore', 'Chennai', 'Remote'],
    durationMonths: 3,
    minStipend: 10000,
  },
  resume: { filename: 'Anika_Sharma_Resume.pdf', size: '142 KB', updated: 'Updated 3 days ago' },
  links: {
    github: 'github.com/anika-sharma',
    portfolio: 'anikasharma.dev',
  },
};

/** Applications that already exist when the demo opens. */
export const seedApplications: Application[] = [
  {
    jobId: 'zepto-be',
    status: 'shortlisted',
    appliedLabel: 'Applied 9 days ago',
    appliedOrder: 1,
    note: 'My MediTrack project is a Node and PostgreSQL service handling real scheduling load — close to the routing work described here.',
    noteWasAiDrafted: true,
    resumeAttached: 'Anika_Sharma_Resume.pdf',
    fitSnapshot: 79,
    timeline: [
      { status: 'applied', date: '27 Aug' },
      { status: 'reviewing', date: '29 Aug', detail: 'Your application is being reviewed by the team.' },
      { status: 'shortlisted', date: '2 Sep', detail: 'You are in the top 12% of applicants.' },
    ],
  },
  {
    jobId: 'flipkart-mobile',
    status: 'reviewing',
    appliedLabel: 'Applied 6 days ago',
    appliedOrder: 2,
    resumeAttached: 'Anika_Sharma_Resume.pdf',
    fitSnapshot: 74,
    timeline: [
      { status: 'applied', date: '30 Aug' },
      { status: 'reviewing', date: '1 Sep', detail: 'Your application is being reviewed by the team.' },
    ],
  },
  {
    jobId: 'meesho-fe',
    status: 'reviewing',
    appliedLabel: 'Applied 4 days ago',
    appliedOrder: 3,
    note: 'I have shipped two React projects and interned on a design-system team, which matches the component work in this role.',
    noteWasAiDrafted: true,
    resumeAttached: 'Anika_Sharma_Resume.pdf',
    fitSnapshot: 86,
    timeline: [
      { status: 'applied', date: '1 Sep' },
      { status: 'reviewing', date: '3 Sep' },
    ],
  },
  {
    jobId: 'cred-pd',
    status: 'rejected',
    appliedLabel: 'Applied 11 days ago',
    appliedOrder: 0,
    resumeAttached: 'Anika_Sharma_Resume.pdf',
    fitSnapshot: 41,
    timeline: [
      { status: 'applied', date: '25 Aug' },
      { status: 'reviewing', date: '26 Aug' },
      { status: 'rejected', date: '30 Aug', detail: 'They moved forward with candidates who had more visual design work.' },
    ],
  },
];

export const seedSaved = ['myntra-fe', 'razorpay-be'];

/** Conversations only exist once a company has selected the student. */
export const seedConversations: Conversation[] = [];

export const seedNotifications: Notification[] = [
  {
    id: 'n1',
    kind: 'status',
    title: 'Your Zepto application was shortlisted',
    body: 'You are in the top 12% of applicants for Backend Engineering Intern.',
    time: '2 h ago',
    group: 'Today',
    unread: true,
  },
  {
    id: 'n2',
    kind: 'view',
    title: 'A company viewed your profile',
    body: 'Someone at a Series A startup spent 2+ minutes on your profile today.',
    time: '5 h ago',
    group: 'Today',
    unread: true,
  },
  {
    id: 'n3',
    kind: 'matches',
    title: '5 new internships match your profile',
    body: 'Including roles at Nexora Labs, Postman and Myntra — all above 80% fit.',
    time: 'Yesterday, 4:12 PM',
    group: 'Yesterday',
    unread: false,
  },
];

/** Short, human hints used when a required or preferred skill is missing. */
export const gapHints: Record<string, string> = {
  Docker: 'A weekend project containerising something you have already built would cover it.',
  PostgreSQL: 'Your SQL experience already transfers. Worth naming it explicitly.',
  TypeScript: 'You use it in SketchSync — add it to more projects and this closes.',
  Redis: 'A caching layer on any existing project is enough to claim it.',
  Go: 'Not expected of an intern. Nice to have, not a blocker.',
  Kotlin: 'Only relevant if you want to go deeper on Android.',
  Swift: 'iOS-specific. Skip unless you want mobile work.',
  'React Native': 'Your React experience is most of the way there.',
  'Next.js': 'A thin layer over React you could pick up in a weekend.',
  GraphQL: 'Worth an afternoon tutorial. Increasingly common in frontend roles.',
  Testing: 'Add tests to MediTrack and you can claim this honestly.',
  Statistics: 'The main gate on data roles. Needs real study, not a weekend.',
  Pandas: 'Follows quickly once you are comfortable with Python.',
  'Machine Learning': 'A larger investment. Only worth it if data roles are the goal.',
  Airflow: 'Pipeline tooling. Learn on the job.',
  Wireframing: 'You have Figma. This is a way of working more than a tool.',
  Prototyping: 'Figma prototyping mode would get you most of the way.',
  'Interaction Design': 'A craft skill that takes portfolio work to demonstrate.',
  'Visual Design': 'The hardest gap here. Needs a body of visual work.',
  'Motion Design': 'Nice to have. Rive or Framer would demonstrate it.',
  'User Research': 'Run two usability sessions and write them up.',
  Framer: 'Close to Figma. A day to learn.',
  CSS: 'You already write it inside your React work.',
  Performance: 'Profile one of your own projects and write up what you found.',
  Java: 'A larger language investment.',
  Spark: 'Only relevant at data-warehouse scale.',
};
