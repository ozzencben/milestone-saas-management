export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface PersonalTask {
  id: string;
  title: string;
  isDone: boolean;
  priority: Priority;
  dueDate: string | null | Date;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Yeni görev oluştururken gönderilecek veri tipi
export interface CreatePersonalTaskInput {
  title: string;
  priority?: Priority;
  dueDate?: string | Date;
}

// Güncelleme yaparken kullanılacak veri tipi (Partial tüm alanları opsiyonel yapar)
export interface UpdatePersonalTaskInput {
  title?: string;
  isDone?: boolean;
  priority?: Priority;
  dueDate?: string | Date;
}

// Task sayfasındaki genel görünüm için birleşik bir tip (Opsiyonel)
export interface GlobalTaskStats {
  totalPersonalTasks: number;
  completedPersonalTasks: number;
  pendingPersonalTasks: number;
}
