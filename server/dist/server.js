import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import { createServer } from "http";
import morgan from "morgan";
import prisma from "./config/prisma.js";
import { initSocket } from "./config/socket.js";
import { globalErrorHandler } from "./controllers/error.controllers.js";
import AuthRoutes from "./routes/auth.routes.js";
import NotificationRoutes from "./routes/notification.routes.js";
import ProjectRoutes from "./routes/projects.routes.js";
import UserRoutes from "./routes/user.routes.js";
import TaskRoutes from "./routes/tasks.routes.js";
dotenv.config();
// Beklenmedik hataları yakala
process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception! Server is shutting down.", error);
    process.exit(1);
});
const app = express();
const httpServer = createServer(app); // Socket.io için gerekli sarmalama
// Socket.io'yu başlat
initSocket(httpServer);
// Middlewares
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
}));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
// Routes
app.use("/api/auth", AuthRoutes);
app.use("/api/projects", ProjectRoutes);
app.use("/api/notifications", NotificationRoutes);
app.use("/api/users", UserRoutes);
app.use("/api/tasks", TaskRoutes);
// Global Error Handler
app.use(globalErrorHandler);
const port = process.env.PORT || 5000;
// app.listen yerine httpServer.listen kullanıyoruz
const server = httpServer.listen(port, async () => {
    console.log(`🚀 Server is running on port ${port}`);
    try {
        await prisma.$connect();
        console.log("🐘 Database connected successfully");
    }
    catch (error) {
        console.error("❌ Database connection error:", error);
    }
});
// Promise hatalarını yakala
process.on("unhandledRejection", (error) => {
    console.error("Unhandled Rejection! Server is shutting down.", error);
    // server.close artık httpServer'ı kapatacaktır
    server.close(() => process.exit(1));
});
process.on("SIGTERM", () => {
    console.log("SIGTERM received");
    server.close(() => {
        console.log("Process terminated");
    });
});
