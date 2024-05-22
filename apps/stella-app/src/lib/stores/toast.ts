import { writable } from 'svelte/store';

type ToastType = 'success' | 'error' | 'info';

export type Toast = {
	id: ReturnType<typeof crypto.randomUUID>;
	type: ToastType;
	message: string;
};

export const toasts = writable<Toast[]>([]);

const addToast = (message: string, type: ToastType, duration?: number) => {
	const id = crypto.randomUUID();

	toasts.update((toasts) => [{ id, type, message }, ...toasts]);

	// remove toast after certain duration, defaults to 1500ms
	setTimeout(
		() => toasts.update((toasts) => toasts.filter((toast) => toast.id !== id)),
		duration ?? 2500
	);
};

export const toast = {
	success: (message: string, duration?: number) => addToast(message, 'success', duration),
	error: (message: string, duration?: number) => addToast(message, 'error', duration),
	info: (message: string, duration?: number) => addToast(message, 'info', duration)
};
