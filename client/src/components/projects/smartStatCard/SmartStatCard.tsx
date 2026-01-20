import { Icon, IconProps } from "../../icons/Icon";
import styles from "./SmartStatCard.module.css";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: IconProps["name"];
  subtext?: string;
  trend?: string;
  variant?: "indigo" | "emerald" | "violet" | "amber";
}

export const StatCard = ({
  title,
  value,
  icon,
  subtext,
  trend,
  variant = "indigo",
}: StatCardProps) => {
  return (
    <div className={`${styles.card} ${styles[variant]}`}>
      <div className={styles.cardHeader}>
        <span className={styles.title}>{title}</span>
        <div className={styles.iconWrapper}>
          <Icon name={icon} />
        </div>
      </div>
      <div className={styles.value}>{value}</div>
      {(subtext || trend) && (
        <div className={styles.cardFooter}>
          {trend && <span className={styles.trend}>{trend}</span>}
          {subtext && <span className={styles.subtext}>{subtext}</span>}
        </div>
      )}
    </div>
  );
};
