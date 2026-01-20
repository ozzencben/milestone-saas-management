import prisma from "../config/prisma.js";
import {
  CreatePersonalTaskInput,
  UpdatePersonalTaskInput,
} from "../types/tasks.type.js";

export class TaskService {
  // Kullanıcının tüm kişisel görevlerini getir
  static async getPersonalTasks(userId: string) {
    return await prisma.personalTask.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  // Yeni kişisel görev oluştur
  static async createPersonalTask(
    userId: string,
    data: CreatePersonalTaskInput,
  ) {
    return await prisma.personalTask.create({
      data: {
        title: data.title,
        priority: data.priority || "MEDIUM",
        // Tarih string gelirse Date objesine çeviriyoruz, yoksa null
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        userId: userId,
      },
    });
  }

  // Takvim için belirli tarih aralığındaki görevleri getir
  static async getTasksByDateRange(userId: string, start: Date, end: Date) {
    return await prisma.personalTask.findMany({
      where: {
        userId: userId,
        dueDate: {
          gte: start,
          lte: end,
        },
      },
      // Takvimde düzgün sıralanması için tarihe göre sıralıyoruz
      orderBy: { dueDate: "asc" },
    });
  }

  // Görevi güncelle (isDone, title, priority veya dueDate)
  static async updatePersonalTask(
    taskId: string,
    userId: string,
    data: UpdatePersonalTaskInput,
  ) {
    // dueDate güncelleniyorsa Date objesine çevrilmeli
    const updateData = { ...data } as any;
    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate);
    }

    // Prisma updateMany, where içindeki tüm kriterlere uyanları günceller
    // Güvenlik: Sadece sahibi olan kullanıcı güncelleyebilir
    return await prisma.personalTask.updateMany({
      where: {
        id: taskId,
        userId: userId,
      },
      data: updateData,
    });
  }

  // Görevi sil
  static async deletePersonalTask(taskId: string, userId: string) {
    return await prisma.personalTask.deleteMany({
      where: {
        id: taskId,
        userId: userId,
      },
    });
  }
}
