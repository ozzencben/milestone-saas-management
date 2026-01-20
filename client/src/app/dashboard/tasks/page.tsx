"use client";

import PersonalTasks from "../../../components/tasks/personalTask/PersonalTasks";
import TaskStatsTable from "../../../components/tasks/taskStatsTable/TaskStatsTable";
import styles from "./page.module.css";

export default function Tasks() {
  // İleride buraya kullanıcı adını çekebilirsin
  const userName = "Özenç";

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Workflow Management</h1>
        <p>
          Welcome back, {userName}. Here&apos;s what&apos;s happening with your
          projects today.
        </p>
      </header>

      <main className={styles.content}>
        {/* Üst Kısım: Kişisel Odak Alanı (Kartlar Yan Yana) */}
        <section>
          <PersonalTasks />
        </section>

        {/* Alt Kısım: Proje Analitiği (Modernize Edilmiş Tablo) */}
        <section>
          <TaskStatsTable />
        </section>
      </main>
    </div>
  );
}
