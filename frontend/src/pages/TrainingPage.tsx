import React, { useState } from "react";
import useRequireAuth from "../utils/useRequireAuth";
import styles from "./TrainingPage.module.css";
import { saveParameterSet } from "../api/parameterSet";
import { runAnalysis } from "../api/traind";

const TrainingPage: React.FC = () => {
  useRequireAuth();
  const [target, setTarget] = useState("");
  const [params, setParams] = useState({
    min_cluster_size: 5,
    min_samples: 10,
    metric: "euclidean",
    cluster_selection_method: "eom",
    cluster_selection_epsilon: 0.5,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleStartTraining = async () => {
    setLoading(true);
    setResult(null);
    try {
      const saveRes = await saveParameterSet({
        name: "Temp Parameter Set",
        config: params,
      });
      if (!saveRes || !saveRes.id) {
        setResult("Failed to save parameter set: Unknown error");
        setLoading(false);
        return;
      }
      const parameterSetId = saveRes.id;
      const runRes = await runAnalysis(target, parameterSetId);
      if (runRes.error) {
        setResult("Analysis failed: " + runRes.error);
      } else {
        setResult(`Task created!`);
      }
    } catch (err: any) {
      setResult("Request error: " + (err?.message || err));
    }
    setLoading(false);
  };

  return (
    <div className={styles.trainingPageWrapper}>
      <div className={styles.mainCard}>
        <h2 className={styles.title}>Reddit ML Analysis</h2>

        <div className={styles.panelRow}>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>Target Selector</div>
            <label htmlFor="target-input" className={styles.inputLabel}>
              Reddit Link or ID:
            </label>
            <input
              id="target-input"
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Enter Reddit link or ID"
              className={styles.trainingInput}
            />
          </div>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>Parameter Set Configuration</div>
            <div className={styles.paramInputs}>
              <label className={styles.inputLabel} htmlFor="min_cluster_size">
                min_cluster_size
              </label>
              <input
                id="min_cluster_size"
                type="number"
                className={styles.trainingInput}
                value={params.min_cluster_size}
                onChange={(e) =>
                  setParams({
                    ...params,
                    min_cluster_size: Number(e.target.value),
                  })
                }
              />
              <label className={styles.inputLabel} htmlFor="min_samples">
                min_samples
              </label>
              <input
                id="min_samples"
                type="number"
                className={styles.trainingInput}
                value={params.min_samples}
                onChange={(e) =>
                  setParams({ ...params, min_samples: Number(e.target.value) })
                }
              />
              <label className={styles.inputLabel} htmlFor="metric">
                metric
              </label>
              <input
                id="metric"
                type="text"
                className={styles.trainingInput}
                value={params.metric}
                onChange={(e) =>
                  setParams({ ...params, metric: e.target.value })
                }
              />
              <label
                className={styles.inputLabel}
                htmlFor="cluster_selection_method"
              >
                cluster_selection_method
              </label>
              <input
                id="cluster_selection_method"
                type="text"
                className={styles.trainingInput}
                value={params.cluster_selection_method}
                onChange={(e) =>
                  setParams({
                    ...params,
                    cluster_selection_method: e.target.value,
                  })
                }
              />
              <label
                className={styles.inputLabel}
                htmlFor="cluster_selection_epsilon"
              >
                cluster_selection_epsilon
              </label>
              <input
                id="cluster_selection_epsilon"
                type="number"
                step="0.01"
                className={styles.trainingInput}
                value={params.cluster_selection_epsilon}
                onChange={(e) =>
                  setParams({
                    ...params,
                    cluster_selection_epsilon: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className={styles.startBtnRow}>
          <button
            onClick={handleStartTraining}
            disabled={loading || !target}
            className={styles.startBtn}
          >
            {loading ? "Creating..." : "Start Analysis Task"}
          </button>
        </div>

        {result && <div className={styles.resultBox}>{result}</div>}
      </div>
    </div>
  );
};

export default TrainingPage;
