import { DEFAULT_AVATAR } from './data.js';

const INK = '#2A1B4A';

export default function Avatar({ avatar = DEFAULT_AVATAR, size = 120, title = 'הדמות שלי' }) {
  const a = { ...DEFAULT_AVATAR, ...avatar };
  const hair = a.hairColor;

  let fringe = <path d="M32 60 Q34 30 60 32 Q86 30 88 60 Q72 44 60 48 Q46 44 32 60Z" fill={hair} />;
  if (a.hairStyle === 'spiky') {
    fringe = (
      <path d="M32 58 L35 34 L45 46 L53 28 L61 44 L71 28 L77 46 L86 34 L88 58 Q72 44 60 48 Q46 44 32 58Z" fill={hair} />
    );
  } else if (a.hairStyle === 'curly') {
    fringe = (
      <g fill={hair}>
        {[
          [38, 42],
          [48, 34],
          [60, 31],
          [72, 34],
          [82, 42],
          [34, 54],
          [86, 54],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="9" />
        ))}
      </g>
    );
  } else if (a.hairStyle === 'buzz') {
    fringe = <path d="M33 56 Q34 33 60 33 Q86 33 87 56 Q72 46 60 49 Q48 46 33 56Z" fill={hair} opacity="0.9" />;
  }

  return (
    <svg viewBox="0 0 120 140" width={size} height={(size * 140) / 120} role="img" aria-label={title}>
      {/* hair behind the head */}
      {a.hairStyle === 'long' && (
        <path d="M30 62 Q30 26 60 26 Q90 26 90 62 L92 114 Q60 122 28 114 Z" fill={hair} />
      )}
      {a.hairStyle === 'braids' && (
        <g fill={hair}>
          <ellipse cx="33" cy="94" rx="7" ry="20" />
          <ellipse cx="87" cy="94" rx="7" ry="20" />
        </g>
      )}
      {a.hairStyle === 'bun' && <circle cx="60" cy="24" r="12" fill={hair} />}

      {/* body */}
      <path d="M22 140 Q22 102 60 100 Q98 102 98 140 Z" fill={a.outfit} />
      <rect x="52" y="86" width="16" height="16" rx="6" fill={a.skin} />

      {/* head */}
      <circle cx="60" cy="62" r="28" fill={a.skin} />
      {fringe}

      {/* face */}
      <circle cx="49" cy="64" r="3.2" fill={INK} />
      <circle cx="71" cy="64" r="3.2" fill={INK} />
      <path d="M50 76 Q60 85 70 76" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <circle cx="42" cy="74" r="4" fill="#FF8BA7" opacity="0.35" />
      <circle cx="78" cy="74" r="4" fill="#FF8BA7" opacity="0.35" />

      {/* accessories */}
      {a.accessory === 'glasses' && (
        <g stroke={INK} strokeWidth="2.4" fill="none">
          <circle cx="49" cy="64" r="9" />
          <circle cx="71" cy="64" r="9" />
          <path d="M58 64 L62 64" />
        </g>
      )}
      {a.accessory === 'bow' && (
        <g fill="#FF8BA7">
          <path d="M80 34 L96 26 L96 44 Z" />
          <path d="M80 34 L64 26 L64 44 Z" />
          <circle cx="80" cy="34" r="4" fill="#E4577A" />
        </g>
      )}
      {a.accessory === 'cap' && (
        <g>
          <path d="M32 50 Q34 24 60 24 Q86 24 88 50 Z" fill="#4D9DE0" />
          <rect x="30" y="48" width="60" height="6" rx="3" fill="#2F78B8" />
          <path d="M88 50 L108 54 L88 56 Z" fill="#2F78B8" />
        </g>
      )}
    </svg>
  );
}
