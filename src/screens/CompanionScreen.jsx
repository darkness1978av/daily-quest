import { useState } from 'react';
import { CompanionPicker } from '../ui.jsx';
import { COMPANIONS } from '../data.js';

// Lets the child change her companion (including the family dog) at any time.
export default function CompanionScreen({ profile, onSave, onBack }) {
  const current = profile.companion;
  const [companionId, setCompanionId] = useState(current ? current.type : null);
  const [companionName, setCompanionName] = useState(current ? current.name : '');

  const save = () => {
    const c = COMPANIONS.find((x) => x.id === companionId);
    onSave(
      c
        ? { type: c.id, emoji: c.emoji, image: c.image || null, name: companionName.trim() || c.suggest }
        : null
    );
  };

  return (
    <main className="screen">
      <header className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="חזרה למפה">
          →
        </button>
        <div className="topbar-title">
          <strong>החבר שלי</strong>
          <span className="rank">מי מלווה אותך במסלול?</span>
        </div>
        <span className="icon-btn ghost" aria-hidden="true" />
      </header>

      <CompanionPicker
        companionId={companionId}
        setCompanionId={setCompanionId}
        companionName={companionName}
        setCompanionName={setCompanionName}
      />

      <div className="spacer" />
      <button className="btn primary big" onClick={save}>
        שמירה
      </button>
    </main>
  );
}
