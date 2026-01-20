"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface DashboardContextType {
  isCollapsed: boolean; // Masaüstü dar mod kontrolü
  isMobileOpen: boolean; // Mobil açılır menü kontrolü
  toggleSidebar: () => void;
  closeMobileMenu: () => void;
  isMobile: boolean; // Ekranın o an mobil olup olmadığı bilgisi
}

export const DashboardContext = createContext<DashboardContextType | null>(
  null
);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 1. Ekran boyutunu takip eden mekanizma
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024; // Tablet ve altı mobil sayılır
      setIsMobile(mobile);

      if (!mobile) {
        setIsMobileOpen(false); // Masaüstüne geçince mobil menüyü kapat
      }
    };

    handleResize(); // İlk açılışta kontrol et
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 2. Akıllı Toggle Fonksiyonu
  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  }, [isMobile]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        isCollapsed,
        isMobileOpen,
        toggleSidebar,
        closeMobileMenu,
        isMobile,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context)
    throw new Error("useDashboard must be used within a DashboardProvider");
  return context;
};
