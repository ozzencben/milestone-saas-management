import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserProfileData } from "../types/user.type.js";
import { AppError } from "../utils/AppError.js";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("Unauthorized", 401));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as unknown as JwtPayload;

    req.user = {
      id: decoded.id,
    } as UserProfileData;

    req.userId = decoded.id;

    next();
  } catch (error) {
    next(new AppError("Unauthorized", 401));
  }
};
