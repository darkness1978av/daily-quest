// An original plush-style puppy (round, soft, fluffy, cream with a warm tan patch),
// drawn in SVG. Poses: 'sit' (default), 'happy' (open mouth, tongue), 'sleep' (closed eyes).
export default function PlushDog({ size = 96, pose = 'sit', title = '' }) {
  const eyes =
    pose === 'sleep' ? (
      <g stroke="#3b2a20" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M34 54 q6 5 12 0" />
        <path d="M74 54 q6 5 12 0" />
      </g>
    ) : (
      <g>
        <ellipse cx="40" cy="54" rx="5.5" ry="6.5" fill="#2b1d16" />
        <ellipse cx="80" cy="54" rx="5.5" ry="6.5" fill="#2b1d16" />
        <circle cx="42" cy="51.5" r="2" fill="#fff" />
        <circle cx="82" cy="51.5" r="2" fill="#fff" />
      </g>
    );
  const mouth =
    pose === 'happy' ? (
      <g>
        <path d="M50 70 q10 14 20 0 z" fill="#8a2f3c" />
        <path d="M54 76 q6 8 12 0 q-6 -3 -12 0z" fill="#ff8aa0" />
        <path d="M60 66 v4" stroke="#2b1d16" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    ) : (
      <path d="M50 69 q5 6 10 0 q5 6 10 0 M60 65 v4" stroke="#2b1d16" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    );
  return (
    <svg
      className="plush-dog"
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role={title ? 'img' : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : 'true'}
    >
      {/* soft ground shadow */}
      <ellipse cx="60" cy="110" rx="34" ry="6" fill="#000" opacity="0.12" />
      {/* tail puff */}
      <circle cx="98" cy="90" r="12" fill="#f6e3c3" />
      {/* body */}
      <ellipse cx="60" cy="88" rx="34" ry="24" fill="#fbefd9" />
      <path d="M30 86 q4 -14 22 -16 q-10 12 -6 30 q-14 -2 -16 -14z" fill="#e9c58f" opacity="0.85" />
      {/* paws */}
      <ellipse cx="44" cy="107" rx="10" ry="6" fill="#fff6e6" />
      <ellipse cx="76" cy="107" rx="10" ry="6" fill="#fff6e6" />
      {/* ears */}
      <path d="M22 38 q-2 -22 12 -26 q12 8 8 26 z" fill="#e9c58f" />
      <path d="M98 38 q2 -22 -12 -26 q-12 8 -8 26 z" fill="#e9c58f" />
      <path d="M28 36 q0 -12 7 -16 q6 6 4 16z" fill="#f3b9b0" opacity="0.8" />
      <path d="M92 36 q0 -12 -7 -16 q-6 6 -4 16z" fill="#f3b9b0" opacity="0.8" />
      {/* head */}
      <ellipse cx="60" cy="56" rx="42" ry="36" fill="#fbefd9" />
      {/* fluffy cheeks */}
      <circle cx="22" cy="64" r="10" fill="#fbefd9" />
      <circle cx="98" cy="64" r="10" fill="#fbefd9" />
      {/* tan forehead patch */}
      <path d="M44 24 q16 -8 32 0 q-6 12 -16 12 q-10 0 -16 -12z" fill="#e9c58f" opacity="0.9" />
      {/* muzzle */}
      <ellipse cx="60" cy="68" rx="17" ry="12" fill="#fff8ec" />
      {eyes}
      {/* blush */}
      <circle cx="30" cy="68" r="5" fill="#f7a8a0" opacity="0.55" />
      <circle cx="90" cy="68" r="5" fill="#f7a8a0" opacity="0.55" />
      {/* nose */}
      <ellipse cx="60" cy="62" rx="6" ry="4.5" fill="#2b1d16" />
      <ellipse cx="58.5" cy="60.5" rx="2" ry="1.2" fill="#fff" opacity="0.7" />
      {mouth}
    </svg>
  );
}
