import React, { useEffect, useRef, useState } from "react";
import { login, register, checkStatus } from "../api/auth";
import { useNavigate } from "react-router-dom";
import styles from "./WelcomePage.module.css";

type AuthMode = "login" | "register";

const WelcomePage = () => {
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    (async () => {
      const res = await checkStatus();
      if (res && res.valid) {
        navigate("/train");
      }
    })();
  }, [navigate]);
  const [showModal, setShowModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const open = (m: AuthMode, el?: HTMLButtonElement) => {
    if (el) {
      openerRef.current = el;
    }
    setMode(m);
    setShowModal(true);
    setIsClosing(false);
    setErrorMsg("");
  };

  const close = () => {
    document.activeElement instanceof HTMLElement &&
      document.activeElement.blur();
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      openerRef.current?.focus();
      setErrorMsg("");
    }, 200);
  };

  useEffect(() => {
    if (!showModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    firstInputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showModal]);

  useEffect(() => {
    if (!showModal || !dialogRef.current) return;
    const dialog = dialogRef.current;
    const selector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusables = Array.from(
      dialog.querySelectorAll<HTMLElement>(selector)
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const handle = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    };
    dialog.addEventListener("keydown", handle as any);
    return () => dialog.removeEventListener("keydown", handle as any);
  }, [showModal]);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (submitting) {
      return;
    }
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirmPassword") || "");

    if (mode === "register" && password !== confirm) {
      setErrorMsg("Passwords don’t match.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    if (mode === "login") {
      const user = await login({ email, password });
      if (user.error) {
        setErrorMsg(user.error);
        setSubmitting(false);
        return;
      }
      console.log("Logged in user:", user);
      window.location.reload();
      close();
    } else {
      const newUser = await register({
        email,
        password,
        confirmPassword: confirm,
      });
      if (newUser.error) {
        setErrorMsg(newUser.error);
        setSubmitting(false);
        return;
      }
      console.log("Registered user:", newUser);
      close();
    }
    setSubmitting(false);
  };

  const enterAsGuest = () => {
    navigate("/train");
  };

  useEffect(() => {
    const handleOpenLoginModal = () => open("login");
    const handleOpenRegisterModal = () => open("register");

    window.addEventListener("open-login-modal", handleOpenLoginModal);
    window.addEventListener("open-register-modal", handleOpenRegisterModal);

    return () => {
      window.removeEventListener("open-login-modal", handleOpenLoginModal);
      window.removeEventListener(
        "open-register-modal",
        handleOpenRegisterModal
      );
    };
  }, []);

  return (
    <div className={styles.fullscreen}>
      <div className={`${styles.centerText}`}>
        <h1 className={styles.title}>
          Tr<span className={styles.ai_highlight}>ai</span>nd.online
        </h1>
        <p className={styles.subtitle}>Traind to See, Trend to Know</p>

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.button}`}
            onClick={(e) => open("login", e.currentTarget)}
          >
            🔑 Log In
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.ghost}`}
            onClick={(e) => open("register", e.currentTarget)}
          >
            📝 Register
          </button>
        </div>
        <div className={styles.guestLink}>
          <button
            type="button"
            className={styles.linkButton}
            onClick={enterAsGuest}
          >
            Enter as Guest
          </button>
        </div>
      </div>

      {showModal && (
        <div
          className={`${styles.modalOverlay} ${
            isClosing ? styles.overlayHide : styles.overlayShow
          }`}
          onClick={close}
          aria-hidden="true"
        >
          <div
            ref={dialogRef}
            className={`${styles.modal} ${
              isClosing ? styles.modalHide : styles.modalShow
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="authDialogTitle"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.tabs} role="tablist" aria-label="Auth mode">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "login"}
                className={`${styles.tab} ${
                  mode === "login" ? styles.tabActive : ""
                }`}
                onClick={() => setMode("login")}
              >
                Log In
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "register"}
                className={`${styles.tab} ${
                  mode === "register" ? styles.tabActive : ""
                }`}
                onClick={() => setMode("register")}
              >
                Register
              </button>
            </div>

            <h2 id="authDialogTitle" className={styles.modalTitle}>
              {mode === "login" ? "Welcome back" : "Register an account"}
            </h2>

            <form className={styles.form} onSubmit={onSubmit}>
              {errorMsg && (
                <div className={styles.errorMsg} role="alert">
                  {errorMsg}
                </div>
              )}
              <div className={styles.formRow}>
                <label className={styles.label} htmlFor="email">
                  E‑mail
                </label>
                <input
                  ref={firstInputRef}
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={styles.input}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div className={styles.formRow}>
                <label className={styles.label} htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className={styles.input}
                  placeholder="••••••••"
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                />
              </div>

              {mode === "register" && (
                <div className={styles.formRow}>
                  <label className={styles.label} htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    className={styles.input}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
              )}

              <div className={styles.modalActions}>
                <button
                  type="submit"
                  className={styles.button}
                  disabled={submitting}
                >
                  {submitting
                    ? "Please wait…"
                    : mode === "login"
                    ? "Log In"
                    : "Register"}
                </button>
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={close}
                >
                  Close
                </button>
              </div>

              <div className={styles.switchHint}>
                {mode === "login" ? (
                  <div className={styles.hintText}>
                    Don’t have an account?
                    <button
                      type="button"
                      className={styles.linkButton}
                      onClick={() => setMode("register")}
                    >
                      Go to Register
                    </button>
                  </div>
                ) : (
                  <div className={styles.hintText}>
                    Already have an account?
                    <button
                      type="button"
                      className={styles.linkButton}
                      onClick={() => setMode("login")}
                    >
                      Go to Log In
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomePage;
