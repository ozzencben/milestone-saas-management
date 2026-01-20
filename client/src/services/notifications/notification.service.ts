import { Notification } from "../../types/notification.type";
import api from "../api/api";

export const NotificationService = {
  /**
   * Kullanıcının son bildirimlerini getirir
   */
  async getMyNotifications() {
    const response = await api.get<{ success: boolean; data: Notification[] }>(
      "/notifications",
    );
    return response.data;
  },

  /**
   * Belirli bir bildirimi okundu olarak işaretler
   */
  async markAsRead(notificationId: string) {
    const response = await api.patch<{ success: boolean; message: string }>(
      `/notifications/${notificationId}/read`,
    );
    return response.data;
  },

  /**
   * Tüm okunmamış bildirimleri okundu olarak işaretler
   */
  async markAllAsRead() {
    const response = await api.patch<{ success: boolean; message: string }>(
      "/notifications/mark-all",
    );
    return response.data;
  },
};
