"use client";

import Link from "next/link";
import { Icon } from "../components/icons/Icon";
import { useAuth } from "../context/auth/AuthContext";
import styles from "./page.module.css";

export default function WelcomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.container}>
      {/* --- Navbar --- */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <Icon name="tasks" size={24} />
          <span>Milestone</span>
        </div>
        <div className={styles.navLinks}>
          {isAuthenticated ? (
            <Link href="/dashboard" className={styles.primaryBtn}>
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className={styles.secondaryBtn}>
                Login
              </Link>
              <Link href="/register" className={styles.primaryBtn}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <header className={styles.hero}>
        <span className={styles.badge}>v1.0 is now live</span>
        <h1>
          Freelance Project Management <br /> <span>Made Simple</span>
        </h1>
        <p>
          The all-in-one platform for developers to manage projects, track
          tasks, and collaborate with clients effortlessly.
        </p>
        <div className={styles.heroActions}>
          <Link
            href={isAuthenticated ? "/dashboard" : "/register"}
            className={styles.mainBtn}
          >
            {isAuthenticated ? "Launch Dashboard" : "Start Building for Free"}
          </Link>
        </div>
      </header>

      {/* --- Mission Section (Projenin Görevi) --- */}
      <section className={styles.missionSection}>
        <div className={styles.missionContent}>
          <h2>Why Milestone?</h2>
          <p>
            Milestone was built specifically for freelance developers and small
            teams who are tired of jumping between spreadsheets, chat apps, and
            task managers. Our mission is to centralize your entire
            workflow—from the first line of the contract to the final project
            delivery.
          </p>
        </div>
      </section>

      {/* --- Features --- */}
      <section className={styles.features}>
        <div className={styles.featureCard}>
          <Icon name="settings" size={32} />
          <h3>Project CRUD</h3>
          <p>
            Full control over your projects. Create, update, and manage your
            portfolio with ease.
          </p>
        </div>
        <div className={styles.featureCard}>
          <Icon name="calendar" size={32} />
          <h3>Team Activation</h3>
          <p>
            Invite clients or collaborators. Manage permissions and work
            together in real-time.
          </p>
        </div>
        <div className={styles.featureCard}>
          <Icon name="tasks" size={32} />
          <h3>Task Management</h3>
          <p>
            Create personal tasks and project checklists to never miss a
            deadline.
          </p>
        </div>
      </section>

      {/* --- Roadmap --- */}
      <section className={styles.roadmap}>
        <div className={styles.sectionHeader}>
          <h2>Development Roadmap</h2>
          <p>
            Transparent look at what we&apos;ve built and what&apos;s coming
            next.
          </p>
        </div>
        <div className={styles.timeline}>
          <div className={styles.step}>
            <div className={styles.stepHeader}>
              <span className={styles.done}>Done</span>
              <h4>Core Infrastructure</h4>
            </div>
            <p>
              Auth system, Project CRUD, Notification engine, and Task creation
              are fully functional.
            </p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepHeader}>
              <span className={styles.ongoing}>In Progress</span>
              <h4>User Interaction</h4>
            </div>
            <p>
              Developing Profile management and advanced user interaction
              features.
            </p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepHeader}>
              <span className={styles.upcoming}>Next</span>
              <h4>Real-time Communication</h4>
            </div>
            <p>
              In-app Chat system and real-time collaboration tools for team
              members.
            </p>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>
            © {new Date().getFullYear()} Milestone Project. All rights reserved.
          </p>
          <p className={styles.creator}>
            Created by <a href="mailto:ozzencben@gmail.com">Özenç Dönmezer</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
