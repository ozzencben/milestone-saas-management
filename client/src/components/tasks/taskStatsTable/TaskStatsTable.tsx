"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProjectService } from "../../../services/projects/project.service";
import { Project } from "../../../types/project.type";
import { Icon } from "../../icons/Icon";
import styles from "./TaskStatsTable.module.css";

export default function TaskStatsTable() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await ProjectService.getProjects();
        setProjects(data || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleRowClick = (projectId: string) => {
    router.push(`/dashboard/projects/${projectId}`);
  };

  if (loading)
    return <div className={styles.loader}>Loading project analytics...</div>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Status</th>
              <th>Completed / Total</th>
              <th>Pending Tasks</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const totalTasks = project.checklist?.length || 0;
              const completedTasks =
                project.checklist?.filter((t) => t.isDone).length || 0;
              const pendingTasks = totalTasks - completedTasks;
              const progressPercent =
                totalTasks > 0
                  ? Math.round((completedTasks / totalTasks) * 100)
                  : 0;

              return (
                <tr
                  key={project.id}
                  onClick={() => handleRowClick(project.id)}
                  className={styles.row}
                >
                  <td className={styles.projectName}>
                    <strong>{project.name}</strong>
                    <small>{project.type} Project</small>
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${styles[project.status.toLowerCase()]}`}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className={styles.countCell}>
                    <span className={styles.completedCount}>
                      {completedTasks}
                    </span>
                    <span className={styles.separator}>/</span>
                    <span className={styles.totalCount}>{totalTasks}</span>
                  </td>
                  <td>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                      className={
                        pendingTasks > 0
                          ? styles.pendingActive
                          : styles.pendingZero
                      }
                    >
                      {pendingTasks > 0 && <Icon name="tasks" size={14} />}
                      {pendingTasks} {pendingTasks === 1 ? "Task" : "Tasks"}
                    </span>
                  </td>
                  <td className={styles.progressCell}>
                    <div className={styles.progressWrapper}>
                      <div className={styles.progressTrack}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className={styles.progressText}>
                        {progressPercent}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {projects.length === 0 && (
          <div className={styles.emptyState}>No projects found yet.</div>
        )}
      </div>
    </div>
  );
}
