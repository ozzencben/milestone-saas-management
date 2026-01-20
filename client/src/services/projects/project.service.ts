import {
  Activity,
  ChecklistItem,
  CreateProjectInput,
  Project,
  ProjectInvitation,
  ProjectMember,
  ProjectResource,
  ProjectRole,
  ResourceType,
  UpdateProjectInput,
} from "../../types/project.type";
import api from "../api/api";

export const ProjectService = {
  // --- Temel Proje İşlemleri ---
  async createProject(data: CreateProjectInput): Promise<Project> {
    const response = await api.post("/projects/create", data);
    return response.data.data;
  },

  async getProjects(): Promise<Project[]> {
    const response = await api.get(`/projects`);
    return response.data.data;
  },

  async getProjectById(projectId: string): Promise<Project> {
    const response = await api.get(`/projects/${projectId}`);
    return response.data.data;
  },

  async deleteProject(projectId: string): Promise<void> {
    await api.delete(`/projects/${projectId}`);
  },

  async updateProject(
    projectId: string,
    data: UpdateProjectInput,
  ): Promise<Project> {
    const payload: UpdateProjectInput = { ...data };

    if (payload.price !== undefined && payload.price !== null) {
      payload.price = Number(payload.price);
    }

    const response = await api.patch<{ data: Project }>(
      `/projects/${projectId}`,
      payload,
    );

    return response.data.data;
  },

  // --- Checklist İşlemleri ---
  async addChecklistItem(
    projectId: string,
    title: string,
  ): Promise<ChecklistItem> {
    const response = await api.post(`/projects/${projectId}/checklist`, {
      title,
    });
    return response.data.data;
  },

  async updateChecklistItem(
    projectId: string,
    itemId: string,
    data: { title?: string; isDone?: boolean; isUrgent?: boolean },
  ): Promise<ChecklistItem> {
    const response = await api.patch(
      `/projects/${projectId}/checklist/${itemId}`,
      data,
    );
    return response.data.data;
  },

  async deleteChecklistItem(projectId: string, itemId: string): Promise<void> {
    await api.delete(`/projects/${projectId}/checklist/${itemId}`);
  },

  // --- Kaynak (Resource) İşlemleri ---
  async addResource(
    projectId: string,
    data: {
      title?: string;
      url?: string;
      type: ResourceType;
      file?: File;
    },
  ): Promise<ProjectResource> {
    if (data.type === "FILE" && data.file) {
      const formData = new FormData();
      formData.append("file", data.file);
      if (data.title) formData.append("title", data.title);

      const response = await api.post(
        `/projects/${projectId}/resources`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return response.data.data;
    } else {
      const response = await api.post(`/projects/${projectId}/resources`, {
        title: data.title,
        url: data.url,
        type: data.type,
      });
      return response.data.data;
    }
  },

  // client/src/services/projects/project.service.ts

  async deleteResource(projectId: string, resourceId: string): Promise<void> {
    // URL'nin başına / koyduğundan ve dizilimin doğru olduğundan emin ol
    await api.delete(`/projects/${projectId}/resources/${resourceId}`);
  },

  // --- Aktivite Logları (YENİ) ---
  async getProjectActivities(projectId: string): Promise<Activity[]> {
    const response = await api.get(`/projects/${projectId}/activities`);
    return response.data.data;
  },

  // --- Üye (Member) İşlemleri (YENİ EKLEME) ---

  /**
   * Projeye yeni bir üye ekler.
   * @param projectId - Proje ID
   * @param email - Eklenecek kullanıcının email adresi
   * @param role - Projedeki rolü (DEVELOPER | CLIENT)
   */
  async addMember(
    projectId: string,
    email: string,
    role: ProjectRole,
  ): Promise<ProjectMember> {
    const response = await api.post(`/projects/${projectId}/members`, {
      email,
      role,
    });
    return response.data.data;
  },

  /**
   * Projeden bir üyeyi çıkarır.
   * @param projectId - Proje ID
   * @param userId - Çıkarılacak kullanıcının ID'si
   */
  async removeMember(projectId: string, userId: string): Promise<void> {
    await api.delete(`/projects/${projectId}/members/${userId}`);
  },

  async inviteMember(projectId: string, email: string, role: string) {
    const response = await api.post(`/projects/${projectId}/invite`, {
      email,
      role,
    });
    return response.data;
  },

  /**
   * Kullanıcıya gelen tüm bekleyen davetleri getirir.
   */
  async getMyInvitations(): Promise<ProjectInvitation[]> {
    const response = await api.get("/projects/invitations");
    return response.data.data;
  },

  /**
   * Bir daveti kabul eder veya reddeder.
   * @param invitationId - Davet ID
   * @param action - "ACCEPT" veya "REJECT"
   */
  async respondToInvitation(
    invitationId: string,
    action: "ACCEPT" | "REJECT",
  ): Promise<{ message: string }> {
    const response = await api.post(
      `/projects/invitations/${invitationId}/respond`,
      {
        action,
      },
    );
    return response.data;
  },

  // ProjectService içine eklenecek yeni metod:
  async completeExternalInvitation(
    token: string,
  ): Promise<{ success: boolean; projectId: string }> {
    const response = await api.post("/projects/invitations/external/complete", {
      token,
    });
    return response.data;
  },
};
