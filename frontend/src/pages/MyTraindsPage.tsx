import React, { useEffect, useState } from "react";
import TraindStream from "../components/TraindStream";
import { Traind } from "../types/traind";
import {
  getMyTrainds,
  adaptTraindResponse,
  deleteTraind,
  setTraindVisibility,
} from "../api/traind";
import { toggleTraindStar } from "../api/star";
import styles from "./MyTraindsPage.module.css";

const MyTraindsPage: React.FC = () => {
  const [trainds, setTrainds] = useState<Traind[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadTrainds();
  }, []);

  const loadTrainds = async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
      setTrainds([]);
      setCursor(undefined);
    }

    try {
      const response = await getMyTrainds({
        limit: 20,
        cursor: isLoadMore ? cursor : undefined,
      });
      const traindsList = response.trainds || [];

      // Adapt backend response to frontend format
      const adaptedTrainds = traindsList.map(adaptTraindResponse);

      if (isLoadMore) {
        setTrainds((prev) => [...prev, ...adaptedTrainds]);
      } else {
        setTrainds(adaptedTrainds);
      }

      setHasNextPage(response.hasNextPage || false);
      setTotalCount(response.totalCount || traindsList.length);

      // Use the nextCursor from backend response
      if (response.nextCursor) {
        setCursor(response.nextCursor);
      } else {
        setCursor(undefined);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load your trainds");
      if (!isLoadMore) {
        setTrainds([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleTraindClick = (traind: Traind) => {
    console.log("Navigate to traind:", traind.id);
    // TODO: Implement navigation to traind detail page
    alert(`Would navigate to traind: ${traind.title}`);
  };

  const handleStarToggle = async (traindId: string, isStarred: boolean) => {
    try {
      const result = await toggleTraindStar(traindId);
      // Update local state with the actual response
      setTrainds((prevTrainds) =>
        prevTrainds.map((traind) =>
          traind.id === traindId
            ? {
                ...traind,
                _count: {
                  stars: result.starCount || traind._count?.stars || 0,
                  comments: traind._count?.comments || 0,
                },
              }
            : traind
        )
      );
    } catch (err: any) {
      console.error("Failed to toggle star:", err);
      // Show error to user
      alert("Failed to toggle star: " + err.message);
    }
  };

  const handleDelete = async (traindId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this traind? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteTraind(traindId);
      setTrainds((prevTrainds) =>
        prevTrainds.filter((traind) => traind.id !== traindId)
      );
      setTotalCount((prev) => prev - 1);
    } catch (err: any) {
      alert("Failed to delete traind: " + err.message);
    }
  };

  const handleVisibilityToggle = async (
    traindId: string,
    currentVisibility: boolean
  ) => {
    try {
      await setTraindVisibility(traindId, !currentVisibility);
      setTrainds((prevTrainds) =>
        prevTrainds.map((traind) =>
          traind.id === traindId
            ? { ...traind, isPublic: !currentVisibility }
            : traind
        )
      );
    } catch (err: any) {
      alert("Failed to update visibility: " + err.message);
    }
  };

  const loadMoreTrainds = () => {
    if (!loadingMore && hasNextPage) {
      loadTrainds(true);
    }
  };

  const getEmptyMessage = () => {
    return "You haven't created any trainds yet. Start by running your first analysis!";
  };

  return (
    <div className={styles.myTraindsPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Trainds</h1>
        <p className={styles.subtitle}>
          Manage your Reddit trend analysis results and share insights with the
          community
        </p>

        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{totalCount}</span>
            <span className={styles.statLabel}>Total Trainds</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>
              {trainds.filter((t) => t.isPublic).length}
            </span>
            <span className={styles.statLabel}>Public</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>
              {trainds.filter((t) => !t.isPublic).length}
            </span>
            <span className={styles.statLabel}>Private</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>
              {trainds.reduce((sum, t) => sum + (t._count?.stars || 0), 0)}
            </span>
            <span className={styles.statLabel}>Total Stars</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => loadTrainds()}
        className={styles.refreshButton}
        disabled={loading}
      >
        🔄 {loading ? "Loading..." : "Refresh"}
      </button>

      {error && (
        <div className={styles.errorMessage}>
          <p>Error loading your trainds: {error}</p>
          <button onClick={() => loadTrainds()} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      )}

      <TraindStream
        trainds={trainds}
        loading={loading}
        hasError={!!error}
        onTraindClick={handleTraindClick}
        onStarToggle={handleStarToggle}
        onDelete={handleDelete}
        showActions={true}
        emptyMessage={getEmptyMessage()}
      />

      {!loading && trainds.length > 0 && hasNextPage && (
        <div className={styles.loadMoreSection}>
          <button
            onClick={loadMoreTrainds}
            className={styles.loadMoreButton}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {!loading && trainds.length > 0 && (
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Showing {trainds.length} of {totalCount} traind
            {totalCount !== 1 ? "s" : ""}
            {hasNextPage &&
              totalCount > trainds.length &&
              ` • ${totalCount - trainds.length} more available`}
          </p>
        </div>
      )}
    </div>
  );
};

export default MyTraindsPage;
