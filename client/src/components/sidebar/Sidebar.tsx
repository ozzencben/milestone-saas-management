"use client";

import { useRouter } from "next/navigation";
import { memo } from "react";
import { useAuth } from "../../context/auth/AuthContext";
import { useDashboard } from "../../context/dashboard/DashboardContext";
import { Icon } from "../icons/Icon";
import styles from "./Sidebar.module.css";

const Sidebar = memo(() => {
  const router = useRouter();
  const { logout } = useAuth();

  const { isCollapsed, isMobileOpen, closeMobileMenu } = useDashboard();

  const TOP_LINKS = [
    "dashboard",
    "projects",
    "tasks",
    "calendar",
    "messages",
    "team",
  ] as const;

  const BOTTOM_LINKS = ["settings", "help", "logout"] as const;

  const handleLinkClick = (
    link: (typeof TOP_LINKS)[number] | (typeof BOTTOM_LINKS)[number],
  ) => {
    closeMobileMenu();

    if (link === "dashboard") {
      router.push("/dashboard");
      return;
    }

    if (link === "logout") {
      logout();
      return;
    }

    router.push(`/dashboard/${link}`);
  };

  return (
    <>
      <div
        className={`${styles.overlay} ${isMobileOpen ? styles.open : ""}`}
        onClick={closeMobileMenu}
      ></div>

      <aside
        className={`
          ${styles.sidebar} 
          ${isCollapsed ? styles.collapsed : ""} 
          ${isMobileOpen ? styles.mobileOpen : ""}
        `}
      >
        <div className={styles.content}>
          <nav className={styles.nav}>
            <ul className={styles.navList}>
              {TOP_LINKS.map((link) => (
                <li key={link} onClick={() => handleLinkClick(link)}>
                  <div className={styles.navItem}>
                    <Icon name={link} />
                    <span className={styles.navText}>{link}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className={styles.divider}></div>

            <ul className={`${styles.navList} ${styles.bottomNav}`}>
              {BOTTOM_LINKS.map((link) => (
                <li key={link} onClick={() => handleLinkClick(link)}>
                  <div className={styles.navItem}>
                    <Icon name={link} />
                    <span className={styles.navText}>{link}</span>
                  </div>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
});

Sidebar.displayName = "Sidebar";

export default Sidebar;
