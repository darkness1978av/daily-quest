import { useEffect, useMemo, useReducer, useState } from 'react';
import { reducer, loadCache, saveCache, clearCache, viewOf, dayKey, todayPlan, todayRecord } from './logic.js';
import { linesFor, pick } from './data.js';
import { sfx, unlock, buzz, setSoundEnabled } from './audio.js';
import { cloudConfigured, getSession, getFamilyCache, setFamilyCache, myMembership, signOut } from './cloud.js';
import { useCloud } from './useCloud.js';
import AuthScreen from './screens/AuthScreen.jsx';
import FamilyScreen from './screens/FamilyScreen.jsx';
import FamilyPanel from './screens/FamilyPanel.jsx';
import { Loading, PinSetup, WaitForChild, WaitForParent } from './screens/Setup.jsx';
import Onboarding from './screens/Onboarding.jsx';
import MapScreen from './screens/MapScreen.jsx';
import StationScreen from './screens/StationScreen.jsx';
import FinishScreen from './screens/FinishScreen.jsx';
import WorldScreen from './screens/WorldScreen.jsx';
import BuilderScreen from './screens/BuilderScreen.jsx';
import ParentScreen, { ParentGate } from './screens/ParentScreen.jsx';
import CompanionScreen from './screens/CompanionScreen.jsx';
import AlarmGuide from './screens/AlarmGuide.jsx';
import { fillName } from './ui.jsx';

const defaultMode = () => {
  const h = new Date().getHours();
  return h >= 16 || h < 4 ? 'night' : 'morning';
};

// Gatekeeper: sign-in, then family, then the app itself.
export default function App() {
  const [session, setSession] = useState(getSession());
  const [family, setFamily] = useState(getFamilyCache());
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!session || family) return undefined;
    let alive = true;
    setChecking(true);
    myMembership()
      .then((m) => {
        if (!alive) return;
        if (m) {
          setFamilyCache(m);
          setFamily(m);
        }
        setChecking(false);
      })
      .catch((e) => {
        if (!alive) return;
        if (e.status === 401) setSession(null);
        setChecking(false);
      });
    return () => {
      alive = false;
    };
  }, [session, family]);

  const leave = () => {
    signOut();
    clearCache();
    setSession(null);
    setFamily(null);
  };

  if (!cloudConfigured()) return <Loading text="האפליקציה עדיין לא מחוברת לשרת." />;
  if (!session) return <AuthScreen onSignedIn={() => setSession(getSession())} />;
  if (!family) {
    if (checking) return <Loading />;
    return (
      <FamilyScreen
        onSignOut={leave}
        onReady={(f) => {
          clearCache();
          const m = { id: f.id, role: f.role };
          setFamilyCache(m);
          setFamily(m);
        }}
      />
    );
  }
  return <Home key={family.id} family={family} onSignOut={leave} />;
}

