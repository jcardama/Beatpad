import { create } from "zustand";

export type ToastVariant = "info" | "error" | "update";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: number;
  variant: ToastVariant;
  message: string;
  /** Optional primary action (e.g. "Download"). */
  action?: ToastAction;
}

interface ToastState {
  toasts: Toast[];
  /** Queue a toast; returns its id. */
  show: (toast: Omit<Toast, "id">) => number;
  dismiss: (id: number) => void;
}

let nextId = 0;

/** Transient in-app notifications (an alternative to native OS dialogs). */
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (toast) => {
    const id = ++nextId;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    return id;
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
