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
  emptyStudentWorkspace,
  loadStudentWorkspace,
  markConversationRead,
  markNotificationsRead,
  passJob,
  resetDemoData,
  saveStudentProfile,
  sendMessage,
  setSaved,
  type ApplicationRecord,
  type NotificationRecord,
  type StudentRecord,
  type StudentWorkspace,
} from '@inswipe/data';
import type { Conversation, Experience, ParsedResume, Project, Student } from '@inswipe/core';
import { catalog, getJob } from './data/catalog';
import { computeFit } from './lib/fit';
import { db } from './lib/db';
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
  student: StudentRecord;
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
  /**
   * The profile on screen has edits that Supabase has not stored yet.
   *
   * This is what stops the four-second poll from undoing them. Without it every
   * keystroke in onboarding or on the profile tab was replaced by the row it came from
   * within four seconds, which read as fields that refused to change.
   */
  profileDirty: boolean;
  /**
   * The resume the student just chose, on its way to being read. It lives here rather
   * than in the upload screen because the screen that reads it is the next one — and it
   * is a `File`, never a row: nothing about it is written until the student accepts what
   * came back from it.
   */
  pendingResume: File | null;
  /**
   * How sure the parser was, field by field, about the profile now on screen. Null when
   * the profile was typed rather than read. The review screen turns anything below `high`
   * into a "Confirm?" chip — CLAUDE.md section 6: parsing is imperfect, and the student
   * is told exactly where.
   */
  resumeConfidence: ParsedResume['confidence'] | null;
  learn: Record<string, LearnStatus>;
  filters: Filters;
}

/**
 * Everything the student has done lives in Supabase. This turns one load of it into the
 * screen state, and `sync` below folds later loads back in the same way.
 */
function stateFromWorkspace(workspace: StudentWorkspace, screen: Screen, tab?: Tab): State {
  return {
    screen,
    stack: [],
    dir: 'f',
    tab: tab ?? 'discover',
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
    profileDirty: false,
    pendingResume: null,
    resumeConfidence: null,
    learn: {},
    filters: { minFit: 0, workMode: 'Any' },
  };
}

/**
 * Where a freshly loaded app starts. A reload should not replay onboarding, so a
 * session that finished it comes back to the tab it was left on — and one that did not
 * resumes at the fork, holding the account it had already created.
 */
function initialState(workspace: StudentWorkspace): State {
  const session = readSession();
  if (!session || !workspace.student.id) return stateFromWorkspace(workspace, 'splash');
  return stateFromWorkspace(workspace, session.onboarded ? 'main' : 'fork', session.tab);
}

/**
 * A profile change, with the flag that keeps it. Every edit goes through here so no
 * screen can change the student without the save that follows it.
 */
