import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- İSTEK (REQUEST) INTERCEPTOR ---
api.interceptors.request.use(
  (config) => {
    // Tarayıcı tarafında olduğumuzdan emin olalım (Next.js SSR için önemli)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- CEVAP (RESPONSE) INTERCEPTOR ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Backend'den 401 Unauthorized gelirse (Token geçersizse)
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login"; // Kullanıcıyı girişe fırlat
      }
    }
    return Promise.reject(error);
  }
);

export default api;
