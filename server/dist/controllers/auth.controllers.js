import { AuthService } from "../services/auth.service.js";
import { AppError } from "../utils/AppError.js";
export const register = async (req, res, next) => {
    try {
        const user = await AuthService.registerUser(req.body);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: user.id,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
            },
        });
    }
    catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        }
        next(error);
    }
};
export const login = async (req, res, next) => {
    try {
        const user = await AuthService.loginUser(req.body);
        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: {
                id: user.id,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
            },
            token: user.token,
        });
    }
    catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        }
        next(error);
    }
};
export const getMyProfile = async (req, res, next) => {
    try {
        const id = req.userId || req.user?.id;
        if (!id) {
            return next(new AppError("User ID not found in request", 400));
        }
        const user = await AuthService.userProfile(id);
        res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            data: {
                id: user.id,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
