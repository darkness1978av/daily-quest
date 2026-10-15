import { useEffect, useRef, useState } from 'react';
import { Companion } from '../ui.jsx';
import { stationById, todayPlan, fmtTime, MAX_EXTENSIONS } from '../logic.js';
import { linesFor, pick } from '../data.js';
import { sfx } from '../audio.js';

const R = 92;
const C = 2 * Math.PI * R;

export default function StationScreen({ state, day, id, dispatch, onBack, onDone }) {
  const station = stationById(state, id);
  const quiet = !!station.noScore; // e.g. the morning pill: just a check-off, no timer
  const planned = todayPlan(state, day).find((p) => p.id === id);
  const minutes = planned ? planned.minutes : station.minutes;

  const active = state.active && state.active.id === id ? state.active : null;
  const [now, setNow] = useState(Date.now());
  const warned = useRef(false);

  useEffect(() => {
    if (!active) {
      dispatch({ type: 'START', id, now: Date.now() });
      sfx.start();
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  const startedAt = active ? active.startedAt : now;
  const ext = active ? active.ext : 0;
  const allowed = minutes * 60 + ext * 120;
  const elapsed = Math.max(0, (now - startedAt) / 1000);
  const remaining = allowed - elapsed;
  const over = remaining <= 0;
  const ratio = Math.max(0, Math.min(1, remaining / allowed));
  const extLeft = MAX_EXTENSIONS - ext;

  const [line, setLine] = useState(() => (quiet ? 'בלי לחץ. מסמנים כשסיימת.' : pick(linesFor(state.profile?.gender, state.mode).start)));
  useEffect(() => {
    if (quiet) return;
    if (over && !warned.current && active) {
      warned.current = true;
      sfx.timesUp();
      setLine(pick(linesFor(state.profile?.gender, state.mode).timesUp));
    }
  }, [over, active, quiet]);

  return (
    <main className="screen station">
      <header className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="חזרה למפה">
          →
        </button>
        <div className="topbar-title">
          <strong>{station.label}</strong>
          {quiet ? null : <span className="rank">{minutes} דקות לתחנה</span>}
        </div>
        <span className="icon-btn ghost" aria-hidden="true" />
      </header>

      {quiet ? (
        <div className="quiet-icon" aria-hidden="true">
          {station.icon}
        </div>
      ) : (
        <div className="timer" role="timer" aria-label={`נשארו ${fmtTime(Math.max(0, remaining))}`}>
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <circle className="ring-bg" cx="100" cy="100" r={R} />
            <circle
              className={`ring${over ? ' calm' : ''}`}
              cx="100"
              cy="100"
              r={R}
              strokeDasharray={C}
              strokeDashoffset={C * (1 - ratio)}
              transform="rotate(-90 100 100)"
            />
          </svg>
          <div className="timer-center">
            <span className="timer-icon" aria-hidden="true">
              {station.icon}
            </span>
            <span className="timer-time">{over ? 'זמן נוסף' : fmtTime(remaining)}</span>
          </div>
        </div>
      )}

      <Companion profile={state.profile} line={line} />

      <div className="spacer" />

      <button className="btn primary big" onClick={() => onDone(id, false)}>
        {quiet ? 'סימנתי' : 'סיימתי!'}
      </button>
      {quiet ? (
        <button className="btn ghost wide" onClick={() => onDone(id, true)}>
          דילוג להיום
        </button>
      ) : (
        <div className="row">
          <button
            className="btn ghost"
            disabled={extLeft <= 0}
            onClick={() => {
              dispatch({ type: 'EXTEND' });
              warned.current = false;
            }}
          >
            {extLeft > 0 ? `עוד 2 דקות (${extLeft === MAX_EXTENSIONS ? 'עד פעמיים' : 'פעם אחת נוספת'})` : 'ההארכות נוצלו'}
          </button>
          <button className="btn ghost" onClick={() => onDone(id, true)}>
            דילוג להיום
          </button>
        </div>
      )}
    </main>
  );
}
