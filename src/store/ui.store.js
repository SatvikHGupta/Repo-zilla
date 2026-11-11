// Transient UI state only (toasts). Nothing here is persisted.
import { create } from 'zustand';

let seq = 0;
export const useUi = create((set) => ({
  toasts: [],
  toast: (message, tone = 'info') => {
    const id = ++seq;
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, message, tone }] }));
    return id;
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
