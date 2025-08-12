import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTraindById, exportResult, getParameterSetId } from "../api/traind";
import { loadParameterSet } from "../api/parameterSet";
import CommentArea from "../components/CommentArea";
import styles from "./TraindDetailPage.module.css";

const TraindDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [traind, setTraind] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parameterSet, setParameterSet] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    (async () => {
      try {
        const data = await getTraindById(id);
        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        }
        setTraind(data);
        const ps = await getParameterSetId(id);
        if (!ps.error && ps.parameterSetId) {
          const paramSet = await loadParameterSet(ps.parameterSetId);
          if (paramSet) setParameterSet(paramSet);
        }
        setLoading(false);
      } catch (err: any) {
        setError(err?.message || "Failed to load detail");
        setLoading(false);
      }
    })();
  }, [id]);

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

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!traind) return <div className={styles.error}>Not found</div>;

  return (
    <div className={styles.detailWrapper}>
      <div className={styles.headerCard}>
        <h1 className={styles.title}>{traind.title}</h1>
        <div className={styles.meta}>
          <span>Subreddit: r/{traind.subreddit}</span>
          <span>Created: {new Date(traind.createdAt).toLocaleString()}</span>
          <span>Status: {traind.status || "Completed"}</span>
          <span>Visibility: {traind.isPublic ? "Public" : "Private"}</span>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Analysis Result</h2>
        <pre className={styles.result}>
          {JSON.stringify(traind.result, null, 2)}
        </pre>
      </div>

      <div className={styles.section}>
        <h2>Parameter Set</h2>
        {parameterSet ? (
          <pre className={styles.param}>
            {JSON.stringify(parameterSet, null, 2)}
          </pre>
        ) : (
          <span>Loading...</span>
        )}
      </div>

      <div className={styles.section}>
        <h2>Comments</h2>
        <CommentArea traindId={id!} />
      </div>

      <div className={styles.section + " " + styles.actions}>
        <button onClick={() => handleExport("json")} disabled={exporting}>
          Export JSON
        </button>
        <button onClick={() => handleExport("csv")} disabled={exporting}>
          Export CSV
        </button>
        <button onClick={() => handleExport("png")} disabled={exporting}>
          Export PNG
        </button>
      </div>
    </div>
  );
};

export default TraindDetailPage;
