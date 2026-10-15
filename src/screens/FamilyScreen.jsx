import { useState } from 'react';
import { createFamily, joinFamily } from '../cloud.js';

const normalize = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

// After signing in: open a new family (parent) or join with an invite code (parent or child, the code decides).
export default function FamilyScreen({ onReady, onSignOut }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const create = async () => {
    setBusy(true);
    setMsg('');
    try {
      onReady(await createFamily());
    } catch (e) {
      setMsg(e.message || 'משהו השתבש. נסו שוב.');
    }
    setBusy(false);
  };

  const join = async () => {
    setBusy(true);
    setMsg('');
    try {
      const f = await joinFamily(normalize(code));
      if (f) onReady(f);
      else setMsg('לא מצאנו משפחה עם הקוד הזה. בדקו את הקוד ונסו שוב.');
    } catch (e) {
      setMsg(e.message || 'משהו השתבש. נסו שוב.');
    }
    setBusy(false);
  };

  return (
    <main className="screen onboarding">
      <h1>מצטרפים למשפחה</h1>
      <p className="lead">קיבלתם קוד הזמנה? מקלידים אותו כאן. אם אתם ההורים הראשונים, פותחים משפחה חדשה.</p>
      <div className="join-box">
        <input
          className="text-input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="קוד הזמנה (8 תווים)"
          aria-label="קוד הזמנה"
          dir="ltr"
          maxLength={10}
          autoCapitalize="characters"
          autoComplete="off"
        />
        <button className="btn primary big" disabled={busy || normalize(code).length !== 8} onClick={join}>
          {busy ? 'בודקים...' : 'הצטרפות עם קוד'}
        </button>
      </div>
      <p className="muted">או</p>
      <button className="btn ghost" disabled={busy} onClick={create}>
        פתיחת משפחה חדשה (להורים)
      </button>
      {msg ? <p className="notice">{msg}</p> : null}
      <div className="spacer" />
      <button className="link-btn" onClick={onSignOut}>
        יציאה מהחשבון
      </button>
    </main>
  );
}
