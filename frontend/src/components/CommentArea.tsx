// Comment system with nested replies for traind discussions
import React, { useState } from "react";
import {
  CommentNode,
  getComments,
  addComment,
  replyToComment,
} from "../api/comment";
import styles from "./CommentArea.module.css";

interface CommentItemProps {
  traindId: string;
  commentNode: CommentNode;
  depth?: number;
  onReplySuccess: (parentId: string, newReply: CommentNode) => void;
}

// Individual comment item with reply functionality and nesting support
const CommentItem: React.FC<CommentItemProps> = ({
  traindId,
  commentNode,
  depth = 0,
  onReplySuccess,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<CommentNode[]>([]);
  const [replyContent, setReplyContent] = useState("");
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [postingReply, setPostingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  // Load replies for this comment
  const loadReplies = async () => {
    if (loadingReplies) return;

    // If we already have replies loaded, just show them
    if (replies.length > 0) {
      setShowReplies(true);
      return;
    }

    setLoadingReplies(true);
    setReplyError(null);
    try {
      const response = await getComments(traindId, commentNode.comment.id);
      setReplies(response.comments || []);
      setShowReplies(true);
    } catch (e: any) {
      console.error("Failed to load replies:", e);
      setReplyError(e?.message || "Failed to load replies");
    }
    setLoadingReplies(false);
  };

  // Submit reply to this comment
  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setPostingReply(true);
    setReplyError(null);
    try {
      const response = await replyToComment(
        traindId,
        commentNode.comment.id,
        replyContent
      );
      setReplyContent("");
      setShowReplyForm(false);

      // Create a new reply object and add it to the current replies
      const newReply: CommentNode = {
        comment: {
          id: response.id,
          traindId: response.traindId,
          userId: response.userId,
          content: response.content,
          createdAt: response.createdAt,
          user: response.user,
          parentId: response.parentId,
        },
        repliesCount: 0,
      };

      // Add the new reply to the local state
      setReplies((prevReplies) => [...prevReplies, newReply]);

      if (!showReplies) {
        setShowReplies(true);
      }

      // Notify parent about the reply
      onReplySuccess(commentNode.comment.id, newReply);
    } catch (err: any) {
      console.error("Failed to reply:", err);
      setReplyError(err?.message || "Failed to reply");
    }
    setPostingReply(false);
  };

  return (
    <div
      className={`${styles.commentItem} ${depth > 0 ? styles.nested : ""}`}
      data-depth={depth}
    >
      <div className={styles.header}>
        <span className={styles.user}>
          {commentNode.comment.user?.username || "Anonymous"}
        </span>
        <span className={styles.time}>
          {new Date(commentNode.comment.createdAt).toLocaleString()}
        </span>
        {commentNode.repliesCount > 0 && (
          <button
            type="button"
            className={styles.repliesBtn}
            onClick={() => {
              if (showReplies) {
                setShowReplies(false);
              } else {
                loadReplies();
              }
            }}
            disabled={loadingReplies}
          >
            {loadingReplies
              ? "Loading..."
              : `${commentNode.repliesCount} replies`}
            {showReplies ? " ▲" : " ▼"}
          </button>
        )}
      </div>
      <div className={styles.content}>{commentNode.comment.content}</div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.replyBtn}
          onClick={() => setShowReplyForm(!showReplyForm)}
        >
          Reply
        </button>
      </div>

      {showReplyForm && (
        <form className={styles.replyForm} onSubmit={handleReply}>
          <textarea
            className={styles.replyTextarea}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            rows={2}
            disabled={postingReply}
          />
          <div className={styles.replyActions}>
            <button
              type="submit"
              disabled={postingReply || !replyContent.trim()}
            >
              {postingReply ? "Replying..." : "Reply"}
            </button>
            <button type="button" onClick={() => setShowReplyForm(false)}>
              Cancel
            </button>
          </div>
          {replyError && <div className={styles.error}>{replyError}</div>}
        </form>
      )}

      {replyError && !showReplyForm && (
        <div className={styles.error}>{replyError}</div>
      )}

      {/* Nested replies with recursive rendering */}
      {showReplies && replies.length > 0 && (
        <div className={styles.replies}>
          {replies.map((reply) => (
            <CommentItem
              key={reply.comment.id}
              traindId={traindId}
              commentNode={reply}
              depth={depth + 1}
              onReplySuccess={(parentId, newReply) => {
                // For nested replies, update the reply count of the nested comment
                setReplies((prevReplies) =>
                  prevReplies.map((reply) =>
                    reply.comment.id === parentId
                      ? { ...reply, repliesCount: reply.repliesCount + 1 }
                      : reply
                  )
                );
                // Propagate the reply success up the chain
                onReplySuccess(parentId, newReply);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface CommentAreaProps {
  traindId: string;
}

// Main comment area component for traind discussion
const CommentArea: React.FC<CommentAreaProps> = ({ traindId }) => {
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  // Load top-level comments for this traind
  const loadComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getComments(traindId);
      setComments(response.comments || []);
    } catch (e: any) {
      console.error("Failed to load comments:", e);
      setError(e?.message || "Failed to load comments");
    }
    setLoading(false);
  };

  React.useEffect(() => {
    if (!traindId) return;
    loadComments();
  }, [traindId]);

  // Submit new top-level comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const response = await addComment(traindId, content);
      setContent("");

      // Create a temporary comment object to provide immediate feedback
      const tempComment: CommentNode = {
        comment: {
          id: response.id,
          traindId: response.traindId,
          userId: response.userId,
          content: response.content,
          createdAt: response.createdAt,
          user: response.user,
          parentId: response.parentId,
        },
        repliesCount: 0,
      };

      // Add the new comment immediately for better UX
      setComments((prevComments) => [tempComment, ...prevComments]);
    } catch (err: any) {
      setError(err?.message || "Failed to comment");
    }
    setPosting(false);
  };

  return (
    <div className={styles.commentArea}>
      <form className={styles.commentBox} onSubmit={handleSubmit}>
        <textarea
          className={styles.textarea}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          rows={3}
          disabled={posting}
        />
        <div className={styles.actions}>
          <button type="submit" disabled={posting || !content.trim()}>
            {posting ? "Posting..." : "Post"}
          </button>
          <button
            type="button"
            onClick={loadComments}
            disabled={loading}
            className={styles.refreshBtn}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
          {error && <span className={styles.error}>{error}</span>}
        </div>
      </form>
      {loading ? (
        <div className={styles.loading}>Loading comments...</div>
      ) : (
        <div className={styles.commentList}>
          {comments && comments.length ? (
            comments.map((commentNode) => (
              <CommentItem
                key={commentNode.comment.id}
                traindId={traindId}
                commentNode={commentNode}
                depth={0}
                onReplySuccess={(parentId, newReply) => {
                  // Update the specific comment's reply count without reloading all comments
                  setComments((prevComments) =>
                    prevComments.map((comment) =>
                      comment.comment.id === parentId
                        ? { ...comment, repliesCount: comment.repliesCount + 1 }
                        : comment
                    )
                  );
                }}
              />
            ))
          ) : (
            <div className={styles.empty}>No comments yet.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentArea;
