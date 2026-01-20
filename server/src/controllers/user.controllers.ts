import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/user.service.js";
import { AppError } from "../utils/AppError.js";

export const searchUserByEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== "string") {
      throw new AppError("Email query parameter is required", 400);
    }

    const user = await UserService.searchByEmail(email);

    // Kullanıcı varsa exists: true, yoksa exists: false döner
    res.status(200).json({
      success: true,
      exists: !!user,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
