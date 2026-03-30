import * as React from 'react';

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 4000;

type ToastProps = {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type Action =
  | { type: 'ADD_TOAST'; toast: ToastProps }
  | { type: 'DISMISS_TOAST'; toastId: string }
  | { type: 'REMOVE_TOAST'; toastId: string };

type State = { toasts: ToastProps[] };

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TOAST':
      return { toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) };
    case 'DISMISS_TOAST':
      return { toasts: state.toasts.map(t => t.id === action.toastId ? { ...t, open: false } : t) };
    case 'REMOVE_TOAST':
      return { toasts: state.toasts.filter(t => t.id !== action.toastId) };
  }
}

let count = 0;
function genId() { return (++count).toString(); }

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach(l => l(memoryState));
}

function toast({ title, description, variant = 'default' }: Omit<ToastProps, 'id'>) {
  const id = genId();
  dispatch({ type: 'ADD_TOAST', toast: { id, title, description, variant, open: true, onOpenChange: (open) => { if (!open) dismiss(id); } } });

  const timeout = setTimeout(() => {
    dispatch({ type: 'DISMISS_TOAST', toastId: id });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', toastId: id }), 300);
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(id, timeout);
  return id;
}

function dismiss(toastId: string) {
  if (toastTimeouts.has(toastId)) {
    clearTimeout(toastTimeouts.get(toastId));
    toastTimeouts.delete(toastId);
  }
  dispatch({ type: 'DISMISS_TOAST', toastId });
  setTimeout(() => dispatch({ type: 'REMOVE_TOAST', toastId }), 300);
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => { const i = listeners.indexOf(setState); if (i > -1) listeners.splice(i, 1); };
  }, []);
  return { toasts: state.toasts, toast, dismiss };
}

export { useToast, toast };