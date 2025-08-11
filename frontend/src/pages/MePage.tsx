import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Traind } from "../types/traind";
import { HistoryItem, getHistory, removeFromHistory } from "../api/history";
import { StarItem, getStarredTrainds, toggleTraindStar } from "../api/star";
import { getParameterSets, ParameterSet } from "../api/parameterSet";
import {
  getPreferences,
  updatePreferences,
  UserPreferences,
} from "../api/preference";
import { getMyTrainds, TraindWithPagination } from "../api/traind";
import TraindStream from "../components/TraindStream";
import ThemeSelect from "../components/ThemeSelect";
import styles from "./MePage.module.css";

const MePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "history" | "starred" | "parameters" | "preferences"
  >("overview");
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
    { key: "preferences", label: "Preferences", icon: "🔧" },
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

  // Load data on component mount
  useEffect(() => {
    loadOverviewData();
  }, []);

  // Load data based on active tab
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
      case "preferences":
        loadPreferences();
        break;
    }
  }, [activeTab]);

  const loadOverviewData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load recent data for overview with smaller limits
      const [historyRes, starredRes, myTraindsRes, paramSetsRes] =
        await Promise.all([
          getHistory({ limit: 3 }),
          getStarredTrainds({ limit: 3 }),
          getMyTrainds({ limit: 50 }), // Reduced limit to avoid "Limit cannot exceed 50" error
          getParameterSets().catch(() => ({ parameterSets: [] })), // Handle if not available
        ]);

      setRecentHistory(historyRes.histories || []);
      setStarredItems(starredRes.stars || []);
      setParameterSets(paramSetsRes.parameterSets || []);

      // Extract trainds directly from API responses for overview display
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

      // Calculate user stats
      const trainds = myTraindsRes.trainds || [];
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

      // Extract trainds directly from the history response
      const trainds: TraindWithPagination[] = [];
      const historyItems = response.histories || [];

      for (const item of historyItems) {
        if (item.traind) {
          // Traind is already included in the response with complete data
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

      // Extract trainds directly from the starred response
      const trainds: TraindWithPagination[] = [];
      const starredItems = response.stars || [];

      for (const item of starredItems) {
        if (item.traind) {
          // Traind is already included in the response with complete data
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

  const handleRemoveFromHistory = async (traindId: string) => {
    try {
      await removeFromHistory(traindId);
      setRecentHistory((prev) =>
        prev.filter((item) => item.traindId !== traindId)
      );
    } catch (err: any) {
      alert("Failed to remove from history: " + err.message);
    }
  };

  const handleStarToggle = async (traindId: string) => {
    try {
      const result = await toggleTraindStar(traindId);
      // Reload starred trainds for both overview and tab views
      if (activeTab === "starred") {
        loadStarredTrainds();
      }
    } catch (err: any) {
      alert("Failed to toggle star: " + err.message);
    }
  };

  const handlePreferenceUpdate = async (
    updatedPreferences: UserPreferences
  ) => {
    try {
      await updatePreferences(updatedPreferences);
      setPreferences(updatedPreferences);
    } catch (err: any) {
      alert("Failed to update preferences: " + err.message);
    }
  };

  // Handle clicking on history/starred items to show corresponding tab
  const handleShowHistoryTab = () => {
    setActiveTab("history");
  };

  const handleShowStarredTab = () => {
    setActiveTab("starred");
  };

  const handleTraindClick = (traind: TraindWithPagination) => {
    console.log("Navigate to traind:", traind.id);
    // TODO: Implement navigation to traind detail page
    alert(`Would navigate to traind: ${traind.title}`);
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

  const SectionCard = ({ title, children, className = "" }: any) => (
    <div className={`${styles.sectionCard} ${className}`}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      {children}
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
    <div className={styles.overview}>
      <div className={styles.statsGrid}>
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      <div className={styles.recentSections}>
        <SectionCard title="Recent History">
          {historyTrainds.length > 0 ? (
            <>
              <div className={styles.recentItems}>
                {historyTrainds.slice(0, 3).map((traind) => (
                  <div
                    key={traind.id}
                    className={styles.recentItem}
                    onClick={handleShowHistoryTab}
                  >
                    <span className={styles.itemTitle}>{traind.title}</span>
                    <span className={styles.itemDate}>
                      r/{traind.subreddit} • {formatDate(traind.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
              <ActionButton onClick={handleShowHistoryTab} variant="secondary">
                See All History
              </ActionButton>
            </>
          ) : (
            <EmptyState message="No recent history" icon="📭" />
          )}
        </SectionCard>

        <SectionCard title="Starred Trainds">
          {starredTrainds.length > 0 ? (
            <>
              <div className={styles.recentItems}>
                {starredTrainds.slice(0, 3).map((traind) => (
                  <div
                    key={traind.id}
                    className={styles.recentItem}
                    onClick={handleShowStarredTab}
                  >
                    <span className={styles.itemTitle}>{traind.title}</span>
                    <span className={styles.itemMeta}>
                      {traind._count?.stars || 0} ⭐ • r/{traind.subreddit}
                    </span>
                  </div>
                ))}
              </div>
              <ActionButton onClick={handleShowStarredTab} variant="secondary">
                See All Starred
              </ActionButton>
            </>
          ) : (
            <EmptyState message="No starred trainds" icon="⭐" />
          )}
        </SectionCard>

        <SectionCard title="My Parameter Sets">
          {parameterSets.length > 0 ? (
            <>
              <div className={styles.recentItems}>
                {parameterSets.slice(0, 3).map((paramSet) => (
                  <div
                    key={paramSet.id}
                    className={styles.recentItem}
                    onClick={() => setActiveTab("parameters")}
                  >
                    <span className={styles.itemTitle}>{paramSet.name}</span>
                    <span className={styles.itemMeta}>
                      Created: {formatDate(paramSet.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
              <ActionButton
                onClick={() => setActiveTab("parameters")}
                variant="secondary"
              >
                Manage Parameters
              </ActionButton>
            </>
          ) : (
            <EmptyState message="No parameter sets saved" icon="⚙️" />
          )}
        </SectionCard>

        <SectionCard title="My Published Trainds">
          <div className={styles.recentItems}>
            <div
              className={styles.recentItem}
              onClick={() => window.open("/trainds", "_blank")}
            >
              <span className={styles.itemTitle}>📊 View My Trainds</span>
              <span className={styles.itemMeta}>
                {userStats.totalTrainds} total • {userStats.publicTrainds}{" "}
                public
              </span>
            </div>
          </div>
          <ActionButton
            onClick={() => window.open("/trainds", "_blank")}
            variant="secondary"
          >
            Manage My Trainds
          </ActionButton>
        </SectionCard>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className={styles.historySection}>
      <h2 className={styles.sectionTitle}>Browse History</h2>
      <TraindStream
        trainds={historyTrainds}
        loading={loading}
        hasError={!!error}
        onTraindClick={handleTraindClick}
        onStarToggle={(traindId, isStarred) => handleStarToggle(traindId)}
        showActions={true}
        emptyMessage="No history found"
      />
    </div>
  );

  const renderStarred = () => (
    <div className={styles.starredSection}>
      <h2 className={styles.sectionTitle}>Starred Trainds</h2>
      <TraindStream
        trainds={starredTrainds}
        loading={loading}
        hasError={!!error}
        onTraindClick={handleTraindClick}
        onStarToggle={(traindId, isStarred) => handleStarToggle(traindId)}
        showActions={true}
        emptyMessage="No starred trainds found"
      />
    </div>
  );

  const renderParameters = () => (
    <SectionCard title="My Parameter Sets" className={styles.parametersSection}>
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
                  <pre>{JSON.stringify(paramSet.parameters, null, 2)}</pre>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="No parameter sets saved" icon="⚙️" />
      )}
    </SectionCard>
  );

  const renderPreferences = () => (
    <SectionCard title="Preferences" className={styles.preferencesSection}>
      <div className={styles.preferencesForm}>
        <div className={styles.preferenceGroup}>
          <label htmlFor="themeSelector">Theme:</label>
          <div className={styles.themeSelectWrapper}>
            <ThemeSelect />
          </div>
        </div>

        <div className={styles.preferenceGroup}>
          <label htmlFor="defaultClusterCount">Default Cluster Count:</label>
          <input
            id="defaultClusterCount"
            type="number"
            value={preferences.defaultClusterCount || 5}
            onChange={(e) =>
              setPreferences((prev) => ({
                ...prev,
                defaultClusterCount: parseInt(e.target.value),
              }))
            }
            min="2"
            max="20"
            className={styles.preferenceInput}
          />
        </div>

        <div className={styles.preferenceGroup}>
          <label htmlFor="publicByDefault" className={styles.checkboxLabel}>
            <input
              id="publicByDefault"
              type="checkbox"
              checked={preferences.publicByDefault || false}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  publicByDefault: e.target.checked,
                }))
              }
              className={styles.checkbox}
            />
            Make trainds public by default
          </label>
        </div>

        <div className={styles.preferenceGroup}>
          <label htmlFor="emailNotifications" className={styles.checkboxLabel}>
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

        <div className={styles.preferenceGroup}>
          <label htmlFor="defaultSubreddits">
            Default Subreddits (comma-separated):
          </label>
          <input
            id="defaultSubreddits"
            type="text"
            value={preferences.defaultSubreddits?.join(", ") || ""}
            onChange={(e) =>
              setPreferences((prev) => ({
                ...prev,
                defaultSubreddits: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter((s) => s),
              }))
            }
            placeholder="e.g., news, worldnews, technology"
            className={styles.preferenceInput}
          />
        </div>

        <ActionButton
          onClick={() => handlePreferenceUpdate(preferences)}
          variant="primary"
        >
          💾 Save Preferences
        </ActionButton>
      </div>
    </SectionCard>
  );

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
            {activeTab === "preferences" && renderPreferences()}
          </>
        )}
      </div>
    </div>
  );
};

export default MePage;
