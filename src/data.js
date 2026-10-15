// All app content lives here, so texts and stickers are easy to change.

export const DEFAULT_STATIONS = [
  { id: 'wake', label: 'קמים מהמיטה', icon: '⏰', minutes: 3 },
  { id: 'dress', label: 'מתלבשים', icon: '👕', minutes: 6 },
  { id: 'toilet', label: 'שירותים', icon: '🚽', minutes: 3 },
  { id: 'brush', label: 'צחצוח שיניים', icon: '🪥', minutes: 3 },
  { id: 'face', label: 'שטיפת פנים', icon: '🧼', minutes: 2 },
  { id: 'breakfast', label: 'ארוחת בוקר', icon: '🥣', minutes: 12 },
  // noScore: a quiet check-off. No timer pressure, no stats, never affects "good day" or stickers.
  { id: 'pill', label: 'לוקחת כדור', icon: '💊', minutes: 2, noScore: true },
  { id: 'bag', label: 'תיק מוכן', icon: '🎒', minutes: 3 },
  { id: 'shoes', label: 'נעליים ויוצאים', icon: '👟', minutes: 3 },
];

export const DEFAULT_ROUTE = DEFAULT_STATIONS.map((s) => s.id);

// Extra stations the child can add when she builds her route.
export const EXTRA_STATIONS = [
  { id: 'hair', label: 'מסרקים שיער', icon: '💇‍♀️', minutes: 3 },
  { id: 'water', label: 'בקבוק מים', icon: '💧', minutes: 2 },
  { id: 'bed', label: 'מסדרים מיטה', icon: '🛏️', minutes: 3 },
  { id: 'pet', label: 'מאכילים חיה', icon: '🐕', minutes: 3 },
  { id: 'ready', label: 'מוכנה לצאת', icon: '🚪', minutes: 1 },
];

// ---------- the two routines ----------
export const MODES = {
  morning: { label: 'בוקר', icon: '☀️' },
  night: { label: 'לילה', icon: '🌙' },
};

export const NIGHT_STATIONS = [
  { id: 'shower', label: 'מקלחת', icon: '🚿', minutes: 20 },
  { id: 'brush', label: 'צחצוח שיניים', icon: '🪥', minutes: 3 },
  { id: 'pajamas', label: 'פיג׳מה', icon: '🩳', minutes: 3 },
  { id: 'charge', label: 'טלפון בטעינה', icon: '🔌', minutes: 1 },
  // the bonus step is quiet: a check-off with no timer pressure, outside the "good day" count
  { id: 'sleep', label: 'בונוס: לישון במיטה שלי', icon: '🛏️', minutes: 2, noScore: true, bonus: true },
];
export const NIGHT_ROUTE = NIGHT_STATIONS.map((s) => s.id);

export const EXTRA_NIGHT_STATIONS = [
  { id: 'bagn', label: 'תיק מוכן למחר', icon: '🎒', minutes: 4 },
  { id: 'clothes', label: 'בגדים למחר', icon: '👚', minutes: 3 },
  { id: 'read', label: 'קריאה או זמן שקט', icon: '📖', minutes: 10, noScore: true },
  { id: 'dinner', label: 'ארוחת ערב', icon: '🍽️', minutes: 15 },
  { id: 'tidy', label: 'מסדרים את החדר', icon: '🧸', minutes: 5 },
  { id: 'water', label: 'בקבוק מים ליד המיטה', icon: '💧', minutes: 1 },
  { id: 'toilet', label: 'שירותים', icon: '🚽', minutes: 3 },
];

export const CATALOG = {
  morning: [...DEFAULT_STATIONS, ...EXTRA_STATIONS],
  night: [...NIGHT_STATIONS, ...EXTRA_NIGHT_STATIONS],
};

export const defaultsFor = (mode) =>
  mode === 'night'
    ? { stations: NIGHT_STATIONS, route: NIGHT_ROUTE }
    : { stations: DEFAULT_STATIONS, route: DEFAULT_ROUTE };

// A few station names change with gender. Applied when the child's profile is set.
const MALE_LABELS = { ready: 'מוכן לצאת', pill: 'לוקח כדור' };
export const genderizeStations = (stations, gender) =>
  stations.map((s) => (gender === 'boy' && MALE_LABELS[s.id] ? { ...s, label: MALE_LABELS[s.id] } : s));

