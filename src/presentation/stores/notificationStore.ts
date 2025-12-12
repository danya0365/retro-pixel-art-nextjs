import { create } from "zustand";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (
    type: NotificationType,
    message: string,
    duration?: number
  ) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],

  addNotification: (type, message, duration = 3000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const notification: Notification = { id, type, message, duration };

    set((state) => ({
      notifications: [...state.notifications, notification],
    }));

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, duration);
    }
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearAll: () => {
    set({ notifications: [] });
  },
}));

// Helper functions for easy usage
export const showSuccess = (message: string, duration?: number) => {
  useNotificationStore.getState().addNotification("success", message, duration);
};

export const showError = (message: string, duration?: number) => {
  useNotificationStore.getState().addNotification("error", message, duration);
};

export const showWarning = (message: string, duration?: number) => {
  useNotificationStore.getState().addNotification("warning", message, duration);
};

export const showInfo = (message: string, duration?: number) => {
  useNotificationStore.getState().addNotification("info", message, duration);
};
