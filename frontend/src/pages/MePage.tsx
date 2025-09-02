/**
 * User profile and settings page
 * Multi-tab interface for managing personal data, preferences, and activity
 */

import React, { useEffect, useState } from "react";
import useRequireAuth from "../utils/useRequireAuth";
import { useNavigate } from "react-router-dom";
import { HistoryItem, getHistory, removeFromHistory } from "../api/history";
import { StarItem, getStarredTrainds } from "../api/star";
import { getParameterSets, ParameterSet } from "../api/parameterSet";
import {
  getPreferences,
  updatePreferences,
  UserPreferences,
} from "../api/preference";
import { getMyTrainds, TraindWithPagination } from "../api/traind";
import TraindStream from "../components/TraindStream";
import ThemeSelect from "../components/ThemeSelect";
import PasswordReset from "../components/PasswordReset";
import JsonTreeView from "../components/JsonTreeView";
import { showError, showSuccess } from "../components/Toast";
import styles from "./MePage.module.css";

const MePage: React.FC = () => {
  const [myTrainds, setMyTrainds] = useState<TraindWithPagination[]>([]);
  useRequireAuth();
  const [activeTab, setActiveTab] = useState<
    "overview" | "history" | "starred" | "parameters" | "settings"
  >("overview");
  const [activeSettingsTab, setActiveSettingsTab] = useState<
    "theme" | "preferences" | "password" | "help"
  >("theme");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [recentHistory, setRecentHistory] = useState<HistoryItem[]>([]);
  const [starredItems, setStarredItems] = useState<StarItem[]>([]);
  const [starredTrainds, setStarredTrainds] = useState<TraindWithPagination[]>(
    []
  );
  const [parameterSets, setParameterSets] = useState<ParameterSet[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [userStats, setUserStats] = useState({
    totalTrainds: 0,
    publicTrainds: 0,
    totalStars: 0,
    totalHistory: 0,
  });

  const navigate = useNavigate();

  // States for TraindStream usage
  const [historyTrainds, setHistoryTrainds] = useState<TraindWithPagination[]>(
    []
  );

  // Tab configuration
  const tabs = [
    { key: "overview", label: "Overview", icon: "📊" },
    { key: "history", label: "History", icon: "📚" },
    { key: "starred", label: "Starred", icon: "⭐" },
    { key: "parameters", label: "Parameters", icon: "⚙️" },
    { key: "settings", label: "Settings", icon: "🔧" },
  ] as const;

  // Stat card configuration
  const statCards = [
    {
      title: "My Trainds",
      value: userStats.totalTrainds,
      detail: `${userStats.publicTrainds} public`,
      icon: "📈",
    },
    {
      title: "Total Stars",
      value: userStats.totalStars,
      detail: "received",
      icon: "⭐",
    },
    {
      title: "History",
      value: userStats.totalHistory,
      detail: "viewed trainds",
      icon: "📚",
    },
    {
      title: "Starred",
      value: starredTrainds.length,
      detail: "items",
      icon: "💖",
    },
  ];

  useEffect(() => {
    loadOverviewData();
  }, []);

  useEffect(() => {
    switch (activeTab) {
      case "history":
        loadHistory();
        break;
      case "starred":
        loadStarredTrainds();
        break;
      case "parameters":
        loadParameterSets();
        break;
      case "settings":
        loadPreferences();
        break;
    }
  }, [activeTab]);

  const loadOverviewData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [historyRes, starredRes, myTraindsRes, paramSetsRes] =
        await Promise.all([
          getHistory({ limit: 3 }),
          getStarredTrainds({ limit: 3 }),
          getMyTrainds({ limit: 4 }),
          getParameterSets().catch(() => ({ parameterSets: [] })),
        ]);

      setRecentHistory(historyRes.histories || []);
      setStarredItems(starredRes.stars || []);
      setParameterSets(paramSetsRes.parameterSets || []);

      const recentHistoryTrainds = (historyRes.histories || [])
        .filter((item) => item.traind)
        .map((item) => item.traind!)
        .slice(0, 3);

      const recentStarredTrainds = (starredRes.stars || [])
        .filter((item) => item.traind)
        .map((item) => item.traind!)
        .slice(0, 3);

      setHistoryTrainds(recentHistoryTrainds);
      setStarredTrainds(recentStarredTrainds);

      const trainds = myTraindsRes.trainds || [];
      setMyTrainds(trainds);
      setUserStats({
        totalTrainds: myTraindsRes.totalCount || trainds.length,
        publicTrainds: trainds.filter((t) => t.isPublic).length,
        totalStars: trainds.reduce((sum, t) => sum + (t._count?.stars || 0), 0),
        totalHistory: historyRes.totalCount || 0,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await getHistory({ limit: 20 });
      setRecentHistory(response.histories || []);

      const trainds: TraindWithPagination[] = [];
      const historyItems = response.histories || [];

      for (const item of historyItems) {
        if (item.traind) {
          trainds.push(item.traind);
        }
      }

      setHistoryTrainds(trainds);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStarredTrainds = async () => {
    setLoading(true);
    try {
      const response = await getStarredTrainds({ limit: 20 });
      setStarredItems(response.stars || []);

      const trainds: TraindWithPagination[] = [];
      const starredItems = response.stars || [];

      for (const item of starredItems) {
        if (item.traind) {
          trainds.push(item.traind);
        }
      }

      setStarredTrainds(trainds);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadParameterSets = async () => {
    setLoading(true);
    try {
      const response = await getParameterSets();
      setParameterSets(response.parameterSets || []);
    } catch (err: any) {
      setError("Parameter sets feature not available yet");
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const response = await getPreferences();
      setPreferences(response.preferences || {});
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceUpdate = async (
    updatedPreferences: UserPreferences
  ) => {
    try {
      await updatePreferences(updatedPreferences);
      setPreferences(updatedPreferences);
      showSuccess("Preferences updated successfully!");
    } catch (err: any) {
      showError("Failed to update preferences: " + err.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const StatCard = ({ title, value, detail, icon }: any) => (
    <div className={styles.statCard}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statValue}>{value}</div>
      <h3>{title}</h3>
      <div className={styles.statDetail}>{detail}</div>
    </div>
  );

  const EmptyState = ({
    message,
    icon = "📭",
  }: {
    message: string;
    icon?: string;
  }) => (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{icon}</div>
      <p className={styles.emptyMessage}>{message}</p>
    </div>
  );

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

  const renderOverview = () => (
    <div>
      <div className={styles.statsGrid}>
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>
      <h3 className={styles.sectionTitle}>My Published Trainds</h3>
      <div
        className={styles.sectionCard}
        onClick={() => navigate("/my-trainds")}
      >
        <div className={styles.sectionCardContent}>
          {Array.isArray(myTrainds) &&
            myTrainds.slice(0, 3).map((traind) => (
              <div key={traind.id} className={styles.recentItem}>
                <span className={styles.itemTitle}>{traind.title}</span>
                <span className={styles.itemMeta}>
                  r/{traind.subreddit} • {formatDate(traind.createdAt)}
                </span>
              </div>
            ))}

          {(!Array.isArray(myTrainds) || myTrainds.length === 0) && (
            <EmptyState message="No published trainds" icon="📊" />
          )}
        </div>
        {userStats.totalTrainds > 3 && (
          <span className={styles.moreIndicator}>...</span>
        )}
      </div>
    </div>
  );

  const renderHistory = () => (
    <>
      <h2 className={styles.sectionTitle}>Browse History</h2>
      <TraindStream
        trainds={historyTrainds}
        loading={loading}
        hasError={!!error}
        showActions={true}
        emptyMessage="No history found"
      />
    </>
  );

  const renderStarred = () => (
    <>
      <h2 className={styles.sectionTitle}>Starred Trainds</h2>
      <TraindStream
        trainds={starredTrainds}
        loading={loading}
        hasError={!!error}
        showActions={true}
        emptyMessage="No starred trainds found"
      />
    </>
  );

  const renderParameters = () => (
    <>
      <h3 className={styles.sectionTitle}>My Parameter Sets</h3>
      {parameterSets.length > 0 ? (
        <div className={styles.itemsList}>
          {parameterSets.map((paramSet) => (
            <div key={paramSet.id} className={styles.parameterItem}>
              <h4 className={styles.itemTitle}>{paramSet.name}</h4>
              <p className={styles.itemMeta}>
                Created: {formatDate(paramSet.createdAt)}
              </p>
              <div className={styles.parameterConfig}>
                {paramSet.parameters && (
                  <JsonTreeView data={paramSet.parameters} />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="No parameter sets saved" icon="⚙️" />
      )}
    </>
  );

  const renderSettings = () => {
    const settingsTabs = [
      { key: "theme", label: "Theme", icon: "🎨" },
      { key: "preferences", label: "Preferences", icon: "⚙️" },
      { key: "password", label: "Password Reset", icon: "🔑" },
      { key: "help", label: "Help", icon: "❓" },
    ] as const;

    const renderTheme = () => (
      <div className={styles.settingsSubContent}>
        <h4>🎨 Theme Settings</h4>
        <p>
          Select a theme that suits your preference. This setting is saved to
          your account.
        </p>
        <div className={styles.preferenceGroup}>
          <label htmlFor="themeSelector">Theme:</label>
          <div className={styles.themeSelectWrapper}>
            <ThemeSelect />
          </div>
        </div>
      </div>
    );

    const renderPreferences = () => (
      <div className={styles.settingsSubContent}>
        <h4>⚙️ Preference Settings</h4>
        <div className={styles.preferencesForm}>
          <div className={styles.preferenceGroup}>
            <label htmlFor="publicByDefault" className={styles.checkboxLabel}>
              <input
                id="publicByDefault"
                type="checkbox"
                checked={preferences.makeTraindsPublicAsDefault || false}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    makeTraindsPublicAsDefault: e.target.checked,
                  }))
                }
                className={styles.checkbox}
              />
              Make trainds public by default
            </label>
          </div>

          <div className={styles.preferenceGroup}>
            <label
              htmlFor="emailNotifications"
              className={styles.checkboxLabel}
            >
              <input
                id="emailNotifications"
                type="checkbox"
                checked={preferences.emailNotifications || false}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    emailNotifications: e.target.checked,
                  }))
                }
                className={styles.checkbox}
              />
              Email notifications
            </label>
          </div>

          <ActionButton
            onClick={() => handlePreferenceUpdate(preferences)}
            variant="primary"
          >
            💾 Save Preferences
          </ActionButton>
        </div>
      </div>
    );

    const renderPasswordReset = () => (
      <div className={styles.settingsSubContent}>
        <h4>🔑 Password Reset</h4>
        <p>
          Reset your password if you've forgotten it or want to change it for
          security reasons.
        </p>
        <PasswordReset />

        <div className={styles.securityTip}>
          <h5>🛡️ Security Best Practices</h5>
          <ul>
            <li>
              Use a strong password with uppercase, lowercase, numbers, and
              special characters
            </li>
            <li>Don't use the same password on multiple websites</li>
            <li>Update your password regularly</li>
            <li>Remember to log out when using public devices</li>
          </ul>
        </div>
      </div>
    );

    const renderHelp = () => (
      <div className={styles.settingsSubContent}>
        <h4>❓ Help & Support</h4>

        <div className={styles.helpEntries}>
          <div className={styles.helpEntry}>
            <h5>📚 User Guide</h5>
            <p>Learn how to use Traind.online effectively</p>
            <button
              onClick={() => navigate("/help")}
              className={`${styles.actionButton} ${styles.secondary}`}
            >
              Open Help Center
            </button>
          </div>

          <div className={styles.helpEntry}>
            <h5>💬 Contact Support</h5>
            <p>Get help with technical issues or account problems</p>
            <button
              type="button"
              onClick={() => window.open("mailto:support@traind.online")}
              className={`${styles.actionButton} ${styles.secondary}`}
            >
              Send Email
            </button>
          </div>
        </div>
      </div>
    );

    return (
      <>
        <h3 className={styles.sectionTitle}>Settings</h3>

        <div className={styles.settingsTabs}>
          {settingsTabs.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.settingsTab} ${
                activeSettingsTab === tab.key ? styles.active : ""
              }`}
              onClick={() => setActiveSettingsTab(tab.key as any)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.settingsContent}>
          {activeSettingsTab === "theme" && renderTheme()}
          {activeSettingsTab === "preferences" && renderPreferences()}
          {activeSettingsTab === "password" && renderPasswordReset()}
          {activeSettingsTab === "help" && renderHelp()}
        </div>
      </>
    );
  };

  return (
    <div className={styles.mePage}>
      <div className={styles.header}>
        <h1>My Profile</h1>
        <p>Manage your trainds, preferences, and view your activity</p>
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

      {error && (
        <div className={styles.errorMessage}>
          <p>Error: {error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <div className={styles.content}>
        {loading && <div className={styles.loading}>Loading...</div>}

        {!loading && (
          <>
            {activeTab === "overview" && renderOverview()}
            {activeTab === "history" && renderHistory()}
            {activeTab === "starred" && renderStarred()}
            {activeTab === "parameters" && renderParameters()}
            {activeTab === "settings" && renderSettings()}
          </>
        )}
      </div>
    </div>
  );
};

export default MePage;
