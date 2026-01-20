import cloudinary from "../config/cloudinary.js";
import prisma from "../config/prisma.js";
import {
  CreateProjectInput,
  ProjectData,
  ResourceType,
  UpdateProjectInput,
} from "../types/project.type.js";
import { AppError } from "../utils/AppError.js";
import { NotificationService } from "./notification.service.js";

export const ProjectService = {
  async createActivity(
    projectId: string,
    userId: string,
    action: string,
    entityName?: string,
    entityId?: string,
  ) {
    try {
      return await prisma.activity.create({
        data: {
          projectId,
          userId,
          action,
          entityName,
          entityId,
        },
      });
    } catch (error) {
      // Aktivite kaydı sırasında oluşacak bir hata ana işlemi durdurmasın diye logluyoruz
      console.error("Activity Log Error:", error);
    }
  },

  async createProject(
    data: CreateProjectInput,
    userId: string,
  ): Promise<ProjectData> {
    const isPaid = data.type === "PAID";

    if (
      isPaid &&
      (data.price === undefined || data.price === null || data.price <= 0)
    ) {
      throw new AppError("Paid projects must have a price greater than 0", 400);
    }

    // 1. Önce projeyi değişkene atayarak oluşturuyoruz
    const project = await prisma.project.create({
      data: {
        name: data.name,
        type: data.type,
        price: isPaid ? data.price || 0 : 0,
        currency: isPaid ? data.currency || "USD" : "USD",
        ownerId: userId,
        description: null,
        status: "ACTIVE",
        deadline: data.deadline ? new Date(data.deadline) : null,
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
            role: true,
          },
        },
      },
    });

    // 2. Aktiviteyi kaydediyoruz (Bu satırı ekledik)
    await this.createActivity(
      project.id,
      userId,
      "PROJECT_CREATED",
      project.name,
    );

    // 3. Projeyi geri döndürüyoruz
    return project as unknown as ProjectData;
  },

  async getProjects(userId: string): Promise<ProjectData[]> {
    return (await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId: userId,
              },
            },
          },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
            role: true,
          },
        },
        checklist: true,
        // 1. Üyeleri ve kullanıcı detaylarını ekliyoruz (Team tablosu için)
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstname: true,
                lastname: true,
                role: true,
              },
            },
          },
        },
        // 2. Bekleyen davetleri ekliyoruz (Pending Invites tabı için)
        invitations: {
          where: {
            status: "PENDING",
          },
        },
      },
    })) as unknown as ProjectData[];
  },

  async getProjectById(
    projectId: string,
    userId: string,
  ): Promise<ProjectData> {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ ownerId: userId }, { members: { some: { userId: userId } } }],
      },
      include: {
        checklist: {
          include: {
            // Kimin oluşturduğu ve tamamladığı bilgisini çekiyoruz
            createdBy: {
              select: {
                id: true,
                email: true,
                firstname: true,
                lastname: true,
                role: true,
              },
            },
            completedBy: {
              select: {
                id: true,
                email: true,
                firstname: true,
                lastname: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: "asc" }, // Id yerine tarihe göre sıralamak daha mantıklı
        },
        resources: { orderBy: { createdAt: "desc" } },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstname: true,
                lastname: true,
                role: true,
                createdAt: true,
              },
            },
          },
        },
        owner: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!project) throw new AppError("Project not found", 404);

    // Formatlama işlemleri (Hataları önlemek için)
    const response = {
      ...project,
      price: project.price ? project.price.toString() : "0",
      owner: {
        ...project.owner,
        firstname: project.owner.firstname ?? undefined,
        lastname: project.owner.lastname ?? undefined,
      },
      members: project.members.map((m) => ({
        ...m.user,
        firstname: m.user.firstname ?? undefined,
        lastname: m.user.lastname ?? undefined,
        projectRole: m.role,
      })),
      // Checklist maddelerindeki null değerleri undefined yaparak tipe uyduruyoruz
      checklist: project.checklist.map((item) => ({
        ...item,
        createdBy: {
          ...item.createdBy,
          firstname: item.createdBy.firstname ?? undefined,
          lastname: item.createdBy.lastname ?? undefined,
        },
        completedBy: item.completedBy
          ? {
              ...item.completedBy,
              firstname: item.completedBy.firstname ?? undefined,
              lastname: item.completedBy.lastname ?? undefined,
            }
          : null,
      })),
    };

    return response as unknown as ProjectData;
  },

  async updateProject(
    projectId: string,
    userId: string,
    data: UpdateProjectInput,
  ): Promise<ProjectData> {
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });

    if (!project) throw new AppError("Project not found", 404);

    const updatePayload: any = { ...data };

    // 1. Tip değişikliği kontrolü
    const newType = data.type || project.type;

    // 2. Eğer tip PERSONAL veya FREE yapılıyorsa fiyatı otomatik SIFIRLA
    if (newType !== "PAID") {
      updatePayload.price = 0;
    }
    // 3. Eğer tip PAID ise ve yeni bir fiyat gelmemişse mevcut fiyatı kontrol et
    else if (newType === "PAID") {
      const currentPrice =
        data.price !== undefined ? Number(data.price) : Number(project.price);

      if (currentPrice <= 0) {
        throw new AppError(
          "Paid projeler için 0'dan büyük bir fiyat girmelisiniz.",
          400,
        );
      }
      updatePayload.price = currentPrice;
    }

    // Deadline tarihini Date objesine çevirmeyi unutmayalım (eğer varsa)
    if (updatePayload.deadline) {
      updatePayload.deadline = new Date(updatePayload.deadline);
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: updatePayload,
      include: {
        owner: { select: { id: true, firstname: true, lastname: true } },
      },
    });

    // --- ŞU SATIRI EKLE: Proje güncellendi logu ---
    await this.createActivity(projectId, userId, "PROJECT_UPDATED");

    return updated as unknown as ProjectData;
  },

  async deleteProject(projectId: string, userId: string): Promise<void> {
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });
    if (!project) throw new AppError("Project not found", 404);

    await prisma.project.delete({ where: { id: projectId } });
  },

  // Checklist CRUD
  async addChecklistItem(projectId: string, userId: string, title: string) {
    await this.getProjectById(projectId, userId);

    const item = await prisma.checklistItem.create({
      data: {
        title,
        projectId,
        createdById: userId,
      },
      include: {
        createdBy: { select: { firstname: true, lastname: true } },
      },
    });

    // LOG EKLE: "Görev eklendi: Görev Adı"
    await this.createActivity(
      projectId,
      userId,
      "CHECKLIST_ADDED",
      item.title,
      item.id,
    );

    return item;
  },

  async updateChecklistItem(
    projectId: string, // <-- Log için bunu ekledik
    itemId: string,
    userId: string,
    data: { title?: string; isDone?: boolean; isUrgent?: boolean },
  ) {
    const item = await prisma.checklistItem.findUnique({
      where: { id: itemId },
    });

    if (!item) throw new AppError("Item not found", 404);

    const updateData: any = { ...data };

    if (data.isDone !== undefined) {
      updateData.completedById = data.isDone ? userId : null;
    }

    const updated = await prisma.checklistItem.update({
      where: { id: itemId },
      data: updateData,
      include: {
        createdBy: { select: { firstname: true, lastname: true } },
        completedBy: { select: { firstname: true, lastname: true } },
      },
    });

    // LOG EKLE: Tamamlandı mı yoksa tekrar mı açıldı kontrolü
    if (data.isDone !== undefined) {
      const action = data.isDone ? "CHECKLIST_COMPLETED" : "CHECKLIST_REOPENED";
      await this.createActivity(
        projectId,
        userId,
        action,
        updated.title,
        itemId,
      );
    } else {
      // Sadece başlık veya aciliyet değiştiyse
      await this.createActivity(
        projectId,
        userId,
        "CHECKLIST_UPDATED",
        updated.title,
        itemId,
      );
    }

    return updated;
  },

  async deleteChecklistItem(projectId: string, itemId: string, userId: string) {
    const item = await prisma.checklistItem.findUnique({
      where: { id: itemId },
    });

    if (!item) throw new AppError("Item not found", 404);

    // Silmeden önce log için ismi alıyoruz
    await this.createActivity(
      projectId,
      userId,
      "CHECKLIST_DELETED",
      item.title,
    );

    return await prisma.checklistItem.delete({ where: { id: itemId } });
  },

  async addResource(
    projectId: string,
    userId: string,
    data: {
      title: string;
      url: string;
      type: ResourceType;
      fileSize?: string | null;
      mimeType?: string | null;
    },
  ) {
    await this.getProjectById(projectId, userId);

    const resource = await prisma.projectResource.create({
      data: {
        title: data.title,
        url: data.url,
        type: data.type,
        fileSize: data.fileSize || null,
        mimeType: data.mimeType || null,
        projectId,
      },
    });

    // LOG EKLE: "Kaynak eklendi: Dosya/Link Adı"
    await this.createActivity(
      projectId,
      userId,
      "RESOURCE_ADDED",
      resource.title,
      resource.id,
    );

    return resource;
  },

  async deleteResource(projectId: string, resourceId: string, userId: string) {
    const resource = await prisma.projectResource.findUnique({
      where: { id: resourceId },
      include: { project: { select: { ownerId: true } } },
    });

    if (!resource) throw new AppError("Resource not found", 404);

    if (resource.project.ownerId !== userId) {
      throw new AppError(
        "Unauthorized: Only the project owner can delete resources",
        403,
      );
    }

    // 1. ADIM: Cloudinary temizliği
    if (resource.type === "FILE") {
      try {
        const parts = resource.url.split("/");
        const folderAndFileName = parts.slice(-2).join("/").split(".")[0];
        await cloudinary.uploader.destroy(folderAndFileName);
      } catch (error) {
        console.error("Cloudinary file delete error:", error);
      }
    }

    // LOG EKLE: Silinmeden hemen önce ismi logluyoruz
    await this.createActivity(
      projectId,
      userId,
      "RESOURCE_DELETED",
      resource.title,
    );

    // 2. ADIM: Veritabanından sil
    return await prisma.projectResource.delete({
      where: { id: resourceId },
    });
  },

  async addMember(
    projectId: string,
    ownerId: string,
    email: string,
    projectRole: "DEVELOPER" | "CLIENT",
  ) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw new AppError("Project not found", 404);
    if (project.ownerId !== ownerId)
      throw new AppError("Only the owner can add members", 403);

    const userToAdd = await prisma.user.findUnique({
      where: { email },
    });

    if (userToAdd && userToAdd.id === ownerId) {
      throw new AppError(
        "You are already the owner of this project. You cannot add yourself as a member.",
        400,
      );
    }

    if (!userToAdd) {
      throw new AppError("User not found with this email", 404);
    }

    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: userToAdd.id,
        },
      },
    });

    if (existingMember) {
      throw new AppError("User is already a member of this project", 400);
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId: userToAdd.id,
        role: projectRole,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
          },
        },
      },
    });

    // --- BİLDİRİM: Projeye Ekleme ---
    try {
      await NotificationService.createNotification({
        userId: userToAdd.id,
        title: "New Project Assignment",
        message: `You have been added to the project "${project.name}" as a ${projectRole}.`,
        type: "PROJECT_INVITE",
        link: `/dashboard/projects/${projectId}`,
      });
    } catch (error) {
      console.error("Notification error (Add Member):", error);
    }

    return member;
  },

  async removeMember(
    projectId: string,
    ownerId: string,
    userIdToRemove: string,
  ): Promise<void> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    if (project.ownerId !== ownerId) {
      throw new AppError("Only the project owner can remove members", 403);
    }

    if (userIdToRemove === ownerId) {
      throw new AppError("You cannot remove yourself as the owner", 400);
    }

    // Silme işleminden önce üyenin varlığını ve bilgilerini kontrol etmeliyiz ki bildirim atabilelim
    const memberToRemove = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: userIdToRemove,
        },
      },
    });

    if (!memberToRemove) {
      throw new AppError("Member not found in this project", 404);
    }

    // Silme İşlemi
    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId: projectId,
          userId: userIdToRemove,
        },
      },
    });

    // --- BİLDİRİM: Projeden Çıkarılma ---
    try {
      await NotificationService.createNotification({
        userId: userIdToRemove,
        title: "Removed from Project",
        message: `Your access to the project "${project.name}" has been revoked.`,
        type: "INFO", // Veya uygun bir NotificationType
        link: "/dashboard/projects", // Artık projeye giremeyeceği için ana listeye yönlendiriyoruz
      });
    } catch (error) {
      console.error("Notification error (Remove Member):", error);
    }
  },

  async sendInvitation(
    projectId: string,
    invitedById: string,
    email: string,
    role: "DEVELOPER" | "CLIENT",
  ) {
    // 1. Proje ve Sahibi Kontrolü (Email için title'ı da alıyoruz)
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, ownerId: true, name: true },
    });

    if (!project) throw new AppError("Project not found", 404);
    if (project.ownerId !== invitedById)
      throw new AppError("Only the project owner can invite members", 403);

    // 2. Kullanıcı Zaten Üye mi?
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const existingMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: { projectId, userId: user.id },
        },
      });
      if (existingMember)
        throw new AppError("This user is already a member of the project", 400);
    }

    // 3. Daveti Oluştur (upsert kullanarak temiz tutuyoruz)
    const invitation = await prisma.projectInvitation.upsert({
      where: { projectId_email: { projectId, email } },
      update: { status: "PENDING", role },
      create: {
        projectId,
        email,
        role,
        invitedById,
      },
    });

    return {
      invitation,
      userExists: !!user,
      userId: user?.id,
      projectName: project.name,
    };
  },

  // Kullanıcıya gelen bekleyen davetleri getir
  async getMyInvitations(email: string) {
    return await prisma.projectInvitation.findMany({
      where: { email, status: "PENDING" },
      include: {
        project: { select: { name: true } },
        invitedBy: { select: { firstname: true, lastname: true } },
      },
    });
  },

  // Daveti Kabul Et
  async acceptInvitation(invitationId: string, userId: string) {
    const invitation = await prisma.projectInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) throw new AppError("Invitation not found", 404);

    // 1. ProjectMember tablosuna asıl kaydı oluştur (Eski addMember logic'i buraya geldi)
    await prisma.projectMember.create({
      data: {
        projectId: invitation.projectId,
        userId: userId,
        role: invitation.role,
      },
    });

    // 2. Davet durumunu güncelle (veya silebilirsin, ama geçmiş için ACCEPTED yapmak iyidir)
    await prisma.projectInvitation.update({
      where: { id: invitationId },
      data: { status: "ACCEPTED" },
    });

    return { projectId: invitation.projectId };
  },

  // Daveti Reddet
  async rejectInvitation(invitationId: string) {
    await prisma.projectInvitation.update({
      where: { id: invitationId },
      data: { status: "REJECTED" },
    });
  },

  // Projeye ait son aktiviteleri getirir
  async getProjectActivities(projectId: string) {
    return await prisma.activity.findMany({
      where: {
        projectId: projectId,
      },
      include: {
        user: {
          select: {
            firstname: true,
            lastname: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // En yeni aktiviteler en üstte
      },
      take: 50, // Performans için son 50 aktiviteyi getiriyoruz
    });
  },
};
