import React, { useEffect, useState } from "react";
import TraindStream from "../components/TraindStream";
import { Traind } from "../types/traind";
import { mockTraindApi } from "../api/mockTraindApi";
import styles from "./TraindsPage.module.css";

const TraindsPage: React.FC = () => {
  const [trainds, setTrainds] = useState<Traind[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "public" | "my">("all");
  const [stats, setStats] = useState({
    total: 0,
    public: 0,
    private: 0,
    starred: 0,
  });

  useEffect(() => {
    loadTrainds();
  }, [filter]);

  const loadTrainds = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;

      switch (filter) {
        case "public":
          response = await mockTraindApi.getPublicTrainds({ limit: 50 });
          break;
        case "my":
          response = await mockTraindApi.getMyTrainds({ limit: 50 });
          break;
        default:
          response = await mockTraindApi.getTrainds({ limit: 50 });
          break;
      }

      if ("error" in response) {
        setError(response.error);
      } else {
        const traindsData = response.data || [];
        setTrainds(traindsData);

        // Calculate stats
        const publicCount = traindsData.filter((t) => t.isPublic).length;
        const privateCount = traindsData.length - publicCount;
        const starredCount = traindsData.reduce(
          (sum, t) => sum + (t._count?.stars || 0),
          0
        );

        setStats({
          total: traindsData.length,
          public: publicCount,
          private: privateCount,
          starred: starredCount,
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load trainds");
    } finally {
      setLoading(false);
    }
  };

  const handleTraindClick = (traind: Traind) => {
    console.log("Navigate to traind:", traind.id);
    // TODO: Implement navigation to traind detail page
    alert(`Would navigate to traind: ${traind.title}`);
  };

  const handleStarToggle = async (traindId: string, isStarred: boolean) => {
    try {
      const response = await mockTraindApi.toggleTraindStar(traindId);
      if ("success" in response && response.success) {
        // Update local state
        setTrainds((prevTrainds) =>
          prevTrainds.map((traind) =>
            traind.id === traindId
              ? {
                  ...traind,
                  _count: {
                    stars: (traind._count?.stars || 0) + (isStarred ? -1 : 1),
                    comments: traind._count?.comments || 0,
                  },
                }
              : traind
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle star:", err);
    }
  };

  const handleDelete = async (traindId: string) => {
    try {
      const response = await mockTraindApi.deleteTraind(traindId);
      if ("success" in response && response.success) {
        setTrainds((prevTrainds) =>
          prevTrainds.filter((traind) => traind.id !== traindId)
        );
      } else if ("error" in response) {
        alert("Failed to delete traind: " + response.error);
      }
    } catch (err: any) {
      alert("Failed to delete traind: " + err.message);
    }
  };

  const getEmptyMessage = () => {
    switch (filter) {
      case "public":
        return "No public trainds available. Be the first to share your analysis!";
      case "my":
        return "You haven't created any trainds yet. Start by running your first analysis!";
      default:
        return "No trainds found. Create your first analysis to get started!";
    }
  };

  return (
    <div className={styles.traindsPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Trainds</h1>
        <p className={styles.subtitle}>
          Explore Reddit trend analysis results and discover insights from the
          community
        </p>

        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.public}</span>
            <span className={styles.statLabel}>Public</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.private}</span>
            <span className={styles.statLabel}>Private</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.starred}</span>
            <span className={styles.statLabel}>Total Stars</span>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterButton} ${
              filter === "all" ? styles.active : ""
            }`}
            onClick={() => setFilter("all")}
          >
            🔍 All Trainds
          </button>
          <button
            className={`${styles.filterButton} ${
              filter === "public" ? styles.active : ""
            }`}
            onClick={() => setFilter("public")}
          >
            🌐 Public Feed
          </button>
          <button
            className={`${styles.filterButton} ${
              filter === "my" ? styles.active : ""
            }`}
            onClick={() => setFilter("my")}
          >
            👤 My Trainds
          </button>
        </div>

        <button onClick={loadTrainds} className={styles.refreshButton}>
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <p>Error loading trainds: {error}</p>
          <button onClick={loadTrainds} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      )}

      <TraindStream
        trainds={trainds}
        loading={loading}
        onTraindClick={handleTraindClick}
        onStarToggle={handleStarToggle}
        onDelete={filter === "my" ? handleDelete : undefined}
        showActions={true}
        emptyMessage={getEmptyMessage()}
      />

      {!loading && trainds.length > 0 && (
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Showing {trainds.length} traind{trainds.length !== 1 ? "s" : ""}
            {filter !== "all" && ` in ${filter} view`}
          </p>
        </div>
      )}
    </div>
  );
};

export default TraindsPage;
