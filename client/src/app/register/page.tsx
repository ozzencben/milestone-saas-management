"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/auth/AuthContext";
import authService from "../../services/auth/auth.service";
import { ProjectService } from "../../services/projects/project.service";
import { RegisterType } from "../../types/auth";
import styles from "./page.module.css";

// useSearchParams kullanılan kısmı ayrı bir component'e alıyoruz (Next.js Best Practice)
function RegisterForm() {
  const { login } = useAuth();

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // URL'deki ?token=... değerini alır

  const [formData, setFormData] = useState<RegisterType>({
    email: "",
    password: "",
    firstname: "",
    lastname: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Önce kayıt ol
      await authService.register(formData);

      // 2. Otomatik LOGIN yap
      // AuthContext'teki tanıma göre: login(email, password)
      await login(formData.email, formData.password);

      // 3. Daveti tamamla
      if (token) {
        await ProjectService.completeExternalInvitation(token);
        toast.success("Joined the project successfully!");
      }

      // 4. Yönlendir
      router.push("/dashboard");
    } catch (err: unknown) {
      // ESLint 'any' hatasını çözmek için tipi daraltıyoruz
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>
          {token
            ? "Finish registration to join the project"
            : "Join WorkHub and manage your team"}
        </p>
      </div>

      {error && <div className={styles.errorBox}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label htmlFor="firstname">First Name</label>
            <input
              id="firstname"
              type="text"
              placeholder="John"
              required
              value={formData.firstname}
              onChange={(e) =>
                setFormData({ ...formData, firstname: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="lastname">Last Name</label>
            <input
              id="lastname"
              type="text"
              placeholder="Doe"
              required
              value={formData.lastname}
              onChange={(e) =>
                setFormData({ ...formData, lastname: e.target.value })
              }
              disabled={loading}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="name@company.com"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            disabled={loading}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className={styles.registerButton}
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      <div className={styles.footer}>
        <span>Already have an account?</span>
        <a href="/login">Log in</a>
      </div>
    </div>
  );
}

// Ana component: useSearchParams hatası almamak için Suspense ile sarmalıyoruz
export default function RegisterPage() {
  return (
    <div className={styles.container}>
      <Suspense fallback={<div>Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
