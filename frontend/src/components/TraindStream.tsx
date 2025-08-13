import React, { useState, useEffect } from "react";
import { Traind, TraindStreamProps } from "../types/traind";
import { useAuth } from "../contexts/AuthContext";
import { toggleTraindStar } from "../api/star";
import styles from "./TraindStream.module.css";

const TraindStream: React.FC<TraindStreamProps> = ({
  trainds,
  loading = false,
  hasError = false,
  onTraindClick,
  onDelete,
  showActions = true,
  emptyMessage = "No trainds found",
}) => {
  const { isLoggedIn } = useAuth();
  const [starringTrainds, setStarringTrainds] = useState<Set<string>>(
    new Set()
  );
  const [localStarStates, setLocalStarStates] = useState<Map<string, boolean>>(
    new Map()
  );

  useEffect(() => {
    const initialStarStates = new Map<string, boolean>();
    trainds.forEach((traind) => {
      initialStarStates.set(traind.id, traind.isStarred || false);
    });
    setLocalStarStates(initialStarStates);
  }, [trainds]);

  const getTraindStarStatus = (traind: Traind): boolean => {
    const localState = localStarStates.get(traind.id);
    const finalState =
      localState !== undefined ? localState : traind.isStarred || false;

    return finalState;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return `${Math.ceil(diffInHours * 60)}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const formatResult = (result: any) => {
    if (!result) return "No result available";

    try {
      if (typeof result === "string") {
        return result;
      }
      return JSON.stringify(result, null, 2);
    } catch {
      return "Invalid result format";
    }
  };

  const handleCardClick = (traind: Traind) => {
    if (onTraindClick) {
      onTraindClick(traind);
    }
  };

  const handleStarClick = async (e: React.MouseEvent, traind: Traind) => {
    e.stopPropagation();

    if (!isLoggedIn) return;

    if (starringTrainds.has(traind.id)) return;

    try {
      setStarringTrainds((prev) => new Set(prev).add(traind.id));

      const result = await toggleTraindStar(traind.id);

      setLocalStarStates((prev) => {
        const newMap = new Map(prev);
        newMap.set(traind.id, result.isStarred);
        return newMap;
      });

      if (traind._count) {
        traind._count.stars = result.starCount;
      }
    } catch (error) {
      console.error("Failed to toggle star:", error);
    } finally {
      setStarringTrainds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(traind.id);
        return newSet;
      });
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, traindId: string) => {
    e.stopPropagation();
    if (
      onDelete &&
      window.confirm("Are you sure you want to delete this traind?")
    ) {
      onDelete(traindId);
    }
  };

  const renderPlaceholder = () => (
    <div className={styles.loadingPlaceholder}>
      {[1, 2, 3].map((index) => (
        <div key={index} className={styles.placeholderCard}>
          <div className={styles.placeholderCardContent}>
            <div className={styles.placeholderTitle}></div>
            <div className={styles.placeholderContent}></div>
            <div className={styles.placeholderActions}></div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return renderPlaceholder();
  }

  if (!hasError && (!trainds || trainds.length === 0)) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📊</div>
        <div className={styles.emptyMessage}>{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className={styles.traindStream}>
      {trainds.map((traind) => (
        <div
          key={traind.id}
          className={styles.traindCard}
          onClick={() => handleCardClick(traind)}
        >
          <div className={styles.cardContent}>
            <div className={styles.traindHeader}>
              <h3 className={styles.traindTitle}>{traind.title}</h3>
              <div className={styles.traindMeta}>
                <div className={styles.subreddit}>r/{traind.subreddit}</div>
                <div className={styles.timestamp}>
                  {formatDate(traind.createdAt)}
                </div>
                <div className={styles.visibility}>
                  {traind.isPublic ? (
                    <>
                      <span className={styles.visibilityIcon}>🌐</span>
                      Public
                    </>
                  ) : (
                    <>
                      <span className={styles.visibilityIcon}>🔒</span>
                      Private
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.traindContent}>
              <div className={styles.postId}>Post ID: {traind.postId}</div>
              <div className={styles.resultPreview}>
                {formatResult(traind.result)}
              </div>
            </div>

            {showActions && (
              <div className={styles.traindActions}>
                <div className={styles.actionGroup}>
                  <button
                    className={`${styles.actionButton} ${
                      isLoggedIn && getTraindStarStatus(traind)
                        ? styles.starred
                        : styles.unstarred
                    }`}
                    onClick={(e) => handleStarClick(e, traind)}
                    title={
                      !isLoggedIn
                        ? "Login to star this traind"
                        : starringTrainds.has(traind.id)
                        ? "Processing..."
                        : getTraindStarStatus(traind)
                        ? "Unstar this traind"
                        : "Star this traind"
                    }
                    disabled={!isLoggedIn || starringTrainds.has(traind.id)}
                  >
                    {starringTrainds.has(traind.id)
                      ? "⏳"
                      : isLoggedIn && getTraindStarStatus(traind)
                      ? "⭐"
                      : "☆"}{" "}
                    {traind._count?.stars || 0}
                  </button>
                  <button className={styles.actionButton} title="Comments">
                    💬 {traind._count?.comments || 0}
                  </button>
                </div>

                <div className={styles.actionGroup}>
                  <button className={styles.actionButton} title="Export result">
                    📥 Export
                  </button>
                  {onDelete && (
                    <button
                      className={`${styles.actionButton} ${styles.delete}`}
                      onClick={(e) => handleDeleteClick(e, traind.id)}
                      title="Delete traind"
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TraindStream;
