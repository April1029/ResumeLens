import { useEffect } from 'react';
import { useStore } from '../state/store';

export function Toast() {
  const { state, dispatch } = useStore();
  useEffect(() => {
    if (!state.toast) return;
    const t = setTimeout(() => dispatch({ type: 'clearToast' }), 3200);
    return () => clearTimeout(t);
  }, [state.toast, dispatch]);
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
      {state.toast && (
        <div key={state.toast.id} className="rounded-xl border-2 border-ink bg-ink px-4 py-2.5 text-sm font-bold text-paper">
          {state.toast.text}
        </div>
      )}
    </div>
  );
}
