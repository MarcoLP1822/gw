/**
 * Toast Notification System
 * 
 * Centralized wrapper around sonner for consistent toast notifications.
 * Provides type-safe methods for success, error, loading, and promise-based toasts.
 * 
 * @example
 * ```typescript
 * import { toast } from '@/lib/ui/toast';
 * 
 * // Simple notifications
 * toast.success('Operation completed!');
 * toast.error('Something went wrong');
 * toast.loading('Processing...');
 * 
 * // Promise-based (auto-updates)
 * toast.promise(apiCall(), {
 *   loading: 'Saving...',
 *   success: 'Saved successfully!',
 *   error: 'Failed to save'
 * });
 * ```
 */

import { toast as sonnerToast, ExternalToast } from 'sonner';

interface ToastPromiseMessages {
    loading: string;
    success: string;
    error: string | ((error: any) => string);
}

export const toast = {
    /**
     * Show a success toast notification
     */
    success: (message: string, data?: ExternalToast) => {
        return sonnerToast.success(message, data);
    },

    /**
     * Show an error toast notification
     */
    error: (message: string, data?: ExternalToast) => {
        return sonnerToast.error(message, data);
    },

    /**
     * Show a loading toast notification
     * Returns a toast ID that can be used to dismiss it later
     */
    loading: (message: string, data?: ExternalToast) => {
        return sonnerToast.loading(message, data);
    },

    /**
     * Show an info toast notification
     */
    info: (message: string, data?: ExternalToast) => {
        return sonnerToast.info(message, data);
    },

    /**
     * Show a warning toast notification
     */
    warning: (message: string, data?: ExternalToast) => {
        return sonnerToast.warning(message, data);
    },

    /**
     * Promise-based toast that automatically updates based on promise state
     * Shows loading state, then updates to success or error
     */
    promise: <T,>(
        promise: Promise<T>,
        messages: ToastPromiseMessages,
        data?: ExternalToast
    ) => {
        return sonnerToast.promise(promise, {
            loading: messages.loading,
            success: messages.success,
            error: typeof messages.error === 'function'
                ? messages.error
                : () => messages.error as string,
            ...data,
        });
    },

    /**
     * Dismiss a specific toast by ID
     */
    dismiss: (toastId?: string | number) => {
        return sonnerToast.dismiss(toastId);
    },

    /**
     * Custom toast with full control
     */
    custom: (message: string | React.ReactNode, data?: ExternalToast) => {
        return sonnerToast(message, data);
    },
};

/**
 * Toast configuration presets for common scenarios
 */
export const toastPresets = {
    /**
     * AI Generation started
     */
    generationStarted: (entityName: string) => {
        return toast.loading(`Generazione ${entityName} in corso...`, {
            duration: Infinity, // Don't auto-dismiss
        });
    },

    /**
     * AI Generation completed
     */
    generationCompleted: (entityName: string) => {
        return toast.success(`✨ ${entityName} generato con successo!`, {
            duration: 4000,
        });
    },

    /**
     * API Error with details
     */
    apiError: (action: string, error: any) => {
        const message = error?.message || 'Errore sconosciuto';
        return toast.error(`Errore durante ${action}: ${message}`, {
            duration: 6000,
        });
    },

    /**
     * Save operation
     */
    saved: (entityName: string = 'Modifiche') => {
        return toast.success(`${entityName} salvate`, {
            duration: 2000,
        });
    },

    /**
     * Delete operation
     */
    deleted: (entityName: string) => {
        return toast.success(`${entityName} eliminato`, {
            duration: 3000,
        });
    },
};
