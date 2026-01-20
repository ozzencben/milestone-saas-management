import { UserProfileData } from "./user.type.js";

declare global {
  namespace Express {
    interface Request {
      user?: UserProfileData;
      userId?: string;
      file?: Multer.File; // Multer'dan gelen tekli dosya için
      files?: Multer.File[] | { [fieldname: string]: Multer.File[] }; // Çoklu dosyalar için
    }
  }
}

export {}; // Bu dosyanın bir modül olarak algılanması için şart
