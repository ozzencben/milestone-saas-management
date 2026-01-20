import prisma from "../config/prisma.js";
export const UserService = {
    async searchByEmail(email) {
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                firstname: true,
                lastname: true,
                role: true,
                createdAt: true,
            },
        });
        return user;
    },
};
