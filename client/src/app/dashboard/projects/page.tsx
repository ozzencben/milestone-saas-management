"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "../../../components/icons/Icon";
import CreateProjectForm from "../../../components/projects/createProjectForm/CreateProjectForm";
import { RecentProjectsTable } from "../../../components/projects/recentProjectsTable/RecentProjectsTable";
import { StatCard } from "../../../components/projects/smartStatCard/SmartStatCard";
import { useAuth } from "../../../context/auth/AuthContext";
import { ProjectService } from "../../../services/projects/project.service";
import { Project } from "../../../types/project.type";
import styles from "./page.module.css";

export default function Projects() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const recentProjects = [...projects]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const fetchProjects = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await ProjectService.getProjects();
      setProjects(data || []);
    } catch (error: unknown) {
      setError((error as Error).message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchProjects();
    }
  }, [authLoading, user?.id, fetchProjects]);

  if (authLoading) {
    return <div className={styles.container}>Oturum kontrol ediliyor...</div>;
  }

  // Finansal Hesaplama: Sadece kullanıcının SAHİBİ olduğu ve ÜCRETLİ projelerin toplamı
  const totalRevenue = projects
    .filter((p) => p.type === "PAID" && p.ownerId === user?.id) // Sahiplik kontrolü eklendi
    .reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);

  return (
    <div className={styles.container} style={{ position: "relative" }}>
      {isOpen && (
        <CreateProjectForm
          onClose={() => setIsOpen(false)}
          onSuccess={() => {
            setIsOpen(false);
            fetchProjects();
          }}
        />
      )}

      {loading && projects.length === 0 ? (
        <div className={styles.content}>Projects are loading...</div>
      ) : projects && projects.length > 0 ? (
        <div className={styles.content}>
          <div className={styles.header}>
            <h2 className={styles.title}>Projects ({projects.length})</h2>
            <button
              className={styles.createButton}
              onClick={() => setIsOpen(true)}
            >
              + New Project
            </button>
          </div>

          <div className={styles.projects}>
            <div className={styles.smartStats}>
              <StatCard
                title="Total Projects"
                value={projects.length}
                icon="projects"
                variant="indigo"
                subtext="View all projects"
              />

              <StatCard
                title="Total Revenue"
                value={new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(totalRevenue)}
                icon="money"
                variant="emerald"
                subtext="Earnings from your own projects"
              />

              <StatCard
                title="Active Projects"
                value={
                  projects.filter((project) => project.status === "ACTIVE")
                    .length
                }
                icon="clock"
                variant="amber"
                subtext="View active projects"
              />

              <StatCard
                title="Pending Projects"
                value={
                  projects.filter((project) => project.status === "PENDING")
                    .length
                }
                icon="clock"
                variant="violet"
                subtext="View pending projects"
              />
            </div>

            <div className={styles.allProjects}>
              <RecentProjectsTable projects={recentProjects} />
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.emptyContainer}>
          <div className={styles.emptyContent}>
            <div className={styles.welcomeText}>
              <h2 className={styles.welcomeTitle}>
                Hey, what will you build today? 👋
              </h2>
              <p className={styles.welcomeSubtitle}>
                Get started by creating your first project or exploring how
                Workhub can help you.
              </p>
            </div>

            <div className={styles.emptyGrid}>
              <div
                className={styles.mainCreateCard}
                onClick={() => setIsOpen(true)}
              >
                <div className={styles.cardIconMain}>+</div>
                <div className={styles.cardInfo}>
                  <h3>Create New Project</h3>
                  <p>Start a new freelance task from scratch.</p>
                </div>
              </div>

              <div className={`${styles.guideCard} ${styles.disabledCard}`}>
                <div className={styles.guideIcon}>
                  <Icon name="team" />
                </div>
                <div className={styles.cardInfo}>
                  <h3>Import from GitHub</h3>
                  <p>Coming soon: Sync your repositories.</p>
                </div>
              </div>

              <div className={`${styles.guideCard} ${styles.disabledCard}`}>
                <div className={styles.guideIcon}>
                  <Icon name="calendar" />
                </div>
                <div className={styles.cardInfo}>
                  <h3>Quick Guide</h3>
                  <p>Learn how to track your earnings.</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.emptyFooter}>
            <div className={styles.footerSection}>
              <h4>Helpful Resources</h4>
              <ul className={styles.footerLinks}>
                <li>
                  <Icon name="projects" /> How to manage projects?
                </li>
                <li>
                  <Icon name="calendar" /> Setting up deadlines
                </li>
                <li>
                  <Icon name="team" /> Managing clients
                </li>
              </ul>
            </div>

            <div className={styles.footerStats}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>System Status</span>
                <span className={styles.statValue}>
                  All systems operational
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Last Sync</span>
                <span className={styles.statValue}>Just now</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
