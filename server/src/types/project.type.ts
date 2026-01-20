import { UserProfileData } from "./user.type.js";

export type ProjectType = "PAID" | "PORTFOLIO" | "PERSONAL";
export type ProjectStatus = "ACTIVE" | "PENDING" | "COMPLETED";
export type ResourceType = "LINK" | "FILE";
export type ProjectRole = "DEVELOPER" | "CLIENT";

export interface ProjectMemberData extends UserProfileData {
  projectRole: ProjectRole; // Veritabanındaki ProjectMember.role alanından gelecek
}

export interface ActivityData {
  id: string;
  projectId: string;
  userId: string;
  user: UserProfileData;
  action: string;
  entityId?: string | null;
  entityName?: string | null;
  createdAt: Date | string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  isDone: boolean;
  isUrgent: boolean;

  // Takip alanları
  createdById: string;
  createdBy: UserProfileData; // Kim oluşturdu bilgisi

  completedById?: string | null;
  completedBy?: UserProfileData | null;

  projectId: string;

  createdAt: Date | string;
}

export interface ProjectResource {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  fileSize?: string | null;
  mimeType?: string | null;
  projectId: string;
  createdAt: Date;
}

export interface ProjectData {
  id: string;
  owner?: UserProfileData;
  ownerId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  type: ProjectType;
  price: number | string | any;
  currency: string;
  deadline: Date | null;
  checklist?: ChecklistItem[];
  resources?: ProjectResource[];
  members?: ProjectMemberData[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectInput {
  name: string;
  type: ProjectType;
  price?: number;
  currency?: string;
  deadline?: Date | null;
}

export interface UpdateProjectInput {
  name?: string;
  type?: ProjectType;
  price?: number;
  currency?: string;
  description?: string | null;
  status?: ProjectStatus;
  deadline?: Date | null;
}
