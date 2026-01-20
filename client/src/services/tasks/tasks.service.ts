import {
  CreatePersonalTaskInput,
  PersonalTask,
  UpdatePersonalTaskInput,
} from "../../types/tasks.type";
import api from "../api/api";

export const TaskService = {
  /**
   * Belirli bir tarih aralığındaki görevleri getir (Takvim için)
   */
  async getTasksByDateRange(
    start: string,
    end: string,
  ): Promise<PersonalTask[]> {
    const response = await api.get("/tasks/calendar", {
      params: { start, end },
    });
    return response.data.data;
  },

  /**
   * Tüm kişisel görevleri getir
   */
  async getPersonalTasks(): Promise<PersonalTask[]> {
    const response = await api.get("/tasks");
    return response.data.data;
  },

  /**
   * Yeni görev oluştur
   */
  async createPersonalTask(
    data: CreatePersonalTaskInput,
  ): Promise<PersonalTask> {
    const response = await api.post("/tasks", data);
    return response.data.data;
  },

  /**
   * Görevi güncelle (Title, Priority, isDone, DueDate)
   * BACKEND PATCH beklediği için PATCH olarak güncellendi.
   */
  async updatePersonalTask(
    id: string,
    data: UpdatePersonalTaskInput,
  ): Promise<void> {
    // BURASI DÜZELTİLDİ: api.put -> api.patch
    await api.patch(`/tasks/${id}`, data);
  },

  /**
   * Görevi sil
   */
  async deletePersonalTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  /**
   * Durum değiştirme (Tamamlandı/Tamamlanmadı)
   * updatePersonalTask ile aynı rotayı kullanır.
   */
  async toggleTaskStatus(id: string, currentStatus: boolean) {
    // Backend rotası: PATCH /tasks/:id
    const response = await api.patch(`/tasks/${id}`, {
      isDone: !currentStatus,
    });

    return response.data;
  },
};
