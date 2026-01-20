import { NextFunction, Request, Response } from "express";
import { TaskService } from "../services/tasks.service.js";

// Tüm kişisel görevleri getir
export const getPersonalTasks = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tasks = await TaskService.getPersonalTasks(req.userId!);
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

// Takvim için tarih aralığına göre görevleri getir (YENİ)
export const getCalendarTasks = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: "Start and end dates are required",
      });
    }

    // Query'den gelen string tarihleri Date objesine dönüştürüyoruz
    const startDate = new Date(start as string);
    const endDate = new Date(end as string);

    const tasks = await TaskService.getTasksByDateRange(
      req.userId!,
      startDate,
      endDate,
    );

    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

// Yeni kişisel görev oluştur
export const createPersonalTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // req.body içinde artık dueDate de gelebilir
    const task = await TaskService.createPersonalTask(req.userId!, req.body);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// Görevi güncelle
export const updatePersonalTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    // req.body içinde güncellenmiş dueDate, priority vb. olabilir
    await TaskService.updatePersonalTask(id as string, req.userId!, req.body);
    res.status(200).json({ success: true, message: "Task updated" });
  } catch (error) {
    next(error);
  }
};

// Görevi sil
export const deletePersonalTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    await TaskService.deletePersonalTask(id as string, req.userId!);
    res.status(200).json({ success: true, message: "Task deleted" });
  } catch (error) {
    next(error);
  }
};
