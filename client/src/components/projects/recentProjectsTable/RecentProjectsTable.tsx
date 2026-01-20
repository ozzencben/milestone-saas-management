"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/auth/AuthContext";
import { Project } from "../../../types/project.type";
import { getDeadlineStatus } from "../../../utils/getDeadlineStatus";
import { Icon } from "../../icons/Icon";
import styles from "./RecentProjectsTable.module.css";

interface Props {
  projects: Project[];
}

export const RecentProjectsTable = ({ projects }: Props) => {
  const router = useRouter();
  const { user } = useAuth(); // Giriş yapmış kullanıcı bilgisi

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <h3>Recent Projects</h3>
        <button
          className={styles.viewAllBtn}
          onClick={() => router.push("/dashboard/projects/projectList")}
        >
          View All Projects
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Members</th>
              <th>Budget</th>
              <th>Status</th>
              <th>Deadline</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const isOwner = project.ownerId === user?.id;

              return (
                <tr
                  key={project.id}
                  onClick={() =>
                    router.push(`/dashboard/projects/${project.id}`)
                  }
                  className={styles.clickableRow}
                >
                  <td className={styles.projectNameCell}>
                    <div className={styles.projectIcon}>
                      <Icon name={isOwner ? "folder" : "user"} />
                    </div>
                    <div className={styles.projectInfo}>
                      <span className={styles.nameText}>{project.name}</span>
                      <span
                        className={`${styles.roleLabel} ${isOwner ? styles.ownerLabel : styles.memberLabel}`}
                      >
                        {isOwner
                          ? "Owner"
                          : `Owner (${project.owner?.firstname})`}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.emptyMembers}>
                      <span className={styles.placeholder}>--</span>
                    </div>
                  </td>
                  <td className={styles.price}>
                    {project.type === "PAID"
                      ? `${Number(project.price)?.toLocaleString()} ${project.currency}`
                      : "Internal"}
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[project.status.toLowerCase()]
                      }`}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className={styles.date}>
                    <div className={styles.deadlineWrapper}>
                      <span className={styles.dateText}>
                        {project.deadline
                          ? new Date(project.deadline).toLocaleDateString(
                              "tr-TR",
                            )
                          : "No Deadline"}
                      </span>

                      {project.deadline &&
                        (() => {
                          const dl = getDeadlineStatus(project.deadline);
                          if (!dl) return null;
                          return (
                            <span
                              className={`${styles.dlStatusBadge} ${styles[dl.color]}`}
                            >
                              {dl.days === 0
                                ? "Today"
                                : dl.days < 0
                                  ? "Delayed"
                                  : `${dl.days} day`}
                            </span>
                          );
                        })()}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
