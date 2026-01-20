import { Icon } from "../../icons/Icon";
import { IconName } from "../../icons/lib";
import styles from "./TeamStats.module.css";

interface TeamStatsProps {
  totalMembers: number;
  pendingInvites: number;
  activeProjects: number;
}

export default function TeamStats({
  totalMembers,
  pendingInvites,
  activeProjects,
}: TeamStatsProps) {
  const stats = [
    {
      id: 1,
      label: "Total Collaborators",
      value: totalMembers,
      icon: "tasks", // Kütüphanendeki uygun icon ismini kullanabilirsin
      color: "#4f46e5",
    },
    {
      id: 2,
      label: "Pending Invitations",
      value: pendingInvites,
      icon: "calendar",
      color: "#f59e0b",
    },
    {
      id: 3,
      label: "Active Projects",
      value: activeProjects,
      icon: "settings",
      color: "#10b981",
    },
  ];

  return (
    <div className={styles.statsGrid}>
      {stats.map((stat) => (
        <div key={stat.id} className={styles.statCard}>
          <div
            className={styles.iconWrapper}
            style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
          >
            <Icon name={stat.icon as IconName} size={24} />
          </div>
          <div className={styles.info}>
            <p className={styles.label}>{stat.label}</p>
            <h3 className={styles.value}>{stat.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
