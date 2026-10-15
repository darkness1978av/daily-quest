import { useState } from 'react';
import { PinPad } from '../ui.jsx';
import { stationStats, lastDays, rankFor, fmtMin, totalGoodDays } from '../logic.js';
import { MODES } from '../data.js';

export function ParentGate({ pin, onOk, onCancel }) {
  return (
    <main className="screen">
      <PinPad
        title="מצב הורים"
        hint="הקלידו את הקוד."
        onSubmit={(p) => {
          if (p === pin) {
            onOk();
            return true;
          }
          return false;
        }}
        onCancel={onCancel}
      />
    </main>
  );
}

export default function ParentScreen({ state, mode, onMode, dispatch, day, onBack, onEditRoute, familyPanel }) {
  const stats = stationStats(state, 14, day);
  const days = lastDays(state, 14, day);
  const rank = rankFor(state);
  const [confirmReset, setConfirmReset] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [msg, setMsg] = useState('');

  const measured = stats.filter((s) => s.ratio);
  const hardest = [...measured].sort((a, b) => b.ratio - a.ratio)[0];
  const statusLabel = { good: 'יום טוב', done: 'הושלם', none: 'לא בוצע' };

  return (
    <main className="screen parent">
      <header className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="יציאה ממצב הורים">
          →
        </button>
        <div className="topbar-title">
          <strong>מצב הורים</strong>
          <span className="rank">
            {state.profile.name} · דרגה {rank.name}
          </span>
        </div>
        <span className="icon-btn ghost" aria-hidden="true" />
      </header>

      <div className="mode-tabs" role="tablist" aria-label="שגרה">
        {Object.entries(MODES).map(([id, m]) => (
          <button
            key={id}
            role="tab"
            aria-selected={mode === id}
            className={`chip${mode === id ? ' sel' : ''}`}
            onClick={() => onMode(id)}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {state.proposal ? (
        <section className="card proposal">
          <h2>הצעה חדשה למסלול</h2>
          <p>
            {state.profile.name} {state.profile.gender === 'boy' ? 'שלח' : 'שלחה'} מסלול של {state.proposal.route.length} תחנות:
          </p>
          <p className="muted">
            {state.proposal.route
              .map((id) => state.proposal.stations.find((s) => s.id === id)?.label)
              .filter(Boolean)
              .join(' ← ')}
          </p>
          <div className="row">
            <button className="btn ghost" onClick={() => dispatch({ type: 'REJECT' })}>
              לא עכשיו
            </button>
            <button className="btn primary" onClick={() => dispatch({ type: 'APPROVE' })}>
              אישור
            </button>
          </div>
          <p className="muted">אם לא מסכימים, כדאי לדבר על זה ביחד ולערוך את המסלול.</p>
        </section>
      ) : null}

      <section>
        <h2>14 הימים האחרונים</h2>
        <div className="day-strip" role="img" aria-label="סיכום הימים האחרונים">
          {days.map((d) => (
            <span key={d.key} className={`day ${d.status}`} title={`${d.key}: ${statusLabel[d.status]}`} />
          ))}
        </div>
        <p className="muted">
          ירוק: יום טוב. כחול: הושלם. אפור: לא בוצע. סך הכול {totalGoodDays(state.log)} ימים טובים.
        </p>
      </section>

      <section>
        <h2>איפה לוקח זמן</h2>
        {hardest && hardest.ratio > 1 ? (
          <p>
            התחנה שלוקחת הכי הרבה זמן ביחס לתכנון היא <strong>{hardest.label}</strong>: בממוצע {fmtMin(hardest.avgSec)} דקות
            מתוך {hardest.minutes}. אפשר להציע יחד זמן ארוך יותר, או לחשוב מה מקשה שם.
          </p>
        ) : (
          <p className="muted">אין עדיין תחנה בולטת. הנתונים מצטברים עם הימים.</p>
        )}
        <ul className="stat-list">
          {stats.map((s) => (
            <li key={s.id}>
              <span>
                {s.icon} {s.label}
              </span>
              <span className="bar" aria-hidden="true">
                <span style={{ width: `${Math.min(100, (s.ratio || 0) * 100)}%` }} className={s.ratio > 1 ? 'over' : ''} />
              </span>
              <span className="muted">
                {s.avgSec ? `${fmtMin(s.avgSec)} / ${s.minutes} דק׳` : `${s.minutes} דק׳`}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>ניהול</h2>
        <button className="btn ghost wide" onClick={onEditRoute}>
          עריכת מסלול {MODES[mode].label} וזמנים
        </button>
        <p className="muted">בעריכה אפשר לשנות סדר, להוסיף ולהסיר תחנות, ולקבוע כמה דקות לכל תחנה.</p>
        <label className="toggle">
          <input
            type="checkbox"
            checked={state.settings.calm}
            onChange={(e) => dispatch({ type: 'SETTINGS', patch: { calm: e.target.checked } })}
          />
          הפחתת אנימציות
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={state.settings.sound}
            onChange={(e) => dispatch({ type: 'SETTINGS', patch: { sound: e.target.checked } })}
          />
          צלילים
        </label>
        <div className="row">
          <input
            className="text-input"
            inputMode="numeric"
            maxLength={4}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
            placeholder="קוד הורה חדש"
            aria-label="קוד הורה חדש"
          />
          <button
            className="btn ghost"
            disabled={newPin.length !== 4}
            onClick={() => {
              dispatch({ type: 'SET_PIN', pin: newPin });
              setNewPin('');
              setMsg('הקוד הוחלף.');
            }}
          >
            החלפה
          </button>
        </div>
        {msg ? <p className="notice">{msg}</p> : null}
      </section>

      {familyPanel}

      <section>
        <h2>איפוס</h2>
        {confirmReset ? (
          <div className="row">
            <button className="btn ghost" onClick={() => setConfirmReset(false)}>
              ביטול
            </button>
            <button className="btn danger" onClick={() => dispatch({ type: 'RESET' })}>
              למחוק הכול
            </button>
          </div>
        ) : (
          <button className="btn ghost wide" onClick={() => setConfirmReset(true)}>
            איפוס כל נתוני המשפחה
          </button>
        )}
      </section>
    </main>
  );
}