// The rooms of the house. Each station belongs to a room; a custom station joins the room of the station before it.
export const ROOMS = {
  bedroom: { label: 'חדר שינה' },
  bathroom: { label: 'מקלחת' },
  dining: { label: 'שולחן האוכל' },
  hall: { label: 'כניסה' },
};

export const ROOM_OF = {
  wake: 'bedroom',
  dress: 'bedroom',
  bed: 'bedroom',
  toilet: 'bathroom',
  brush: 'bathroom',
  face: 'bathroom',
  hair: 'bathroom',
  breakfast: 'dining',
  pill: 'dining',
  water: 'dining',
  bag: 'hall',
  shoes: 'hall',
  pet: 'hall',
  ready: 'hall',
  shower: 'bathroom',
  charge: 'bedroom',
  bagn: 'hall',
  clothes: 'bedroom',
  pajamas: 'bedroom',
  read: 'bedroom',
  sleep: 'bedroom',
  tidy: 'bedroom',
  dinner: 'dining',
};

export const SERIES = {
  space: { name: 'חלל', icon: '🪐' },
  sea: { name: 'ים', icon: '🌊' },
  forest: { name: 'יער', icon: '🌲' },
};

export const TIERS = {
  common: { label: 'נפוצה', color: '#7C8DB5', how: 'כל מסלול שהושלם' },
  rare: { label: 'נדירה', color: '#1FB3A6', how: '5 ימים טובים בתוך 7 ימים' },
  epic: { label: 'אפית', color: '#9B5DE5', how: '3 מדבקות נדירות בתוך 30 יום' },
  legendary: {
    label: 'אגדית',
    color: '#E8A800',
    how: 'שיא אישי חדש, או 20 ימים טובים בתוך 30 יום',
  },
};

export const TIER_ORDER = ['common', 'rare', 'epic', 'legendary'];

const st = (id, series, tier, icon, name) => ({ id, series, tier, icon, name });

export const STICKERS = [
  st('sp1', 'space', 'common', '🌙', 'ירח'),
  st('sp2', 'space', 'common', '⭐', 'כוכב'),
  st('sp3', 'space', 'common', '🪐', 'שבתאי'),
  st('sp4', 'space', 'rare', '🚀', 'חללית'),
  st('sp5', 'space', 'rare', '🛰️', 'לוויין'),
  st('sp6', 'space', 'epic', '👽', 'חייזר ידידותי'),
  st('sp7', 'space', 'epic', '☄️', 'שביט'),
  st('sp8', 'space', 'legendary', '🌌', 'שביל החלב'),

  st('se1', 'sea', 'common', '🐚', 'צדף'),
  st('se2', 'sea', 'common', '🐟', 'דג'),
  st('se3', 'sea', 'common', '🦀', 'סרטן'),
  st('se4', 'sea', 'rare', '🐢', 'צב ים'),
  st('se5', 'sea', 'rare', '🐙', 'תמנון'),
  st('se6', 'sea', 'epic', '🐬', 'דולפין'),
  st('se7', 'sea', 'epic', '🦑', 'דיונון'),
  st('se8', 'sea', 'legendary', '🐋', 'לווייתן'),

  st('fo1', 'forest', 'common', '🍄', 'פטרייה'),
  st('fo2', 'forest', 'common', '🌲', 'אשוח'),
  st('fo3', 'forest', 'common', '🍂', 'עלה שלכת'),
  st('fo4', 'forest', 'rare', '🦊', 'שועל'),
  st('fo5', 'forest', 'rare', '🦉', 'ינשוף'),
  st('fo6', 'forest', 'epic', '🦌', 'צבי'),
  st('fo7', 'forest', 'epic', '🦋', 'פרפר'),
  st('fo8', 'forest', 'legendary', '🦄', 'חד קרן'),
];

