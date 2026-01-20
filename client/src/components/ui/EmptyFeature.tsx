// src/components/ui/EmptyFeature/EmptyFeature.tsx
"use client";

import { Icon } from "../icons/Icon";
import { IconName } from "../icons/lib";
import styles from "./EmptyFeature.module.css";

interface EmptyFeatureProps {
  title: string;
  description: string;
  iconName: string;
}

export default function EmptyFeature({
  title,
  description,
  iconName,
}: EmptyFeatureProps) {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <Icon name={iconName as IconName} size={48} />
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className={styles.badge}>Coming Soon</div>
    </div>
  );
}
