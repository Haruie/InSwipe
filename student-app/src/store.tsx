import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { deckJobIds, getJob, jobs } from './data/jobs';
import {
  initialStudent,
  seedApplications,
  seedConversations,
  seedNotifications,
  seedSaved,
} from './data/student';
import { getCompany } from './data/companies';
import { computeFit } from './lib/fit';
import { openingMessage } from './lib/note';
import type { Application, Conversation, Notification, Project, Student } from './data/types';

export type Screen =
  | 'splash'
  | 'intro'
  | 'auth'
  | 'fork'
  | 'upload'
  | 'parsing'
  | 'review'
  | 'm-basic'
  | 'm-skills'
  | 'm-projects'
  | 'm-prefs'
  | 'main'
  | 'detail'
  | 'company'
  | 'appDetail'
  | 'chat'
  | 'learning'
  | 'notifications';

export type Tab = 'discover' | 'applications' | 'saved' | 'inbox' | 'profile';
export type Sheet = null | 'fit' | 'note' | 'filter';
export type LearnStatus = 'todo' | 'learning' | 'done' | 'skipped';

export interface Filters {
  minFit: number;
  workMode: 'Any' | 'Remote' | 'Hybrid' | 'On-site';
}

export interface State {
  screen: Screen;
  stack: Screen[];
  dir: 'f' | 'b';
  tab: Tab;
  introIndex: number;
  authMode: 'signup' | 'signin';
  student: Student;
  deck: string[];
  passed: string[];
  saved: string[];
  applications: Application[];
  conversations: Conversation[];
  notifications: Notification[];
  inboxUnlocked: boolean;
  detailJobId: string | null;
  companyId: string | null;
  appDetailJobId: string | null;
  chatJobId: string | null;
  sheet: Sheet;
  noteJobId: string | null;
  selection: string | null;
  appliedModal: string | null;
  toast: string | null;
  profileEditing: boolean;
  learn: Record<string, LearnStatus>;
  filters: Filters;
}

const initialState: State = {
  screen: 'splash',
  stack: [],
  dir: 'f',
  tab: 'discover',
  introIndex: 0,
  authMode: 'signup',
  student: initialStudent,
  deck: deckJobIds,
  passed: [],
  saved: seedSaved,
  applications: seedApplications,
  conversations: seedConversations,
  notifications: seedNotifications,
  inboxUnlocked: false,
  detailJobId: null,
  companyId: null,
  appDetailJobId: null,
  chatJobId: null,
  sheet: null,
  noteJobId: null,
  selection: null,
  appliedModal: null,
  toast: null,
  profileEditing: false,
  learn: {},
  filters: { minFit: 0, workMode: 'Any' },
};

