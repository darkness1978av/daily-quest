import { useEffect, useState } from 'react';
import { familyInfo } from '../cloud.js';

// Parent mode: invite codes, connection status, sign out.
export default function FamilyPanel({ familyId, status, onSignOut }) {
  const [info, setInfo] = useState(null);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    let alive = true;
    familyInfo(familyId)
      .then((i) => alive && setInfo(i))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [familyId]);

  const copy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
    } catch (e) {
      setCopied('');
    }
  };

  return (
    <section>
      <h2>משפחה וחשבון</h2>
      {info?.parentCode ? (
        <>
          <p className="muted">קוד להצטרפות הילד או הילדה (בטלפון שלהם):</p>
          <div className="family-code" dir="ltr">
            {info.childCode}
          </div>
          <button className="btn ghost" onClick={() => copy(info.childCode, 'child')}>
            {copied === 'child' ? 'הועתק' : 'העתקת קוד'}
          </button>
          <p className="muted">קוד להצטרפות הורה נוסף:</p>
          <div className="family-code" dir="ltr">
            {info.parentCode}
          </div>
          <button className="btn ghost" onClick={() => copy(info.parentCode, 'parent')}>
            {copied === 'parent' ? 'הועתק' : 'העתקת קוד'}
          </button>
        </>
      ) : null}
      <p className="muted">
        {status === 'error' ? 'אין חיבור כרגע. הנתונים יתעדכנו כשיחזור.' : 'מחובר. שינויים מתעדכנים בין המכשירים תוך כמה שניות.'}
      </p>
      <button
        className="btn ghost"
        onClick={() => {
          if (window.confirm('לצאת מהחשבון במכשיר הזה?')) onSignOut();
        }}
      >
        יציאה מהחשבון
      </button>
    </section>
  );
}
