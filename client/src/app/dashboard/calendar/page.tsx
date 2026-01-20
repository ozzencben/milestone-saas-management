"use client";

import CalendarComponent from "../../../components/calendar/CalendarComponent";
import { Icon } from "../../../components/icons/Icon";
import styles from "./page.module.css";

export default function Calendar() {
  return (
    <div className={styles.container}>
      {/* Page Header Section */}
      <header className={styles.pageHeader}>
        <div className={styles.headerTitle}>
          <div className={styles.iconBox}>
            <Icon name="logout" size={24} className={styles.headerIcon} />
          </div>
          <div>
            <h1>Schedule & Tasks</h1>
            <p>
              Manage your deadlines, personal tasks, and project milestones in
              one place.
            </p>
          </div>
        </div>
      </header>

      {/* Main Calendar Section */}
      <main className={styles.mainContent}>
        <CalendarComponent />
      </main>
    </div>
  );
}
