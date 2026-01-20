export type NotificationType = 
  | "INFO" 
  | "PROJECT_INVITE" 
  | "TASK_COMPLETED" 
  | "RESOURCE_ADDED";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string | null;
  isRead: boolean;
  createdAt: string | Date;
}