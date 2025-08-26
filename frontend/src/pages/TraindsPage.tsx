/**
 * Public trainds discovery page
 * Displays trending Reddit analysis posts shared by the community
 */

import React, { useEffect, useState } from "react";
import { Traind } from "../types/traind";
import { getFeed, adaptFeedResponse, FeedResponse } from "../api/feed";
import TraindStream from "../components/TraindStream";
import styles from "./TraindsPage.module.css";

const TraindsPage: React.FC = () => {
  // State management for feed data
  const [trainds, setTrainds] = useState<Traind[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedMeta, setFeedMeta] = useState<FeedResponse["meta"] | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [recommendationReason, setRecommendationReason] = useState<string[]>(
    []
  );

  // Load trending feed on component mount
  useEffect(() => {
    loadTrendingFeed();
  }, []);

  // Fetch trending trainds from API
  const loadTrendingFeed = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use 100% trending weight (pure popularity-based ranking)
      const feedResponse = await getFeed({
        collaborative: 0,
        content: 0,
        trending: 100,
      });

      const adaptedResponse = adaptFeedResponse(feedResponse);

      setTrainds(adaptedResponse.trainds);
      setFeedMeta(adaptedResponse.meta);
      setTotalCount(adaptedResponse.total);
      setRecommendationReason(adaptedResponse.recommendationReason || []);
    } catch (err: any) {
      setError(err.message || "Failed to load trending trainds");
      setTrainds([]);
    } finally {
      setLoading(false);
    }
  };

  // Message for empty state
  const getEmptyMessage = () => {
    return "No public trainds available. Be the first to share your analysis!";
  };

  // Format timestamp for display
  const formatGeneratedTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className={styles.traindsPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Trainds</h1>
        <p className={styles.subtitle}>
          Discover the most popular Reddit trend analysis from the community
        </p>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          onClick={loadTrendingFeed}
          className={styles.refreshButton}
          disabled={loading}
        >
          🔄 {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <p>Error loading trending trainds: {error}</p>
          <button
            type="button"
            onClick={loadTrendingFeed}
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
        showActions={true}
        emptyMessage={getEmptyMessage()}
      />

      {!loading && trainds.length > 0 && (
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Showing {trainds.length} trending traind
            {trainds.length !== 1 ? "s" : ""}
            {feedMeta && (
              <span className={styles.footerMeta}>
                • Generated at {formatGeneratedTime(feedMeta.generatedAt)}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default TraindsPage;
