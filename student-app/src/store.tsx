import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import {
  applyToJob,
  loadStudentWorkspace,
  markConversationRead,
  markNotificationsRead,
  passJob,
  resetDemoData,
  sendMessage,
  setSaved,
  type ApplicationRecord,
  type NotificationRecord,
  type StudentWorkspace,
} from '@inswipe/data';
import type { Conversation, Project, Student } from '@inswipe/core';
import { catalog, getJob } from './data/catalog';
import { computeFit } from './lib/fit';
import { DEMO_STUDENT_ID, db } from './lib/db';
import { clearSession, readSession, writeSession } from './lib/session';

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
  applications: ApplicationRecord[];
  conversations: Conversation[];
  notifications: NotificationRecord[];
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

/**
 * Everything the student has done lives in Supabase. This turns one load of it into the
 * screen state, and `sync` below folds later loads back in the same way.
 */
function stateFromWorkspace(workspace: StudentWorkspace): State {
  // A reload should not replay onboarding. If the last session was signed in, come back
  // to the tab it was left on.
  const session = readSession();
  return {
    screen: session ? 'main' : 'splash',
    stack: [],
    dir: 'f',
    tab: session?.tab ?? 'discover',
    introIndex: 0,
    authMode: 'signup',
    student: workspace.student,
    deck: workspace.deckJobIds,
    passed: workspace.passed,
    saved: workspace.saved,
    applications: workspace.applications,
    conversations: workspace.conversations,
    notifications: workspace.notifications,
    inboxUnlocked: workspace.inboxUnlocked,
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
}

type Action =
  | { type: 'nav'; screen: Screen }
  | { type: 'back' }
  | { type: 'tab'; tab: Tab }
  | { type: 'patch'; patch: Partial<State> }
  | { type: 'pass'; jobId: string }
  | { type: 'toggleSave'; jobId: string }
  | { type: 'openNote'; jobId: string }
  | { type: 'apply'; jobId: string; note?: string }
  | { type: 'send'; jobId: string; text: string }
  | { type: 'readConversation'; jobId: string }
  | { type: 'sync'; workspace: StudentWorkspace }
  | { type: 'setLearn'; skill: string; status: LearnStatus }
  | { type: 'updateStudent'; patch: Partial<Student> }
  | { type: 'toggleSkill'; skill: string }
  | { type: 'addProject'; project: Project }
  | { type: 'startManualProfile' }
  | { type: 'dismissGap'; skill: string }
  | { type: 'logout'; workspace: StudentWorkspace };

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

    /**
     * The optimistic half of applying. The row itself is written by `apply_to_job()`;
     * the next sync replaces this placeholder with what the database actually stored.
     */
    case 'apply': {
      if (state.applications.some((a) => a.jobId === action.jobId)) {
        return { ...state, sheet: null, noteJobId: null };
      }
      const order = Math.max(0, ...state.applications.map((a) => a.appliedOrder)) + 1;
      const fit = computeFit(state.student, getJob(action.jobId));
      const application: ApplicationRecord = {
        id: `pending-${action.jobId}`,
        studentId: state.student.id,
        jobId: action.jobId,
        status: 'applied',
        stage: 'Applied',
        appliedLabel: 'Applied just now',
        appliedOrder: order,
        note: action.note || undefined,
        noteWasAiDrafted: Boolean(action.note),
        resumeAttached: state.student.resume?.filename,
        fitSnapshot: fit.score,
        timeline: [{ status: 'applied', date: 'Just now' }],
        availability: '',
        preferenceNotes: [],
        resumeSummary: '',
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
                  { id: `pending-${Date.now()}`, fromCompany: false, text, time: 'Just now' },
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

    /**
     * The company dashboard writes; this reads it back. A conversation that was not
     * here a moment ago can only mean one thing — a recruiter selected her — so this is
     * where the celebration is triggered from (CLAUDE.md section 3, rule 8).
     */
    case 'sync': {
      const known = new Set(state.conversations.map((c) => c.id));
      const arrived = action.workspace.conversations.find((c) => !known.has(c.id));

      return {
        ...state,
        student: action.workspace.student,
        deck: action.workspace.deckJobIds,
        passed: action.workspace.passed,
        saved: action.workspace.saved,
        applications: action.workspace.applications,
        conversations: action.workspace.conversations,
        notifications: action.workspace.notifications,
        inboxUnlocked: action.workspace.inboxUnlocked,
        selection: arrived ? arrived.jobId : state.selection,
        // The selection celebration supersedes it — otherwise closing the overlay
        // reveals a stale "Applied" modal stacked underneath.
        appliedModal: arrived ? null : state.appliedModal,
      };
    }

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
          ...state.student,
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

    /** Back to the splash screen with nothing carried over from the session. */
    case 'logout':
      return { ...stateFromWorkspace(action.workspace), screen: 'splash' };

    default:
      return state;
  }
}

/** Screens that mean the student has not finished signing in yet. */
const ONBOARDING = new Set<Screen>([
  'splash',
  'intro',
  'auth',
  'fork',
  'upload',
  'parsing',
  'review',
  'm-basic',
  'm-skills',
  'm-projects',
  'm-prefs',
]);

const StoreContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
  sync: () => Promise<void>;
  logout: () => void;
  resetDemo: () => Promise<string>;
} | null>(null);

