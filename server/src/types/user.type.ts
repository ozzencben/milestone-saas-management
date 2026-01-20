export interface UserData {
  id: string;
  email: string;
  password: string;
  firstname?: string;
  lastname?: string;
  role: "USER" | "ADMIN" | "CLIENT";
  createdAt: Date;
  updatedAt: Date;
}

export type UserRegisterData = Pick<
  UserData,
  "email" | "password" | "firstname" | "lastname"
>;

export type UserLoginData = Pick<UserData, "email" | "password">;

export type UserProfileData = Omit<UserData, "password" | "updatedAt">;

export type UserSearchResponse = {
  success: boolean;
  exists: boolean;
  data: {
    id: string;
    email: string;
    firstname: string | null;
    lastname: string | null;
  } | null;
};
