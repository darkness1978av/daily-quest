// Supabase through its REST API (no extra packages): email + password sign-in, family functions, the shared state row.
import { SUPABASE_URL, SUPABASE_KEY } from './supabase-config.js';

const SESSION_KEY = 'mq2-session';
const FAMILY_KEY = 'mq2-family';
const DEVICE_KEY = 'mq2-device';
const SEEN_KEY = 'mq2-seen';

const read = (k) => {
  try {
    return localStorage.getItem(k);
  } catch (e) {
    return null;
  }
};
const write = (k, v) => {
  try {
    if (v === null || v === undefined) localStorage.removeItem(k);
    else localStorage.setItem(k, v);
  } catch (e) {
    /* ignore */
  }
};

export const cloudConfigured = () => !!(SUPABASE_URL && SUPABASE_KEY);

export function deviceId() {
  let id = read(DEVICE_KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    write(DEVICE_KEY, id);
  }
  return id;
}

export const getSeen = () => Number(read(SEEN_KEY) || 0);
export const setSeen = (t) => write(SEEN_KEY, String(t));

// ---------- session ----------
let session = (() => {
  try {
    return JSON.parse(read(SESSION_KEY) || 'null');
  } catch (e) {
    return null;
  }
})();

const saveSession = (s) => {
  session = s;
  write(SESSION_KEY, s ? JSON.stringify(s) : null);
};

export const getSession = () => session;
export const getFamilyCache = () => {
  try {
    return JSON.parse(read(FAMILY_KEY) || 'null');
  } catch (e) {
    return null;
  }
};
export const setFamilyCache = (f) => write(FAMILY_KEY, f ? JSON.stringify(f) : null);

export class CloudError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const HEBREW = [
  [/invalid login credentials/i, 'מייל או סיסמה שגויים.'],
  [/already registered|already been registered/i, 'כבר קיים חשבון עם המייל הזה. נסו להיכנס.'],
  [/at least 6|weak password|password should/i, 'הסיסמה צריכה להכיל לפחות 6 תווים.'],
  [/valid email|invalid email|unable to validate email/i, 'כתובת המייל לא נראית תקינה.'],
  [/rate limit|too many/i, 'יותר מדי ניסיונות. נסו שוב בעוד כמה דקות.'],
  [/email not confirmed/i, 'צריך לאשר את המייל לפני הכניסה.'],
  [/failed to fetch|networkerror|load failed/i, 'אין חיבור לאינטרנט כרגע.'],
];

function friendly(msg) {
  const hit = HEBREW.find(([re]) => re.test(msg || ''));
  return hit ? hit[1] : 'משהו השתבש. נסו שוב.';
}

async function authCall(path, body) {
  let res;
  try {
    res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new CloudError(friendly(String(e.message)), 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new CloudError(friendly(data.msg || data.error_description || data.message || data.error), res.status);
  return data;
}

function sessionFrom(data) {
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at || Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
    user: { id: data.user?.id, email: data.user?.email },
  };
}

export async function signUp(email, password) {
  const data = await authCall('signup', { email, password });
  if (!data.access_token) throw new CloudError('צריך לאשר את המייל לפני הכניסה.', 0);
  saveSession(sessionFrom(data));
  return session;
}

export async function signIn(email, password) {
  const data = await authCall('token?grant_type=password', { email, password });
  saveSession(sessionFrom(data));
  return session;
}

export function signOut() {
  saveSession(null);
  setFamilyCache(null);
  write(SEEN_KEY, null);
}

async function refresh() {
  if (!session?.refresh_token) throw new CloudError('', 401);
  const data = await authCall('token?grant_type=refresh_token', { refresh_token: session.refresh_token });
  saveSession(sessionFrom(data));
}

async function accessToken() {
  if (!session) throw new CloudError('', 401);
  if (session.expires_at - Math.floor(Date.now() / 1000) < 60) {
    try {
      await refresh();
    } catch (e) {
      if (e.status === 400 || e.status === 401) {
        saveSession(null);
        throw new CloudError('', 401);
      }
      throw e;
    }
  }
  return session.access_token;
}

async function api(path, { method = 'GET', body, headers = {} } = {}) {
  const call = async () => {
    const token = await accessToken();
    return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      method,
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  };
  let res;
  try {
    res = await call();
    if (res.status === 401) {
      await refresh();
      res = await call();
    }
  } catch (e) {
    if (e instanceof CloudError) throw e;
    throw new CloudError(friendly(String(e.message)), 0);
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new CloudError(data.message || `error ${res.status}`, res.status);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ---------- family ----------
export async function myMembership() {
  const rows = await api(`mq_members?select=family_id,role&user_id=eq.${session.user.id}&limit=1`);
  return rows && rows[0] ? { id: rows[0].family_id, role: rows[0].role } : null;
}

export async function createFamily() {
  const r = await api('rpc/mq_create_family', { method: 'POST', body: { p_name: 'המשפחה שלנו' } });
  return { id: r.family_id, role: 'parent', parentCode: r.parent_code, childCode: r.child_code };
}

// returns { id, role } or null when the code does not exist
export async function joinFamily(code) {
  const r = await api('rpc/mq_join_family', { method: 'POST', body: { p_code: code } });
  return r && r.ok ? { id: r.family_id, role: r.role } : null;
}

export async function familyInfo(id) {
  const r = await api('rpc/mq_family_info', { method: 'POST', body: { p_family: id } });
  return r ? { name: r.name, role: r.role, parentCode: r.parent_code, childCode: r.child_code } : null;
}

export const leaveFamily = (id) => api('rpc/mq_leave_family', { method: 'POST', body: { p_family: id } });

// ---------- the shared state ----------
export async function fetchState(familyId) {
  const rows = await api(`mq_state?select=state,device,updated_at&family_id=eq.${familyId}&limit=1`);
  if (!rows || !rows[0]) return null;
  return { state: rows[0].state, device: rows[0].device || '', at: Date.parse(rows[0].updated_at) || 0 };
}

export async function pushState(familyId, state) {
  await api('mq_state?on_conflict=family_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: { family_id: familyId, state, device: deviceId() },
  });
}

// What is shared between devices. A running timer and the sticker reveal stay on each device.
export function syncable(state) {
  const routines = {};
  Object.entries(state.routines).forEach(([m, r]) => {
    const { active, ...rest } = r; // eslint-disable-line no-unused-vars
    routines[m] = rest;
  });
  const { reveal, ...top } = state; // eslint-disable-line no-unused-vars
  return { ...top, routines };
}

export function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .filter((k) => value[k] !== undefined)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stable(value[k])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}
