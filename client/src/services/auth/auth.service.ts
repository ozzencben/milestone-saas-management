import { RegisterType } from "../../types/auth";
import api from "../api/api";

export const authService = {
  async register(data: RegisterType): Promise<void> {
    await api.post("/auth/register", data);
  },
};

export default authService;
