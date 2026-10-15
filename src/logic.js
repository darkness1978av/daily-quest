import { STICKERS, RANKS, ROOM_OF, SERIES, BADGES, defaultsFor, genderizeStations } from './data.js';

// ---------- dates ----------
const pad = (n) => String(n).padStart(2, '0');
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = (k) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (key, n) => {
  const d = parseKey(key);
  d.setDate(d.getDate() + n);
  return dayKey(d);
};
export const daysBetween = (a, b) => Math.round((parseKey(b) - parseKey(a)) / 86400000);

export const fmtTime = (sec) => {
  const s = Math.max(0, Math.round(sec));
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
};
export const fmtMin = (sec) => {
  const m = sec / 60;
  return m >= 10 ? String(Math.round(m)) : String(Math.round(m * 10) / 10);
};

// ---------- state ----------
export const CACHE_KEY = 'mq2-cache';
export const MAX_EXTENSIONS = 2; // each extension adds 2 minutes

// One family document. Each routine (morning / night) has its own stations, route and daily log.
// Stickers, profile, PIN and settings are shared between the two routines.
const newRoutine = (mode) => ({ ...defaultsFor(mode), proposal: null, active: null, log: {} });
const ROUTINE_KEYS = ['stations', 'route', 'proposal', 'active', 'log'];

export const initialState = () => ({
  v: 2,
  profile: null, // { gender: 'girl'|'boy', name, avatar, companion: {type, emoji, image, name} | null }
  parentPin: null,
  routines: { morning: newRoutine('morning'), night: newRoutine('night') },
  stickers: [], // { sid, tier, day }
  reveal: null, // last finished day summary, shown until closed
  settings: { sound: true, calm: false },
});

// The single-routine view the screens work with.
export const viewOf = (state, mode) => ({ ...state, ...state.routines[mode], mode });

// Room id for each station in a list (custom stations stay in the room of the one before them).
export function assignRooms(list) {
  let prev = 'hall';
  return list.map((st) => {
    prev = ROOM_OF[st.id] || prev;
    return prev;
  });
}

export const stationById = (state, id) => state.stations.find((s) => s.id === id);

const planFor = (state) =>
  state.route
    .map((id) => stationById(state, id))
    .filter(Boolean)
    .map((s) => ({ id: s.id, minutes: s.minutes }));

export const todayRecord = (state, day) => state.log[day] || null;

export const todayPlan = (state, day) => todayRecord(state, day)?.plan || planFor(state);

export const nextStationId = (state, day) => {
  const rec = todayRecord(state, day);
  const doneIds = new Set((rec?.done || []).map((d) => d.id));
  const next = todayPlan(state, day).find((p) => !doneIds.has(p.id));
  return next ? next.id : null;
};

// ---------- rewards ----------
function seededRandom(seed) {
  let t = Math.floor(seed * 4294967296) >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return (((r ^ (r >>> 14)) >>> 0) % 1000000) / 1000000;
  };
}

export function goodDaysIn(log, endDay, n) {
  let count = 0;
  for (let i = 0; i < n; i++) {
    const r = log[addDays(endDay, -i)];
    if (r && r.finished && r.good) count++;
  }
  return count;
}

export const totalGoodDays = (log) => Object.values(log).filter((r) => r.finished && r.good).length;

// Rank counts good days from both routines.
export const goodDaysTotal = (state) =>
  Object.values(state.routines).reduce((sum, r) => sum + totalGoodDays(r.log), 0);

export const rankFor = (state) => {
  const good = goodDaysTotal(state);
  const boy = state.profile?.gender === 'boy';
  const nm = (r) => (boy ? r.m : r.name);
  let idx = 0;
  RANKS.forEach((r, i) => {
    if (good >= r.at) idx = i;
  });
  const next = RANKS[idx + 1] || null;
  return { name: nm(RANKS[idx]), good, next: next ? { ...next, name: nm(next) } : null, toNext: next ? next.at - good : 0 };
};

function computeAwards(log, stickers, day) {
  const rec = log[day];
  const awards = [{ tier: 'common', why: 'סיימת מסלול' }];
  const recent = (tier, n) => stickers.filter((s) => s.tier === tier && daysBetween(s.day, day) < n).length;

  const rare = goodDaysIn(log, day, 7) >= 5 && recent('rare', 7) === 0;
  if (rare) awards.push({ tier: 'rare', why: '5 ימים טובים בתוך 7 ימים' });

  const rareCount = recent('rare', 30) + (rare ? 1 : 0);
  if (rareCount >= 3 && recent('epic', 30) === 0) awards.push({ tier: 'epic', why: 'עקביות לאורך שלושה שבועות' });

  const priorTimes = Object.entries(log)
    .filter(([k, r]) => k < day && r.finished && r.done.every((d) => d.noScore || !d.skipped) && r.totalSec > 0)
    .map(([, r]) => r.totalSec);
  const personalBest =
    priorTimes.length >= 7 && rec.done.every((d) => d.noScore || !d.skipped) && rec.totalSec < Math.min(...priorTimes);
  const monthStrong = goodDaysIn(log, day, 30) >= 20 && recent('legendary', 30) === 0;
  if ((personalBest && recent('legendary', 14) === 0) || monthStrong) {
    awards.push({ tier: 'legendary', why: personalBest ? 'שיא אישי חדש' : 'חודש עקבי' });
  }
  return awards;
}