function edited(student: StudentRecord): Pick<State, 'student' | 'profileDirty'> {
  // The avatar letter is derived, never typed, so it cannot fall out of step with the name.
  const initial = student.name.trim() ? student.name.trim()[0].toUpperCase() : '·';
  return { student: { ...student, initial }, profileDirty: true };
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
  | { type: 'updateProject'; project: Project }
  | { type: 'removeProject'; projectId: string }
  | { type: 'addExperience'; experience: Experience }
  | { type: 'updateExperience'; experience: Experience }
  | { type: 'removeExperience'; experienceId: string }
  | { type: 'profileSaved'; student: StudentRecord }
  | { type: 'dismissGap'; skill: string }
  | { type: 'signedIn'; workspace: StudentWorkspace; screen: Screen }
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
        // An edit that has not reached Supabase yet outranks the row it was made from.
        // The save is in flight; the next poll after it lands agrees with the screen.
        student: state.profileDirty ? state.student : action.workspace.student,
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

    /*
     * Everything below edits the profile. Each one marks it dirty, and the provider
     * flushes it to Supabase shortly afterwards — see `save_student_profile()`. The
     * dirty flag is why these edits stick: `sync` above will not overwrite them.
     */
    case 'updateStudent':
      return { ...state, ...edited({ ...state.student, ...action.patch }) };

    case 'toggleSkill': {
      const exists = state.student.skills.some((s) => s.name === action.skill);
      return {
        ...state,
        ...edited({
          ...state.student,
          skills: exists
            ? state.student.skills.filter((s) => s.name !== action.skill)
            : [...state.student.skills, { name: action.skill, evidence: 'weak' }],
        }),
      };
    }

    case 'addProject':
      return {
        ...state,
        ...edited({ ...state.student, projects: [...state.student.projects, action.project] }),
      };

    case 'updateProject':
      return {
        ...state,
        ...edited({
          ...state.student,
          projects: state.student.projects.map((p) =>
            p.id === action.project.id ? action.project : p,
          ),
        }),
      };

    case 'removeProject':
      return {
        ...state,
        ...edited({
          ...state.student,
          projects: state.student.projects.filter((p) => p.id !== action.projectId),
        }),
      };

    case 'addExperience':
      return {
        ...state,
        ...edited({
          ...state.student,
          experience: [...state.student.experience, action.experience],
        }),
      };

    case 'updateExperience':
      return {
        ...state,
        ...edited({
          ...state.student,
          experience: state.student.experience.map((e) =>
            e.id === action.experience.id ? action.experience : e,
          ),
        }),
      };

    case 'removeExperience':
      return {
        ...state,
        ...edited({
          ...state.student,
          experience: state.student.experience.filter((e) => e.id !== action.experienceId),
        }),
      };

    /**
     * The save landed. It only clears the flag if nothing was typed while the write was
     * in flight — otherwise those newer edits are still unsaved, and the provider will
     * send them next.
     */
    case 'profileSaved':
      return state.student === action.student ? { ...state, profileDirty: false } : state;

    /** A real account, loaded. Everything about the signed-out app is discarded. */
    case 'signedIn':
      return stateFromWorkspace(action.workspace, action.screen);

    case 'dismissGap':
      return { ...state, learn: { ...state.learn, [action.skill]: 'skipped' } };

    /** Back to the splash screen with nothing carried over from the session. */
    case 'logout':
      return stateFromWorkspace(action.workspace, 'splash');

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
  /** Loads a student's workspace and runs the app as them. */
  signIn: (studentId: string, options: { onboarded: boolean }) => Promise<void>;
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
  const [state, rawDispatch] = useReducer(reducer, workspace, initialState);

  // The reducer stays pure. Anything that changes the database happens here, and the
  // reload that follows is what makes the dashboard's view and this one agree.
  const stateRef = useRef(state);
  stateRef.current = state;

  // Once onboarding is behind her, remember it, so a refresh returns to the app rather
  // than the splash screen. The onboarding screens themselves are never remembered.
  useEffect(() => {
    if (ONBOARDING.has(state.screen) || !state.student.id) return;
    writeSession({ studentId: state.student.id, onboarded: true, tab: state.tab });
  }, [state.screen, state.tab, state.student.id]);

  /**
   * Demo only. `demo_reset()` can be run from the profile tab here, from the company
   * dashboard's settings or from `scripts/demo.mjs`, and it rebuilds every runtime row.
   * Nothing else deletes an application, so an id that was here a moment ago and is gone
   * now means the dataset was restored underneath this tab — reload onto it, rather than
   * leave the app holding applications and threads that no longer exist.
   */
  const knownApplications = useRef(new Set(workspace.applications.map((a) => a.id)));

  const sync = useCallback(async () => {
    // Nobody is signed in yet — the splash and auth screens have nothing to poll for.
    const studentId = stateRef.current.student.id;
    if (!studentId) return;

    const next = await loadStudentWorkspace(db, studentId, catalog());

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
              studentId: current.student.id,
              jobId: action.jobId,
              note: action.note,
              noteWasAiDrafted: Boolean(action.note),
              fit: computeFit(current.student, getJob(action.jobId)).score,
            }),
          );
          break;
        }
        case 'pass':
          after(passJob(db, current.student.id, action.jobId));
          break;
        case 'toggleSave':
          after(setSaved(db, current.student.id, action.jobId, !current.saved.includes(action.jobId)));
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
            after(markNotificationsRead(db, current.student.id));
          }
          break;
        default:
          break;
      }
    },
    [sync],
  );

  /**
   * Run the app as this student. Called once an account has been created or signed into
   * — the id is real either way, so from here on every read and write is scoped to it.
   */
  const signIn = useCallback(
    async (studentId: string, options: { onboarded: boolean }) => {
      const next = await loadStudentWorkspace(db, studentId, catalog());
      knownApplications.current = new Set(next.applications.map((a) => a.id));
      writeSession({ studentId, onboarded: options.onboarded, tab: 'discover' });
      rawDispatch({
        type: 'signedIn',
        workspace: next,
        screen: options.onboarded ? 'main' : 'fork',
      });
    },
    [],
  );

  /**
   * The other half of the fix for edits that would not stick. The reducer keeps the
   * edit on screen; this is what puts it in Supabase.
   *
   * Debounced, because the caller is a text field: typing a university name should be
   * one write, not thirty. The snapshot is compared by reference on the way back, so an
   * edit made while the write was in flight is not marked saved by it.
   */
  useEffect(() => {
    if (!state.profileDirty || !state.student.id) return;
    const snapshot = state.student;
    const timer = setTimeout(() => {
      saveStudentProfile(db, snapshot)
        .then(() => rawDispatch({ type: 'profileSaved', student: snapshot }))
        .catch((error) => {
          console.error('[InSwipe] profile save failed', error);
          rawDispatch({ type: 'patch', patch: { toast: 'Could not save your profile' } });
        });
    }, 600);
    return () => clearTimeout(timer);
  }, [state.profileDirty, state.student]);

  // Signing out is a session concern, not a data one: nothing is written to Supabase,
  // the app simply forgets that anyone was signed in and returns to the splash screen.
  // The profile itself is a row, so it is still there at the next sign-in.
  const logout = useCallback(() => {
    clearSession();
    rawDispatch({ type: 'logout', workspace: emptyStudentWorkspace(catalog()) });
  }, []);

  /**
   * Demo only: restores the dataset a presentation starts from. The caller reloads the
   * page afterwards — the deck, the applications and the catalogue itself are all views
   * of rows this call has just replaced.
   */
  const resetDemo = useCallback(() => resetDemoData(db), []);

  const value = useMemo(
    () => ({ state, dispatch, sync, signIn, logout, resetDemo }),
    [state, dispatch, sync, signIn, logout, resetDemo],
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
