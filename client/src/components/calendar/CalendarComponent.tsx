"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { useEffect, useState } from "react";
import { ProjectService } from "../../services/projects/project.service";
import { TaskService } from "../../services/tasks/tasks.service";
import { PersonalTask } from "../../types/tasks.type";
import { Icon } from "../icons/Icon";
import styles from "./Calendar.module.css";

interface Project {
  id: string;
  name: string;
  deadline: string | Date | null;
}

export default function CalendarComponent() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<PersonalTask[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Fetch data when month changes
  useEffect(() => {
    const fetchCalendarData = async () => {
      const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }).toISOString();
      const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }).toISOString();

      try {
        const [taskData, projectData] = await Promise.all([
          TaskService.getTasksByDateRange(start, end),
          ProjectService.getProjects(),
        ]);

        setTasks(taskData);
        setProjects(projectData.filter((p: Project) => p.deadline));
      } catch (error) {
        console.error("Calendar data fetch error:", error);
      }
    };

    fetchCalendarData();
  }, [currentMonth]);

  // Selected Day Filters
  const selectedDayTasks = tasks.filter(
    (t) => t.dueDate && isSameDay(new Date(t.dueDate), selectedDate)
  );
  const selectedDayProjects = projects.filter(
    (p) => p.deadline && isSameDay(new Date(p.deadline), selectedDate)
  );

  const handleQuickAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const newTask = await TaskService.createPersonalTask({
        title: newTaskTitle,
        dueDate: selectedDate.toISOString(),
        priority: "MEDIUM",
      });
      setTasks((prev) => [...prev, newTask]);
      setNewTaskTitle("");
      setIsAddingTask(false);
    } catch (error) {
      console.error("Task creation failed:", error);
    }
  };

  const renderHeader = () => (
    <div className={styles.header}>
      <div className={styles.monthInfo}>
        <h2>{format(currentMonth, "MMMM yyyy", { locale: enUS })}</h2>
      </div>
      <div className={styles.nav}>
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <Icon name="logout" size={16} className={styles.rotateLeft} />
        </button>
        <button className={styles.todayBtn} onClick={() => {
            const today = new Date();
            setCurrentMonth(today);
            setSelectedDate(today);
        }}>
          Today
        </button>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <Icon name="logout" size={16} />
        </button>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return (
      <div className={styles.daysRow}>
        {days.map((d) => (
          <div key={d} className={styles.dayName}>{d}</div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className={styles.calendarGrid}>
        {calendarDays.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isSelected = isSameDay(day, selectedDate);
          const dayTasks = tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), day));
          const dayProjects = projects.filter((p) => p.deadline && isSameDay(new Date(p.deadline), day));

          return (
            <div
              key={idx}
              className={`${styles.cell} ${!isCurrentMonth ? styles.disabled : ""} ${
                isSelected ? styles.selected : ""
              }`}
              onClick={() => setSelectedDate(day)}
            >
              <span className={styles.dayNumber}>{format(day, "d")}</span>
              <div className={styles.eventContainer}>
                {dayProjects.slice(0, 2).map((project) => (
                  <div key={project.id} className={`${styles.miniEvent} ${styles.projectEvent}`}>
                    <Icon name="settings" size={10} /> {project.name}
                  </div>
                ))}
                {dayTasks.slice(0, 2).map((task) => (
                  <div key={task.id} className={`${styles.miniEvent} ${styles[task.priority.toLowerCase()]}`}>
                    {task.title}
                  </div>
                ))}
                {(dayTasks.length + dayProjects.length) > 4 && (
                    <span className={styles.moreCount}>+{(dayTasks.length + dayProjects.length) - 4} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.mainWrapper}>
      <div className={styles.container}>
        {renderHeader()}
        <div className={styles.calendarBody}>
          {renderDays()}
          {renderCells()}
        </div>
      </div>

      <div className={styles.sidePanel}>
        <div className={styles.panelHeader}>
          <h3>{format(selectedDate, "eeee, MMM d", { locale: enUS })}</h3>
          <p>Daily Overview</p>
        </div>

        <div className={styles.panelContent}>
          {selectedDayProjects.length > 0 && (
            <div className={styles.panelSection}>
              <h4>Projects</h4>
              {selectedDayProjects.map((p) => (
                <div key={p.id} className={styles.panelProjectItem}>
                  <Icon name="settings" size={14} />
                  <span>{p.name}</span>
                </div>
              ))}
            </div>
          )}

          <div className={styles.panelSection}>
            <div className={styles.sectionHeader}>
              <h4>Tasks</h4>
              <button onClick={() => setIsAddingTask(true)} className={styles.addBtn}>
                 +
              </button>
            </div>

            {isAddingTask && (
              <form onSubmit={handleQuickAddTask} className={styles.quickAddForm}>
                <input
                  autoFocus
                  placeholder="New task title..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onBlur={() => !newTaskTitle && setIsAddingTask(false)}
                />
              </form>
            )}

            <div className={styles.taskList}>
                {selectedDayTasks.length > 0 ? (
                selectedDayTasks.map((t) => (
                    <div key={t.id} className={styles.panelTaskItem}>
                    <div className={`${styles.statusDot} ${styles[t.priority.toLowerCase()]}`} />
                    <span className={t.isDone ? styles.done : ""}>{t.title}</span>
                    </div>
                ))
                ) : (
                !isAddingTask && <p className={styles.emptyText}>No tasks for this day.</p>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}