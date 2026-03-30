'use client';
import * as React from 'react';

type ToastProps = {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  action?: React.ReactNode;
};

export { type ToastProps };

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Toast({ variant = 'default', children, open }: Pick<ToastProps, 'variant' | 'children' | 'open'> & { children?: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className={`pointer-events-auto flex w-full items-center justify-between rounded-xl border p-4 shadow-lg transition-all ${
      variant === 'destructive'
        ? 'border-red-500/30 bg-red-950 text-red-200'
        : 'border-white/10 bg-gray-900 text-white'
    }`}>
      {children}
    </div>
  );
}

export function ToastTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-semibold">{children}</p>;
}

export function ToastDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-xs opacity-70 mt-0.5">{children}</p>;
}

export function ToastClose({ onClick }: { onClick?: () => void }) {
  return (
    <button onClick={onClick} className="ml-4 flex-shrink-0 rounded-md p-1 opacity-50 hover:opacity-100 transition">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  );
}

export function ToastViewport({ children }: { children?: React.ReactNode }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
      {children}
    </div>
  );
}