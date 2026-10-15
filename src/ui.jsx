import { useState } from 'react';
import { STICKERS, TIERS, COMPANIONS } from './data.js';
import { sfx, unlock } from './audio.js';
import PlushDog from './PlushDog.jsx';

export const stickerById = (id) => STICKERS.find((s) => s.id === id);

export function fillName(text, profile) {
  return text.replace('{name}', profile?.name || '');
}

// A companion's face: a photo if it has one (and the file exists), otherwise its emoji.
export function CompanionFace({ companion, size = 64 }) {
  const [failed, setFailed] = useState(false);
  if (companion?.plush) return <PlushDog size={size} pose={companion.plush} />;
  if (companion?.image && !failed) {
    return (
      <img
        className="face-img"
        src={`${import.meta.env.BASE_URL}${companion.image}`}
        alt=""
        width={size}
        height={size}
        onError={() => setFailed(true)}
      />
    );
  }
  return <span aria-hidden="true">{companion ? companion.emoji : '💬'}</span>;
}

// The companion with a speech bubble. Tap the face (when onFaceClick is given) to change companion.
export function Companion({ profile, line, onFaceClick }) {
  const c = profile?.companion;
  const face = (
    <>
      <CompanionFace companion={c} />
    </>
  );
  return (
    <div className="companion" aria-live="polite">
      {onFaceClick ? (
        <button type="button" className="companion-face" onClick={onFaceClick} aria-label="החלפת חבר">
          {face}
        </button>
      ) : (
        <div className="companion-face">{face}</div>
      )}
      {line ? <p className="bubble">{line}</p> : null}
    </div>
  );
}

// Grid of companions plus a name field. Used in onboarding and when changing companion later.
export function CompanionPicker({ companionId, setCompanionId, companionName, setCompanionName }) {
  const current = COMPANIONS.find((c) => c.id === companionId);
  return (
    <>
      <div className="companion-grid">
        {COMPANIONS.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`pick${companionId === c.id ? ' sel' : ''}`}
            onClick={() => {
              setCompanionId(c.id);
              sfx.tap();
            }}
            aria-pressed={companionId === c.id}
          >
            <span className="pick-face">
              <CompanionFace companion={c} size={56} />
            </span>
            {c.label}
          </button>
        ))}
        <button
          type="button"
          className={`pick${companionId === null ? ' sel' : ''}`}
          onClick={() => setCompanionId(null)}
          aria-pressed={companionId === null}
        >
          <span className="pick-face" aria-hidden="true">
            🚶
          </span>
          לבד
        </button>
      </div>
      {current ? (
        <input
          className="text-input"
          value={companionName}
          onChange={(e) => setCompanionName(e.target.value)}
          placeholder={current.suggest ? `שם לחבר (למשל ${current.suggest})` : 'שם לחבר'}
          maxLength={14}
          aria-label="שם לחבר"
          autoComplete="off"
        />
      ) : null}
    </>
  );
}

export function Sticker({ sticker, owned = true, count = 1, size = 'md' }) {
  const tier = TIERS[sticker.tier];
  const cls = `sticker ${size} tier-${sticker.tier}${owned ? '' : ' locked'}`;
  return (
    <div className={cls} style={{ '--tier': tier.color }}>
      <div className="sticker-icon" aria-hidden="true">
        {owned ? sticker.icon : '?'}
      </div>
      <div className="sticker-name">{owned ? sticker.name : tier.label}</div>
      {owned && count > 1 ? <div className="sticker-count">×{count}</div> : null}
    </div>
  );
}

export function Stepper({ value, onChange, min = 1, max = 30, label }) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" className="icon-btn" onClick={() => onChange(Math.max(min, value - 1))} aria-label="פחות">
        −
      </button>
      <span className="stepper-value">{value} דק׳</span>
      <button type="button" className="icon-btn" onClick={() => onChange(Math.min(max, value + 1))} aria-label="יותר">
        +
      </button>
    </div>
  );
}

// 4-digit PIN entry. onSubmit(pin) returns true when accepted; otherwise the pad shakes and clears.
export function PinPad({ title, hint, onSubmit, onCancel }) {
  const [digits, setDigits] = useState('');
  const [bad, setBad] = useState(false);

  const press = (d) => {
    unlock();
    sfx.tap();
    if (digits.length >= 4) return;
    const next = digits + d;
    setBad(false);
    setDigits(next);
    if (next.length === 4) {
      setTimeout(() => {
        const ok = onSubmit(next);
        if (ok === false) {
          setBad(true);
          setDigits('');
        }
      }, 120);
    }
  };

  return (
    <div className="pin">
      <h2>{title}</h2>
      {hint ? <p className="muted">{hint}</p> : null}
      <div className={`pin-dots${bad ? ' bad' : ''}`} aria-label={`הוזנו ${digits.length} ספרות`}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={i < digits.length ? 'on' : ''} />
        ))}
      </div>
      {bad ? <p className="error">הקוד לא נכון. אפשר לנסות שוב.</p> : <p className="error">&nbsp;</p>}
      <div className="pin-grid">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} type="button" onClick={() => press(d)}>
            {d}
          </button>
        ))}
        <button type="button" className="ghost" onClick={onCancel} disabled={!onCancel}>
          {onCancel ? 'ביטול' : ''}
        </button>
        <button type="button" onClick={() => press('0')}>
          0
        </button>
        <button type="button" className="ghost" onClick={() => setDigits(digits.slice(0, -1))} aria-label="מחיקה">
          ⌫
        </button>
      </div>
    </div>
  );
}