type Action =
  | { type: 'nav'; screen: Screen }
  | { type: 'back' }
  | { type: 'tab'; tab: Tab }
  | { type: 'patch'; patch: Partial<State> }
  | { type: 'pass'; jobId: string }
  | { type: 'toggleSave'; jobId: string }
  | { type: 'openNote'; jobId: string }
  | { type: 'apply'; jobId: string; note?: string }
  | { type: 'simulateSelection' }
  | { type: 'send'; jobId: string; text: string }
  | { type: 'readConversation'; jobId: string }
  | { type: 'setLearn'; skill: string; status: LearnStatus }
  | { type: 'updateStudent'; patch: Partial<Student> }
  | { type: 'toggleSkill'; skill: string }
  | { type: 'addProject'; project: Project }
  | { type: 'startManualProfile' }
  | { type: 'dismissGap'; skill: string }
  | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    // Any navigation dismisses an open sheet — otherwise it hangs over the next screen.
    case 'nav':
      return {
        ...state,
        screen: action.screen,
        stack: [...state.stack, state.screen],
        dir: 'f',
        sheet: null,
      };

    case 'back': {
      const stack = [...state.stack];
      const prev = stack.pop() ?? 'main';
      return { ...state, screen: prev, stack, dir: 'b', sheet: null };
    }

    case 'tab':
      return { ...state, tab: action.tab, sheet: null };

    case 'patch':
      return { ...state, ...action.patch };

    case 'pass':
      return {
        ...state,
        deck: state.deck.filter((id) => id !== action.jobId),
        passed: [...state.passed, action.jobId],
      };

    case 'toggleSave': {
      const isSaved = state.saved.includes(action.jobId);
      return {
        ...state,
        saved: isSaved ? state.saved.filter((id) => id !== action.jobId) : [...state.saved, action.jobId],
        toast: isSaved ? 'Removed from saved' : 'Saved to your list',
      };
    }

    case 'openNote':
      return { ...state, sheet: 'note', noteJobId: action.jobId };

    case 'apply': {
      if (state.applications.some((a) => a.jobId === action.jobId)) {
        return { ...state, sheet: null, noteJobId: null };
      }
      const order = Math.max(0, ...state.applications.map((a) => a.appliedOrder)) + 1;
      const fit = computeFit(state.student, getJob(action.jobId));
      const application: Application = {
        jobId: action.jobId,
        status: 'applied',
        appliedLabel: 'Applied just now',
        appliedOrder: order,
        note: action.note || undefined,
        noteWasAiDrafted: Boolean(action.note),
        resumeAttached: state.student.resume?.filename,
        fitSnapshot: fit.score,
        timeline: [{ status: 'applied', date: 'Just now' }],
      };
      return {
        ...state,
        applications: [application, ...state.applications],
        deck: state.deck.filter((id) => id !== action.jobId),
        sheet: null,
        noteJobId: null,
        appliedModal: action.jobId,
        // if they applied from the detail screen, drop back to the deck behind the modal
        screen: state.screen === 'detail' ? 'main' : state.screen,
        stack: state.screen === 'detail' ? [] : state.stack,
      };
    }

    /**
     * Stands in for the company dashboard. When the two products share a backend this
     * is the `selections` row that unlocks the conversation — nothing else may create one.
     */
    case 'simulateSelection': {
      const candidate =
        state.applications.find((a) => a.status === 'applied') ??
        state.applications.find((a) => a.status === 'reviewing' || a.status === 'shortlisted');
      if (!candidate) return { ...state, toast: 'Apply to something first' };

      const job = getJob(candidate.jobId);
      const company = getCompany(job.companyId);

      const applications = state.applications.map((a) =>
        a.jobId === candidate.jobId
          ? {
              ...a,
              status: 'selected' as const,
              timeline: [...a.timeline, { status: 'selected' as const, date: 'Just now', detail: `${company.name} selected you.` }],
            }
          : a,
      );

      const conversation: Conversation = {
        jobId: candidate.jobId,
        unread: 1,
        lastLabel: 'Now',
        messages: [
          {
            id: `m-${Date.now()}`,
            fromCompany: true,
            text: openingMessage(state.student, job),
            time: 'Now',
            dayLabel: 'Today',
          },
        ],
      };

      const notification: Notification = {
        id: `n-${Date.now()}`,
        kind: 'selected',
        title: `You have been selected by ${company.name}`,
        body: `${company.name} selected you for ${job.title}. Open the chat to respond.`,
        time: 'Just now',
        group: 'Today',
        unread: true,
      };

      return {
        ...state,
        applications,
        conversations: [conversation, ...state.conversations.filter((c) => c.jobId !== candidate.jobId)],
        notifications: [notification, ...state.notifications],
        inboxUnlocked: true,
        selection: candidate.jobId,
        // The selection celebration supersedes it — otherwise closing the overlay
        // reveals a stale "Applied" modal stacked underneath.
        appliedModal: null,
      };
    }

    case 'send': {
      const text = action.text.trim();
      if (!text) return state;
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.jobId === action.jobId
            ? {
                ...c,
                lastLabel: 'Now',
                messages: [
                  ...c.messages,
                  { id: `m-${Date.now()}`, fromCompany: false, text, time: 'Now' },
                ],
              }
            : c,
        ),
      };
    }

    case 'readConversation':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.jobId === action.jobId ? { ...c, unread: 0 } : c,
        ),
      };

    case 'setLearn':
      return { ...state, learn: { ...state.learn, [action.skill]: action.status } };

    case 'updateStudent':
      return { ...state, student: { ...state.student, ...action.patch } };

    case 'toggleSkill': {
      const exists = state.student.skills.some((s) => s.name === action.skill);
      return {
        ...state,
        student: {
          ...state.student,
          skills: exists
            ? state.student.skills.filter((s) => s.name !== action.skill)
            : [...state.student.skills, { name: action.skill, evidence: 'weak' }],
        },
      };
    }

    case 'addProject':
      return {
        ...state,
        student: { ...state.student, projects: [...state.student.projects, action.project] },
      };

    /** Manual entry has to start from a blank profile, not the parsed one. */
    case 'startManualProfile':
      return {
        ...state,
        student: {
          ...initialStudent,
          name: '',
          initial: '·',
          email: '',
          phone: '',
          university: '',
          degree: '',
          field: '',
          gradYear: '',
          skills: [],
          projects: [],
          experience: [],
          resume: undefined,
          links: {},
        },
      };

    case 'dismissGap':
      return { ...state, learn: { ...state.learn, [action.skill]: 'skipped' } };

    case 'reset':
      return initialState;

    default:
      return state;
  }
}

const StoreContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

/* ---------- selectors ---------- */

export const useFit = (jobId: string | null | undefined) => {
  const { state } = useStore();
  return useMemo(
    () => (jobId ? computeFit(state.student, getJob(jobId)) : null),
    [state.student, jobId],
  );
};

export const useDeck = () => {
  const { state } = useStore();
  return useMemo(() => {
    const withFit = state.deck.map((id) => ({ id, fit: computeFit(state.student, getJob(id)) }));
    return withFit
      .filter(
        (d) =>
          d.fit.score >= state.filters.minFit &&
          (state.filters.workMode === 'Any' || getJob(d.id).workMode === state.filters.workMode),
      )
      .sort((a, b) => b.fit.score - a.fit.score);
  }, [state.deck, state.student, state.filters]);
};

export const allJobs = jobs;
