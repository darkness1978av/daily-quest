import { useEffect, useState } from 'react';
import { PinPad } from '../ui.jsx';
import { familyInfo } from '../cloud.js';

export function Loading({ text = 'טוענים...' }) {
  return (
    <main className="screen onboarding">
      <p className="lead" role="status">
        {text}
      </p>
    </main>
  );
}

// A parent picks the 4-digit parent-mode code (used on the child's phone).
export function PinSetup({ onDone }) {
  const [first, setFirst] = useState(null);
  return (
    <main className="screen onboarding">
      {first === null ? (
        <PinPad
          key="first"
          title="קוד הורים"
          hint="בחרו קוד בן 4 ספרות. הוא ישמש כניסה למצב ההורים בטלפון של הילד או הילדה."
          onSubmit={(pin) => {
            setFirst(pin);
            return true;
          }}
        />
      ) : (
        <PinPad
          key="second"
          title="עוד פעם, לאימות"
          hint="הקלידו את אותו קוד."
          onSubmit={(pin) => {
            if (pin !== first) {
              setFirst(null);
              return false;
            }
            onDone(pin);
            return true;
          }}
          onCancel={() => setFirst(null)}
        />
      )}
    </main>
  );
}

// A parent waits for the child to join and set up the character.
export function WaitForChild({ familyId, onProxy, onSignOut }) {
  const [code, setCode] = useState('');
  useEffect(() => {
    let alive = true;
    familyInfo(familyId)
      .then((i) => alive && setCode(i?.childCode || ''))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [familyId]);
  return (
    <main className="screen onboarding">
      <h1>הילד או הילדה מצטרפים</h1>
      <p className="lead">
        בטלפון שלהם פותחים את האפליקציה, נכנסים עם מייל משלהם ומקלידים את הקוד הזה. אחר כך הם בוחרים מגדר, בונים דמות
        ובוחרים חיית מחמד.
      </p>
      <div className="family-code" dir="ltr" aria-label="קוד הצטרפות">
        {code || '...'}
      </div>
      <p className="muted">המסך הזה יתעדכן לבד כשהם יסיימו.</p>
      <div className="spacer" />
      <button className="btn ghost" onClick={onProxy}>
        להגדיר את הדמות במקומם, בטלפון הזה
      </button>
      <button className="link-btn" onClick={onSignOut}>
        יציאה מהחשבון
      </button>
    </main>
  );
}

export function WaitForParent({ onSignOut }) {
  return (
    <main className="screen onboarding">
      <h1>עוד רגע</h1>
      <p className="lead">ההורה עוד לא סיים את ההגדרה הראשונה. נסו שוב בעוד כמה דקות.</p>
      <div className="spacer" />
      <button className="link-btn" onClick={onSignOut}>
        יציאה מהחשבון
      </button>
    </main>
  );
}
