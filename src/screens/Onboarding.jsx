import { useState } from 'react';
import Avatar from '../Avatar.jsx';
import { AVATAR_OPTIONS, COMPANIONS, defaultAvatarFor, hairStylesFor, accessoriesFor } from '../data.js';
import { CompanionPicker } from '../ui.jsx';
import { sfx, unlock } from '../audio.js';

const STEPS = ['gender', 'name', 'avatar', 'companion'];

function Dots({ step }) {
  return (
    <div className="dots" aria-hidden="true">
      {STEPS.map((s, i) => (
        <span key={s} className={i <= STEPS.indexOf(step) ? 'on' : ''} />
      ))}
    </div>
  );
}

function Swatches({ list, value, onPick, label }) {
  return (
    <div className="swatches">
      {list.map((c) => (
        <button
          key={c}
          type="button"
          className={`swatch${value === c ? ' sel' : ''}`}
          style={{ background: c }}
          onClick={() => onPick(c)}
          aria-label={`${label} ${c}`}
          aria-pressed={value === c}
        />
      ))}
    </div>
  );
}

function Chips({ list, value, onPick }) {
  return (
    <div className="chips">
      {list.map((x) => (
        <button
          key={x.id}
          type="button"
          className={`chip${value === x.id ? ' sel' : ''}`}
          onClick={() => onPick(x.id)}
          aria-pressed={value === x.id}
        >
          {x.label}
        </button>
      ))}
    </div>
  );
}

// First setup of the child's profile: gender, name, character, companion. Done on the child's phone after joining,
// or by a parent on her or his behalf (proxy).
export default function Onboarding({ onFinish, proxy = false }) {
  const [step, setStep] = useState('gender');
  const [gender, setGender] = useState(null);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(defaultAvatarFor('girl'));
  const [companionId, setCompanionId] = useState('dog');
  const [companionName, setCompanionName] = useState('');

  const girl = gender !== 'boy';
  const next = () => {
    unlock();
    sfx.tap();
    setStep(STEPS[STEPS.indexOf(step) + 1]);
  };
  const back = () => setStep(STEPS[STEPS.indexOf(step) - 1]);
  const set = (key, value) => setAvatar((a) => ({ ...a, [key]: value }));

  const chooseGender = (g) => {
    setGender(g);
    setAvatar(defaultAvatarFor(g));
    unlock();
    sfx.tap();
    setStep('name');
  };

  const companion = COMPANIONS.find((c) => c.id === companionId);
  const finish = () => {
    onFinish({
      gender,
      name: name.trim(),
      avatar,
      companion: companionId
        ? {
            type: companionId,
            emoji: companion.emoji,
            image: companion.image || null,
            name: companionName.trim() || companion.suggest,
          }
        : null,
    });
  };

  if (step === 'gender') {
    return (
      <main className="screen onboarding">
        <Dots step={step} />
        <h1>{proxy ? 'מי משתמש באפליקציה?' : 'ברוכים הבאים להרפתקה'}</h1>
        <p className="lead">{proxy ? 'בוחרים כדי שהטקסטים יהיו בלשון הנכונה.' : 'קודם כול, מי את או מי אתה?'}</p>
        <div className="gender-row">
          <button type="button" className="pick gender-pick" onClick={() => chooseGender('girl')}>
            <span className="pick-face" aria-hidden="true">
              👧
            </span>
            ילדה
          </button>
          <button type="button" className="pick gender-pick" onClick={() => chooseGender('boy')}>
            <span className="pick-face" aria-hidden="true">
              👦
            </span>
            ילד
          </button>
        </div>
      </main>
    );
  }

  if (step === 'name') {
    return (
      <main className="screen onboarding">
        <Dots step={step} />
        <h1>איך קוראים {girl ? 'לך' : 'לך'}?</h1>
        <p className="lead">אפשר שם אמיתי, כינוי או שם בדוי. תמיד אפשר לשנות אחר כך.</p>
        <input
          className="text-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="השם שלי"
          maxLength={16}
          aria-label="השם שלי"
          autoComplete="off"
        />
        <div className="spacer" />
        <div className="row">
          <button className="btn ghost" onClick={back}>
            חזרה
          </button>
          <button className="btn primary" disabled={!name.trim()} onClick={next}>
            המשך
          </button>
        </div>
      </main>
    );
  }

  if (step === 'avatar') {
    return (
      <main className="screen onboarding">
        <Dots step={step} />
        <h1>{girl ? 'איך את נראית?' : 'איך אתה נראה?'}</h1>
        <div className="avatar-stage">
          <Avatar avatar={avatar} size={150} />
        </div>
        <div className="options">
          <fieldset>
            <legend>גוון עור</legend>
            <Swatches list={AVATAR_OPTIONS.skin} value={avatar.skin} onPick={(c) => set('skin', c)} label="גוון" />
          </fieldset>
          <fieldset>
            <legend>שיער</legend>
            <Chips list={hairStylesFor(gender)} value={avatar.hairStyle} onPick={(id) => set('hairStyle', id)} />
            <Swatches
              list={AVATAR_OPTIONS.hairColor}
              value={avatar.hairColor}
              onPick={(c) => set('hairColor', c)}
              label="צבע שיער"
            />
          </fieldset>
          <fieldset>
            <legend>בגדים</legend>
            <Swatches list={AVATAR_OPTIONS.outfit} value={avatar.outfit} onPick={(c) => set('outfit', c)} label="צבע בגד" />
          </fieldset>
          <fieldset>
            <legend>אקססורי</legend>
            <Chips list={accessoriesFor(gender)} value={avatar.accessory} onPick={(id) => set('accessory', id)} />
          </fieldset>
        </div>
        <div className="row">
          <button className="btn ghost" onClick={back}>
            חזרה
          </button>
          <button className="btn primary" onClick={next}>
            בחרתי
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="screen onboarding">
      <Dots step={step} />
      <h1>{girl ? 'רוצה חבר למסע?' : 'רוצה חבר למסע?'}</h1>
      <CompanionPicker
        companionId={companionId}
        setCompanionId={setCompanionId}
        companionName={companionName}
        setCompanionName={setCompanionName}
      />
      <div className="spacer" />
      <div className="row">
        <button className="btn ghost" onClick={back}>
          חזרה
        </button>
        <button className="btn primary" onClick={finish}>
          סיימנו
        </button>
      </div>
    </main>
  );
}
