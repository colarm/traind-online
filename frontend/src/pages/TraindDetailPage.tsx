/**
 * Individual traind detail view page
 * Displays full analysis results, parameters, and allows interaction
 * Filename: TraindDetailPage.tsx
 * Date: 2025-09-03
 *
 * AI Usage Declaration:
 * - This file contains code and comments that were generated or revised with the help of AI tools.
 * - Tool Used: Claude
 * - Date Generated: 2025-09-03
 * - AI-generated or AI-revised sections are marked with comments:
 *   # [AI-GENERATED] or # [AI-GENERATED: Claude, 2025-09-03]
 * The author has reviewed, tested, and understood all AI-generated code/comments.
 */

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getTraindById,
  getParameterSetId,
  setTraindVisibility,
} from "../api/traind";
import { loadParameterSet } from "../api/parameterSet";
import { addToHistory } from "../api/history";
import { useAuth } from "../contexts/AuthContext";
import CommentArea from "../components/CommentArea";
import ResultDisplay from "../components/ResultDisplay";
import { showSuccess, showError } from "../components/Toast";
import styles from "./TraindDetailPage.module.css";
import JsonTreeView from "../components/JsonTreeView";

const TraindDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get traind ID from URL
  const { isLoggedIn, username } = useAuth();

  // State management for traind data and operations
  const [traind, setTraind] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parameterSet, setParameterSet] = useState<any>(null);
  const [exporting, setExporting] = useState(false);
  const [changingVisibility, setChangingVisibility] = useState(false);

  // Load traind details when component mounts or ID changes
  useEffect(() => {
    if (!id) return;

    const loadTraindDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch traind data from API
        const traindData = await getTraindById(id);
        if (traindData.error) {
          setError(traindData.error);
          return;
        }
        setTraind(traindData);

        // Track viewing history for logged-in users
        if (isLoggedIn) {
          try {
            await addToHistory(id);
          } catch (historyError) {
            console.warn("Failed to add to history:", historyError);
          }
        }

        // Load parameter set data
        try {
          const parameterSetResponse = await getParameterSetId(id);
          if (
            !parameterSetResponse.error &&
            parameterSetResponse.parameterSetId
          ) {
            const paramSet = await loadParameterSet(
              parameterSetResponse.parameterSetId
            );
            if (paramSet) {
              setParameterSet(paramSet);
            }
          }
        } catch (paramError) {
          console.warn("Failed to load parameter set:", paramError);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load traind detail");
      } finally {
        setLoading(false);
      }
    };

    loadTraindDetail();
  }, [id, isLoggedIn]);

  // # [AI-GENERATED: Claude, 2025-09-03]
  const handleExport = async (format: string) => {
    if (!id || !traind) return;
    setExporting(true);

    try {
      // Use the existing traind data for export instead of calling API
      let exportData: any;
      let filename: string;
      let mimeType: string;

      if (format === "json") {
        // Export all traind data as JSON
        exportData = {
          id: traind.id,
          title: traind.title,
          postId: traind.postId,
          subreddit: traind.subreddit,
          result: traind.result,
          createdAt: traind.createdAt,
          isPublic: traind.isPublic,
          user: traind.user,
          parameterSet: parameterSet,
        };
        const jsonData = JSON.stringify(exportData, null, 2);
        filename = `traind-${id}-export.json`;
        mimeType = "application/json";
        downloadFile(jsonData, filename, mimeType);
      } else if (format === "csv") {
        // Export basic traind info and result summary as CSV
        const csvData = convertToCSV(traind);
        filename = `traind-${id}-export.csv`;
        mimeType = "text/csv";
        downloadFile(csvData, filename, mimeType);
      }

      showSuccess(`${format.toUpperCase()} export completed successfully!`);
    } catch (error: any) {
      console.error("Export error:", error);
      showError(`Export failed: ${error.message || "Export processing error"}`);
    } finally {
      setExporting(false);
    }
  };

  // Helper function to convert traind data to CSV format
  const convertToCSV = (traindData: any) => {
    const csvRows: string[] = [];

    // Add basic information
    csvRows.push("Section,Field,Value");
    csvRows.push(`Basic Info,ID,${traindData.id}`);
    csvRows.push(`Basic Info,Title,${traindData.title || "N/A"}`);
    csvRows.push(`Basic Info,Post ID,${traindData.postId || "N/A"}`);
    csvRows.push(`Basic Info,Subreddit,${traindData.subreddit || "N/A"}`);
    csvRows.push(
      `Basic Info,Created At,${new Date(traindData.createdAt).toLocaleString()}`
    );
    csvRows.push(`Basic Info,Is Public,${traindData.isPublic ? "Yes" : "No"}`);
    csvRows.push(`Basic Info,Status,${traindData.status || "Completed"}`);
    csvRows.push(`Basic Info,Author,${traindData.user?.username || "Unknown"}`);

    // Add post information if available
    if (traindData.result?.post_info) {
      const postInfo = traindData.result.post_info;
      csvRows.push(`Post Info,URL,${postInfo.url || "N/A"}`);
      csvRows.push(`Post Info,Score,${postInfo.score || "N/A"}`);
      csvRows.push(`Post Info,Author,${postInfo.author || "N/A"}`);
      csvRows.push(
        `Post Info,Comments Count,${postInfo.num_comments || "N/A"}`
      );
      csvRows.push(`Post Info,Upvote Ratio,${postInfo.upvote_ratio || "N/A"}`);
      csvRows.push(
        `Post Info,Self Text,${(postInfo.selftext || "").replace(/"/g, '""')}`
      );
    }

    // Add analysis results
    if (traindData.result) {
      csvRows.push(
        `Analysis,Success,${traindData.result.success ? "Yes" : "No"}`
      );
      csvRows.push(
        `Analysis,Number of Clusters,${traindData.result.num_clusters || "N/A"}`
      );
      csvRows.push(
        `Analysis,Total Processed,${traindData.result.total_processed || "N/A"}`
      );
      csvRows.push(
        `Analysis,Noise Ratio,${traindData.result.noise_ratio || "N/A"}`
      );

      // Add cluster data
      if (traindData.result.clusters) {
        Object.entries(traindData.result.clusters).forEach(
          ([clusterId, comments]: [string, any]) => {
            if (Array.isArray(comments)) {
              comments.forEach((comment, index) => {
                csvRows.push(
                  `Cluster ${clusterId},Comment ${index + 1},${comment.replace(
                    /"/g,
                    '""'
                  )}`
                );
              });
            }
          }
        );
      }

      // Add cluster summaries
      if (
        traindData.result.summaries &&
        Array.isArray(traindData.result.summaries)
      ) {
        traindData.result.summaries.forEach((summary: any, index: number) => {
          csvRows.push(`Summary ${index + 1},Rank,${summary.rank}`);
          csvRows.push(`Summary ${index + 1},Size,${summary.size}`);
          csvRows.push(`Summary ${index + 1},Cluster ID,${summary.cluster_id}`);
          csvRows.push(
            `Summary ${index + 1},Summary,${summary.summary.replace(
              /"/g,
              '""'
            )}`
          );
          csvRows.push(
            `Summary ${index + 1},Keywords,${
              summary.keywords ? summary.keywords.join("; ") : "N/A"
            }`
          );

          if (
            summary.sample_comments &&
            Array.isArray(summary.sample_comments)
          ) {
            summary.sample_comments.forEach(
              (comment: string, commentIndex: number) => {
                csvRows.push(
                  `Summary ${index + 1},Sample Comment ${
                    commentIndex + 1
                  },${comment.replace(/"/g, '""')}`
                );
              }
            );
          }
        });
      }
    }

    // Add parameter set information if available
    if (traindData.parameterSet) {
      csvRows.push(`Parameters,Parameter Set ID,${traindData.parameterSet.id}`);
      csvRows.push(
        `Parameters,Parameter Set Name,${traindData.parameterSet.name}`
      );

      if (traindData.parameterSet.parameters) {
        const params = traindData.parameterSet.parameters;
        csvRows.push(`Parameters,Min Score,${params.min_score || "N/A"}`);
        csvRows.push(`Parameters,Max Comments,${params.max_comments || "N/A"}`);
        csvRows.push(
          `Parameters,Skip Deleted,${params.skip_deleted ? "Yes" : "No"}`
        );
        csvRows.push(
          `Parameters,Skip Removed,${params.skip_removed ? "Yes" : "No"}`
        );

        if (params.hdbscan_params) {
          csvRows.push(
            `Parameters,HDBSCAN Min Cluster Size,${params.hdbscan_params.min_cluster_size}`
          );
          csvRows.push(
            `Parameters,HDBSCAN Min Samples,${params.hdbscan_params.min_samples}`
          );
          csvRows.push(
            `Parameters,HDBSCAN Metric,${params.hdbscan_params.metric}`
          );
          csvRows.push(
            `Parameters,HDBSCAN Alpha,${params.hdbscan_params.alpha}`
          );
        }

        if (params.model_params) {
          csvRows.push(
            `Parameters,Model Batch Size,${params.model_params.batch_size}`
          );
          csvRows.push(
            `Parameters,Model Normalization,${params.model_params.normalization}`
          );
          csvRows.push(
            `Parameters,Sentence Transformer Model,${params.model_params.sentence_transformer_model}`
          );
        }
      }
    }

    // Convert to CSV format with proper escaping
    return csvRows
      .map((row) => {
        const parts = row.split(",");
        return parts.map((part) => `"${part}"`).join(",");
      })
      .join("\n");
  };

  // Helper function to download text/JSON/CSV files
  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleVisibilityToggle = async () => {
    if (!id || !traind) return;

    setChangingVisibility(true);
    try {
      const newVisibility = !traind.isPublic;
      const result = await setTraindVisibility(id, newVisibility);

      if (result.error) {
        showError("Failed to update visibility: " + result.error);
      } else {
        setTraind({ ...traind, isPublic: newVisibility });
        showSuccess(`Traind is now ${newVisibility ? "public" : "private"}`);
      }
    } catch (err: any) {
      showError("Failed to update visibility: " + err.message);
    } finally {
      setChangingVisibility(false);
    }
  };

  // Check if current user is the owner of this traind
  const isOwner = traind?.user?.username === username;

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!traind) return <div className={styles.error}>Not found</div>;

  return (
    <div className={styles.detailWrapper}>
      <div className={styles.headerCard}>
        <h1 className={styles.title}>{traind.title}</h1>
        <div className={styles.meta}>
          <span>Analyser: {traind.user?.username || "Unknown"}</span>
          <span>Subreddit: r/{traind.subreddit}</span>
          <span>Created: {new Date(traind.createdAt).toLocaleString()}</span>
          <span>Status: {traind.status || "Completed"}</span>
          <span>Visibility: {traind.isPublic ? "Public" : "Private"}</span>
        </div>
        {isOwner && (
          <div className={styles.ownerActions}>
            <button
              type="button"
              className={`${styles.visibilityButton} ${
                traind.isPublic ? styles.public : styles.private
              }`}
              onClick={handleVisibilityToggle}
              disabled={changingVisibility}
              title={`Make this traind ${
                traind.isPublic ? "private" : "public"
              }`}
            >
              {changingVisibility
                ? "..."
                : traind.isPublic
                ? "🔒 Make Private"
                : "🌐 Make Public"}
            </button>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <ResultDisplay result={traind.result} />
      </div>

      <div className={styles.section}>
        <h2>Parameter Set</h2>
        {parameterSet ? (
          <JsonTreeView data={parameterSet} />
        ) : (
          <span>Loading...</span>
        )}
      </div>

      <div className={styles.section}>
        <h2>Comments</h2>
        <CommentArea traindId={id!} />
      </div>

      <div className={styles.section + " " + styles.actions}>
        <button
          type="button"
          className={styles.exportButton}
          onClick={() => handleExport("json")}
          disabled={exporting}
        >
          {exporting ? "Exporting..." : "Export JSON"}
        </button>
        <button
          type="button"
          className={styles.exportButton}
          onClick={() => handleExport("csv")}
          disabled={exporting}
        >
          {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>
    </div>
  );
};

export default TraindDetailPage;
