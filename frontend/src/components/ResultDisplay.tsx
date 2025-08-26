// Result viewer for Reddit post analysis with clustered comments
import React, { useState } from "react";
import styles from "./ResultDisplay.module.css";

interface ResultDisplayProps {
  result: any;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const [expandedClusters, setExpandedClusters] = useState<Set<number>>(
    new Set()
  );
  const [expandedSummaries, setExpandedSummaries] = useState<Set<number>>(
    new Set()
  );
  const [showAllSummaries, setShowAllSummaries] = useState(false);
  const [showAllClusters, setShowAllClusters] = useState(false);

  // Handle task in progress or error states
  if (result?.task_id && !result?.success) {
    return (
      <div className={styles.statusContainer}>
        {result.error ? (
          <div className={styles.errorStatus}>
            <div className={styles.statusIcon}>❌</div>
            <div className={styles.statusContent}>
              <h3>Analysis Failed</h3>
              <p>{result.error}</p>
              {result.timestamp && (
                <small>
                  Failed at: {new Date(result.timestamp).toLocaleString()}
                </small>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.processingStatus}>
            <div className={styles.statusIcon}>⏳</div>
            <div className={styles.statusContent}>
              <h3>Analysis in Progress</h3>
              <p>Your Reddit post is being analyzed...</p>
              <div className={styles.spinner}></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Handle invalid result format
  if (!result?.success) {
    return (
      <div className={styles.statusContainer}>
        <div className={styles.errorStatus}>
          <div className={styles.statusIcon}>⚠️</div>
          <div className={styles.statusContent}>
            <h3>Invalid Result</h3>
            <p>The analysis result format is not recognized.</p>
          </div>
        </div>
      </div>
    );
  }

  // Toggle cluster expansion
  const toggleCluster = (clusterId: number) => {
    const newExpanded = new Set(expandedClusters);
    if (newExpanded.has(clusterId)) {
      newExpanded.delete(clusterId);
    } else {
      newExpanded.add(clusterId);
    }
    setExpandedClusters(newExpanded);
  };

  // Toggle summary expansion
  const toggleSummary = (clusterId: number) => {
    const newExpanded = new Set(expandedSummaries);
    if (newExpanded.has(clusterId)) {
      newExpanded.delete(clusterId);
    } else {
      newExpanded.add(clusterId);
    }
    setExpandedSummaries(newExpanded);
  };

  return (
    <div className={styles.resultContainer}>
      <div className={styles.successBanner}>
        <div className={styles.statusIcon}>✅</div>
        <span>Analysis Completed Successfully</span>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>📝 Post Information</h3>
        <div className={styles.postInfo}>
          <div className={styles.postCard}>
            <div className={styles.postMeta}>
              <span className={styles.metaItem}>
                📍 r/{result.post_info?.subreddit}
              </span>
              <span className={styles.metaItem}>
                👤 {result.post_info?.author || "Unknown"}
              </span>
              <span className={styles.metaItem}>
                📊 {result.post_info?.score || 0} points
              </span>
              <span className={styles.metaItem}>
                💬 {result.post_info?.num_comments || 0} comments
              </span>
              <span className={styles.metaItem}>
                👍 {Math.round((result.post_info?.upvote_ratio || 0) * 100)}%
                upvoted
              </span>
            </div>
            {result.post_info?.selftext && (
              <div className={styles.postText}>
                <p>{result.post_info.selftext}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>📊 Analysis Overview</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{result.num_clusters || 0}</div>
            <div className={styles.statLabel}>Clusters Found</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>
              {result.total_processed || 0}
            </div>
            <div className={styles.statLabel}>Comments Processed</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>
              {Math.round((result.noise_ratio || 0) * 100)}%
            </div>
            <div className={styles.statLabel}>Noise Ratio</div>
          </div>
        </div>
      </div>

      {result.summaries && result.summaries.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>📋 Cluster Summaries</h3>
          <div className={styles.summariesContainer}>
            {(showAllSummaries
              ? result.summaries
              : result.summaries.slice(0, 3)
            ).map((summary: any, index: number) => (
              <div key={index} className={styles.summaryCard}>
                <div
                  className={styles.summaryHeader}
                  onClick={() => toggleSummary(summary.cluster_id)}
                >
                  <div className={styles.summaryTitle}>
                    <span className={styles.rankBadge}>#{summary.rank}</span>
                    <span>Cluster {summary.cluster_id}</span>
                    <span className={styles.sizeInfo}>
                      ({summary.size} comments)
                    </span>
                  </div>
                  <span className={styles.expandIcon}>
                    {expandedSummaries.has(summary.cluster_id) ? "▼" : "▶"}
                  </span>
                </div>

                <div className={styles.summaryPreview}>{summary.summary}</div>

                {expandedSummaries.has(summary.cluster_id) && (
                  <div className={styles.summaryDetails}>
                    {summary.keywords && summary.keywords.length > 0 && (
                      <div className={styles.keywordsSection}>
                        <h5>🔑 Keywords:</h5>
                        <div className={styles.keywords}>
                          {summary.keywords.map(
                            (keyword: string, keyIndex: number) => (
                              <span key={keyIndex} className={styles.keyword}>
                                {keyword}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {summary.sample_comments &&
                      summary.sample_comments.length > 0 && (
                        <div className={styles.samplesSection}>
                          <h5>💬 Sample Comments:</h5>
                          <div className={styles.sampleComments}>
                            {summary.sample_comments.map(
                              (comment: string, commentIndex: number) => (
                                <div
                                  key={commentIndex}
                                  className={styles.sampleComment}
                                >
                                  "{comment}"
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            ))}
            {result.summaries.length > 3 && (
              <div className={styles.showMoreContainer}>
                <button
                  className={styles.showMoreButton}
                  onClick={() => setShowAllSummaries(!showAllSummaries)}
                >
                  {showAllSummaries
                    ? "Show Less"
                    : `Show More (${result.summaries.length - 3} more)`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {result.clusters && Object.keys(result.clusters).length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>🎯 Comment Clusters</h3>
          <div className={styles.clustersContainer}>
            {(showAllClusters
              ? Object.entries(result.clusters)
              : Object.entries(result.clusters).slice(0, 3)
            ).map(([clusterId, comments]: [string, any]) => (
              <div key={clusterId} className={styles.clusterCard}>
                <div
                  className={styles.clusterHeader}
                  onClick={() => toggleCluster(parseInt(clusterId))}
                >
                  <span className={styles.clusterTitle}>
                    Cluster {clusterId} (
                    {Array.isArray(comments) ? comments.length : 0} comments)
                  </span>
                  <span className={styles.expandIcon}>
                    {expandedClusters.has(parseInt(clusterId)) ? "▼" : "▶"}
                  </span>
                </div>
                {expandedClusters.has(parseInt(clusterId)) && (
                  <div className={styles.clusterContent}>
                    {Array.isArray(comments) ? (
                      comments.map((comment: string, index: number) => (
                        <div key={index} className={styles.commentItem}>
                          {comment}
                        </div>
                      ))
                    ) : (
                      <div className={styles.noComments}>
                        No comments available
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {Object.keys(result.clusters).length > 3 && (
              <div className={styles.showMoreContainer}>
                <button
                  className={styles.showMoreButton}
                  onClick={() => setShowAllClusters(!showAllClusters)}
                >
                  {showAllClusters
                    ? "Show Less"
                    : `Show More (${
                        Object.keys(result.clusters).length - 3
                      } more)`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;
