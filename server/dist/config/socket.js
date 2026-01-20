import { Server } from "socket.io";
let io;
export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });
    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);
        // Kullanıcı bağlandığında ona özel bir odaya katılmasını isteyeceğiz
        // Frontend'den 'join' eventi ile userId göndereceğiz
        socket.on("join", (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined their private room`);
        });
        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    });
    return io;
};
export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
// Bildirim göndermek için yardımcı bir fonksiyon
export const sendNotification = (userId, data) => {
    if (io) {
        io.to(userId).emit("new_notification", data);
    }
};
