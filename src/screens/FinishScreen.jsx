import { useState } from 'react';
import { Companion, Sticker, stickerById } from '../ui.jsx';
import { TIERS, linesFor, pick } from '../data.js';
import { fmtTime, fmtMin } from '../logic.js';
import { sfx, buzz } from '../audio.js';

export default function FinishScreen({ reveal, profile, mode = 'morning', onClose, onAlbum }) {
  const [opened, setOpened] = useState(0);
  const [line] = useState(() => pick(reveal.good ? linesFor(profile?.gender, mode).finishGood : linesFor(profile?.gender, mode).finishOk));
  const total = reveal.awards.length;
  const allOpen = opened >= total;

  let compare = null;
  if (reveal.prevAvg) {
    const diff = reveal.prevAvg - reveal.totalSec;
    if (diff >= 30) compare = `מהר ב-${fmtMin(diff)} דקות מהממוצע שלך`;
    else if (diff <= -30) compare = `קצת יותר ארוך מהממוצע שלך. זה קורה, מחר חדש`;
    else compare = 'בדיוק בקצב הרגיל שלך';
  }

  const open = () => {
    const award = reveal.awards[opened];
    if (award.tier === 'legendary') sfx.legendary();
    else sfx.sticker();
    buzz(award.tier === 'common' ? 20 : 60);
    setOpened(opened + 1);
  };

  return (
    <main className="screen finish">
      <h1>{reveal.good ? 'יום טוב!' : 'המסלול הושלם'}</h1>
      <Companion profile={profile} line={line} />

      <div className="summary">
        <div>
          <span className="summary-num">{fmtTime(reveal.totalSec)}</span>
          <span className="summary-label">זמן כולל</span>
        </div>
        {compare ? <p className="summary-compare">{compare}</p> : null}
      </div>

      <section className="reveal" aria-label="המדבקות שלך">
        {reveal.awards.map((a, i) => {
          const sticker = stickerById(a.sid);
          const shown = i < opened;
          return (
            <div key={a.sid + i} className={`reveal-card${shown ? ' shown' : ''}`}>
              {shown ? (
                <>
                  <Sticker sticker={sticker} size="lg" />
                  <p className="reveal-why">
                    {TIERS[a.tier].label}: {a.why}
                    {a.isNew ? '' : ' (כבר יש לך, נוספה לספירה)'}
                  </p>
                </>
              ) : (
                <div className="sticker lg pack" aria-hidden="true">
                  <div className="sticker-icon">🎁</div>
                </div>
              )}
            </div>
          );
        })}
      </section>

      {!allOpen ? (
        <button className="btn primary big" onClick={open}>
          {opened === 0 ? 'פתיחת מדבקה' : 'עוד אחת'}
        </button>
      ) : (
        <div className="row">
          <button className="btn ghost" onClick={onAlbum}>
            לעולם ההצלחות
          </button>
          <button className="btn primary" onClick={onClose}>
            סיום
          </button>
        </div>
      )}
    </main>
  );
}
