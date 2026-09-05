import { useStore, type Tab } from '../store';
import { IconChat, IconFile, IconHome, IconLock, IconStar, IconUser } from './Icons';

const TABS: { key: Tab; label: string; Icon: typeof IconHome }[] = [
  { key: 'discover', label: 'Discover', Icon: IconHome },
  { key: 'applications', label: 'Applications', Icon: IconFile },
  { key: 'saved', label: 'Saved', Icon: IconStar },
  { key: 'inbox', label: 'Inbox', Icon: IconChat },
  { key: 'profile', label: 'Profile', Icon: IconUser },
];

export function BottomNav() {
  const { state, dispatch } = useStore();
  const unread = state.conversations.reduce((n, c) => n + c.unread, 0);

  return (
    <nav className="flex h-[72px] shrink-0 items-start justify-around border-t border-line bg-white/95 px-2 pt-2.5 backdrop-blur">
      {TABS.map(({ key, label, Icon }) => {
        const active = state.tab === key;
        const isInbox = key === 'inbox';
        return (
          <button
            key={key}
            onClick={() => dispatch({ type: 'tab', tab: key })}
            aria-current={active ? 'page' : undefined}
            className="press relative flex w-[68px] flex-col items-center gap-1"
            style={{ color: active ? '#4F46E5' : '#9CA3AF' }}
          >
            <span className="relative">
              <Icon size={21} strokeWidth={active ? 2.2 : 1.75} />
              {isInbox && !state.inboxUnlocked && (
                <span className="absolute -right-1.5 -top-1 rounded-full bg-white text-ink-300">
                  <IconLock size={11} strokeWidth={2.4} />
                </span>
              )}
              {isInbox && state.inboxUnlocked && unread > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-primary-500 px-1 text-[9.5px] font-bold text-white">
                  {unread}
                </span>
              )}
            </span>
            <span className="text-[10px] font-semibold leading-none">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
