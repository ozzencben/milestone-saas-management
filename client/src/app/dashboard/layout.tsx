"use client";

import { ReactNode, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Topbar from "../../components/topbar/Topbar";
import { getSocket } from "../../config/socket";
import { useAuth } from "../../context/auth/AuthContext";
import styles from "./layout.module.css";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      const socket = getSocket();

      socket.connect();
      socket.emit("join", user.id);

      socket.on("connect", () => {
        console.log("Socket connected");
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user?.id]);

  return (
    <div className={styles.container}>
      <Topbar />

      <div className={styles.mainLayout}>
        <Sidebar />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
