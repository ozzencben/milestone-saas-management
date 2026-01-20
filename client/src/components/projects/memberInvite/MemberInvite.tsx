"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/auth/AuthContext";
import { ProjectService } from "../../../services/projects/project.service";
import { UserService } from "../../../services/user/user.service";
import { UserSearchResponse } from "../../../types/user";
import styles from "./MemberInvite.module.css";

interface Props {
  projectId: string;
  onSuccess: () => void;
}

interface AxiosErrorResponse {
  message: string;
  success?: boolean;
}

export default function MemberInvite({ projectId, onSuccess }: Props) {
  const { user: currentUser } = useAuth();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"DEVELOPER" | "CLIENT">("DEVELOPER");
  const [searchResult, setSearchResult] = useState<UserSearchResponse | null>(
    null,
  );
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce ile kullanıcı arama
  useEffect(() => {
    if (email.length < 5 || !email.includes("@")) {
      setSearchResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await UserService.searchByEmail(email);
        setSearchResult(res);
      } catch (error) {
        setSearchResult(null);
        console.error("Error searching for user:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email]);

  const handleAddMember = async () => {
    if (email === currentUser?.email) {
      toast.error("You cannot add yourself to your own project.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await ProjectService.inviteMember(projectId, email, role);
      toast.success(res.message || "Invitation sent successfully!");
      setEmail("");
      setSearchResult(null);
      onSuccess();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverResponse = error.response?.data as AxiosErrorResponse;
        const errorMessage = serverResponse?.message || "Error adding member";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred");
      }
      console.error("Add member error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.inviteCard}>
      <h3>Invite Team Member</h3>

      <div className={styles.inputGroup}>
        <div className={styles.inputWrapper}>
          <input
            type="email"
            placeholder="Enter email address..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.emailInput}
          />
        </div>

        <div className={styles.selectWrapper}>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "DEVELOPER" | "CLIENT")}
            className={styles.customSelect}
          >
            <option value="DEVELOPER">Developer</option>
            <option value="CLIENT">Client</option>
          </select>
          <span className={styles.selectArrow}>▼</span>
        </div>
      </div>

      {isSearching && (
        <div className={styles.searchingLoader}>
          <p className={styles.infoText}>Checking user database...</p>
        </div>
      )}

      {searchResult && !isSearching && (
        <div className={styles.resultBox}>
          {searchResult.exists && searchResult.data ? (
            searchResult.data.email === currentUser?.email ? (
              <div className={styles.selfWarning}>
                <p>ℹ️ This is your account. You already have owner access.</p>
              </div>
            ) : (
              <div className={styles.found}>
                <p>
                  ✅{" "}
                  <strong>
                    {searchResult.data.firstname} {searchResult.data.lastname}
                  </strong>{" "}
                  is on WorkHub.
                </p>
                <button
                  onClick={handleAddMember}
                  disabled={isSubmitting}
                  className={styles.primaryBtn}
                >
                  {isSubmitting ? "Adding..." : "Add to Project"}
                </button>
              </div>
            )
          ) : (
            <div className={styles.notFound}>
              <p>📧 User not found in system.</p>
              <button
                onClick={handleAddMember}
                disabled={isSubmitting}
                className={styles.outlineBtn}
              >
                {isSubmitting ? "Inviting..." : "Invite via Email"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
