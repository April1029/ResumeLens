import { StoreProvider, useStore, type View } from './state/store';
import { Onboarding } from './screens/Onboarding';
import { Profile } from './screens/Profile';
import { Tailor } from './screens/tailor/Tailor';
import { Applications } from './screens/Applications';
import { Toast } from './components/Toast';

const TABS: { id: View; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'tailor', label: 'Tailor' },
  { id: 'applications', label: 'Applications' },
];

function Shell() {
  const { state, dispatch } = useStore();
  if (state.stage === 'onboarding')
    return (
      <>
        <Onboarding />
        <Toast />
      </>
    );
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-5 border-b-2 border-ink bg-paper px-4 py-2.5">
        <span className="rounded-lg border-2 border-ink bg-accent px-2.5 py-0.5 font-display text-base tracking-tight">ResumeLens</span>
        <nav aria-label="Main" className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              aria-current={state.view === t.id ? 'page' : undefined}
              onClick={() => dispatch({ type: 'go', view: t.id })}
              className={`border-2 px-3 py-1.5 text-sm font-bold ${state.view === t.id ? 'border-ink bg-accent-soft' : 'border-transparent hover:border-ink hover:bg-cream'}`}
            >
              {t.label}
              {t.id === 'tailor' && state.session && <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-accent-strong align-middle" aria-label="(in progress)" />}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm">
          <span className="hidden rounded-full border-2 border-ink bg-blue px-2.5 py-0.5 text-xs font-bold sm:inline">Jordan Lee</span>
          <button className="text-xs font-bold underline decoration-2 underline-offset-2 hover:text-accent-strong" onClick={() => dispatch({ type: 'reset' })}>
            Reset demo
          </button>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-auto">
        {state.view === 'profile' && <Profile />}
        {state.view === 'tailor' && <Tailor />}
        {state.view === 'applications' && <Applications />}
      </div>
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
