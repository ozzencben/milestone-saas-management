import { NotificationType } from "@prisma/client";
import prisma from "../config/prisma.js";
import { sendNotification } from "../config/socket.js";

export const NotificationService = {
  // Bildirim Oluştur (Diğer servisler burayı çağıracak)
  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
  }) {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link,
      },
    });

    // Socket üzerinden anlık fırlat
    sendNotification(data.userId, notification);

    return notification;
  },

  // Kullanıcının bildirimlerini getir
  async getUserNotifications(userId: string) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30, // Son 30 bildirim yeterli
    });
  },

  // Bildirimi okundu işaretle
  async markAsRead(notificationId: string, userId: string) {
    return await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: userId, // Güvenlik: Sadece kendi bildirimini okundu yapabilir
      },
      data: { isRead: true },
    });
  },

  // Tümünü okundu işaretle
  async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },
};
