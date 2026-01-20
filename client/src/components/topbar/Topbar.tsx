"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { memo, useEffect, useRef, useState } from "react";
import { getSocket } from "../../config/socket";
import { useDashboard } from "../../context/dashboard/DashboardContext";
import { NotificationService } from "../../services/notifications/notification.service";
import { Notification as MyNotification } from "../../types/notification.type";
import { Icon } from "../icons/Icon";
import styles from "./Topbar.module.css";

const Hamburger = memo(({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) => (
  <button className={`${styles.hamburger} ${isOpen ? styles.open : ""}`} onClick={onClick} aria-label="Menu">
    <div className={styles.inner}>
      <span className={styles.lineTop}></span>
      <span className={styles.lineMid}></span>
      <span className={styles.lineBottom}></span>
    </div>
  </button>
));
Hamburger.displayName = "Hamburger";

export default function Topbar() {
  const router = useRouter();
  const { toggleSidebar, isMobileOpen, isCollapsed, isMobile } = useDashboard();
  const [notifications, setNotifications] = useState<MyNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const isAnyMenuOpen = isMobile ? isMobileOpen : isCollapsed;

  // 1. Dışarı tıklayınca kapatma
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    if (isNotifOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotifOpen]);

  // 2. İlk Yükleme & Socket Dinleme
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await NotificationService.getMyNotifications();
        if (res.success) {
          setNotifications(res.data);
          const unread = res.data.filter((n: MyNotification) => !n.isRead).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error("Fetch notifications error:", error);
      }
    };

    fetchNotifications();

    const socket = getSocket();
    socket.on("new_notification", (notification: MyNotification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => { socket.off("new_notification"); };
  }, []);

  // 3. Bildirim Paneli Açma ve Okundu İşaretleme
  const handleToggleNotif = async () => {
    const nextState = !isNotifOpen;
    setIsNotifOpen(nextState);

    // Panel açıldığında okunmamış bildirim varsa backend'i güncelle
    if (nextState && unreadCount > 0) {
      try {
        await NotificationService.markAllAsRead();
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (error) {
        console.error("Mark as read error:", error);
      }
    }
  };

  const handleViewAll = () => {
    setIsNotifOpen(false);
    router.push("/dashboard/notifications");
  };

  return (
    <div className={styles.topbar}>
      <Hamburger isOpen={isAnyMenuOpen} onClick={toggleSidebar} />

      <div className={styles.brand}>
        <h1 className={styles.brandName}>WorkHub</h1>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.notifWrapper} ref={notifRef}>
          <button className={styles.notifBtn} onClick={handleToggleNotif} type="button">
            <Icon name="notification" />
            {unreadCount > 0 && (
              <span className={styles.badge}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className={styles.notifDropdown}>
              <div className={styles.notifHeader}>
                <h3>Notifications</h3>
                {unreadCount > 0 && <span className={styles.unreadTag}>{unreadCount} New</span>}
              </div>
              <div className={styles.notifList}>
                {notifications.length === 0 ? (
                  <div className={styles.emptyNotif}>No new notifications</div>
                ) : (
                  notifications.slice(0, 8).map((n) => (
                    <div key={n.id} className={`${styles.notifItem} ${!n.isRead ? styles.unread : ""}`}>
                      <div className={styles.notifContent}>
                        <p className={styles.notifTitle}><strong>{n.title}</strong></p>
                        <span className={styles.notifMessage}>{n.message}</span>
                      </div>
                      {!n.isRead && <div className={styles.notifDot}></div>}
                    </div>
                  ))
                )}
              </div>
              <button className={styles.viewAllBtn} onClick={handleViewAll} type="button">
                View All Notifications
              </button>
            </div>
          )}
        </div>

        <div className={styles.avatarWrapper} onClick={() => router.push("/dashboard/profile")}>
          <Image
            src="/svg/user.png"
            alt="Avatar"
            className={styles.avatar}
            width={40}
            height={40}
          />
        </div>
      </div>
    </div>
  );
}