export function StoreProvider({
  workspace,
  children,
}: {
  workspace: StudentWorkspace;
  children: React.ReactNode;
}) {
  const [state, rawDispatch] = useReducer(reducer, workspace, stateFromWorkspace);

  // The reducer stays pure. Anything that changes the database happens here, and the
  // reload that follows is what makes the dashboard's view and this one agree.
  const stateRef = useRef(state);
  stateRef.current = state;

  // Once onboarding is behind her, remember it, so a refresh returns to the app rather
  // than the splash screen. The onboarding screens themselves are never remembered.
  useEffect(() => {
    if (ONBOARDING.has(state.screen)) return;
    writeSession({ signedIn: true, tab: state.tab });
  }, [state.screen, state.tab]);

  /**
   * Demo only. `demo_reset()` can be run from the profile tab here, from the company
   * dashboard's settings or from `scripts/demo.mjs`, and it rebuilds every runtime row.
   * Nothing else deletes an application, so an id that was here a moment ago and is gone
   * now means the dataset was restored underneath this tab — reload onto it, rather than
   * leave the app holding applications and threads that no longer exist.
   */
  const knownApplications = useRef(new Set(workspace.applications.map((a) => a.id)));

  const sync = useCallback(async () => {
    const next = await loadStudentWorkspace(db, DEMO_STUDENT_ID, catalog());

    const ids = new Set(next.applications.map((a) => a.id));
    for (const id of knownApplications.current) {
      if (!ids.has(id)) return window.location.reload();
    }
    knownApplications.current = ids;

    rawDispatch({ type: 'sync', workspace: next });
  }, []);

  const dispatch = useCallback(
    (action: Action) => {
      rawDispatch(action);

      // `stateRef` still holds the state from before that dispatch, because React has not
      // re-rendered yet. That is what we want: a toggle needs to know what it was toggled
      // from, and the apply guard needs to know whether an application already existed.
      const current = stateRef.current;
      const after = (write: Promise<unknown>) => {
        write.then(sync).catch((error) => {
          console.error('[InSwipe] write failed', error);
          rawDispatch({ type: 'patch', patch: { toast: 'Could not reach the server' } });
        });
      };

      switch (action.type) {
        case 'apply': {
          if (current.applications.some((a) => a.jobId === action.jobId)) break;
          after(
            applyToJob(db, {
              studentId: DEMO_STUDENT_ID,
              jobId: action.jobId,
              note: action.note,
              noteWasAiDrafted: Boolean(action.note),
              fit: computeFit(current.student, getJob(action.jobId)).score,
            }),
          );
          break;
        }
        case 'pass':
          after(passJob(db, DEMO_STUDENT_ID, action.jobId));
          break;
        case 'toggleSave':
          after(setSaved(db, DEMO_STUDENT_ID, action.jobId, !current.saved.includes(action.jobId)));
          break;
        case 'send': {
          const conversation = current.conversations.find((c) => c.jobId === action.jobId);
          if (conversation && action.text.trim()) {
            after(sendMessage(db, conversation.id, false, action.text));
          }
          break;
        }
        case 'readConversation': {
          const conversation = current.conversations.find((c) => c.jobId === action.jobId);
          if (conversation && conversation.unread > 0) {
            after(markConversationRead(db, conversation.id, false));
          }
          break;
        }
        case 'nav':
          if (action.screen === 'notifications' && current.notifications.some((n) => n.unread)) {
            after(markNotificationsRead(db, DEMO_STUDENT_ID));
          }
          break;
        default:
          break;
      }
    },
    [sync],
  );

  // Signing out is a session concern, not a data one: nothing is written to Supabase,
  // the app simply forgets that anyone was signed in and returns to the splash screen.
  const logout = useCallback(() => {
    clearSession();
    rawDispatch({ type: 'logout', workspace });
  }, [workspace]);

  /**
   * Demo only: restores the dataset a presentation starts from. The caller reloads the
   * page afterwards — the deck, the applications and the catalogue itself are all views
   * of rows this call has just replaced.
   */
  const resetDemo = useCallback(() => resetDemoData(db), []);

  const value = useMemo(
    () => ({ state, dispatch, sync, logout, resetDemo }),
    [state, dispatch, sync, logout, resetDemo],
  );
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
