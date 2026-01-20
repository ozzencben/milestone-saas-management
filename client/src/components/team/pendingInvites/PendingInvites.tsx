"use client";

import { ProjectInvitation } from "@/types/project.type";
import { Icon } from "../../icons/Icon";
import styles from "./PendingInvites.module.css";

interface PendingInvitesProps {
  invitations: ProjectInvitation[];
  onCancel: (invitationId: string) => Promise<void>;
}

export default function PendingInvites({
  invitations,
  onCancel,
}: PendingInvitesProps) {
  if (invitations.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Icon name="calendar" size={18} />
          <h3>Pending Invitations</h3>
        </div>
        <p>Sent invitations waiting for approval</p>
      </div>

      <div className={styles.list}>
        {invitations.map((invite) => (
          <div key={invite.id} className={styles.inviteCard}>
            <div className={styles.mainInfo}>
              <div className={styles.emailBadge}>
                <Icon name="tasks" size={14} />
                <span>{invite.email}</span>
              </div>
              <div className={styles.details}>
                <span className={styles.projectName}>
                  Project: <strong>{invite.project?.name}</strong>
                </span>
                <span className={styles.dot}>•</span>
                <span className={styles.roleLabel}>
                  Role: <strong>{invite.role}</strong>
                </span>
              </div>
            </div>

            <div className={styles.actions}>
              <div className={styles.statusBadge}>
                <span className={styles.pulse}></span>
                {invite.status}
              </div>
              <button
                className={styles.cancelBtn}
                onClick={() => onCancel(invite.id)}
                title="Cancel Invitation"
              >
                <Icon name="logout" size={16} />
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
