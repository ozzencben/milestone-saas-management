import { UserSearchResponse } from "../../types/user";
import api from "../api/api";

export const UserService = {
  async searchByEmail(email: string): Promise<UserSearchResponse> {
    const response = await api.get(`/users/search?email=${email}`);
    return response.data;
  },
};
