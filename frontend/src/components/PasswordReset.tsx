/**
 * Password Reset Component
 * Allows users to request password reset via email
 */

import React, { useState } from "react";
import { showError, showSuccess } from "./Toast";
import styles from "./PasswordReset.module.css";

const PasswordReset: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"request" | "sent">("request");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showError("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep("sent");
        showSuccess("Password reset email sent! Please check your inbox.");
      } else {
        showError(data.message || "Failed to send reset email");
      }
    } catch (error) {
      console.error("Password reset request failed:", error);
      showError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewRequest = () => {
    setStep("request");
    setEmail("");
  };

  if (step === "sent") {
    return (
      <div className={styles.passwordReset}>
        <div className={styles.successState}>
          <div className={styles.successIcon}>📧</div>
          <h3>Check Your Email</h3>
          <p>
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <p className={styles.note}>
            The link will expire in 5 minutes for security reasons.
          </p>
          <button
            type="button"
            onClick={handleNewRequest}
            className={styles.secondaryButton}
          >
            Send to Different Email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.passwordReset}>
      <h3>Reset Password</h3>
      <p className={styles.description}>
        Enter your email address and we'll send you a link to reset your
        password.
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="resetEmail">Email Address</label>
          <input
            id="resetEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            disabled={loading}
            className={styles.input}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email.trim()}
          className={styles.submitButton}
        >
          {loading ? (
            <>
              <span className={styles.spinner}></span>
              Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>

      <div className={styles.note}>
        <strong>Note:</strong> For security reasons, reset links expire after 5
        minutes.
      </div>
    </div>
  );
};

export default PasswordReset;
