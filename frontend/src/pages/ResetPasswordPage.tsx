/**
 * Reset Password Page
 * Handles password reset functionality using token from URL
 *
 * Filename: ResetPasswordPage.tsx
 * Author: Haicheng Zhao
 * Date: 2025-09-02
 * AI Usage Declaration:
 * - This file contains code generated with the help of AI tools.
 * - Tool Used: Claude
 * - Date Generated: 2025-09-02
 * - AI-generated sections are marked with comments: # [AI-GENERATED]
 * I have reviewed, tested, and understood all AI-generated code.
 */

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../api/auth";
import styles from "./ResetPasswordPage.module.css";

// [AI-GENERATED: Claude, 2025-09-02]
const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (!urlToken) {
      setMessage(
        "Invalid or missing reset token. Please request a new password reset."
      );
      return;
    }
    setToken(urlToken);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setMessage("Invalid reset token.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const result = await resetPassword(token, password);

      if (result.error) {
        setMessage(result.error);
        setIsSuccess(false);
      } else {
        setMessage(
          "Password reset successful! You can now log in with your new password."
        );
        setIsSuccess(true);
        // Redirect to home page after 3 seconds
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    } catch (error) {
      setMessage("An unexpected error occurred. Please try again.");
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.resetCard}>
        <div className={styles.header}>
          <h1>Reset Your Password</h1>
          <p>Enter your new password below</p>
        </div>

        {!token ? (
          <div className={styles.errorSection}>
            <div className={styles.errorIcon}>⚠️</div>
            <p>
              Invalid or missing reset token. Please request a new password
              reset.
            </p>
            <button onClick={() => navigate("/")} className={styles.homeButton}>
              Return to Home
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Enter your new password"
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Confirm your new password"
                disabled={isSubmitting}
              />
            </div>

            {message && (
              <div
                className={`${styles.message} ${
                  isSuccess ? styles.success : styles.error
                }`}
              >
                {isSuccess ? "✅" : "❌"} {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !password || !confirmPassword}
              className={styles.submitButton}
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>

            <div className={styles.footer}>
              <button
                type="button"
                onClick={() => navigate("/")}
                className={styles.backButton}
              >
                Back to Home
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
