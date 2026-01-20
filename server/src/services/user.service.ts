import prisma from "../config/prisma.js";
import { UserProfileData } from "../types/user.type.js";

export const UserService = {
  async searchByEmail(email: string): Promise<UserProfileData | null> {
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

    return user as UserProfileData | null;
  },
};
