import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getTraindById,
  exportResult,
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
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn, username } = useAuth();
  const [traind, setTraind] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parameterSet, setParameterSet] = useState<any>(null);
  const [exporting, setExporting] = useState(false);
  const [changingVisibility, setChangingVisibility] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadTraindDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load traind data
        const traindData = await getTraindById(id);
        if (traindData.error) {
          setError(traindData.error);
          return;
        }
        setTraind(traindData);

        // Add to history only if user is logged in
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

  const handleExport = async (format: string) => {
    if (!id) return;
    setExporting(true);

    // Mock implementation
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`Mock export: Traind ${id} exported as ${format} format`);
      console.log("Export data:", {
        traindId: id,
        title: traind.title,
        format: format,
        timestamp: new Date().toISOString(),
      });

      setExporting(false);
      alert(`Mock export completed: ${format.toUpperCase()}`);
    } catch (e) {
      setExporting(false);
      alert("Mock export failed");
    }
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
              className={`${styles.visibilityButton} ${
                traind.isPublic ? styles.public : styles.private
              }`}
              onClick={handleVisibilityToggle}
              disabled={changingVisibility}
              title={`Make this traind ${
                traind.isPublic ? "private" : "public"
              }`}
            >
              {changingVisibility ? "..." : traind.isPublic ? "🔒 Make Private" : "🌐 Make Public"}
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
          className={styles.exportButton}
          onClick={() => handleExport("json")}
          disabled={exporting}
        >
          Export JSON
        </button>
        <button
          className={styles.exportButton}
          onClick={() => handleExport("csv")}
          disabled={exporting}
        >
          Export CSV
        </button>
        <button
          className={styles.exportButton}
          onClick={() => handleExport("png")}
          disabled={exporting}
        >
          Export PNG
        </button>
      </div>
    </div>
  );
};

export default TraindDetailPage;
