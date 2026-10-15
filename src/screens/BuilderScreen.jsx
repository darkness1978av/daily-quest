import { useState } from 'react';
import { Stepper } from '../ui.jsx';
import { CATALOG, MODES, genderizeStations } from '../data.js';

// Used by the child (parent=false → sends a proposal) and by the parent (parent=true → saves directly).
export default function BuilderScreen({ state, mode = 'morning', parent = false, onSave, onBack }) {
  const ALL = genderizeStations(CATALOG[mode], state.profile?.gender);
  const [route, setRoute] = useState(state.proposal?.route || state.route);
  const [stations, setStations] = useState(() => {
    const base = state.proposal?.stations || state.stations;
    const map = new Map(base.map((s) => [s.id, s]));
    ALL.forEach((s) => map.has(s.id) || map.set(s.id, s));
    return [...map.values()];
  });
  const [customName, setCustomName] = useState('');

  const byId = (id) => stations.find((s) => s.id === id);
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= route.length) return;
    const r = [...route];
    [r[i], r[j]] = [r[j], r[i]];
    setRoute(r);
  };
  const remove = (id) => route.length > 1 && setRoute(route.filter((x) => x !== id));
  const add = (id) => !route.includes(id) && setRoute([...route, id]);
  const setMinutes = (id, minutes) => setStations(stations.map((s) => (s.id === id ? { ...s, minutes } : s)));
  const addCustom = () => {
    const label = customName.trim();
    if (!label) return;
    const id = `c${Date.now()}`;
    setStations([...stations, { id, label, icon: '⭐', minutes: 3 }]);
    setRoute([...route, id]);
    setCustomName('');
  };

  const available = stations.filter((s) => !route.includes(s.id));
  const total = route.reduce((a, id) => a + (byId(id)?.minutes || 0), 0);
  const used = new Set(route);
  const savedStations = stations.filter((s) => used.has(s.id));

  return (
    <main className="screen builder">
      <header className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="חזרה">
          →
        </button>
        <div className="topbar-title">
          <strong>
            {parent ? 'עריכת מסלול' : 'המסלול שלי'} · {MODES[mode].label}
          </strong>
          <span className="rank">סך הכול {total} דקות</span>
        </div>
        <span className="icon-btn ghost" aria-hidden="true" />
      </header>

      {state.proposal && !parent ? <p className="notice">ההצעה הקודמת שלך עדיין ממתינה לאישור הורה.</p> : null}

      <ol className="route-list">
        {route.map((id, i) => {
          const s = byId(id);
          if (!s) return null;
          return (
            <li key={id} className="route-item">
              <span className="route-icon" aria-hidden="true">
                {s.icon}
              </span>
              <span className="route-name">{s.label}</span>
              <Stepper value={s.minutes} onChange={(m) => setMinutes(id, m)} label={`זמן ל${s.label}`} />
              <div className="route-actions">
                <button className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="הזזה למעלה">
                  ↑
                </button>
                <button
                  className="icon-btn"
                  onClick={() => move(i, 1)}
                  disabled={i === route.length - 1}
                  aria-label="הזזה למטה"
                >
                  ↓
                </button>
                <button className="icon-btn" onClick={() => remove(id)} disabled={route.length <= 1} aria-label="הסרה">
                  ✕
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      {available.length ? (
        <section>
          <h2>להוסיף תחנה</h2>
          <div className="chips">
            {available.map((s) => (
              <button key={s.id} className="chip" onClick={() => add(s.id)}>
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2>תחנה משלי</h2>
        <div className="row">
          <input
            className="text-input"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="למשל: לשטוף פנים"
            maxLength={22}
            aria-label="שם תחנה חדשה"
          />
          <button className="btn ghost" onClick={addCustom} disabled={!customName.trim()}>
            הוספה
          </button>
        </div>
      </section>

      <div className="spacer" />
      <button className="btn primary big" onClick={() => onSave(route, savedStations)}>
        {parent ? 'שמירה' : 'שליחה לאישור הורה'}
      </button>
    </main>
  );
}
