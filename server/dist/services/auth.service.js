import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
export const AuthService = {
    async registerUser(userData) {
        const { email, password, firstname, lastname } = userData;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new AppError("User already exists", 400);
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstname,
                lastname,
            },
        });
        return newUser;
    },
    async loginUser(userData) {
        const { email, password } = userData;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (!existingUser) {
            throw new AppError("User not found", 404);
        }
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            throw new AppError("Invalid password", 401);
        }
        const token = jwt.sign({ id: existingUser.id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        const { password: _, ...userWithoutPassword } = existingUser;
        return { ...userWithoutPassword, token };
    },
    async userProfile(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstname: true,
                lastname: true,
                role: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new AppError("User not found", 404);
        }
        return user;
    },
};
