import { useEffect } from 'react';
import type { StudentWorkspace } from '@inswipe/data';
import { StoreProvider, useStore } from './store';
import { PhoneFrame, HomeIndicator, StatusBar } from './components/PhoneFrame';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/ui';

import { Auth, Fork, Intro, Splash } from './screens/Onboarding';
import { ResumeParsing, ResumeUpload, ReviewProfile } from './screens/ResumeFlow';
import { ManualBasic, ManualPrefs, ManualProjects, ManualSkills } from './screens/ManualFlow';
import { Discover } from './screens/Discover';
import { JobDetail } from './screens/JobDetail';
import { FitSheet, NoteSheet } from './screens/Sheets';
import { Applications, Profile, Saved } from './screens/Tabs';
import { Chat, Inbox } from './screens/Messaging';
import { ApplicationDetail, CompanyProfile, LearningList, Notifications } from './screens/Detail';
import { AppliedModal, SelectionOverlay } from './screens/Overlays';

/** Screens that paint their own status bar / full-bleed background. */
const SELF_CHROMED = new Set([
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
  'detail',
  'company',
  'appDetail',
  'chat',
  'learning',
  'notifications',
]);

function Router() {
  const { state } = useStore();
  const { screen, tab } = state;

  switch (screen) {
    case 'splash':
      return <Splash />;
    case 'intro':
      return <Intro />;
    case 'auth':
      return <Auth />;
    case 'fork':
      return <Fork />;
    case 'upload':
      return <ResumeUpload />;
    case 'parsing':
      return <ResumeParsing />;
    case 'review':
      return <ReviewProfile />;
    case 'm-basic':
      return <ManualBasic />;
    case 'm-skills':
      return <ManualSkills />;
    case 'm-projects':
      return <ManualProjects />;
    case 'm-prefs':
      return <ManualPrefs />;
    case 'detail':
      return <JobDetail />;
    case 'company':
      return <CompanyProfile />;
    case 'appDetail':
      return <ApplicationDetail />;
    case 'chat':
      return <Chat />;
    case 'learning':
      return <LearningList />;
    case 'notifications':
      return <Notifications />;
    case 'main':
    default:
      return (
        <div className="flex h-full flex-col bg-canvas">
          <StatusBar />
          <div className="flex-1 overflow-hidden">
            {tab === 'discover' && <Discover />}
            {tab === 'applications' && <Applications />}
            {tab === 'saved' && <Saved />}
            {tab === 'inbox' && <Inbox />}
            {tab === 'profile' && <Profile />}
          </div>
          <BottomNav />
          <HomeIndicator />
        </div>
      );
  }
}

/** How often the app asks Supabase whether anything changed on the company's side. */
const SYNC_INTERVAL_MS = 4000;

function Shell() {
  const { state, dispatch, sync } = useStore();

  // auto-dismiss the toast
  useEffect(() => {
    if (!state.toast) return;
    const id = setTimeout(() => dispatch({ type: 'patch', patch: { toast: null } }), 1500);
    return () => clearTimeout(id);
  }, [state.toast, dispatch]);

  /**
   * The other half of the product is a separate app writing to the same database. Poll
   * it, so a recruiter selecting this student lands here without a reload — that is what
   * turns the inbox padlock into a conversation while the demo is running.
   */
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') sync().catch(() => {});
    }, SYNC_INTERVAL_MS);
    return () => clearInterval(id);
  }, [sync]);

  return (
    <>
      <PhoneFrame>
        {/* overflow:clip stops the browser scrolling this container when it focuses a control */}
        <div className="relative h-full w-full" style={{ overflow: 'clip' }}>
          <div
            key={state.screen + (state.screen === 'main' ? state.tab : '')}
            className="h-full w-full"
            style={{ animation: 'fadeUp .26s ease both' }}
          >
            <Router />
          </div>

          <FitSheet />
          <NoteSheet />
          <Toast message={state.toast} />
          <AppliedModal />
          <SelectionOverlay />
        </div>
      </PhoneFrame>
    </>
  );
}

export default function App({ workspace }: { workspace: StudentWorkspace }) {
  return (
    <StoreProvider workspace={workspace}>
      <Shell />
    </StoreProvider>
  );
}
