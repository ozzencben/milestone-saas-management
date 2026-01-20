"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Icon } from "../../../../components/icons/Icon";
import ActivityLog from "../../../../components/projects/activityLogs/ActivityLog";
import MemberInvite from "../../../../components/projects/memberInvite/MemberInvite";
import { getSocket } from "../../../../config/socket";
import { useAuth } from "../../../../context/auth/AuthContext";
import { ProjectService } from "../../../../services/projects/project.service";
import {
  Activity,
  ChecklistItem,
  Project,
  ProjectStatus,
  ResourceType,
  UpdateProjectInput,
} from "../../../../types/project.type";
import { User } from "../../../../types/user";
import { getDeadlineStatus } from "../../../../utils/getDeadlineStatus";
import styles from "./page.module.css";

export default function ProjectDetail() {
  const { user } = useAuth();

  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const projectId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [projectData, setProjectData] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [confirmMemberId, setConfirmMemberId] = useState<string | null>(null);

  const [activities, setActivities] = useState<Activity[]>([]);

  const isOwner = user && projectData && user.id === projectData.ownerId;

  // --- Filtreleme ve Pagination State'leri ---
  const [checklistFilter, setChecklistFilter] = useState<
    "ALL" | "DONE" | "TODO"
  >("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8; // Sayfa başına gösterilecek madde sayısı

  const [isAddingResource, setIsAddingResource] = useState(false);
  const [newResource, setNewResource] = useState({
    title: "",
    url: "",
    type: "LINK" as ResourceType,
    file: null as File | null,
  });

  const fetchProjectDetail = useCallback(async () => {
    try {
      const data = await ProjectService.getProjectById(id);
      const logs = await ProjectService.getProjectActivities(id);
      setProjectData(data);
      setActivities(logs);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Beklenmedik bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [id]); // id değişirse fonksiyon güncellenir

  useEffect(() => {
    if (id) fetchProjectDetail();
  }, [id, fetchProjectDetail]); // Artık gönül rahatlığıyla ekleyebiliriz

  useEffect(() => {
    const socket = getSocket();

    // Backend'de "Notification" dışında özel bir event de fırlatabiliriz
    // ya da gelen bildirimin tipini kontrol edebiliriz.
    socket.on("new_notification", (notification) => {
      // Eğer gelen bildirim "çıkarılma" bildirimi ise
      // VE kullanıcı şu an o projenin sayfasındaysa
      const isRemoval = notification.title === "Removed from Project";
      const isCurrentProject = notification.link === "/dashboard/projects";
      // Backend'de removeMember içinde linki "/dashboard/projects" yapmıştık

      if (
        isRemoval &&
        isCurrentProject &&
        window.location.pathname.includes(projectId)
      ) {
        toast.error("Your access to this project has been revoked.");
        router.push("/dashboard/projects");
      }
    });

    return () => {
      socket.off("new_notification");
    };
  }, [projectId, router]);

  const handleUpdateProject = async (fields: UpdateProjectInput) => {
    if (!isOwner) {
      toast.error("You don't have permission to update this project.");
      return;
    }

    try {
      const updated = await ProjectService.updateProject(id, fields);
      setProjectData((prev) => (prev ? { ...prev, ...updated } : updated));
      setIsEditingTitle(false);
      setIsEditingDesc(false);
      setIsEditingDeadline(false);
      setIsEditingBudget(false);
      setIsStatusOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Güncelleme başarısız.");
      setIsEditingTitle(false);
      setIsEditingDesc(false);
      setIsEditingDeadline(false);
      setIsEditingBudget(false);
    }
  };

  const handleAddChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;
    try {
      const newItem = await ProjectService.addChecklistItem(
        id,
        newChecklistTitle,
      );
      setProjectData((prev) =>
        prev
          ? { ...prev, checklist: [...(prev.checklist || []), newItem] }
          : null,
      );
      setNewChecklistTitle("");
      // Yeni ekleyince görebilmesi için filtreyi sıfırla
      setChecklistFilter("ALL");
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCheck = async (item: ChecklistItem) => {
    try {
      const updated = await ProjectService.updateChecklistItem(id, item.id, {
        isDone: !item.isDone,
      });
      updateLocalChecklist(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUrgent = async (item: ChecklistItem) => {
    try {
      const updated = await ProjectService.updateChecklistItem(id, item.id, {
        isUrgent: !item.isUrgent, // Mevcut durumun tersini gönderiyoruz
      });
      updateLocalChecklist(updated); // State'i güncelliyoruz
    } catch (err) {
      console.error("Öncelik güncellenemedi:", err);
    }
  };

  const handleUpdateCheckTitle = async (itemId: string) => {
    if (!editValue.trim()) {
      setEditingItemId(null);
      return;
    }
    try {
      const updated = await ProjectService.updateChecklistItem(id, itemId, {
        title: editValue,
      });
      updateLocalChecklist(updated);
      setEditingItemId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCheck = async (itemId: string) => {
    try {
      // Silme işlemini başlatan promise
      const deletePromise = ProjectService.deleteChecklistItem(id, itemId);

      // Toast bildirimi ve işlemin tamamlanmasını bekle
      await toast.promise(deletePromise, {
        loading: "Deleting...",
        success: "Item deleted!",
        error: "Item could not be deleted.",
      });

      // Local state güncelleme
      setProjectData((prev) =>
        prev
          ? {
              ...prev,
              checklist: prev.checklist?.filter((i) => i.id !== itemId),
            }
          : null,
      );

      // Onay modunu kapat
      setConfirmDeleteId(null);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const updateLocalChecklist = (updatedItem: ChecklistItem) => {
    setProjectData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        checklist: prev.checklist?.map((i) =>
          i.id === updatedItem.id ? updatedItem : i,
        ),
      };
    });
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newResource.type === "LINK" && !newResource.url) return;
    if (newResource.type === "FILE" && !newResource.file) return;

    setUploading(true);
    try {
      const added = await ProjectService.addResource(id, {
        title: newResource.title,
        url: newResource.url,
        type: newResource.type,
        file: newResource.file || undefined,
      });
      setProjectData((prev) =>
        prev
          ? { ...prev, resources: [...(prev.resources || []), added] }
          : null,
      );
      setNewResource({ title: "", url: "", type: "LINK", file: null });
      setIsAddingResource(false);
    } catch (err) {
      // alert sadece tek bir string alır.
      // Hata detayını görmek istersen string içine gömebilirsin.
      toast.error(
        `An error occurred while adding the source: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      console.error(err); // Detaylı log için konsolu kullanmak daha sağlıklıdır.
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm("Bu kaynağı silmek istediğinize emin misiniz?")) return;
    try {
      await ProjectService.deleteResource(id, resourceId);
      setProjectData((prev) =>
        prev
          ? {
              ...prev,
              resources: prev.resources?.filter((r) => r.id !== resourceId),
            }
          : null,
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.warn(
        "The file could not be downloaded; it opens in a new tab:",
        error,
      );
      window.open(url, "_blank");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const removePromise = ProjectService.removeMember(id, memberId);
      await toast.promise(removePromise, {
        loading: "Üye çıkarılıyor...",
        success: "Üye başarıyla çıkarıldı!",
        error: "Çıkarma işlemi başarısız.",
      });

      setProjectData((prev: Project | null) =>
        prev
          ? {
              ...prev,
              members: prev.members?.filter((m: User) => m.id !== memberId),
            }
          : null,
      );
      setConfirmMemberId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Mantıksal Hesaplamalar ---
  const progress = projectData?.checklist?.length
    ? Math.round(
        (projectData.checklist.filter((i) => i.isDone).length /
          projectData.checklist.length) *
          100,
      )
    : 0;

  const filteredChecklist =
    projectData?.checklist?.filter((item) => {
      if (checklistFilter === "DONE") return item.isDone;
      if (checklistFilter === "TODO") return !item.isDone;
      return true;
    }) || [];

  const totalPages = Math.ceil(filteredChecklist.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedChecklist = filteredChecklist.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const dlStatus = getDeadlineStatus(projectData?.deadline);

  if (loading) return <div className={styles.center}>Yükleniyor...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!projectData)
    return <div className={styles.notFound}>Proje bulunamadı.</div>;

  console.log("projectData", projectData);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.projectIcon}>
            {projectData.name.charAt(0).toUpperCase()}
          </div>
          <div className={styles.titleArea}>
            {isOwner && isEditingTitle ? (
              <input
                className={styles.inlineTitleInput}
                defaultValue={projectData.name}
                onBlur={(e) => handleUpdateProject({ name: e.target.value })}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  handleUpdateProject({ name: e.currentTarget.value })
                }
                autoFocus
              />
            ) : (
              <div className={styles.titleWithAction}>
                <h1>{projectData.name}</h1>
                {isOwner && (
                  <button
                    className={styles.editIconBtn}
                    onClick={() => setIsEditingTitle(true)}
                  >
                    ✎
                  </button>
                )}
              </div>
            )}
            <p className={styles.subText}>
              {projectData.type} Project • Owner: {projectData.owner?.firstname}
            </p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.statusDropdownContainer}>
            <span
              className={`${styles.statusBadge} ${styles[projectData.status.toLowerCase()]}`}
              onClick={() => setIsStatusOpen(!isStatusOpen)}
            >
              {projectData.status} ▾
            </span>
            {isOwner && isStatusOpen && (
              <div className={styles.statusMenu}>
                {(["ACTIVE", "PENDING", "COMPLETED"] as ProjectStatus[]).map(
                  (s) => (
                    <div
                      key={s}
                      onClick={() => handleUpdateProject({ status: s })}
                    >
                      {s}
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className={styles.contentLayout}>
        <main className={styles.mainContent}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <label>Budget</label>
              {projectData.type === "PAID" ? (
                isOwner && isEditingBudget ? (
                  <div className={styles.budgetEditWrapper}>
                    <input
                      type="number"
                      className={styles.inlineBudgetInput}
                      defaultValue={projectData.price}
                      onBlur={(e) =>
                        handleUpdateProject({ price: Number(e.target.value) })
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        handleUpdateProject({
                          price: Number(e.currentTarget.value),
                        })
                      }
                      autoFocus
                    />
                    <span className={styles.currencySuffix}>
                      {projectData.currency}
                    </span>
                  </div>
                ) : (
                  <div
                    className={styles.editableValue}
                    onClick={() => setIsEditingBudget(true)}
                  >
                    <p>
                      {Number(projectData.price).toLocaleString()}{" "}
                      {projectData.currency}{" "}
                      <span className={styles.miniEditIcon}>✎</span>
                    </p>
                  </div>
                )
              ) : (
                <div className={styles.lockedValue}>
                  <p>Free / Personal</p>
                </div>
              )}
            </div>

            <div className={styles.statCard}>
              <div className={styles.deadlineWrapper}>
                <label>Deadline</label>

                {dlStatus && (
                  <span
                    className={`${styles.deadlineBadge} ${styles[dlStatus.color]}`}
                  >
                    {dlStatus.days === 0
                      ? "Today!"
                      : dlStatus.days < 0
                        ? "Delayed"
                        : `${dlStatus.days} days left`}
                  </span>
                )}
              </div>
              {isOwner && isEditingDeadline ? (
                <div className={styles.deadlineEditWrapper}>
                  <input
                    type="date"
                    className={styles.inlineDeadlineInput}
                    defaultValue={
                      projectData.deadline
                        ? new Date(projectData.deadline)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur();
                      if (e.key === "Escape") setIsEditingDeadline(false);
                    }}
                    onBlur={async (e) => {
                      const val = e.target.value;
                      if (isEditingDeadline && val) {
                        setIsEditingDeadline(false);
                        await handleUpdateProject({
                          deadline: new Date(val).toISOString(),
                        });
                      } else setIsEditingDeadline(false);
                    }}
                    autoFocus
                  />
                </div>
              ) : (
                <div
                  className={styles.editableValue}
                  onClick={() => setIsEditingDeadline(true)}
                >
                  <p>
                    {projectData.deadline
                      ? new Date(projectData.deadline).toLocaleDateString(
                          "tr-TR",
                        )
                      : "Set Deadline"}{" "}
                    {isOwner && <span className={styles.miniEditIcon}>✎</span>}
                  </p>
                </div>
              )}
            </div>
          </div>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Description</h3>
              {isOwner && (
                <button
                  className={styles.editIconBtn}
                  onClick={() => setIsEditingDesc(true)}
                >
                  ✎
                </button>
              )}
            </div>
            {isEditingDesc ? (
              <textarea
                className={styles.inlineTextArea}
                defaultValue={projectData.description || ""}
                onBlur={(e) =>
                  handleUpdateProject({ description: e.target.value })
                }
                autoFocus
              />
            ) : (
              <p className={styles.descriptionText}>
                {projectData.description || "No description yet."}
              </p>
            )}
          </section>

          <section className={styles.section}>
            <div className={styles.checklistHeader}>
              <div className={styles.checklistTitleGroup}>
                <h3>Checklist ({progress}%)</h3>
                <div className={styles.filterGroup}>
                  {(["ALL", "TODO", "DONE"] as const).map((f) => (
                    <button
                      key={f}
                      className={`${styles.filterTab} ${checklistFilter === f ? styles.activeFilter : ""}`}
                      onClick={() => {
                        setChecklistFilter(f);
                        setCurrentPage(1);
                      }}
                    >
                      {f === "ALL"
                        ? "ALL"
                        : f === "TODO"
                          ? "To Be Done"
                          : "Done"}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.progressContainer}>
                <div
                  className={styles.progressBar}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className={styles.checklistItems}>
              {paginatedChecklist.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.checkItem} ${item.isDone ? styles.done : ""} ${item.isUrgent ? styles.urgent : ""}`}
                >
                  <div className={styles.checkItemContent}>
                    <div className={styles.checkItemLeft}>
                      <input
                        type="checkbox"
                        checked={item.isDone}
                        onChange={() => handleToggleCheck(item)}
                      />
                      {editingItemId === item.id ? (
                        <input
                          className={styles.editInput}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleUpdateCheckTitle(item.id)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleUpdateCheckTitle(item.id)
                          }
                          autoFocus
                        />
                      ) : (
                        <span
                          onDoubleClick={() => {
                            setEditingItemId(item.id);
                            setEditValue(item.title);
                          }}
                        >
                          {item.title}
                        </span>
                      )}
                    </div>
                    <div className={styles.itemActions}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => handleToggleUrgent(item)}
                      >
                        <Icon name="urgent" size={18} />
                      </button>

                      {/* ONAY MEKANİZMASI BAŞLANGICI */}
                      {confirmDeleteId === item.id ? (
                        <div className={styles.confirmGroup}>
                          <button
                            className={styles.confirmYesBtn}
                            onClick={() => handleDeleteCheck(item.id)}
                          >
                            Confirm
                          </button>
                          <button
                            className={styles.confirmNoBtn}
                            onClick={() => setConfirmDeleteId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            className={styles.actionBtn}
                            onClick={() => {
                              setEditingItemId(item.id);
                              setEditValue(item.title);
                            }}
                          >
                            <Icon name="edit" size={18} />
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => setConfirmDeleteId(item.id)} // Direkt silmek yerine onay modunu açar
                          >
                            <Icon name="delete" size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className={styles.itemMeta}>
                    <small>By: {item.createdBy?.firstname}</small>
                    {item.isDone && item.completedBy && (
                      <small className={styles.doneBy}>
                        {" • "} Done by: {item.completedBy.firstname}
                      </small>
                    )}
                  </div>
                </div>
              ))}
              {paginatedChecklist.length === 0 && (
                <p className={styles.emptyText}>
                  No substances matching this filter were found.
                </p>
              )}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  ←
                </button>
                <span>
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  →
                </button>
              </div>
            )}

            <form onSubmit={handleAddChecklist} className={styles.addForm}>
              <input
                type="text"
                placeholder="+ Add new task..."
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
              />
            </form>
          </section>
        </main>

        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarHeaderInline}>
              <h4>Members</h4>
              {isOwner && (
                <button
                  className={styles.addSmallBtn}
                  onClick={() => setIsAddingMember(!isAddingMember)} // Formu aç/kapat
                >
                  <Icon name={isAddingMember ? "close" : "plus"} />
                </button>
              )}
            </div>

            {/* YENİ: Davet Bileşeni */}
            {isOwner && isAddingMember && (
              <div className={styles.inviteSectionWrapper}>
                <MemberInvite
                  projectId={id}
                  onSuccess={() => {
                    fetchProjectDetail(); // Üye eklenince listeyi yenile
                    setIsAddingMember(false); // Formu kapat
                  }}
                />
              </div>
            )}

            <div className={styles.memberList}>
              {projectData.members?.map((member) => (
                <div key={member.id} className={styles.member}>
                  <div className={styles.avatar}>{member.firstname?.[0]}</div>
                  <div className={styles.memberInfo}>
                    <span>
                      {member.firstname} {member.lastname}
                    </span>
                    <small className={styles.roleBadge}>
                      {member.projectRole}
                    </small>
                  </div>

                  {isOwner && member.id !== user?.id && (
                    <div className={styles.memberActionArea}>
                      {confirmMemberId === member.id ? (
                        <div className={styles.memberConfirmGroup}>
                          <button
                            className={styles.memberYesBtn}
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            Sil
                          </button>
                          <button
                            className={styles.memberNoBtn}
                            onClick={() => setConfirmMemberId(null)}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          className={styles.memberActionBtn}
                          onClick={() => setConfirmMemberId(member.id)}
                        >
                          <Icon name="close" size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sidebarCard}>
            <div className={styles.sidebarHeaderInline}>
              <h4>Resources & Assets</h4>
              <button
                className={styles.addSmallBtn}
                onClick={() => setIsAddingResource(!isAddingResource)}
              >
                <Icon name={isAddingResource ? "close" : "plus"} />
              </button>
            </div>

            {isAddingResource && (
              <form
                onSubmit={handleAddResource}
                className={styles.resourceForm}
              >
                <input
                  type="text"
                  placeholder="Title (Optional)"
                  value={newResource.title || ""}
                  onChange={(e) =>
                    setNewResource({ ...newResource, title: e.target.value })
                  }
                />
                <select
                  value={newResource.type}
                  onChange={(e) =>
                    setNewResource({
                      ...newResource,
                      type: e.target.value as ResourceType,
                      url: "",
                      file: null,
                    })
                  }
                >
                  <option value="LINK">Web Link</option>
                  <option value="FILE">Local File</option>
                </select>
                {newResource.type === "LINK" ? (
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newResource.url || ""}
                    onChange={(e) =>
                      setNewResource({ ...newResource, url: e.target.value })
                    }
                    required
                  />
                ) : (
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) =>
                      setNewResource({
                        ...newResource,
                        file: e.target.files?.[0] || null,
                      })
                    }
                    required
                  />
                )}
                <button
                  type="submit"
                  className={styles.saveResourceBtn}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Add Resource"}
                </button>
              </form>
            )}

            <div className={styles.resourceList}>
              {projectData.resources?.map((resource) => (
                <div key={resource.id} className={styles.resourceWrapper}>
                  {resource.type === "FILE" ? (
                    <button
                      className={styles.resourceItem}
                      onClick={() =>
                        handleDownload(resource.url, resource.title)
                      }
                      style={{
                        background: "none",
                        border: "none",
                        textAlign: "left",
                        width: "100%",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      <div
                        className={`${styles.resourceIcon} ${styles.fileBg}`}
                      >
                        <Icon name="projects" />
                      </div>
                      <div className={styles.resourceText}>
                        <span>{resource.title}</span>
                        <small>
                          {resource.fileSize || "İndirmek için tıkla"}
                        </small>
                      </div>
                    </button>
                  ) : (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.resourceItem}
                    >
                      <div
                        className={`${styles.resourceIcon} ${styles.linkBg}`}
                      >
                        <Icon name="link" />
                      </div>
                      <div className={styles.resourceText}>
                        <span>{resource.title}</span>
                        <small>
                          {resource.url.replace("https://", "").split("/")[0]}
                        </small>
                      </div>
                    </a>
                  )}
                  <button
                    className={styles.deleteResourceBtn}
                    onClick={() => handleDeleteResource(resource.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sidebarCard}>
            <div className={styles.sidebarHeaderInline}>
              <h4 className={styles.sidebarHeader}>Recent Activity</h4>
            </div>
            <ActivityLog activities={activities} />
          </div>
        </aside>
      </div>
    </div>
  );
}
