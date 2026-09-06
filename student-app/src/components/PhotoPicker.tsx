import { useRef, useState } from 'react';
import { useStore } from '../store';
import { fileToAvatarDataUrl } from '../lib/photo';
import { Avatar } from './ui';

/**
 * Choose, replace or remove a profile photo.
 *
 * Used in two places — onboarding step 1 and the profile tab — because it is the same
 * decision in both, and neither should be the only place a student can make it.
 */
export function PhotoPicker({ size = 72 }: { size?: number }) {
  const { state, dispatch } = useStore();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const photo = state.student.avatarUrl;

  const choose = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const avatarUrl = await fileToAvatarDataUrl(file);
      dispatch({ type: 'updateStudent', patch: { avatarUrl } });
    } catch (error) {
      dispatch({
        type: 'patch',
        patch: { toast: error instanceof Error ? error.message : 'Could not read that image.' },
      });
    } finally {
      setBusy(false);
      // so choosing the same file twice still fires a change event
      if (input.current) input.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-3.5">
      <button
        onClick={() => input.current?.click()}
        className="press relative rounded-full"
        aria-label={photo ? 'Change your photo' : 'Add a photo'}
      >
        <Avatar initial={state.student.initial} src={photo} size={size} />
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white ring-2 ring-canvas"
          aria-hidden
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </button>

      <div className="flex flex-col items-start gap-1">
        <button
          onClick={() => input.current?.click()}
          disabled={busy}
          className="press text-[13.5px] font-semibold text-primary-500 disabled:opacity-50"
        >
          {busy ? 'Resizing…' : photo ? 'Change photo' : 'Add a photo'}
        </button>
        {photo ? (
          <button
            onClick={() => dispatch({ type: 'updateStudent', patch: { avatarUrl: '' } })}
            className="press text-[12px] font-medium text-ink-300"
          >
            Remove
          </button>
        ) : (
          <span className="text-[12px] text-ink-300">Optional</span>
        )}
      </div>

      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => choose(e.target.files?.[0])}
      />
    </div>
  );
}
