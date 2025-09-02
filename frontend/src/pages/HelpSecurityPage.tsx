/**
 * Help and Security page
 * Provides help resources and password reset functionality
 * Accessible to all users (logged in or not)
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PasswordReset from "../components/PasswordReset";
import ThemeSelect from "../components/ThemeSelect";
import { useAuth } from "../contexts/AuthContext";
import styles from "./HelpSecurityPage.module.css";

const HelpSecurityPage: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"help" | "security" | "theme">(
    "help"
  );

  // Tab configuration
  const tabs = [
    { key: "help", label: "Help", icon: "❓" },
    { key: "security", label: "Security", icon: "🔒" },
    { key: "theme", label: "Theme", icon: "🎨" },
  ] as const;

  const ActionButton = ({
    children,
    onClick,
    variant = "primary",
    ...props
  }: any) => (
    <button
      className={`${styles.actionButton} ${styles[variant]}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );

  const renderHelp = () => (
    <div className={styles.tabContent}>
      <h3>Help & Support</h3>
      <div className={styles.helpEntries}>
        <div className={styles.helpEntry}>
          <h4>📚 User Guide</h4>
          <p>Learn how to use Traind.online effectively</p>
          <ActionButton onClick={() => navigate("/help")} variant="secondary">
            Open Help Center
          </ActionButton>
        </div>

        {!isLoggedIn && (
          <div className={styles.helpEntry}>
            <h4>🔑 Account Access</h4>
            <p>Need to access your account? Login or create a new account</p>
            <div className={styles.buttonGroup}>
              <ActionButton
                onClick={() => navigate("/", { state: { modal: "login" } })}
                variant="primary"
              >
                Login
              </ActionButton>
              <ActionButton
                onClick={() => navigate("/", { state: { modal: "register" } })}
                variant="secondary"
              >
                Register
              </ActionButton>
            </div>
          </div>
        )}

        <div className={styles.helpEntry}>
          <h4>💬 Contact Support</h4>
          <p>Get help with technical issues or account problems</p>
          <ActionButton
            onClick={() => window.open("mailto:support@traind.online")}
            variant="secondary"
          >
            Send Email
          </ActionButton>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className={styles.tabContent}>
      <h3>Security & Password</h3>
      <div className={styles.securitySection}>
        <h4>🔒 Reset Password</h4>
        <p>Enter your email address to receive a password reset link</p>
        <PasswordReset />
      </div>

      {isLoggedIn && (
        <div className={styles.securityTip}>
          <h4>🛡️ Security Tips</h4>
          <ul>
            <li>Use a strong, unique password for your account</li>
            <li>Never share your password with others</li>
            <li>Log out from shared or public computers</li>
            <li>
              Contact support immediately if you notice suspicious activity
            </li>
          </ul>
        </div>
      )}
    </div>
  );

  const renderTheme = () => (
    <div className={styles.tabContent}>
      <h3>Theme Settings</h3>
      <div className={styles.themeSection}>
        <h4>🎨 Choose Your Theme</h4>
        <p>
          Select a theme that suits your preference. This setting is saved
          locally.
        </p>
        <div className={styles.themeSelectWrapper}>
          <ThemeSelect />
        </div>
        {!isLoggedIn && (
          <div className={styles.note}>
            <strong>Note:</strong> Theme settings are saved locally. To sync
            preferences across devices, please{" "}
            <button
              onClick={() => navigate("/", { state: { modal: "login" } })}
              className={styles.linkButton}
            >
              login
            </button>{" "}
            to your account.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.helpSecurityPage}>
      <div className={styles.header}>
        <h1>Help & Security</h1>
        <p>Get help, manage security settings, and customize your experience</p>
      </div>

      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${
              activeTab === tab.key ? styles.active : ""
            }`}
            onClick={() => setActiveTab(tab.key as any)}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === "help" && renderHelp()}
        {activeTab === "security" && renderSecurity()}
        {activeTab === "theme" && renderTheme()}
      </div>
    </div>
  );
};

export default HelpSecurityPage;
