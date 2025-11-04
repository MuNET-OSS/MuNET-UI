import { ref } from 'vue';

export type Toast = {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
};

export type ToastInternal = Toast & { rand: number };

export const toasts = ref<ToastInternal[]>([]);

export function addToast(toast: Toast) {
  const rand = Math.random();
  toasts.value.push({
    ...toast,
    rand,
  });
  return rand;
}