// Success badges. Earned automatically from the history (see badgesFor in logic.js).
export const BADGES = [
  { id: 'first_morning', icon: '🌅', name: 'בוקר ראשון', how: 'להשלים מסלול בוקר' },
  { id: 'first_night', icon: '🌙', name: 'לילה ראשון', how: 'להשלים שגרת לילה' },
  { id: 'both_day', icon: '☀️🌙', name: 'יום שלם', how: 'בוקר וערב באותו יום' },
  { id: 'good_3', icon: '⭐', name: 'שלושה ימים טובים', how: '3 ימים טובים בסך הכול' },
  { id: 'good_10', icon: '🌟', name: 'עשרה ימים טובים', how: '10 ימים טובים בסך הכול' },
  { id: 'good_30', icon: '🏆', name: 'שלושים ימים טובים', how: '30 ימים טובים בסך הכול' },
  { id: 'week_5', icon: '🔥', name: 'שבוע חזק', how: '5 ימים טובים בתוך 7 ימים' },
  { id: 'rare_3', icon: '💎', name: 'אספן נדירים', how: '3 מדבקות נדירות' },
  { id: 'legend_1', icon: '👑', name: 'מדבקה אגדית', how: 'לקבל מדבקה אגדית' },
  { id: 'sticker_10', icon: '🎴', name: 'עשר מדבקות', how: 'לאסוף 10 מדבקות שונות' },
  { id: 'series_space', icon: '🪐', name: 'שלמות החלל', how: 'כל 8 המדבקות של סדרת החלל' },
  { id: 'series_sea', icon: '🌊', name: 'שלמות הים', how: 'כל 8 המדבקות של סדרת הים' },
  { id: 'series_forest', icon: '🌲', name: 'שלמות היער', how: 'כל 8 המדבקות של סדרת היער' },
  { id: 'sticker_all', icon: '🌈', name: 'אספן מושלם', how: 'כל 24 המדבקות' },
];

export const RANKS = [
  { at: 0, name: 'מגלה', m: 'מגלה' },
  { at: 3, name: 'סיירת', m: 'סייר' },
  { at: 8, name: 'נווטת', m: 'נווט' },
  { at: 15, name: 'חוקרת', m: 'חוקר' },
  { at: 30, name: 'אלופה', m: 'אלוף' },
  { at: 50, name: 'אגדה', m: 'אגדה' },
];

// A companion with `image` shows that picture (a file in /public). If the file is missing, the emoji is shown.
export const COMPANIONS = [
  { id: 'dog', emoji: '🐕', label: 'הכלב שלנו', suggest: '', image: 'dog.jpg' },
  { id: 'cat', emoji: '🐱', label: 'חתול', suggest: 'מיצי' },
  { id: 'owl', emoji: '🦉', label: 'ינשוף', suggest: 'ינשופית' },
  { id: 'fox', emoji: '🦊', label: 'שועל', suggest: 'זוהר' },
  { id: 'dragon', emoji: '🐲', label: 'דרקון', suggest: 'להבה' },
  { id: 'panda', emoji: '🐼', label: 'פנדה', suggest: 'בובו' },
];

export const AVATAR_OPTIONS = {
  skin: ['#F7D6BF', '#E8B994', '#C58C62', '#8D5A3B'],
  hairStyle: [
    { id: 'short', label: 'קצר' },
    { id: 'long', label: 'ארוך' },
    { id: 'bun', label: 'פקעת' },
    { id: 'braids', label: 'צמות' },
  ],
  hairStyleBoy: [
    { id: 'short', label: 'קצר' },
    { id: 'spiky', label: 'מדובב' },
    { id: 'curly', label: 'מתולתל' },
    { id: 'buzz', label: 'גזור' },
  ],
  hairColor: ['#2B1B12', '#6B3E1E', '#C8922B', '#E4572E', '#7A4DD6'],
  outfit: ['#1FB3A6', '#FF8BA7', '#FFC93C', '#7A4DD6', '#4D9DE0', '#E4572E'],
  accessory: [
    { id: 'none', label: 'בלי' },
    { id: 'glasses', label: 'משקפיים' },
    { id: 'bow', label: 'סרט' },
    { id: 'cap', label: 'כובע' },
  ],
  accessoryBoy: [
    { id: 'none', label: 'בלי' },
    { id: 'glasses', label: 'משקפיים' },
    { id: 'cap', label: 'כובע' },
  ],
};

export const hairStylesFor = (gender) => (gender === 'boy' ? AVATAR_OPTIONS.hairStyleBoy : AVATAR_OPTIONS.hairStyle);
export const accessoriesFor = (gender) => (gender === 'boy' ? AVATAR_OPTIONS.accessoryBoy : AVATAR_OPTIONS.accessory);

