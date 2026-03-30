'use client';
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';

export function Toaster() {
  const { toasts, dismiss } = useToast();
  return (
    <ToastProvider>
      <ToastViewport>
        {toasts.map(({ id, title, description, variant, open }) => (
          <Toast key={id} variant={variant} open={open}>
            <div className="grid gap-0.5">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            <ToastClose onClick={() => dismiss(id)} />
          </Toast>
        ))}
      </ToastViewport>
    </ToastProvider>
  );
}