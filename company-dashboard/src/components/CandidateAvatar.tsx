/**
 * A candidate's face, or their initials.
 *
 * The dashboard drew this ten times over as an inline-styled div. It is one component
 * now because a student can add a photo to their profile, and a photo that only appeared
 * in some of those ten places would read as a bug.
 */
export default function CandidateAvatar({
  initials,
  color,
  photoUrl,
  size = 40,
  radius,
  fontSize,
}: {
  initials: string;
  color: string;
  photoUrl?: string;
  size?: number;
  /** corner radius; defaults to the squircle proportion the dashboard uses throughout */
  radius?: number;
  fontSize?: number;
}) {
  const box = {
    width: size,
    height: size,
    borderRadius: radius ?? Math.round(size * 0.3),
  };

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt=""
        className="flex-shrink-0 object-cover"
        style={{ ...box, background: color }}
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center font-bold flex-shrink-0"
      style={{
        ...box,
        background: color,
        color: '#4F46E5',
        fontSize: fontSize ?? Math.max(10, Math.round(size * 0.32)),
      }}
    >
      {initials}
    </div>
  );
}