export const DEFAULT_AVATAR = {
  skin: AVATAR_OPTIONS.skin[1],
  hairStyle: 'long',
  hairColor: AVATAR_OPTIONS.hairColor[1],
  outfit: AVATAR_OPTIONS.outfit[0],
  accessory: 'none',
};
export const defaultAvatarFor = (gender) =>
  gender === 'boy' ? { ...DEFAULT_AVATAR, hairStyle: 'short', outfit: AVATAR_OPTIONS.outfit[4] } : DEFAULT_AVATAR;

// Lines the companion says. {name} is replaced with the child's name. Girl and boy forms.
const LINES_GIRL = {
  welcome: ['בוקר טוב, {name}.', 'המפה מחכה לך.', 'מוכנה להרפתקה?', 'היום עוד מסלול אחד, ואת כבר מכירה את הדרך.'],
  start: ['בואי נתחיל. אני איתך.', 'התחנה הבאה מחכה לך.', 'בלי לחץ, רק להתחיל.', 'הצעד הראשון הוא החלק הקשה. אחריו זה זורם.'],
  done: ['יפה. עוד אחת בכיס.', 'קלי קלות.', 'זה היה חלק.', 'את מתקדמת כמו מקצוענית.', 'התחנה הבאה כבר קרובה.'],
  timesUp: ['הזמן נגמר, ואין שום בעיה. אפשר לסיים בקצב שלך.', 'הטיימר התרוקן. עכשיו רק לסיים.', 'אפשר לקחת עוד רגע, אני לא ממהר.'],
  finishGood: ['יום טוב! כל התחנות בזמן.', 'מסלול מושלם. ככה נראה בוקר מנצח.'],
  finishOk: ['המסלול הושלם. מחר נשפר עוד קצת.', 'סיימת, וזה העיקר.', 'עוד בוקר מאחוריך.'],
  doneToday: ['המסלול של היום כבר הושלם. נתראה מחר.', 'סיימת להיום. אפשר לבדוק את האלבום.'],
};

const LINES_BOY = {
  welcome: ['בוקר טוב, {name}.', 'המפה מחכה לך.', 'מוכן להרפתקה?', 'היום עוד מסלול אחד, ואתה כבר מכיר את הדרך.'],
  start: ['בוא נתחיל. אני איתך.', 'התחנה הבאה מחכה לך.', 'בלי לחץ, רק להתחיל.', 'הצעד הראשון הוא החלק הקשה. אחריו זה זורם.'],
  done: ['יפה. עוד אחת בכיס.', 'קל קלות.', 'זה היה חלק.', 'אתה מתקדם כמו מקצוען.', 'התחנה הבאה כבר קרובה.'],
  timesUp: LINES_GIRL.timesUp,
  finishGood: LINES_GIRL.finishGood,
  finishOk: LINES_GIRL.finishOk,
  doneToday: LINES_GIRL.doneToday,
};

const NIGHT_GIRL = {
  welcome: ['ערב טוב, {name}.', 'בואי נסגור את היום בנחת.', 'עוד כמה תחנות וזה לילה טוב.'],
  finishGood: ['ערב מושלם. לילה טוב.', 'כל התחנות בזמן. אפשר לישון בשקט.'],
  finishOk: ['סיימת את הערב. לילה טוב.', 'עוד יום מאחוריך. מחר מתחילים מחדש.'],
  doneToday: ['שגרת הלילה הושלמה. לילה טוב.', 'סיימת להיום. חלומות מתוקים.'],
};
const NIGHT_BOY = {
  ...NIGHT_GIRL,
  welcome: ['ערב טוב, {name}.', 'בוא נסגור את היום בנחת.', 'עוד כמה תחנות וזה לילה טוב.'],
};

export const linesFor = (gender, mode = 'morning') => {
  const base = gender === 'boy' ? LINES_BOY : LINES_GIRL;
  if (mode !== 'night') return base;
  return { ...base, ...(gender === 'boy' ? NIGHT_BOY : NIGHT_GIRL) };
};

export const pick = (arr, seed = Math.random()) => arr[Math.floor(seed * arr.length) % arr.length];

// The wake-up time shown in the app. The real alarm is set in the phone's own clock app.
export const WAKE_TIME = '06:45';
