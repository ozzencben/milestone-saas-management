"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../../services/api/api";
import { User } from "../../types/user";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean; // Yeni alan eklendi
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Hesaplanan bir değer: user objesi varsa true döner
  const isAuthenticated = !!user;

  useEffect(() => {
    const loadStorageData = () => {
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser && savedUser !== "undefined") {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error("Error loading user data from local storage:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStorageData();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("auth/login", { email, password });

      if (response && response.data.success) {
        const { token, data: userData } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);
        router.push("/dashboard");
      } else {
        throw new Error("Invalid response from server.");
      }
    } catch (error: unknown) {
      let errorMsg = "An error occurred during login.";

      if (axios.isAxiosError(error)) {
        errorMsg = error.response?.data.message || errorMsg;
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }

      console.error("Login error:", errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, loading, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within a AuthProvider");
  return context;
};
