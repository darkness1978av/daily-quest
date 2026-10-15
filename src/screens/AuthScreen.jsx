import { useState } from 'react';
import { signIn, signUp } from '../cloud.js';

// Email + password. Used on first launch and whenever the session has ended.
export default function AuthScreen({ onSignedIn }) {
  const [mode, setMode] = useState('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      if (mode === 'in') await signIn(email.trim(), password);
      else await signUp(email.trim(), password);
      onSignedIn();
    } catch (err) {
      setMsg(err.message || 'משהו השתבש. נסו שוב.');
    }
    setBusy(false);
  };

  return (
    <main className="screen onboarding">
      <h1>ברוכים הבאים</h1>
      <p className="lead">{mode === 'in' ? 'נכנסים עם המייל והסיסמה.' : 'פותחים חשבון חדש עם מייל וסיסמה.'}</p>
      <form className="join-box" onSubmit={submit}>
        <input
          className="text-input"
          type="email"
          dir="ltr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="מייל"
          aria-label="מייל"
          autoComplete="email"
          required
        />
        <input
          className="text-input"
          type="password"
          dir="ltr"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="סיסמה (לפחות 6 תווים)"
          aria-label="סיסמה"
          autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
          minLength={6}
          required
        />
        <button className="btn primary big" type="submit" disabled={busy || !email || password.length < 6}>
          {busy ? 'רגע...' : mode === 'in' ? 'כניסה' : 'יצירת חשבון'}
        </button>
        {msg ? <p className="notice">{msg}</p> : null}
      </form>
      <button className="link-btn" onClick={() => setMode(mode === 'in' ? 'up' : 'in')}>
        {mode === 'in' ? 'אין לי חשבון עדיין' : 'כבר יש לי חשבון'}
      </button>
    </main>
  );
}
