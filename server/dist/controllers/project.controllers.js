import jwt from "jsonwebtoken";
import { sendInvitationEmail } from "../config/mailer.js";
import prisma from "../config/prisma.js";
import { ProjectService } from "../services/project.service.js";
import { AppError } from "../utils/AppError.js";
// Proje Oluşturma
export const createProject = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId)
            return next(new AppError("User ID not found", 400));
        const project = await ProjectService.createProject(req.body, userId);
        res.status(201).json({ success: true, data: project });
    }
    catch (error) {
        next(error);
    }
};
// Tüm Projeleri Getirme
export const getProjects = async (req, res, next) => {
    try {
        const projects = await ProjectService.getProjects(req.userId);
        res.status(200).json({ success: true, data: projects });
    }
    catch (error) {
        next(error);
    }
};
// Proje Detaylarını Getirme
export const getProjectDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const project = await ProjectService.getProjectById(id, req.userId);
        res.status(200).json({ success: true, data: project });
    }
    catch (error) {
        next(error);
    }
};
// Proje Güncelleme
export const updateProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updated = await ProjectService.updateProject(id, req.userId, req.body);
        res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        next(error);
    }
};
// Proje Silme
export const deleteProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        await ProjectService.deleteProject(id, req.userId);
        res.status(200).json({ success: true, message: "Project deleted" });
    }
    catch (error) {
        next(error);
    }
};
// --- Checklist İşlemleri ---
export const addChecklistItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
        const newItem = await ProjectService.addChecklistItem(id, req.userId, title);
        res.status(201).json({ success: true, data: newItem });
    }
    catch (error) {
        next(error);
    }
};
export const updateChecklistItem = async (req, res, next) => {
    try {
        // Hem projenin id'sini hem de checklist'in itemId'sini alıyoruz
        const { id: projectId, itemId } = req.params;
        const updated = await ProjectService.updateChecklistItem(projectId, // Servis artık log için bunu bekliyor
        itemId, req.userId, req.body);
        res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        next(error);
    }
};
export const deleteChecklistItem = async (req, res, next) => {
    try {
        const { id: projectId, itemId } = req.params;
        await ProjectService.deleteChecklistItem(projectId, // Servis artık log için bunu bekliyor
        itemId, req.userId);
        res.status(200).json({ success: true, message: "Item deleted" });
    }
    catch (error) {
        next(error);
    }
};
// --- Kaynak (Resource) İşlemleri ---
export const addResource = async (req, res, next) => {
    try {
        const { id: projectId } = req.params;
        const userId = req.userId;
        let resourceData;
        // Eğer Multer bir dosya yakalamışsa (Cloudinary'ye yüklenmiş demektir)
        if (req.file) {
            resourceData = {
                title: req.body.title || req.file.originalname,
                url: req.file.path, // Cloudinary secure_url
                type: "FILE",
                fileSize: `${(req.file.size / 1024).toFixed(1)} KB`,
                mimeType: req.file.mimetype,
            };
        }
        // Dosya yoksa normal Link olarak işle
        else {
            const { title, url } = req.body;
            if (!url)
                throw new AppError("Lütfen bir URL girin veya dosya yükleyin", 400);
            resourceData = {
                title: title || "Yeni Bağlantı",
                url: url,
                type: "LINK",
                fileSize: null,
                mimeType: "text/html",
            };
        }
        const resource = await ProjectService.addResource(projectId, userId, resourceData);
        res.status(201).json({ success: true, data: resource });
    }
    catch (error) {
        next(error);
    }
};
export const deleteResource = async (req, res, next) => {
    try {
        // Burada da hem proje id hem resourceId alıyoruz
        const { id: projectId, resourceId } = req.params;
        await ProjectService.deleteResource(projectId, // Servis artık log için bunu bekliyor
        resourceId, req.userId);
        res
            .status(200)
            .json({ success: true, message: "Resource deleted successfully" });
    }
    catch (error) {
        next(error);
    }
};
// members
export const addMember = async (req, res, next) => {
    try {
        // Tip zorlaması yaparak string olduklarını garanti ediyoruz
        const { id: projectId } = req.params;
        const { email, role } = req.body;
        // Projenin geri kalanıyla uyumlu olması için req.userId kullanıyoruz
        const ownerId = req.userId;
        if (!ownerId)
            return next(new AppError("User ID not found", 400));
        if (!email || !role) {
            throw new AppError("Email and role are required", 400);
        }
        const member = await ProjectService.addMember(projectId, ownerId, email, role);
        res.status(201).json({
            success: true, // Projenin genel formatı 'success' boolean değeridir
            data: member,
        });
    }
    catch (error) {
        next(error);
    }
};
export const removeMember = async (req, res, next) => {
    try {
        // Burada hem id (proje) hem de userId (silinecek üye) geliyor
        const { id: projectId, userId: memberIdToRemove } = req.params;
        const ownerId = req.userId;
        if (!ownerId)
            return next(new AppError("User ID not found", 400));
        await ProjectService.removeMember(projectId, ownerId, memberIdToRemove);
        // 204 No Content bazen frontend'de boş döner, 200 ile mesaj dönmek daha güvenlidir
        res.status(200).json({
            success: true,
            message: "Member removed successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
export const inviteMember = async (req, res, next) => {
    try {
        const { id: projectId } = req.params;
        const { email, role } = req.body;
        const ownerId = req.userId;
        if (!ownerId) {
            throw new AppError("Unauthorized: User ID not found", 401);
        }
        const result = await ProjectService.sendInvitation(projectId, ownerId, email, role);
        if (result.userExists && result.userId) {
            // --- DURUM A: KAYITLI KULLANICI ---
            await prisma.notification.create({
                data: {
                    userId: result.userId,
                    title: "New Project Invitation",
                    message: `You have been invited to join the project "${result.projectName}" as a ${role}.`,
                    type: "PROJECT_INVITE",
                    link: `/dashboard/invitations/${result.invitation.id}`,
                },
            });
            // Buraya socket.emit eklenebilir
        }
        else {
            // --- DURUM B: SİSTEMDE OLMAYAN KULLANICI ---
            // 1. JWT Token Oluştur (7 gün geçerli)
            const inviteToken = jwt.sign({ email, projectId, role, type: "PROJECT_INVITE" }, process.env.JWT_SECRET, { expiresIn: "7d" });
            // 2. Kayıt Linki (Frontend URL .env'den gelmeli)
            const inviteLink = `${process.env.CLIENT_URL}/register?token=${inviteToken}`;
            // 3. Nodemailer ile Mail Gönder
            await sendInvitationEmail(email, result.projectName, inviteLink);
        }
        res.status(201).json({
            success: true,
            message: result.userExists
                ? "Invitation sent to user's dashboard."
                : "User not found. An invitation email has been sent.",
        });
    }
    catch (error) {
        next(error);
    }
};
export const getMyInvitations = async (req, res, next) => {
    try {
        // req.user.email veya req.userId üzerinden kullanıcıyı bulup mailini alabilirsin
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        const invitations = await ProjectService.getMyInvitations(user.email);
        res.status(200).json({ success: true, data: invitations });
    }
    catch (error) {
        next(error);
    }
};
export const respondToInvitation = async (req, res, next) => {
    try {
        // 1. Tip zorlaması yaparak string olduğunu garanti ediyoruz
        const { invitationId } = req.params;
        const { action } = req.body;
        const userId = req.userId;
        if (!userId)
            throw new AppError("User not found", 401);
        // 2. Daveti bul
        const invitation = await prisma.projectInvitation.findUnique({
            where: { id: invitationId },
        });
        if (!invitation)
            throw new AppError("Invitation not found", 404);
        // Eğer davet zaten işlendiyse tekrar işlem yapma
        if (invitation.status !== "PENDING") {
            throw new AppError("This invitation has already been processed", 400);
        }
        if (action === "ACCEPT") {
            // Üyeliği oluştur
            await prisma.projectMember.create({
                data: {
                    projectId: invitation.projectId,
                    userId: userId,
                    role: invitation.role,
                },
            });
        }
        // 3. Davet durumunu güncelle
        await prisma.projectInvitation.update({
            where: { id: invitationId },
            data: { status: action === "ACCEPT" ? "ACCEPTED" : "REJECTED" },
        });
        // 4. Bildirimi güncelle (Hata düzeltmesi: read yerine isRead kullandık)
        // Eğer şemanda hala 'read' ise onu kullan ama hata mesajın 'read'in olmadığını söylüyor.
        await prisma.notification.updateMany({
            where: {
                userId: userId,
                link: { contains: invitationId },
                type: "PROJECT_INVITE",
            },
            data: {
                isRead: true, // Hata mesajına göre 'read' yerine 'isRead' (veya şemandaki doğru isim)
                message: `You have ${action.toLowerCase()}ed the invitation.`,
            },
        });
        res.status(200).json({
            success: true,
            message: `Invitation ${action.toLowerCase()}ed successfully.`,
        });
    }
    catch (error) {
        next(error);
    }
};
export const completeExternalInvitation = async (req, res, next) => {
    try {
        const { token } = req.body;
        const userId = req.userId; // Register olduktan sonra login olup buraya geldiği varsayımıyla
        if (!token)
            throw new AppError("Token is required", 400);
        // 1. Token'ı doğrula ve içindekileri oku
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // 2. Kullanıcıyı projeye üye yap (Duplicate hatasını önlemek için findFirst veya try-catch kullanılabilir)
        const membership = await prisma.projectMember.create({
            data: {
                projectId: decoded.projectId,
                userId: userId,
                role: decoded.role,
            },
        });
        // 3. Bekleyen daveti "ACCEPTED" olarak güncelle (Opsiyonel ama temizlik için iyidir)
        await prisma.projectInvitation.updateMany({
            where: {
                projectId: decoded.projectId,
                email: decoded.email,
            },
            data: { status: "ACCEPTED" },
        });
        res.status(200).json({
            success: true,
            message: "Successfully joined the project",
            projectId: decoded.projectId,
        });
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return next(new AppError("Invitation link has expired", 400));
        }
        next(error);
    }
};
// project.controllers.ts dosyasına en alta ekle
export const getProjectActivities = async (req, res, next) => {
    try {
        const { id } = req.params;
        const activities = await ProjectService.getProjectActivities(id);
        res.status(200).json({ success: true, data: activities });
    }
    catch (error) {
        next(error);
    }
};
