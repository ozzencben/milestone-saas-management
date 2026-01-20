import { create } from "zustand";
import { NotificationService } from "../services/notifications/notification.service";
import { Notification } from "../types/notification.type";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  fetchNotifications: async () => {
    const response = await NotificationService.getMyNotifications();
    if (response.success) {
      const unread = response.data.filter((n) => !n.isRead).length; // isRead senin tipindeki isimlendirmeye göre
      set({ notifications: response.data, unreadCount: unread });
    }
  },
}));
