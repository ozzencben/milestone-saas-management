// types/project.type.ts

// 1. Önce sabit dizileri export ediyoruz (Formun kullanması için)
export const PROJECT_CATEGORIES = ["PAID", "PORTFOLIO", "PERSONAL"] as const;
export const CURRENCIES = ["USD", "TRY", "EUR", "GBP"] as const;

// 2. Bu dizilerden tipleri türetiyoruz
export type ProjectType = (typeof PROJECT_CATEGORIES)[number];
export type ProjectCategory = ProjectType; // Form 'ProjectCategory' ismini aradığı için alias oluşturduk
export type Currency = (typeof CURRENCIES)[number];

// Diğer tipler aynı kalabilir...
export type ProjectStatus = "ACTIVE" | "COMPLETED" | "PENDING";
export type ProjectRole = "DEVELOPER" | "CLIENT";
export type ResourceType = "LINK" | "FILE";

export interface ProjectInvitation {
  id: string;
  projectId: string;
  email: string;
  role: ProjectRole;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  project: { name: string };
  invitedBy: { firstname: string; lastname: string };
  createdAt: string;
}

export interface Activity {
  id: string;
  projectId: string;
  userId: string;
  action: string;
  entityName?: string | null;
  entityId?: string | null;
  createdAt: string | Date;
  user: {
    firstname: string | null;
    lastname: string | null;
    avatar?: string | null;
  };
}

export interface ChecklistItem {
  id: string;
  title: string;
  isDone: boolean;
  isUrgent: boolean;
  projectId: string;

  createdById: string;
  createdBy: {
    id: string;
    firstname: string | null;
    lastname: string | null;
  };

  completedById?: string | null;
  completedBy?: {
    id: string;
    firstname: string | null;
    lastname: string | null;
  } | null;

  createdAt?: string | Date; // Opsiyonel yaptık, hata riskini sıfırladık
  updatedAt?: string | Date;
}

export interface ProjectResource {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  fileSize?: string | null;
  mimeType?: string | null;
  projectId: string;
  createdAt: string | Date;
}

// Üye bilgisi (Backend'deki ProjectMemberData karşılığı)
export interface ProjectMember {
  id: string;
  firstname: string | null;
  lastname: string | null;
  email: string;
  role: string; // Sistemsel rol (ADMIN/USER)
  projectRole: ProjectRole; // PROJE BAZLI ROL (DEVELOPER/CLIENT) - Kritik!
  createdAt?: string | Date;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  type: ProjectType;
  price: number | string; // Daha esnek yapıda tutuyoruz
  currency: Currency;
  deadline: string | Date | null;
  checklist?: ChecklistItem[];
  members?: ProjectMember[];
  resources?: ProjectResource[];
  activities?: Activity[];
  owner?: {
    id: string;
    firstname: string | null;
    lastname: string | null;
    email: string;
  };
  ownerId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Input Tipleri
export interface CreateProjectInput {
  name: string;
  type: ProjectType;
  price: number;
  currency: Currency;
  deadline: string | Date | null;
}

export type UpdateProjectInput = Partial<
  Omit<
    Project,
    | "id"
    | "owner"
    | "ownerId"
    | "createdAt"
    | "updatedAt"
    | "members"
    | "checklist"
    | "resources"
  >
>;
