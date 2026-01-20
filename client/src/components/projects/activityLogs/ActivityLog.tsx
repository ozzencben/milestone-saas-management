// components/projects/activityLog/ActivityLog.tsx
import { Activity } from "../../../types/project.type";
import styles from "./ActivityLog.module.css";

interface ActivityLogProps {
  activities: Activity[];
}

export default function ActivityLog({ activities }: ActivityLogProps) {
  const getActionMessage = (activity: Activity) => {
    const userName = `<b>${activity.user.firstname}</b>`;
    const entity = activity.entityName
      ? ` <span class="${styles.entity}">"${activity.entityName}"</span>`
      : "";

    switch (activity.action) {
      case "PROJECT_CREATED":
        return `${userName} created the project.`;
      case "PROJECT_UPDATED":
        return `${userName} updated project details.`;
      case "CHECKLIST_ADDED":
        return `${userName} added task: ${entity}`;
      case "CHECKLIST_COMPLETED":
        return `${userName} completed: ${entity}`;
      case "CHECKLIST_REOPENED":
        return `${userName} reopened: ${entity}`;
      case "CHECKLIST_DELETED":
        return `${userName} removed task: ${entity}`;
      case "RESOURCE_ADDED":
        return `${userName} uploaded resource: ${entity}`;
      case "RESOURCE_DELETED":
        return `${userName} deleted resource: ${entity}`;
      case "MEMBER_INVITED":
        return `${userName} invited a new member.`;
      case "MEMBER_REMOVED":
        return `${userName} removed a member.`;
      default:
        return `${userName} performed an action: ${activity.action}`;
    }
  };

  return (
    <div className={styles.container}>
      {activities.length === 0 && (
        <p className={styles.time}>No recent activity.</p>
      )}
      {activities.map((log) => (
        <div key={log.id} className={styles.logItem}>
          <div className={styles.avatar}>{log.user.firstname?.[0]}</div>
          <div className={styles.content}>
            <p
              className={styles.message}
              dangerouslySetInnerHTML={{ __html: getActionMessage(log) }}
            />
            <span className={styles.time}>
              {new Date(log.createdAt).toLocaleString("tr-TR", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "short",
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
