"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { TaskService } from "../../../services/tasks/tasks.service";
import { PersonalTask, Priority } from "../../../types/tasks.type";
import { Icon } from "../../icons/Icon";
import styles from "./PersonalTasks.module.css";

export default function PersonalTasks() {
  const [tasks, setTasks] = useState<PersonalTask[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [deadline, setDeadline] = useState("");
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 768 ? 4 : 12);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await TaskService.getPersonalTasks();
        setTasks(data);
      } catch {
        toast.error("Failed to load tasks");
      }
    };
    fetchTasks();
  }, []);

  const currentTasks = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return tasks.slice(indexOfFirstItem, indexOfLastItem);
  }, [tasks, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(tasks.length / itemsPerPage);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const newTask = await TaskService.createPersonalTask({
        title,
        priority,
        dueDate: deadline ? new Date(deadline).toISOString() : undefined,
      });
      setTasks((prev) => [newTask, ...prev]);
      setTitle("");
      setDeadline("");
      setIsSelectOpen(false);
      setCurrentPage(1);
      toast.success("Task added with deadline");
    } catch {
      toast.error("Error adding task");
    }
  };

  const handleUpdateTitle = async (id: string) => {
    // Eğer değer değişmediyse veya boşsa işlemi iptal et ve modu kapat
    const originalTask = tasks.find((t) => t.id === id);
    if (!editValue.trim() || editValue === originalTask?.title) {
      setEditingId(null);
      return;
    }

    try {
      // Backend'e gönder
      await TaskService.updatePersonalTask(id, { title: editValue.trim() });

      // State'i güncelle
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, title: editValue.trim() } : t)),
      );

      setEditingId(null);
      toast.success("Updated successfully");
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Update failed");
      // Hata durumunda eski değeri geri yüklemek istersen editingId(null) yapabilirsin
      setEditingId(null);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      // Servisi çağırıyoruz
      await TaskService.toggleTaskStatus(id, currentStatus);

      // UI'ı anlık güncelle
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isDone: !currentStatus } : t)),
      );

      toast.success(!currentStatus ? "Task completed!" : "Task opened!");
    } catch (error) {
      console.error("Toggle error details:", error);
      toast.error("Status update failed");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await TaskService.deletePersonalTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDeadline = (date: string | Date | null | undefined) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <div className={styles.iconWrapper}>
            <Icon name="tasks" size={22} />
          </div>
          <div>
            <h3>Personal Focus</h3>
            <p>Your daily private micro-tasks</p>
          </div>
        </div>
        <div className={styles.badge}>{tasks.length} Total</div>
      </div>

      <form onSubmit={handleAdd} className={styles.addForm}>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.mainInput}
          />
          <input
            type="date"
            className={styles.dateInput}
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
        <div className={styles.formControls}>
          <div className={styles.customSelectContainer}>
            <div
              className={styles.selectSelected}
              onClick={() => setIsSelectOpen(!isSelectOpen)}
            >
              <span
                className={`${styles.dot} ${styles[priority.toLowerCase()]}`}
              ></span>
              <span className={styles.selectText}>{priority}</span>
              <div
                className={`${styles.arrow} ${isSelectOpen ? styles.arrowUp : ""}`}
              >
                <Icon name="logout" size={10} />
              </div>
            </div>
            {isSelectOpen && (
              <div className={styles.selectOptions}>
                {(["LOW", "MEDIUM", "HIGH"] as Priority[]).map((p) => (
                  <div
                    key={p}
                    className={styles.selectOption}
                    onClick={() => {
                      setPriority(p);
                      setIsSelectOpen(false);
                    }}
                  >
                    <span
                      className={`${styles.dot} ${styles[p.toLowerCase()]}`}
                    ></span>
                    {p}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit" className={styles.submitBtn}>
            Add Task
          </button>
        </div>
      </form>

      <div className={styles.grid}>
        {currentTasks.map((task) => (
          <div
            key={task.id}
            className={`${styles.card} ${task.isDone ? styles.done : ""}`}
          >
            <div className={styles.cardHeader}>
              <div className={styles.tagsRow}>
                <span
                  className={`${styles.tag} ${styles[task.priority.toLowerCase()]}`}
                >
                  {task.priority}
                </span>
                {task.dueDate && (
                  <span className={styles.deadlineTag}>
                    <Icon name="calendar" size={10} />{" "}
                    {formatDeadline(task.dueDate)}
                  </span>
                )}
              </div>
              <div className={styles.cardActions}>
                <button
                  className={styles.actionBtn}
                  onClick={() => {
                    setEditingId(task.id);
                    setEditValue(task.title);
                  }}
                >
                  <Icon name="settings" size={14} />
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className={styles.deleteBtn}
                >
                  <Icon name="logout" size={14} />
                </button>
              </div>
            </div>
            <div className={styles.cardBody}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={task.isDone}
                  onChange={() => handleToggle(task.id, task.isDone)}
                />
                <span className={styles.checkmark}></span>
              </label>
              <div className={styles.contentArea}>
                {editingId === task.id ? (
                  <textarea
                    autoFocus
                    className={styles.editInput}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleUpdateTitle(task.id)} // Dışarı tıklayınca kaydet
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault(); // Alt satıra geçmeyi engelle
                        handleUpdateTitle(task.id);
                      }
                      if (e.key === "Escape") {
                        setEditingId(null); // Vazgeçme seçeneği
                      }
                    }}
                  />
                ) : (
                  <span className={styles.taskTitle}>{task.title}</span>
                )}
              </div>
            </div>
            <div className={styles.cardFooter}>
              <div className={styles.date}>
                <span>Created: {formatDate(task.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className={styles.pageBtn}
          >
            Prev
          </button>
          <div className={styles.pageInfo}>
            <span>{currentPage}</span> / <span>{totalPages}</span>
          </div>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className={styles.pageBtn}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
