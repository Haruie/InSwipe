export interface Candidate {
  id: string;
  /** The job this person applied to. */
  jobId: string;
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
  /** Saved for later by the recruiter (star). */
  saved?: boolean;
  /** Marked "not a fit" by the recruiter. */
  notFit?: boolean;
  gpa: string;
  location: string;
  resumeSummary: string;
  resumeFile: string;
  githubUrl?: string;
  portfolioUrl?: string;
  /** Built from a real Supabase application row. */
  isLive?: boolean;
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

// Runtime data (candidates, jobs, conversations) now comes from Supabase via
// data/store.tsx. This module keeps only the shared types + display helpers.

export const KANBAN_STAGES: KanbanStage[] = [
  "Applied", "Reviewed", "Selected", "In Conversation", "Interview", "Offer", "Hired"
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

/** Live per-job counts, computed from the actual candidate + conversation state
 *  (never the static numbers baked into a Job). */
export function jobStats(
  jobId: string,
  candidates: Candidate[],
  conversations: Conversation[],
): { applicants: number; selected: number; conversations: number } {
  const mine = candidates.filter((c) => c.jobId === jobId);
  const ids = new Set(mine.map((c) => c.id));
  return {
    applicants: mine.length,
    selected: mine.filter((c) => c.selected).length,
    conversations: conversations.filter((cv) => ids.has(cv.candidateId)).length,
  };
}

export function fitBand(score: number): { color: string; label: string } {
  if (score >= 85) return { color: "#16A34A", label: "Strong fit" };
  if (score >= 70) return { color: "#4F46E5", label: "Good fit"  };
  return               { color: "#9CA3AF", label: "Stretch"    };
}
