import { useStore } from '../store';
import { Avatar } from './ui';
import { IconBell } from './Icons';

export function Logo({ size = 26, light }: { size?: number; light?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span
        className="flex items-center justify-center font-extrabold text-white"
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.3,
          background: 'linear-gradient(135deg,#4F46E5,#7C6CF5)',
          fontSize: size * 0.55,
        }}
      >
        i
      </span>
      <span
        className="text-[15px] font-bold tracking-tight"
        style={{ color: light ? '#fff' : '#0F1117' }}
      >
        InSwipe
      </span>
    </span>
  );
}

export function AppHeader() {
  const { state, dispatch } = useStore();
  const unreadNotifications = state.notifications.filter((n) => n.unread).length;
  return (
    <header className="flex h-12 shrink-0 items-center justify-between px-5">
      <Logo />
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch({ type: 'nav', screen: 'notifications' })}
          className="press relative text-ink-500"
          aria-label="Notifications"
        >
          <IconBell size={20} />
          {unreadNotifications > 0 && (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary-500 ring-2 ring-canvas" />
          )}
        </button>
        <button
          onClick={() => dispatch({ type: 'tab', tab: 'profile' })}
          className="press"
          aria-label="Profile"
        >
          <Avatar initial={state.student.initial} size={32} />
        </button>
      </div>
    </header>
  );
}
