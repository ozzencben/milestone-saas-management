"use client";

import EmptyFeature from "../../../components/ui/EmptyFeature";
import styles from "./page.module.css";

export default function SettingsPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Application Settings</h1>
        <p>Control your account security, notification preferences and more.</p>
      </header>

      <div className={styles.settingsGrid}>
        <aside className={styles.sidebar}>
          <nav>
            <div className={styles.activeLink}>Account Security</div>
            <div>Notifications</div>
            <div>Billing & Subscription</div>
            <div>Integrations</div>
          </nav>
        </aside>

        <main className={styles.content}>
          <EmptyFeature
            title="Account Controls"
            description="Password changes, two-factor authentication, and notification controls are being implemented."
            iconName="settings"
          />
        </main>
      </div>
    </div>
  );
}
