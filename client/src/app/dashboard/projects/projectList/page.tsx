"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "../../../../components/icons/Icon";
import CreateProjectForm from "../../../../components/projects/createProjectForm/CreateProjectForm";
import { ProjectService } from "../../../../services/projects/project.service";
import { Project, UpdateProjectInput } from "../../../../types/project.type";
import styles from "./page.module.css";
import { useAuth } from "../../../../context/auth/AuthContext";

export default function ProjectListPage() {
  const { user } = useAuth(); // Kullanıcı bilgisini aldık
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Filtre State'leri
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Custom Select Açık/Kapalı State'leri
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  // Ref'ler
  const menuRef = useRef<HTMLDivElement | null>(null);
  const statusRef = useRef<HTMLDivElement | null>(null);
  const typeRef = useRef<HTMLDivElement | null>(null);

  const loadProjects = async () => {
    try {
      const data = await ProjectService.getProjects();
      setProjects(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Click Outside Yönetimi
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (activeMenu && menuRef.current && !menuRef.current.contains(target)) {
        setActiveMenu(null);
      }
      if (isStatusOpen && statusRef.current && !statusRef.current.contains(target)) {
        setIsStatusOpen(false);
      }
      if (isTypeOpen && typeRef.current && !typeRef.current.contains(target)) {
        setIsTypeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenu, isStatusOpen, isTypeOpen]);

  const handleDeleteProject = async (projectId: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await ProjectService.deleteProject(projectId);
        loadProjects();
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };

  const handleUpdateProject = async (projectId: string, updateData: UpdateProjectInput) => {
    try {
      await ProjectService.updateProject(projectId, updateData);
      setActiveMenu(null);
      loadProjects();
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE": return styles.statusActive;
      case "COMPLETED": return styles.statusCompleted;
      case "PENDING": return styles.statusPending;
      default: return "";
    }
  };

  const getTypeClass = (type: string) => {
    switch (type?.toUpperCase()) {
      case "PAID": return styles.typePaid;
      case "PERSONAL": return styles.typePersonal;
      case "PORTFOLIO": return styles.typePortfolio;
      default: return "";
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    const matchesType = typeFilter === "ALL" || p.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // --- PROJELERİ AYRIŞTIRMA ---
  const ownedProjects = filteredProjects.filter((p) => p.ownerId === user?.id);
  const joinedProjects = filteredProjects.filter((p) => p.ownerId !== user?.id);

  const formatDate = (dateValue: string | Date | null | undefined) => {
    if (!dateValue) return "No Deadline";
    return new Date(dateValue).toLocaleDateString("tr-TR", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
  };

  if (loading)
    return (
      <div className={styles.loadingWrapper}>
        <span>Loading Projects...</span>
      </div>
    );

  // Kart render fonksiyonu (Tekrarı önlemek için)
  const renderProjectCard = (project: Project) => {
    const isOwner = project.ownerId === user?.id;

    return (
      <article key={project.id} className={`${styles.card} ${!isOwner ? styles.joinedCard : ""}`}>
        <div className={styles.cardHeader}>
          <div className={styles.progressBadge}>
            <Icon name={isOwner ? "projects" : "user"} />
            {!isOwner && <span className={styles.ownerName}>{project.owner?.firstname}</span>}
          </div>
          <div className={styles.actionWrapper}>
            <button
              className={styles.menuBtn}
              onClick={() => setActiveMenu(activeMenu === project.id ? null : project.id)}
            >
              ⋮
            </button>
            {activeMenu === project.id && (
              <div className={styles.dropdown} ref={menuRef}>
                <Link href={`/dashboard/projects/${project.id}`} className={styles.dropdownItem}>
                  <Icon name="search" /> View Details
                </Link>
                
                {/* Sadece Owner olanlar status/type güncelleyebilir ve silebilir */}
                {isOwner && (
                  <>
                    <div className={styles.divider}></div>
                    <p className={styles.dropdownLabel}>Status</p>
                    <button className={styles.dropdownItem} onClick={() => handleUpdateProject(project.id, { status: "ACTIVE" })}>
                      <div className={`${styles.statusDot} ${styles.dotActive}`}></div> Mark as Active
                    </button>
                    <button className={styles.dropdownItem} onClick={() => handleUpdateProject(project.id, { status: "COMPLETED" })}>
                      <div className={`${styles.statusDot} ${styles.dotCompleted}`}></div> Mark as Completed
                    </button>
                    <button className={styles.dropdownItem} onClick={() => handleUpdateProject(project.id, { status: "PENDING" })}>
                      <div className={`${styles.statusDot} ${styles.dotPending}`}></div> Mark as Pending
                    </button>
                    <div className={styles.divider}></div>
                    <p className={styles.dropdownLabel}>Type</p>
                    <button className={styles.dropdownItem} onClick={() => handleUpdateProject(project.id, { type: "PERSONAL" })}>
                      <Icon name="user" /> Personal {project.type === "PERSONAL" && "✓"}
                    </button>
                    <button className={styles.dropdownItem} onClick={() => handleUpdateProject(project.id, { type: "PORTFOLIO" })}>
                      <Icon name="projects" /> Portfolio {project.type === "PORTFOLIO" && "✓"}
                    </button>
                    <button className={styles.dropdownItem} onClick={() => handleUpdateProject(project.id, { 
                      type: "PAID", 
                      price: project.price && Number(project.price) > 0 ? project.price : 1 
                    })}>
                      <Icon name="money" /> Paid Project {project.type === "PAID" && "✓"}
                    </button>
                    <div className={styles.divider}></div>
                    <button className={`${styles.dropdownItem} ${styles.deleteBtn}`} onClick={() => handleDeleteProject(project.id)}>
                      <Icon name="delete" /> Delete Project
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={styles.cardContent}>
          <h3 className={styles.projectName}>{project.name}</h3>
          <div className={styles.tags}>
            <span className={`${styles.tag} ${getTypeClass(project.type)}`}>{project.type}</span>
            <span className={`${styles.tag} ${getStatusClass(project.status)}`}>{project.status}</span>
          </div>
        </div>

        <div className={styles.cardFooter}>
          <div className={styles.footerInfo}>
            <div className={styles.dateInfo}>
              <span className={styles.dateLabel}>Deadline:</span>
              <span className={styles.dateValue}>{formatDate(project.deadline)}</span>
            </div>
          </div>
          <div className={`${styles.priceTag} ${project.type !== "PAID" ? styles.personalPrice : ""}`}>
            {project.type === "PAID" ? `${Number(project.price).toLocaleString()} ${project.currency}` : "Internal"}
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className={styles.container}>
      {isOpen ? (
        <CreateProjectForm
          onClose={() => setIsOpen(false)}
          onSuccess={() => { setIsOpen(false); loadProjects(); }}
        />
      ) : (
        <>
          <header className={styles.headerArea}>
            <div>
              <h1>Workspace</h1>
              <p className={styles.subtitle}>Manage your own projects and collaborations</p>
            </div>
            <button onClick={() => setIsOpen(true)} className={styles.addProjectBtn}>
              + ADD PROJECT
            </button>
          </header>

          <section className={styles.filterBar}>
            <div className={styles.searchWrapper}>
              <Icon name="search" />
              <input
                type="text"
                placeholder="Search projects by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className={styles.filterGroup}>
              <div className={styles.customSelectWrapper} ref={statusRef}>
                <div className={styles.customSelectTrigger} onClick={() => setIsStatusOpen(!isStatusOpen)}>
                  <span>{statusFilter === "ALL" ? "All Status" : statusFilter}</span>
                  <div className={`${styles.chevron} ${isStatusOpen ? styles.chevronUp : ""}`}>▼</div>
                </div>
                {isStatusOpen && (
                  <div className={styles.customSelectMenu}>
                    {["ALL", "ACTIVE", "PENDING", "COMPLETED"].map((opt) => (
                      <div key={opt} className={`${styles.customOption} ${statusFilter === opt ? styles.selectedOpt : ""}`} onClick={() => { setStatusFilter(opt); setIsStatusOpen(false); }}>
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.customSelectWrapper} ref={typeRef}>
                <div className={styles.customSelectTrigger} onClick={() => setIsTypeOpen(!isTypeOpen)}>
                  <span>{typeFilter === "ALL" ? "All Types" : typeFilter}</span>
                  <div className={`${styles.chevron} ${isTypeOpen ? styles.chevronUp : ""}`}>▼</div>
                </div>
                {isTypeOpen && (
                  <div className={styles.customSelectMenu}>
                    {["ALL", "PAID", "PERSONAL", "PORTFOLIO"].map((opt) => (
                      <div key={opt} className={`${styles.customOption} ${typeFilter === opt ? styles.selectedOpt : ""}`} onClick={() => { setTypeFilter(opt); setIsTypeOpen(false); }}>
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {(searchTerm || statusFilter !== "ALL" || typeFilter !== "ALL") && (
                <button className={styles.clearBtn} onClick={clearFilters}>
                  <Icon name="delete" /> Reset
                </button>
              )}
            </div>
          </section>

          {/* SAHİBİ OLUNAN PROJELER */}
          <div className={styles.sectionWrapper}>
            <h2 className={styles.sectionTitle}>My Projects <span>{ownedProjects.length}</span></h2>
            <div className={styles.grid}>
              {ownedProjects.map(renderProjectCard)}
            </div>
          </div>

          {/* ÜYESİ OLUNAN PROJELER */}
          {joinedProjects.length > 0 && (
            <div className={styles.sectionWrapper}>
              <h2 className={styles.sectionTitle}>Collaborations <span>{joinedProjects.length}</span></h2>
              <div className={styles.grid}>
                {joinedProjects.map(renderProjectCard)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}