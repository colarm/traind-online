/**
 * User's personal trainds management page
 * Allows viewing, managing, and deleting user's own analysis results
 */

import React, { useEffect, useState } from "react";
import useRequireAuth from "../utils/useRequireAuth";
import TraindStream from "../components/TraindStream";
import { showSuccess, showError, showConfirm } from "../components/Toast";
import { Traind } from "../types/traind";
import { getMyTrainds, adaptTraindResponse, deleteTraind } from "../api/traind";
import styles from "./MyTraindsPage.module.css";

const MyTraindsPage: React.FC = () => {
  useRequireAuth(); // Require authentication for this page

  // State for trainds list and pagination
  const [trainds, setTrainds] = useState<Traind[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);

  // Load user's trainds on component mount
  useEffect(() => {
    loadTrainds();
  }, []);

  // Fetch trainds with pagination support
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

      // Convert backend format to frontend format
      const adaptedTrainds = traindsList.map(adaptTraindResponse);
      if (isLoadMore) {
        setTrainds((prev) => [...prev, ...adaptedTrainds]);
      } else {
        setTrainds(adaptedTrainds);
      }
      setHasNextPage(!!response.hasNextPage);
      setTotalCount(response.totalCount ?? traindsList.length);
      setCursor(response.nextCursor ?? undefined);
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

  // Handle traind deletion with confirmation
  const handleDelete = async (traindId: string) => {
    showConfirm({
      title: "Delete Traind",
      message:
        "Are you sure you want to delete this traind? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          const result = await deleteTraind(traindId);
          if (result.error) {
            showError(`Failed to delete traind: ${result.error}`);
            return;
          }

          showSuccess("Traind deleted successfully!");
          await loadTrainds(); // Refresh list after deletion
        } catch (err: any) {
          console.error("Delete traind error:", err);
          showError(
            `Failed to delete traind: ${err.message || "Unknown error"}`
          );
        }
      },
    });
  };

  // Load more trainds for pagination
  const loadMoreTrainds = () => {
    if (!loadingMore && hasNextPage) {
      loadTrainds(true);
    }
  };

  // Empty state message
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
        type="button"
        onClick={() => loadTrainds()}
        className={styles.refreshButton}
        disabled={loading}
      >
        🔄 {loading ? "Loading..." : "Refresh"}
      </button>

      {error && (
        <div className={styles.errorMessage}>
          <p>Error loading your trainds: {error}</p>
          <button
            type="button"
            onClick={() => loadTrainds()}
            className={styles.retryButton}
          >
            Try Again
          </button>
        </div>
      )}

      <TraindStream
        trainds={trainds}
        loading={loading}
        hasError={!!error}
        onDelete={handleDelete}
        showActions={true}
        emptyMessage={getEmptyMessage()}
      />

      {!loading && trainds.length > 0 && hasNextPage && (
        <div className={styles.loadMoreSection}>
          <button
            type="button"
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
