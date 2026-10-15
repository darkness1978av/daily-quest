import { WAKE_TIME } from '../data.js';

// A web app cannot ring when it is closed, so the real alarm lives in the phone's clock app.
export default function AlarmGuide({ onBack }) {
  return (
    <main className="screen">
      <header className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="חזרה למפה">
          →
        </button>
        <div className="topbar-title">
          <strong>שעון מעורר</strong>
        </div>
        <span className="icon-btn ghost" aria-hidden="true" />
      </header>

      <div className="alarm-time" aria-label={`שעת ההשכמה ${WAKE_TIME}`}>
        <span aria-hidden="true">⏰</span>
        {WAKE_TIME}
      </div>

      <p className="lead">
        שעת ההשכמה שלנו היא {WAKE_TIME}. כדי שהשעון יצלצל גם כשהאפליקציה סגורה, מגדירים אותו פעם אחת באפליקציית
        "שעון" של הטלפון, עם הצליל שבוחרים.
      </p>
    </main>
  );
}
