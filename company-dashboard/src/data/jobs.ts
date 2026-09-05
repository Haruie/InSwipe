import type { Company, Job } from '@inswipe/core';

/**
 * The hiring company. Same `Company` shape the student app renders on a company profile
 * screen, so a job posted here would drop into a student's deck without translation.
 */
export const COMPANY: Company = {
  id: 'technova',
  name: 'TechNova',
  initial: 'T',
  color: '#4F46E5',
  gradient: 'linear-gradient(135deg, #4F46E5 0%, #6C5CE7 100%)',
  verified: true,
  tagline: 'Infrastructure for teams shipping AI products',
  about:
    'TechNova builds the deployment and observability layer that AI teams run their models on. We are 300 people across Bangalore and Berlin, and about half of engineering joined us as interns.',
  industry: 'AI Infrastructure',
  size: '200–400 employees',
  founded: '2019',
  location: 'Bangalore',
  website: 'technova.dev',
  culture: ['Written-first', 'Ship weekly', 'Interns own real surfaces', 'Learning budget'],
  stack: ['React', 'TypeScript', 'Go', 'Postgres', 'Kubernetes'],
  team: [
    { name: 'Priya Sharma', role: 'Talent Lead', initial: 'P' },
    { name: 'Vikram Iyer', role: 'Engineering Manager', initial: 'V' },
    { name: 'Nandini Rao', role: 'Design Lead', initial: 'N' },
  ],
};

export const RECRUITER = {
  name: 'Priya Sharma',
  initials: 'PS',
  role: 'Talent Lead',
};

/** A core `Job` plus the listing metadata only the dashboard needs. */
export interface JobPosting extends Job {
  department: string;
  /** e.g. "Full-time · 10 weeks" */
  type: string;
  status: 'Active' | 'Paused' | 'Closed';
  applicants: number;
  selected: number;
  conversations: number;
  posted: string;
  deadline: string;
}

export const JOBS: JobPosting[] = [
  {
    id: 'j1',
    companyId: 'technova',
    title: 'Frontend Engineering Intern',
    roleCategory: 'Frontend',
    location: 'Bangalore',
    workMode: 'Hybrid',
    durationMonths: 3,
    stipend: 35000,
    about:
      "Join TechNova's product team to build and refine the UI components powering our AI infrastructure platform. You'll work directly with senior engineers and our design team, and own a surface end to end by week four.",
    responsibilities: [
      'Build and maintain components in our internal design system',
      'Ship features to the deployment console used by 4,000 engineers',
      'Work with design on handoff, states and accessibility',
      'Review pull requests and take part in weekly ship reviews',
    ],
    requiredSkills: ['React', 'TypeScript', 'HTML/CSS', 'Git'],
    preferredSkills: ['Tailwind CSS', 'Figma', 'REST APIs', 'Testing'],
    department: 'Engineering',
    type: 'Full-time · 10 weeks',
    status: 'Active',
    applicants: 7,
    selected: 1,
    conversations: 2,
    posted: '12 Mar 2025',
    deadline: '4 Apr 2025',
  },
  {
    id: 'j2',
    companyId: 'technova',
    title: 'Product Design Intern',
    roleCategory: 'Design',
    location: 'Bangalore',
    workMode: 'On-site',
    durationMonths: 3,
    stipend: 30000,
    about:
      "Shape the visual and interaction design of TechNova's developer tools. Own end-to-end flows from research through final handoff, with a design lead reviewing your work weekly.",
    responsibilities: [
      'Run discovery interviews with platform engineers',
      'Design flows for the console and take them through handoff',
      'Contribute components back to the design system',
    ],
    requiredSkills: ['Figma', 'UX Research', 'Prototyping', 'Design Systems'],
    preferredSkills: ['Framer', 'Motion Design', 'User Testing', 'Copywriting'],
    department: 'Design',
    type: 'Full-time · 12 weeks',
    status: 'Active',
    applicants: 14,
    selected: 0,
    conversations: 3,
    posted: '8 Mar 2025',
    deadline: '10 Apr 2025',
  },
  {
    id: 'j3',
    companyId: 'technova',
    title: 'Growth Marketing Intern',
    roleCategory: 'Growth',
    location: 'Remote',
    workMode: 'Remote',
    durationMonths: 2,
    stipend: 20000,
    about:
      "Drive TechNova's developer community growth through content, events and organic channels. Own and measure experiments across the full funnel.",
    responsibilities: [
      'Write and publish developer-facing content weekly',
      'Run and report on growth experiments',
      'Support community events and the monthly newsletter',
    ],
    requiredSkills: ['Content Strategy', 'Analytics', 'SEO', 'Social Media'],
    preferredSkills: ['HubSpot', 'Figma', 'A/B Testing', 'Copywriting'],
    department: 'Marketing',
    type: 'Full-time · 8 weeks',
    status: 'Paused',
    applicants: 22,
    selected: 2,
    conversations: 5,
    posted: '28 Feb 2025',
    deadline: '25 Mar 2025',
  },
];

export const getJob = (id: string): JobPosting => JOBS.find((j) => j.id === id)!;

/* --- display helpers: core stores the facts, the dashboard formats them --- */

export const stipendLabel = (job: Job) => `₹${job.stipend.toLocaleString('en-IN')}/month`;

export const locationLabel = (job: Job) =>
  job.workMode === 'Remote' ? 'Remote' : `${job.location} · ${job.workMode}`;