function pickStickers(awards, owned, seed) {
  const rnd = seededRandom(seed);
  const have = new Set(owned.map((s) => s.sid));
  return awards.map((a) => {
    const pool = STICKERS.filter((s) => s.tier === a.tier);
    const fresh = pool.filter((s) => !have.has(s.id));
    const from = fresh.length ? fresh : pool;
    const chosen = from[Math.floor(rnd() * from.length) % from.length];
    have.add(chosen.id);
    return { ...a, sid: chosen.id, isNew: fresh.length > 0 };
  });
}

// ---------- stats for the parent screen ----------
export function stationStats(state, days = 14, today = dayKey()) {
  const sums = {};
  for (let i = 0; i < days; i++) {
    const r = state.log[addDays(today, -i)];
    if (!r) continue;
    r.done.forEach((d) => {
      if (d.skipped) return;
      const s = (sums[d.id] ||= { total: 0, n: 0 });
      s.total += d.sec;
      s.n += 1;
    });
  }
  return state.route
    .map((id) => stationById(state, id))
    .filter((s) => s && !s.noScore)
    .map((s) => {
      const x = sums[s.id];
      const avgSec = x ? x.total / x.n : null;
      return { ...s, avgSec, ratio: avgSec ? avgSec / (s.minutes * 60) : null, samples: x ? x.n : 0 };
    });
}

export function lastDays(state, n = 14, today = dayKey()) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const key = addDays(today, -i);
    const r = state.log[key];
    out.push({ key, status: r && r.finished ? (r.good ? 'good' : 'done') : 'none' });
  }
  return out;
}

export function previousAverage(log, day) {
  const times = Object.entries(log)
    .filter(([k, r]) => k < day && r.finished && r.done.every((d) => d.noScore || !d.skipped) && r.totalSec > 0)
    .map(([, r]) => r.totalSec);
  return times.length ? times.reduce((a, b) => a + b, 0) / times.length : null;
}

// ---------- reducer ----------
function engine(state, action) {
  switch (action.type) {
    case 'START': {
      if (state.active && state.active.id === action.id) return state;
      return { ...state, active: { id: action.id, startedAt: action.now, ext: 0 } };
    }

    case 'EXTEND': {
      if (!state.active || state.active.ext >= MAX_EXTENSIONS) return state;
      return { ...state, active: { ...state.active, ext: state.active.ext + 1 } };
    }

    case 'DONE': {
      const { id, now, day, skipped } = action;
      const station = stationById(state, id);
      if (!station) return state;
      const rec = state.log[day] || { plan: planFor(state), done: [], finished: false, good: false, totalSec: 0, awards: [] };
      if (rec.finished || rec.done.some((d) => d.id === id)) return { ...state, active: null };
      const active = state.active && state.active.id === id ? state.active : { startedAt: now, ext: 0 };
      const planned = rec.plan.find((p) => p.id === id);
      const minutes = planned ? planned.minutes : station.minutes;
      const sec = skipped ? 0 : Math.max(1, Math.round((now - active.startedAt) / 1000));
      const entry = {
        id,
        sec,
        skipped: !!skipped,
        ext: active.ext || 0,
        onTime: station.noScore ? true : !skipped && sec <= minutes * 60 + (active.ext || 0) * 120,
        ...(station.noScore ? { noScore: true } : {}),
      };
      return {
        ...state,
        active: null,
        log: { ...state.log, [day]: { ...rec, done: [...rec.done, entry] } },
      };
    }

    case 'FINISH': {
      const { day, seed } = action;
      const rec = state.log[day];
      if (!rec || rec.finished) return state;
      const totalSec = rec.done.filter((d) => !d.noScore).reduce((a, d) => a + d.sec, 0);
      const good = rec.done.length === rec.plan.length && rec.done.every((d) => d.onTime);
      const prevAvg = previousAverage(state.log, day);
      const finishedRec = { ...rec, finished: true, good, totalSec };
      const log = { ...state.log, [day]: finishedRec };
      const awards = pickStickers(computeAwards(log, state.stickers, day), state.stickers, seed);
      log[day] = { ...finishedRec, awards };
      return {
        ...state,
        log,
        stickers: [...state.stickers, ...awards.map((a) => ({ sid: a.sid, tier: a.tier, day }))],
        reveal: { day, awards, totalSec, good, prevAvg },
      };
    }

    case 'PROPOSE':
      return { ...state, proposal: { route: action.route, stations: action.stations } };

    case 'APPROVE': {
      if (!state.proposal) return state;
      return { ...state, route: state.proposal.route, stations: state.proposal.stations, proposal: null };
    }

    case 'REJECT':
      return { ...state, proposal: null };

    case 'SET_ROUTE':
      return { ...state, route: action.route, stations: action.stations, proposal: null };

    default:
      return state;
  }
}


