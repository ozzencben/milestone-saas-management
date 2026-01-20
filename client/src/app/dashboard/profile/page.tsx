"use client";

import EmptyFeature from "../../../components/ui/EmptyFeature";
import { useAuth } from "../../../context/auth/AuthContext";
import styles from "./page.module.css";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>My Profile</h1>
        <p>Manage your personal information and public profile.</p>
      </header>

      <div className={styles.card}>
        <div className={styles.userSummary}>
          <div className={styles.avatarLarge}>
            {(user?.firstname?.[0] || user?.email?.[0] || "?").toUpperCase()}
          </div>
          <div className={styles.details}>
            <h2>
              {user?.firstname} {user?.lastname}
            </h2>
            <span>{user?.email}</span>
          </div>
        </div>

        <hr className={styles.divider} />

        {/* Düzenleme kısmı şimdilik Placeholder */}
        <EmptyFeature
          title="Profile Settings"
          description="Bio, professional title, and social links management will be available soon."
          iconName="settings"
        />
      </div>
    </div>
  );
}
