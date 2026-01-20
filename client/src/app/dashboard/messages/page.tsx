"use client";

import EmptyFeature from "../../../components/ui/EmptyFeature";
import styles from "./page.module.css";

export default function Messages() {
  return (
    <div className={styles.container}>
      <EmptyFeature
        title="Real-time Messages"
        description="Collaborate with your team members in real-time. This feature is currently under development."
        iconName="settings" // Buraya uygun bir icon name (message vb.) verebilirsin
      />
    </div>
  );
}