const ROUTINE_ACTIONS = new Set(['START', 'EXTEND', 'DONE', 'FINISH', 'PROPOSE', 'APPROVE', 'REJECT', 'SET_ROUTE']);

export function reducer(state, action) {
  if (ROUTINE_ACTIONS.has(action.type)) {
    const mode = action.mode || 'morning';
    const next = engine(viewOf(state, mode), action);
    const routine = {};
    ROUTINE_KEYS.forEach((k) => {
      routine[k] = next[k];
    });
    const rest = { ...next };
    ROUTINE_KEYS.forEach((k) => delete rest[k]);
    delete rest.mode;
    return { ...rest, routines: { ...state.routines, [mode]: routine } };
  }
  switch (action.type) {
    case 'REPLACE':
      return migrate({ ...initialState(), ...action.state });
    case 'SET_PROFILE': {
      const profile = action.profile;
      const routines = { ...state.routines };
      // the first time a gender is known, masculine station names are applied
      if (profile?.gender && profile.gender !== state.profile?.gender) {
        Object.keys(routines).forEach((m) => {
          routines[m] = { ...routines[m], stations: genderizeStations(routines[m].stations, profile.gender) };
        });
      }
      return { ...state, profile, routines };
    }
    case 'SET_PIN':
      return { ...state, parentPin: action.pin };
    case 'SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case 'CLOSE_REVEAL':
      return { ...state, reveal: null };
    case 'RESET':
      return initialState();
    default:
      return state;
  }
}

// ---------- migrations ----------
// Makes sure a loaded document has both routines, whatever version wrote it.
export function migrate(state) {
  const fresh = initialState();
  const routines = { ...fresh.routines, ...(state.routines || {}) };
  Object.keys(fresh.routines).forEach((m) => {
    routines[m] = { ...fresh.routines[m], ...routines[m] };
  });
  return { ...state, v: 2, routines };
}

// ---------- local cache (the cloud copy is the real one) ----------
export function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return migrate({ ...initialState(), ...JSON.parse(raw) });
  } catch (e) {
    /* ignore */
  }
  return initialState();
}

export function saveCache(state) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(state));
  } catch (e) {
    /* ignore */
  }
}

export function clearCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (e) {
    /* ignore */
  }
}

// ---------- badges (derived from the history, nothing extra is stored) ----------
const finishedDays = (log) =>
  Object.entries(log)
    .filter(([, r]) => r.finished)
    .map(([k]) => k)
    .sort();

// Returns every badge with `earned` (and the first day it was reached, when known).
export function badgesFor(state) {
  const { morning, night } = state.routines;
  const owned = new Set(state.stickers.map((x) => x.sid));
  const countTier = (t) => state.stickers.filter((x) => x.tier === t).length;
  const mDays = finishedDays(morning.log);
  const nDays = finishedDays(night.log);
  const good = Object.values(state.routines).reduce((n, r) => n + totalGoodDays(r.log), 0);

  const weekDay = (r) => finishedDays(r.log).find((d) => goodDaysIn(r.log, d, 7) >= 5) || null;
  const bothDay = mDays.find((d) => nDays.includes(d)) || null;

  const facts = {
    first_morning: mDays[0] || null,
    first_night: nDays[0] || null,
    both_day: bothDay,
    good_3: good >= 3 ? true : null,
    good_10: good >= 10 ? true : null,
    good_30: good >= 30 ? true : null,
    week_5: weekDay(morning) || weekDay(night),
    rare_3: countTier('rare') >= 3 ? true : null,
    legend_1: countTier('legendary') >= 1 ? true : null,
    sticker_10: owned.size >= 10 ? true : null,
    sticker_all: owned.size >= STICKERS.length ? true : null,
  };
  Object.keys(SERIES).forEach((id) => {
    const ids = STICKERS.filter((x) => x.series === id).map((x) => x.id);
    facts[`series_${id}`] = ids.every((x) => owned.has(x)) ? true : null;
  });

  return BADGES.map((b) => ({ ...b, earned: !!facts[b.id], day: typeof facts[b.id] === 'string' ? facts[b.id] : null }));
}
