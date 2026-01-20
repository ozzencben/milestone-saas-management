import { NotificationService } from "../services/notification.service.js";
export const getMyNotifications = async (req, res, next) => {
    try {
        const userId = req.userId; // authMiddleware'den geliyor
        const notifications = await NotificationService.getUserNotifications(userId);
        res.status(200).json({
            success: true,
            data: notifications,
        });
    }
    catch (error) {
        next(error);
    }
};
export const markNotificationRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        await NotificationService.markAsRead(id, userId);
        res.status(200).json({
            success: true,
            message: "Notification marked as read",
        });
    }
    catch (error) {
        next(error);
    }
};
export const markAllNotificationsRead = async (req, res, next) => {
    try {
        const userId = req.userId;
        await NotificationService.markAllAsRead(userId);
        res.status(200).json({
            success: true,
            message: "All notifications marked as read",
        });
    }
    catch (error) {
        next(error);
    }
};
