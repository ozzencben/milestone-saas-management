"use client";

import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getSocket } from "../../../config/socket";
import { NotificationService } from "../../../services/notifications/notification.service";
import { ProjectService } from "../../../services/projects/project.service";
import { Notification as MyNotifications } from "../../../types/notification.type";
import styles from "./page.module.css";

interface InvitationResponse {
  success: boolean;
  message: string;
  projectId?: string;
}

export default function NotificationPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<MyNotifications[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await NotificationService.getMyNotifications();
      setNotifications(res.data);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const socket = getSocket();
    socket.on("new_notification", (notification: MyNotifications) => {
      setNotifications((prev) => [notification, ...prev]);
    });
    return () => {
      socket.off("new_notification");
    };
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      toast.error("Could not mark notifications as read");
    }
  };

  const handleInvitationResponse = async (
    e: React.MouseEvent,
    notification: MyNotifications,
    action: "ACCEPT" | "REJECT",
  ) => {
    e.stopPropagation();

    const invitationId = notification.link?.split("/").pop();
    if (!invitationId || invitationId === "invitations") {
      toast.error("Invalid invitation data");
      return;
    }

    try {
      const res = (await ProjectService.respondToInvitation(
        invitationId,
        action,
      )) as unknown as InvitationResponse;

      if (res.success) {
        toast.success(
          action === "ACCEPT" ? "Joined the project!" : "Invitation declined",
        );

        setNotifications((prev) =>
          prev.map((n) => {
            if (n.id === notification.id) {
              return {
                ...n,
                isRead: true,
                message: `You have ${action.toLowerCase()}ed this invitation.`,
              };
            }
            return n;
          }),
        );

        if (action === "ACCEPT" && res.projectId) {
          setTimeout(
            () => router.push(`/dashboard/projects/${res.projectId}`),
            1200,
          );
        }
      }
    } catch (err: unknown) {
      // @typescript-eslint/no-explicit-any hatasını önlemek için tip kontrolü
      const errorMessage =
        err instanceof Error ? err.message : "Invitation already processed";
      toast.error(errorMessage);
      fetchNotifications();
    }
  };

  const handleNotificationClick = async (notification: MyNotifications) => {
    try {
      if (!notification.isRead) {
        await NotificationService.markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n,
          ),
        );
      }

      if (notification.link && notification.type !== "PROJECT_INVITE") {
        router.push(notification.link);
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  // loading durumunu burada kullanarak ESLint hatasını çözüyoruz
  if (loading && notifications.length === 0) {
    return <div className={styles.loading}>Loading notifications...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Notifications</h1>
        {notifications.some((n) => !n.isRead) && (
          <button onClick={handleMarkAllRead} className={styles.markAllBtn}>
            Mark all as read
          </button>
        )}
      </header>

      <div className={styles.list}>
        {notifications.length > 0 ? (
          notifications.map((n) => {
            const isInvite = n.type === "PROJECT_INVITE";

            // Okunmuş olsa bile butonlar kalmalı, sadece mesajda aksiyon varsa kalkmalı
            const isProcessed =
              n.message.toLowerCase().includes("accepted") ||
              n.message.toLowerCase().includes("declined") ||
              n.message.toLowerCase().includes("joined");

            return (
              <div
                key={n.id}
                className={`${styles.notifItem} ${!n.isRead ? styles.unread : ""}`}
                onClick={() => handleNotificationClick(n)}
              >
                <div className={styles.content}>
                  <p className={styles.title}>{n.title}</p>
                  <p className={styles.message}>{n.message}</p>

                  {isInvite && !isProcessed ? (
                    <div className={styles.actionButtons}>
                      <button
                        onClick={(e) =>
                          handleInvitationResponse(e, n, "ACCEPT")
                        }
                        className={styles.acceptBtn}
                      >
                        Accept
                      </button>
                      <button
                        onClick={(e) =>
                          handleInvitationResponse(e, n, "REJECT")
                        }
                        className={styles.rejectBtn}
                      >
                        Reject
                      </button>
                    </div>
                  ) : isInvite && isProcessed ? (
                    <div className={styles.statusWrapper}>
                      <span className={styles.statusBadge}>Processed</span>
                    </div>
                  ) : null}

                  <span className={styles.time}>
                    {formatDistanceToNow(new Date(n.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.noNotifications}>
            <p>No notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
