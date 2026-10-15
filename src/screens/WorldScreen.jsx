import { useState } from 'react';
import { Sticker } from '../ui.jsx';
import { STICKERS, SERIES, TIERS, TIER_ORDER, MODES } from '../data.js';
import { rankFor, goodDaysIn, badgesFor } from '../logic.js';

// "עולם ההצלחות": badges, stickers and rank in one place.
export default function WorldScreen({ state, day, onBack }) {
  const [view, setView] = useState('badges');
  const counts = {};
  state.stickers.forEach((s) => (counts[s.sid] = (counts[s.sid] || 0) + 1));
  const ownedIds = new Set(Object.keys(counts));
  const rank = rankFor(state);
  const badges = badgesFor(state);
  const earned = badges.filter((b) => b.earned).length;

  const renderGrid = (list) => (
    <div className="sticker-grid">
      {list.map((s) => (
        <Sticker key={s.id} sticker={s} owned={ownedIds.has(s.id)} count={counts[s.id] || 0} />
      ))}
    </div>
  );

  return (
    <main className="screen album">
      <header className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="חזרה למפה">
          →
        </button>
        <div className="topbar-title">
          <strong>עולם ההצלחות</strong>
          <span className="rank">
            {earned} תגים · {ownedIds.size} מדבקות
          </span>
        </div>
        <span className="icon-btn ghost" aria-hidden="true" />
      </header>

      <div className="card progress-card">
        <strong>דרגה: {rank.name}</strong>
        <span>{rank.next ? `עוד ${rank.toNext} ימים טובים ל${rank.next.name}` : 'זו הדרגה הגבוהה ביותר'}</span>
        {Object.entries(MODES).map(([m, info]) => (
          <span key={m}>
            {info.icon} ימים טובים ב-7 הימים האחרונים: {goodDaysIn(state.routines[m].log, day, 7)}
          </span>
        ))}
      </div>

      <div className="chips tabs" role="tablist">
        {[
          ['badges', 'תגים'],
          ['series', 'מדבקות לפי סדרה'],
          ['tier', 'לפי נדירות'],
        ].map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={view === id}
            className={`chip${view === id ? ' sel' : ''}`}
            onClick={() => setView(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {view === 'badges' ? (
        <div className="badge-grid">
          {badges.map((b) => (
            <div key={b.id} className={`badge${b.earned ? ' earned' : ''}`}>
              <div className="badge-icon" aria-hidden="true">
                {b.earned ? b.icon : '🔒'}
              </div>
              <strong>{b.name}</strong>
              <span className="muted">{b.how}</span>
              {b.earned ? <span className="badge-ok">התקבל</span> : null}
            </div>
          ))}
        </div>
      ) : null}

      {view === 'series'
        ? Object.entries(SERIES).map(([id, s]) => {
            const list = STICKERS.filter((x) => x.series === id);
            const have = list.filter((x) => ownedIds.has(x.id)).length;
            return (
              <section key={id}>
                <h2>
                  {s.icon} {s.name}{' '}
                  <small>
                    {have}/{list.length}
                  </small>
                </h2>
                {renderGrid(list)}
              </section>
            );
          })
        : null}

      {view === 'tier'
        ? TIER_ORDER.map((t) => {
            const list = STICKERS.filter((x) => x.tier === t);
            const have = list.filter((x) => ownedIds.has(x.id)).length;
            return (
              <section key={t}>
                <h2>
                  {TIERS[t].label}{' '}
                  <small>
                    {have}/{list.length}
                  </small>
                </h2>
                <p className="muted">{TIERS[t].how}</p>
                {renderGrid(list)}
              </section>
            );
          })
        : null}
    </main>
  );
}
