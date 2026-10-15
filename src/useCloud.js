import { useEffect, useRef, useState } from 'react';
import { fetchState, pushState, deviceId, getSeen, setSeen, stable, syncable } from './cloud.js';

const POLL_MS = 10000;

// Keeps this device in step with the family's shared state. Whole-document, last writer wins.
// Returns { status: 'idle'|'ok'|'error', loaded: bool, exists: bool|null }.
export function useCloud(state, dispatch, familyId) {
  const [info, setInfo] = useState({ status: 'idle', loaded: false, exists: null });
  const [tick, setTick] = useState(0);
  const stateRef = useRef(state);
  stateRef.current = state;
  const ready = useRef(false);
  const last = useRef(null);
  const pendingRemote = useRef(false);

  useEffect(() => {
    ready.current = false;
    last.current = null;
    setInfo({ status: 'idle', loaded: false, exists: null });
    if (!familyId) return undefined;
    let stopped = false;

    const poll = async () => {
      try {
        const row = await fetchState(familyId);
        if (stopped) return;
        const cur = stateRef.current;
        const dirty = last.current !== null && stable(syncable(cur)) !== last.current;
        const firstLoad = !ready.current;
        const isNewer = row && row.device !== deviceId() && row.at > getSeen();
        if (row && row.state && !dirty && (isNewer || (firstLoad && !cur.profile && !cur.parentPin))) {
          // keep this device's running timers and reveal screen
          const routines = {};
          Object.keys(cur.routines).forEach((m) => {
            routines[m] = { ...(row.state.routines?.[m] || {}), active: cur.routines[m].active };
          });
          pendingRemote.current = true;
          setSeen(row.at);
          dispatch({ type: 'REPLACE', state: { ...row.state, routines, reveal: cur.reveal } });
        }
        if (firstLoad) {
          ready.current = true;
          setTick((t) => t + 1);
        }
        setInfo({ status: 'ok', loaded: true, exists: !!row });
      } catch (e) {
        if (!stopped) setInfo((i) => ({ ...i, status: 'error' }));
      }
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') poll();
    };
    poll();
    const iv = setInterval(poll, POLL_MS);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      stopped = true;
      clearInterval(iv);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [familyId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // a brand-new family starts pushing once the parent has chosen the PIN
    if (!familyId || !ready.current || !(state.profile || state.parentPin)) return undefined;
    const cur = stable(syncable(state));
    if (pendingRemote.current) {
      pendingRemote.current = false;
      last.current = cur;
      return undefined;
    }
    if (cur === last.current) return undefined;
    const t = setTimeout(() => {
      pushState(familyId, syncable(state))
        .then(() => {
          last.current = cur;
          setInfo((i) => ({ ...i, status: 'ok', exists: true }));
        })
        .catch(() => setInfo((i) => ({ ...i, status: 'error' })));
    }, 800);
    return () => clearTimeout(t);
  }, [state, familyId, tick]);

  return info;
}
