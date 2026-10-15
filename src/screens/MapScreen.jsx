import { useEffect, useMemo, useRef } from 'react';
import Avatar from '../Avatar.jsx';
import RoomScene from '../rooms.jsx';
import { Companion } from '../ui.jsx';
import BoardView from './BoardView.jsx';
import { ROOMS, WAKE_TIME, MODES } from '../data.js';
import { rankFor, stationById, todayPlan, todayRecord, nextStationId, goodDaysIn, assignRooms } from '../logic.js';

export default function MapScreen({ state, mode, onMode, day, line, onOpenStation, onWorld, onBuilder, onCompanion, onAlarm, onParent, onToggleSound }) {
  const { profile } = state;
  const plan = todayPlan(state, day);
  const rec = todayRecord(state, day);
  const doneIds = useMemo(() => new Set((rec?.done || []).map((d) => d.id)), [rec]);
  const nextId = nextStationId(state, day);
  const finishedToday = !!rec?.finished;
  const rank = rankFor(state);
  const boardView = state.settings.view !== 'rooms';
  const good7 = goodDaysIn(state.log, day, 7);

  // Consecutive stations in the same room share one room card.
  const visits = useMemo(() => {
    const stations = plan.map((p) => stationById(state, p.id)).filter(Boolean);
    const rooms = assignRooms(stations);
    const out = [];
    stations.forEach((st, i) => {
      const last = out[out.length - 1];
      if (last && last.room === rooms[i]) last.stations.push(st);
      else out.push({ room: rooms[i], stations: [st] });
    });
    return out;
  }, [plan, state.stations]); // eslint-disable-line react-hooks/exhaustive-deps

  const nextRef = useRef(null);
  useEffect(() => {
    if (nextRef.current && nextRef.current.scrollIntoView) {
      nextRef.current.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    }
  }, [nextId]);

  const nextStation = nextId ? stationById(state, nextId) : null;
  const activeId = state.active?.id;

  return (
    <main className="screen map-screen">
      <header className="topbar">
        <button className="icon-btn" onClick={onParent} aria-label="מצב הורים">
          🔒
        </button>
        <div className="topbar-title">
          <strong>{profile.name}</strong>
          <span className="rank">
            {rank.name}
            {rank.next ? ` · עוד ${rank.toNext} ימים טובים ל${rank.next.name}` : ''}
          </span>
        </div>
        <button
          className="icon-btn"
          onClick={onToggleSound}
          aria-label={state.settings.sound ? 'כיבוי צלילים' : 'הפעלת צלילים'}
          aria-pressed={state.settings.sound}
        >
          {state.settings.sound ? '🔊' : '🔈'}
        </button>
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

      {boardView ? null : <Companion profile={profile} line={line} onFaceClick={onCompanion} />}

      {boardView ? (
        <div className="house-scroll">
          <BoardView
            state={state}
            plan={plan}
            doneIds={doneIds}
            nextId={nextId}
            finishedToday={finishedToday}
            onOpenStation={onOpenStation}
            line={line}
          />
        </div>
      ) : (
      <div className="house-scroll">
        {visits.map((v, vi) => {
          const allDone = v.stations.every((s) => doneIds.has(s.id));
          const hasNext = !finishedToday && v.stations.some((s) => s.id === nextId);
          const cardState = allDone ? 'done' : hasNext ? 'current' : 'later';
          return (
            <section key={`${v.room}-${vi}`} className={`room-card ${cardState}`}>
              <div className="room-scene">
                <RoomScene room={v.room} />
                {hasNext ? (
                  <span className="token" aria-hidden="true">
                    <Avatar avatar={profile.avatar} size={52} />
                  </span>
                ) : null}
                <h2 className="room-title">{ROOMS[v.room]?.label}</h2>
              </div>
              <ul className="room-stops">
                {v.stations.map((st) => {
                  const done = doneIds.has(st.id);
                  const isNext = !finishedToday && st.id === nextId;
                  return (
                    <li key={st.id}>
                      <button
                        ref={isNext ? nextRef : null}
                        className={`stop-chip${done ? ' done' : ''}${isNext ? ' next' : ''}`}
                        disabled={!isNext}
                        onClick={() => onOpenStation(st.id)}
                        aria-label={`${st.label}${done ? ', הושלם' : isNext ? ', התחנה הבאה' : ''}`}
                      >
                        <span className="chip-icon" aria-hidden="true">
                          {done ? '✔' : st.icon}
                        </span>
                        <span>{st.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
      )}

      <footer className="dock">
        {finishedToday ? (
          <div className="done-today">
            <strong>{mode === 'night' ? 'שגרת הלילה הושלמה' : 'המסלול של היום הושלם'}</strong>
            <span>ימים טובים ב-7 הימים האחרונים: {good7}</span>
          </div>
        ) : nextStation ? (
          <button className="btn primary big" onClick={() => onOpenStation(nextId)}>
            {activeId === nextId ? 'להמשיך:' : 'מתחילים:'} {nextStation.label}
          </button>
        ) : null}
        <nav className="dock-nav" aria-label="ניווט">
          <button className="btn ghost" onClick={onWorld}>
            🏆 עולם ההצלחות
          </button>
          <button className="btn ghost" onClick={onBuilder}>
            🗺️ המסלול שלי
            {state.proposal ? ' (ממתין)' : ''}
          </button>
          {mode === 'morning' ? (
            <button className="btn ghost" onClick={onAlarm}>
              ⏰ {WAKE_TIME}
            </button>
          ) : null}
        </nav>
      </footer>
    </main>
  );
}