function Home({ family, onSignOut }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadCache);
  const [mode, setMode] = useState(defaultMode());
  const [view, setView] = useState({ name: 'map' });
  const [day, setDay] = useState(dayKey());
  const [proxy, setProxy] = useState(false);
  const cloud = useCloud(state, dispatch, family.id);

  useEffect(() => saveCache(state), [state]);
  useEffect(() => setSoundEnabled(state.settings.sound), [state.settings.sound]);
  useEffect(() => {
    document.documentElement.classList.toggle('calm', state.settings.calm);
  }, [state.settings.calm]);
  useEffect(() => {
    // the dark theme is for the routine screens only, not for the first-time setup
    document.documentElement.classList.toggle('night', mode === 'night' && !!state.profile);
    return () => document.documentElement.classList.remove('night');
  }, [mode, state.profile]);

  // Refresh the date when the app returns to the foreground (e.g. next morning).
  useEffect(() => {
    const refresh = () => setDay(dayKey());
    document.addEventListener('visibilitychange', refresh);
    return () => document.removeEventListener('visibilitychange', refresh);
  }, []);

  const rv = viewOf(state, mode); // the single-routine view the screens use
  const dispatchMode = (action) => dispatch({ ...action, mode });
  const isParent = family.role === 'parent';
  const gender = state.profile?.gender;

  const rec = todayRecord(rv, day);
  const mapLine = useMemo(() => {
    if (!state.profile) return '';
    const L = linesFor(gender, mode);
    return fillName(pick(rec?.finished ? L.doneToday : L.welcome), state.profile);
  }, [state.profile, rec?.finished, view.name, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- first-time setup ----
  if (!state.parentPin) {
    if (!cloud.loaded) return <Loading />;
    return isParent ? <PinSetup onDone={(pin) => dispatch({ type: 'SET_PIN', pin })} /> : <WaitForParent onSignOut={onSignOut} />;
  }
  if (!state.profile) {
    if (!isParent || proxy) {
      return <Onboarding proxy={proxy} onFinish={(profile) => dispatch({ type: 'SET_PROFILE', profile })} />;
    }
    return <WaitForChild familyId={family.id} onProxy={() => setProxy(true)} onSignOut={onSignOut} />;
  }

  if (state.reveal) {
    return (
      <FinishScreen
        reveal={state.reveal}
        profile={state.profile}
        mode={mode}
        onClose={() => {
          dispatch({ type: 'CLOSE_REVEAL' });
          setView({ name: 'map' });
        }}
        onAlbum={() => {
          dispatch({ type: 'CLOSE_REVEAL' });
          setView({ name: 'world' });
        }}
      />
    );
  }

  const handleDone = (id, skipped) => {
    unlock();
    const plan = todayPlan(rv, day);
    const doneCount = (rec?.done.length || 0) + 1;
    dispatchMode({ type: 'DONE', id, now: Date.now(), day, skipped });
    if (!skipped) {
      sfx.done();
      buzz(30);
    }
    if (doneCount >= plan.length) dispatchMode({ type: 'FINISH', day, seed: Math.random() });
    setView({ name: 'map' });
  };

  const toMap = () => setView({ name: 'map' });
  let screen;
  switch (view.name) {
    case 'station':
      screen = (
        <StationScreen
          key={`${mode}-${view.id}`}
          state={rv}
          day={day}
          id={view.id}
          dispatch={dispatchMode}
          onBack={toMap}
          onDone={handleDone}
        />
      );
      break;
    case 'world':
      screen = <WorldScreen state={rv} day={day} onBack={toMap} />;
      break;
    case 'builder':
      screen = (
        <BuilderScreen
          key={mode}
          state={rv}
          mode={mode}
          onBack={toMap}
          onSave={(route, stations) => {
            dispatchMode({ type: 'PROPOSE', route, stations });
            toMap();
          }}
        />
      );
      break;
    case 'companion':
      screen = (
        <CompanionScreen
          profile={state.profile}
          onBack={toMap}
          onSave={(companion) => {
            dispatch({ type: 'SET_PROFILE', profile: { ...state.profile, companion } });
            toMap();
          }}
        />
      );
      break;
    case 'alarm':
      screen = <AlarmGuide onBack={toMap} />;
      break;
    case 'gate':
      screen = <ParentGate pin={state.parentPin} onOk={() => setView({ name: 'parent' })} onCancel={toMap} />;
      break;
    case 'parent':
      screen = (
        <ParentScreen
          state={rv}
          mode={mode}
          onMode={setMode}
          dispatch={dispatchMode}
          rootDispatch={dispatch}
          day={day}
          onBack={toMap}
          onEditRoute={() => setView({ name: 'parent-builder' })}
          familyPanel={<FamilyPanel familyId={family.id} status={cloud.status} onSignOut={onSignOut} />}
        />
      );
      break;
    case 'parent-builder':
      screen = (
        <BuilderScreen
          key={mode}
          state={rv}
          mode={mode}
          parent
          onBack={() => setView({ name: 'parent' })}
          onSave={(route, stations) => {
            dispatchMode({ type: 'SET_ROUTE', route, stations });
            setView({ name: 'parent' });
          }}
        />
      );
      break;
    default:
      screen = (
        <MapScreen
          state={rv}
          mode={mode}
          onMode={setMode}
          day={day}
          line={mapLine}
          onOpenStation={(id) => {
            unlock();
            sfx.tap();
            setView({ name: 'station', id });
          }}
          onWorld={() => setView({ name: 'world' })}
          onBuilder={() => setView({ name: 'builder' })}
          onCompanion={() => setView({ name: 'companion' })}
          onAlarm={() => setView({ name: 'alarm' })}
          onParent={() => setView({ name: isParent ? 'parent' : 'gate' })}
          onToggleSound={() => dispatch({ type: 'SETTINGS', patch: { sound: !state.settings.sound } })}
        />
      );
  }

  return screen;
}
