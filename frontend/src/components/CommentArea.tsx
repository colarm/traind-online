import React, { useState } from "react";
import {
  CommentNode,
  getComments,
  addComment,
  replyToComment,
} from "../api/comment";
import styles from "./CommentArea.module.css";

interface CommentAreaProps {
  traindId: string;
}

interface CommentItemProps {
  traindId: string;
  commentNode: CommentNode;
  depth?: number;
  onReplySuccess: (parentId: string, newReply: CommentNode) => void;
}

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

  const loadReplies = async () => {
    if (loadingReplies) return;
    setLoadingReplies(true);
    try {
      const response = await getComments(traindId, commentNode.comment.id);
      setReplies(response.comments || []);
      setShowReplies(true);
    } catch (e) {
      console.error("Failed to load replies:", e);
    }
    setLoadingReplies(false);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setPostingReply(true);
    try {
      const response = await replyToComment(
        traindId,
        commentNode.comment.id,
        replyContent
      );
      setReplyContent("");
      setShowReplyForm(false);

      const newReply: CommentNode = {
        comment: response,
        repliesCount: 0,
      };

      setReplies((prevReplies) => [...prevReplies, newReply]);

      commentNode.repliesCount += 1;

      if (!showReplies) {
        setShowReplies(true);
      }

      onReplySuccess(commentNode.comment.id, newReply);
    } catch (err) {
      console.error("Failed to reply:", err);
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
            className={styles.repliesBtn}
            onClick={loadReplies}
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
        </form>
      )}

      {showReplies && replies.length > 0 && (
        <div className={styles.replies}>
          {replies.map((reply) => (
            <CommentItem
              key={reply.comment.id}
              traindId={traindId}
              commentNode={reply}
              depth={depth + 1}
              onReplySuccess={(parentId, newReply) => {
                const updateReplies = (replies: CommentNode[]): CommentNode[] =>
                  replies.map((reply) =>
                    reply.comment.id === parentId
                      ? { ...reply, repliesCount: reply.repliesCount + 1 }
                      : reply
                  );
                setReplies(updateReplies);
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

const CommentArea: React.FC<CommentAreaProps> = ({ traindId }) => {
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await getComments(traindId);
      setComments(response.comments || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load comments");
    }
    setLoading(false);
  };

  React.useEffect(() => {
    if (!traindId) return;
    loadComments();
  }, [traindId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const response = await addComment(traindId, content);
      setContent("");
      const newComment: CommentNode = {
        comment: response,
        repliesCount: 0,
      };
      setComments((prevComments) => [newComment, ...prevComments]);
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
