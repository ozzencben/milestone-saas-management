"use client";

import { ProjectRole } from "@/types/project.type";
import { Icon } from "../../icons/Icon";
import styles from "./MembersTable.module.css";

export interface TeamMemberUI {
  userId: string;
  firstname: string | null;
  lastname: string | null;
  email: string;
  associatedProjects: {
    projectId: string;
    projectName: string;
    projectRole: ProjectRole;
  }[];
}

interface MembersTableProps {
  members: TeamMemberUI[];
  onRemove: (userId: string, projectId: string) => void;
}

export default function MembersTable({ members, onRemove }: MembersTableProps) {
  return (
    <div className={styles.container}>
      <div className={styles.tableHeader}>
        <div className={styles.titleArea}>
          <h3>Active Collaborators</h3>
          <p>People you are working with across all projects</p>
        </div>
        <span className={styles.countBadge}>{members.length} People</span>
      </div>

      <div className={styles.tableResponsive}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Member</th>
              <th>Projects & Roles</th>
              <th className={styles.actionCol}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const displayEmail = member?.email || "";
              const avatarLetter = (
                member?.firstname?.[0] ||
                displayEmail[0] ||
                "?"
              ).toUpperCase();

              return (
                /* DÜZELTME 1: Key olarak email yerine userId kullanıyoruz */
                <tr key={member.userId || displayEmail}>
                  <td className={styles.userCell}>
                    <div className={styles.avatar}>{avatarLetter}</div>
                    <div className={styles.userInfo}>
                      <p className={styles.name}>
                        {member.firstname
                          ? `${member.firstname} ${member.lastname || ""}`
                          : displayEmail.split("@")[0] || "Unknown"}
                      </p>
                      <p className={styles.email}>{displayEmail}</p>
                    </div>
                  </td>
                  <td className={styles.projectsCell}>
                    <div className={styles.badgeContainer}>
                      {member.associatedProjects?.map((proj) => (
                        /* DÜZELTME 2: İç döngüdeki her proje grubu için de benzersiz key ekledik */
                        <div
                          key={`${member.userId}-${proj.projectId}`}
                          className={styles.projectGroup}
                        >
                          <span className={styles.projectName}>
                            {proj.projectName}
                          </span>
                          <span
                            className={`${styles.roleTag} ${
                              styles[
                                proj.projectRole?.toLowerCase() || "developer"
                              ]
                            }`}
                          >
                            {proj.projectRole}
                          </span>
                          <button
                            onClick={() =>
                              onRemove(member.userId, proj.projectId)
                            }
                            className={styles.miniRemove}
                            title={`Remove from ${proj.projectName}`}
                          >
                            <Icon name="logout" size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className={styles.actionCol}>
                    <button className={styles.mainActionBtn}>
                      <Icon name="settings" size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {members.length === 0 && (
        <div className={styles.emptyState}>
          <Icon name="calendar" size={48} />
          <p>Your team is empty. Start by inviting people to your projects.</p>
        </div>
      )}
    </div>
  );
}
