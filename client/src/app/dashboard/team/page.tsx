"use client";

import { ProjectInvitation } from "@/types/project.type";
import { useCallback, useEffect, useState } from "react"; // useCallback eklendi
import { toast } from "react-hot-toast";
import { Icon } from "../../../components/icons/Icon";
import MembersTable from "../../../components/team/membersTable/MembersTable";
import PendingInvites from "../../../components/team/pendingInvites/PendingInvites";
import TeamStats from "../../../components/team/teamStats/TeamStats";
import { useAuth } from "../../../context/auth/AuthContext";
import { ProjectService } from "../../../services/projects/project.service";
import { TeamMemberUI } from "../../../types/team.type";
import { transformProjectsToTeam } from "../../../utils/TransfromProjectsToTeam";
import styles from "./page.module.css";

type TabType = "members" | "invitations";

export default function TeamPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMemberUI[]>([]);
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>("members");

  // Hata 3 (Exhaustive Deps) Çözümü: loadData'yı useCallback içine alıyoruz
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [projects, invites] = await Promise.all([
        ProjectService.getProjects(),
        ProjectService.getMyInvitations(),
      ]);

      setTotalProjects(projects.length);
      setInvitations(invites || []);

      // Hata 1 (Type Mismatch) Çözümü: 'as any' ile zorlayarak BackendProject tipine cast ediyoruz
      setTeamMembers(transformProjectsToTeam(projects, user?.id));
    } catch (error) {
      toast.error("Failed to load team data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // user.id değiştikçe fonksiyon güncellenir

  useEffect(() => {
    loadData();
  }, [loadData]); // Artık loadData güvenli bir bağımlılık

  const handleRemoveMember = async (uid: string, pid: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await ProjectService.removeMember(pid, uid);
      toast.success("Member removed successfully");
      loadData();
    } catch (error) {
      toast.error("Could not remove member");
      console.error(error);
    }
  };

  const handleCancelInvite = async (id: string) => {
    try {
      await ProjectService.respondToInvitation(id, "REJECT");
      toast.success("Invitation cancelled");
      loadData();
    } catch (error) {
      toast.error("Failed to cancel invitation");
      console.error(error);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.headerSection}>
        <div className={styles.titleInfo}>
          <h1>Team Management</h1>
          <p>
            Global view of all collaborators and clients across your projects.
          </p>
        </div>
        <div className={styles.headerActions}>
          {/* Hata 2 (Unused Variable) Çözümü: loading değişkenini butonun disabled durumunda kullandık */}
          <button
            className={styles.refreshBtn}
            onClick={loadData}
            disabled={loading}
          >
            <Icon name="settings" size={18} />
            {loading ? "Loading..." : "Sync Data"}
          </button>
        </div>
      </header>

      <TeamStats
        totalMembers={teamMembers.length}
        pendingInvites={invitations.length}
        activeProjects={totalProjects}
      />

      <main className={styles.mainContent}>
        <div className={styles.tabs}>
          <button
            className={activeTab === "members" ? styles.activeTab : ""}
            onClick={() => setActiveTab("members")}
          >
            <Icon name="tasks" size={18} />
            Collaborators ({teamMembers.length})
          </button>
          <button
            className={activeTab === "invitations" ? styles.activeTab : ""}
            onClick={() => setActiveTab("invitations")}
          >
            <Icon name="calendar" size={18} />
            Pending Invites ({invitations.length})
            {invitations.length > 0 && (
              <span className={styles.notificationDot} />
            )}
          </button>
        </div>

        <div className={styles.contentCard}>
          {activeTab === "members" ? (
            <MembersTable members={teamMembers} onRemove={handleRemoveMember} />
          ) : (
            <PendingInvites
              invitations={invitations}
              onCancel={handleCancelInvite}
            />
          )}
        </div>
      </main>
    </div>
  );
}
