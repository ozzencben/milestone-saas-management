import { Router } from "express";
import multer from "multer";
import { storage } from "../config/cloudinary.js";
import {
  addChecklistItem,
  addMember, // Ekle
  addResource,
  completeExternalInvitation,
  createProject,
  deleteChecklistItem,
  deleteProject,
  deleteResource,
  getMyInvitations,
  getProjectActivities,
  getProjectDetails,
  getProjects,
  inviteMember,
  removeMember,
  respondToInvitation, // Ekle
  updateChecklistItem,
  updateProject,
} from "../controllers/project.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

const upload = multer({ storage });

// 1. Önce Sabit Rotalar (Static Routes)
router.post("/create", authMiddleware, createProject);
router.get("/", authMiddleware, getProjects);

// ÖNEMLİ: Invitations rotasını yukarı aldık ki :id ile çakışmasın
router.get("/invitations", authMiddleware, getMyInvitations);

// 2. Davet Cevaplama Rotaları
// Not: Controller'da invitationId beklediğin için :id yerine :invitationId yazdım
router.post(
  "/invitations/:invitationId/respond",
  authMiddleware,
  respondToInvitation,
);

// 3. Parametreli Proje Rotaları (:id içerenler)
router.get("/:id", authMiddleware, getProjectDetails);
router.delete("/:id", authMiddleware, deleteProject);
router.patch("/:id", authMiddleware, updateProject);

// --- ACTIVITY LOGS ---
// Proje detay sayfasında logları listelemek için en mantıklı yer burası
router.get("/:id/activities", authMiddleware, getProjectActivities);

// Checklist & Resource Rotaları
router.post("/:id/checklist", authMiddleware, addChecklistItem);
router.delete("/:id/checklist/:itemId", authMiddleware, deleteChecklistItem);
router.patch("/:id/checklist/:itemId", authMiddleware, updateChecklistItem);

router.post(
  "/:id/resources",
  authMiddleware,
  upload.single("file"),
  addResource,
);
router.delete("/:id/resources/:resourceId", authMiddleware, deleteResource);

// --- Üye (Member) Yönetimi ---
router.post("/:id/invite", authMiddleware, inviteMember);
router.delete("/:id/members/:userId", authMiddleware, removeMember);

// Bu rotaya artık ihtiyacın olmayabilir (Çünkü artık davet sistemine geçtik)
// Ama admin paneli gibi yerlerde kullanacaksan kalabilir
router.post("/:id/members", authMiddleware, addMember);

// Diğer importların yanına completeExternalInvitation'ı ekle
router.post(
  "/invitations/external/complete",
  authMiddleware, // Kullanıcının önce kayıt olup giriş yapmış olması lazım
  completeExternalInvitation,
);

export default router;
