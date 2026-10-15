import { useMemo } from 'react';
import Avatar from '../Avatar.jsx';
import PlushDog from '../PlushDog.jsx';
import { CompanionFace } from '../ui.jsx';
import { stationById, assignRooms } from '../logic.js';

// Cells of a ring on a COLS x rows grid, clockwise starting at the top-right corner.
const COLS = 4;
export function ringCells(rows) {
  const cells = [];
  for (let c = COLS - 1; c >= 0; c--) cells.push([0, c]); // top, right -> left
  for (let r = 1; r < rows; r++) cells.push([r, 0]); // left side, down
  for (let c = 1; c < COLS; c++) cells.push([rows - 1, c]); // bottom, left -> right
  for (let r = rows - 2; r >= 1; r--) cells.push([r, COLS - 1]); // right side, up
  return cells;
}

// The marker stamped on every finished square: the child's companion, or the plush puppy.
function Stamp({ companion, size }) {
  return companion ? <CompanionFace companion={companion} size={size} /> : <PlushDog size={size} pose="happy" />;
}

export default function BoardView({ state, plan, doneIds, nextId, finishedToday, onOpenStation, line }) {
  const { profile } = state;
  const stations = useMemo(
    () => plan.map((p) => stationById(state, p.id)).filter(Boolean),
    [plan, state.stations] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const rooms = useMemo(() => assignRooms(stations), [stations]);

  const rows = Math.max(4, Math.ceil((stations.length + 1 - 2 * COLS) / 2) + 2);
  const cells = ringCells(rows);
  const doneCount = stations.filter((s) => doneIds.has(s.id)).length;

  return (
    <div className="board" style={{ gridTemplateRows: `repeat(${rows}, 1fr)` }} role="group" aria-label="לוח המסע">
      {cells.map(([r, c], i) => {
        const pos = { gridRow: r + 1, gridColumn: c + 1 };
        if (i === 0) {
          return (
            <div key="start" className="sq start" style={pos}>
              <span className="sq-icon" aria-hidden="true">🚩</span>
              <span className="sq-label">התחלה</span>
            </div>
          );
        }
        const st = stations[i - 1];
        if (!st) {
          return (
            <div key={`f${i}`} className="sq filler" style={pos} aria-hidden="true">
              ⭐
            </div>
          );
        }
        const done = doneIds.has(st.id);
        const isNext = !finishedToday && st.id === nextId;
        return (
          <button
            key={st.id}
            className={`sq room-${rooms[i - 1]}${done ? ' done' : ''}${isNext ? ' next' : ''}`}
            style={{ ...pos, '--hop': `${i * 70}ms` }}
            disabled={!isNext}
            onClick={() => onOpenStation(st.id)}
            aria-label={`${st.label}${done ? ', הושלם' : isNext ? ', התחנה הבאה' : ''}`}
          >
            <span className="sq-icon" aria-hidden="true">{st.icon}</span>
            <span className="sq-label">{st.label}</span>
            {done ? (
              <span className="stamp" aria-hidden="true">
                <Stamp companion={profile.companion} size={46} />
              </span>
            ) : null}
            {isNext ? (
              <span className="board-token" aria-hidden="true">
                <Avatar avatar={profile.avatar} size={50} />
              </span>
            ) : null}
          </button>
        );
      })}
      <div className="board-center" style={{ gridRow: `2 / ${rows}`, gridColumn: `2 / ${COLS}` }}>
        <div className="center-dog" aria-hidden="true">
          <Stamp companion={profile.companion} size={64} />
        </div>
        {line ? <p className="bubble">{line}</p> : null}
        <strong className="center-count">
          {doneCount} / {stations.length}
        </strong>
      </div>
    </div>
  );
}
