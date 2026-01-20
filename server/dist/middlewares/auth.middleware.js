import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";
export const authMiddleware = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            return next(new AppError("Unauthorized", 401));
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.id,
        };
        req.userId = decoded.id;
        next();
    }
    catch (error) {
        next(new AppError("Unauthorized", 401));
    }
};
