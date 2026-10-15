// Simple flat illustrations of the rooms. Each scene is 320x120; the floor starts at y=88.

const INK = '#2A1B4A';

function Frame({ wall, floor, children }) {
  return (
    <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true" className="room-svg">
      <rect width="320" height="120" fill={wall} />
      <rect y="88" width="320" height="32" fill={floor} />
      <rect y="86" width="320" height="4" fill={INK} opacity="0.12" />
      {children}
    </svg>
  );
}

function Bedroom() {
  return (
    <Frame wall="#E6DEFA" floor="#B9A6E8">
      {/* window */}
      <rect x="40" y="18" width="62" height="52" rx="6" fill="#CFEFF7" stroke="#fff" strokeWidth="5" />
      <circle cx="84" cy="36" r="9" fill="#FFC93C" />
      <path d="M71 18 V70 M40 44 H102" stroke="#fff" strokeWidth="3" />
      {/* bed */}
      <rect x="150" y="50" width="12" height="46" rx="4" fill="#7A4DD6" />
      <rect x="156" y="68" width="136" height="28" rx="6" fill="#7A4DD6" />
      <rect x="160" y="56" width="42" height="22" rx="10" fill="#fff" />
      <path d="M200 66 H288 a6 6 0 0 1 6 6 V86 a6 6 0 0 1 -6 6 H200 Z" fill="#1FB3A6" />
      <path d="M200 66 V92" stroke="#fff" strokeWidth="3" opacity="0.6" />
      <rect x="288" y="62" width="12" height="34" rx="4" fill="#7A4DD6" />
      {/* lamp */}
      <rect x="116" y="78" width="14" height="18" rx="3" fill="#A9744F" />
      <path d="M112 78 L134 78 L128 62 L118 62 Z" fill="#FFC93C" />
    </Frame>
  );
}

function Bathroom() {
  return (
    <Frame wall="#D6F1EE" floor="#9ADBD3">
      {/* tiles */}
      <g stroke="#fff" strokeWidth="2" opacity="0.7">
        <path d="M0 29 H320 M0 58 H320" />
        <path d="M64 0 V88 M128 0 V88 M192 0 V88 M256 0 V88" />
      </g>
      {/* mirror + sink */}
      <rect x="44" y="16" width="54" height="40" rx="8" fill="#fff" stroke="#7A4DD6" strokeWidth="4" />
      <path d="M54 46 L66 24" stroke="#CFEFF7" strokeWidth="5" strokeLinecap="round" />
      <rect x="40" y="66" width="62" height="10" rx="5" fill="#fff" />
      <rect x="52" y="76" width="38" height="20" rx="3" fill="#B9A6E8" />
      <path d="M71 66 V56 h8" stroke="#7A4DD6" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* cup with toothbrush */}
      <rect x="106" y="58" width="10" height="12" rx="2" fill="#FF8BA7" />
      <path d="M109 58 L108 46 M113 58 L114 44" stroke="#1FB3A6" strokeWidth="3" strokeLinecap="round" />
      {/* shower */}
      <rect x="196" y="12" width="104" height="84" rx="4" fill="#fff" opacity="0.55" />
      <path d="M270 12 V26 h-26" stroke="#7A4DD6" strokeWidth="5" fill="none" strokeLinecap="round" />
      <ellipse cx="238" cy="30" rx="13" ry="6" fill="#7A4DD6" />
      <g stroke="#4D9DE0" strokeWidth="3" strokeLinecap="round">
        <path d="M230 42 V52 M238 44 V58 M246 42 V52" />
      </g>
      <rect x="196" y="12" width="14" height="84" fill="#FF8BA7" opacity="0.8" />
    </Frame>
  );
}

function Dining() {
  return (
    <Frame wall="#FFF0C7" floor="#F2D08A">
      {/* pendant lamp */}
      <path d="M160 0 V22" stroke={INK} strokeWidth="3" />
      <path d="M138 40 Q160 14 182 40 Z" fill="#FF8BA7" />
      <ellipse cx="160" cy="42" rx="12" ry="3" fill="#FFC93C" />
      {/* table */}
      <rect x="92" y="62" width="136" height="9" rx="4" fill="#A9744F" />
      <rect x="104" y="70" width="8" height="26" fill="#8A5A3A" />
      <rect x="208" y="70" width="8" height="26" fill="#8A5A3A" />
      {/* plate, bowl, glass */}
      <ellipse cx="136" cy="61" rx="18" ry="4" fill="#fff" />
      <path d="M150 55 q10 18 20 0 Z" fill="#1FB3A6" transform="translate(6 -1)" />
      <rect x="196" y="48" width="9" height="13" rx="2" fill="#CFEFF7" stroke="#4D9DE0" strokeWidth="2" />
      {/* chairs */}
      <rect x="52" y="56" width="8" height="40" rx="3" fill="#7A4DD6" />
      <rect x="52" y="74" width="30" height="8" rx="3" fill="#7A4DD6" />
      <rect x="262" y="56" width="8" height="40" rx="3" fill="#7A4DD6" />
      <rect x="240" y="74" width="30" height="8" rx="3" fill="#7A4DD6" />
    </Frame>
  );
}

function Hall() {
  return (
    <Frame wall="#FFE0E8" floor="#E8B5C4">
      {/* front door */}
      <rect x="226" y="14" width="62" height="82" rx="6" fill="#7A4DD6" />
      <rect x="236" y="24" width="42" height="24" rx="4" fill="#CFEFF7" />
      <circle cx="238" cy="66" r="4" fill="#FFC93C" />
      {/* hooks + backpack */}
      <rect x="40" y="26" width="82" height="6" rx="3" fill="#A9744F" />
      <path d="M62 32 v8 M100 32 v8" stroke="#A9744F" strokeWidth="4" strokeLinecap="round" />
      <rect x="86" y="40" width="28" height="36" rx="10" fill="#4D9DE0" />
      <rect x="92" y="54" width="16" height="12" rx="4" fill="#2F78B8" />
      {/* shoe rack */}
      <rect x="132" y="74" width="72" height="6" rx="2" fill="#A9744F" />
      <rect x="132" y="90" width="72" height="6" rx="2" fill="#A9744F" />
      <path d="M140 74 q0 -12 14 -10 l8 4 v6 Z" fill="#FFC93C" />
      <path d="M170 74 q0 -12 14 -10 l8 4 v6 Z" fill="#1FB3A6" />
      <path d="M140 90 q0 -12 14 -10 l8 4 v6 Z" fill="#FF8BA7" />
    </Frame>
  );
}

const SCENES = { bedroom: Bedroom, bathroom: Bathroom, dining: Dining, hall: Hall };

export default function RoomScene({ room }) {
  const Scene = SCENES[room] || Hall;
  return <Scene />;
}
