import re
import string
import random
from collections import defaultdict, Counter
from sentence_transformers import SentenceTransformer
from sklearn.preprocessing import normalize
import hdbscan
import praw

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import (
    HDBSCAN_PARAMS,
    PREPROCESSING_PARAMS,
    MODEL_PARAMS,
    SUMMARY_PARAMS,
    SENTIMENT_WORDS,
    TOPIC_KEYWORDS,
    STOP_WORDS,
    REDDIT_CONFIG,
    REDDIT_FETCH_PARAMS,
)


class RedditAnalyser:

    def __init__(self):
        self.model = None
        self.reddit = None
        self._init_reddit_client()

    def _init_reddit_client(self):
        try:
            self.reddit = praw.Reddit(
                client_id=REDDIT_CONFIG["client_id"],
                client_secret=REDDIT_CONFIG["client_secret"],
                user_agent=REDDIT_CONFIG["user_agent"],
                username=REDDIT_CONFIG.get("username"),
                password=REDDIT_CONFIG.get("password"),
            )
        except Exception as e:
            self.reddit = None

    def _apply_custom_parameters(self, parameters):
        """Apply custom parameters by temporarily updating global config"""
        # Store original configs for restoration later
        if not hasattr(self, "_original_configs"):
            self._original_configs = {}

        # Update global configs with custom parameters
        if "hdbscan_params" in parameters:
            import config

            self._original_configs["HDBSCAN_PARAMS"] = config.HDBSCAN_PARAMS.copy()

            # Create a copy of hdbscan_params and ensure proper types
            hdbscan_params = parameters["hdbscan_params"].copy()

            # Convert alpha to float if present - HDBSCAN requires float during clustering
            if "alpha" in hdbscan_params:
                hdbscan_params["alpha"] = float(hdbscan_params["alpha"])

            config.HDBSCAN_PARAMS.update(hdbscan_params)

        if "preprocessing_params" in parameters:
            import config

            self._original_configs["PREPROCESSING_PARAMS"] = (
                config.PREPROCESSING_PARAMS.copy()
            )
            config.PREPROCESSING_PARAMS.update(parameters["preprocessing_params"])

        if "model_params" in parameters:
            import config

            self._original_configs["MODEL_PARAMS"] = config.MODEL_PARAMS.copy()
            config.MODEL_PARAMS.update(parameters["model_params"])

        if "summary_params" in parameters:
            import config

            self._original_configs["SUMMARY_PARAMS"] = config.SUMMARY_PARAMS.copy()
            config.SUMMARY_PARAMS.update(parameters["summary_params"])

        if "reddit_fetch_params" in parameters:
            import config

            self._original_configs["REDDIT_FETCH_PARAMS"] = (
                config.REDDIT_FETCH_PARAMS.copy()
            )
            config.REDDIT_FETCH_PARAMS.update(parameters["reddit_fetch_params"])

    def analyse_reddit_post(self, reddit_post_id, parameters=None):
        """
        Analyze a Reddit post with optional custom parameters

        Args:
            reddit_post_id: Reddit post ID to analyze
            parameters: Optional dict of custom parameters to override defaults
        """
        try:
            # Apply custom parameters if provided
            if parameters:
                self._apply_custom_parameters(parameters)

            # 1. Request Reddit data
            post_data = self._fetch_reddit_data(reddit_post_id)

            if not post_data["success"]:
                return post_data

            comments_list = post_data["comments"]
            post_info = post_data["post_info"]

            # 2. Preprocess comments
            filtered_comments = self._preprocess_comments(comments_list)

            if len(filtered_comments) < 3:
                return {
                    "success": False,
                    "error": "Insufficient comments after filtering (minimum 3 required)",
                    "post_info": post_info,
                    "num_clusters": 0,
                    "noise_ratio": 1.0,
                    "total_processed": len(filtered_comments),
                }

            # 3. Generate text embeddings
            embeddings = self._generate_embeddings(filtered_comments)

            # 4. Perform clustering
            labels, clusters = self._perform_clustering(embeddings, filtered_comments)

            # 5. Analyse results
            num_clusters = len(clusters)
            noise_ratio = sum(1 for label in labels if label == -1) / len(labels)

            # 6. Generate summaries
            summaries = self._generate_summaries(clusters)

            return {
                "success": True,
                "post_info": post_info,
                "num_clusters": num_clusters,
                "noise_ratio": noise_ratio,
                "total_processed": len(filtered_comments),
                "clusters": clusters,
                "summaries": summaries,
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "num_clusters": 0,
                "noise_ratio": 1.0,
                "total_processed": 0,
            }

    def _fetch_reddit_data(self, post_id):

        if self.reddit is None:
            return {
                "success": False,
                "error": "Reddit client not initialized. Please configure API credentials.",
                "comments": [],
                "post_info": {},
            }

        try:
            # Get submission object
            submission = self.reddit.submission(id=post_id)

            # Get post information
            post_info = {
                "id": submission.id,
                "title": submission.title,
                "author": str(submission.author) if submission.author else "[deleted]",
                "score": submission.score,
                "upvote_ratio": submission.upvote_ratio,
                "num_comments": submission.num_comments,
                "created_utc": submission.created_utc,
                "subreddit": str(submission.subreddit),
                "url": submission.url,
                "selftext": submission.selftext,
            }

            # Get all comments (expand all nested comments)
            submission.comments.replace_more(limit=None)

            comments = []
            comment_count = 0
            max_comments = REDDIT_FETCH_PARAMS["max_comments"]
            min_score = REDDIT_FETCH_PARAMS["min_score"]

            for comment in submission.comments.list():
                # Check comment count limit
                if comment_count >= max_comments:
                    break

                # Skip deleted comments
                if REDDIT_FETCH_PARAMS["skip_deleted"] and (
                    not hasattr(comment, "body")
                    or comment.body in ["[deleted]", "[removed]"]
                ):
                    continue

                # Skip low-scoring comments
                if hasattr(comment, "score") and comment.score < min_score:
                    continue

                # Get comment text
                if hasattr(comment, "body") and comment.body:
                    comments.append(comment.body)
                    comment_count += 1

            return {"success": True, "comments": comments, "post_info": post_info}

        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to fetch Reddit data: {str(e)}",
                "comments": [],
                "post_info": {},
            }

    def _preprocess_comments(self, comments):
        filtered_comments = []
        for comment in comments:
            if (PREPROCESSING_PARAMS["filter_deleted"] and comment == "[deleted]") or (
                PREPROCESSING_PARAMS["filter_removed"] and comment == "[removed]"
            ):
                continue

            # Text cleaning
            cleaned = re.sub(r"http[s]?://\S+", "", comment)  # Remove URLs
            cleaned = re.sub(r"\s+", " ", cleaned).strip()  # Clean whitespace

            # Quality filtering - use config parameters
            filter_prefixes = PREPROCESSING_PARAMS["filter_prefixes"]
            # Ensure filter_prefixes is a tuple for startswith()
            if isinstance(filter_prefixes, list):
                filter_prefixes = tuple(filter_prefixes)
            elif isinstance(filter_prefixes, str):
                filter_prefixes = (filter_prefixes,)

            if (
                len(cleaned) >= PREPROCESSING_PARAMS["min_comment_length"]
                and len(cleaned.split()) >= PREPROCESSING_PARAMS["min_word_count"]
                and not cleaned.lower().startswith(filter_prefixes)
                and "/" not in cleaned[:10]
            ):
                filtered_comments.append(cleaned)

        return filtered_comments

    def _generate_embeddings(self, comments):
        if self.model is None:
            self.model = SentenceTransformer(MODEL_PARAMS["sentence_transformer_model"])

        embeddings = self.model.encode(
            comments, batch_size=MODEL_PARAMS["batch_size"], show_progress_bar=True
        )
        embeddings_normalized = normalize(
            embeddings, norm=MODEL_PARAMS["normalization"]
        )
        return embeddings_normalized

    def _perform_clustering(self, embeddings, comments):
        clusterer = hdbscan.HDBSCAN(**HDBSCAN_PARAMS)

        labels = clusterer.fit_predict(embeddings)

        # Generate cluster dictionary
        clusters = defaultdict(list)
        for idx, label in enumerate(labels):
            if label != -1:
                # Convert numpy.int64 to Python int for JSON serialization
                clusters[int(label)].append(comments[idx])

        return labels, dict(clusters)

    def _generate_summaries(self, clusters):
        summaries = []
        sorted_clusters = sorted(
            clusters.items(), key=lambda x: len(x[1]), reverse=True
        )

        max_display = min(SUMMARY_PARAMS["top_clusters_display"], len(sorted_clusters))

        for rank, (cluster_id, comments) in enumerate(sorted_clusters[:max_display], 1):
            summary = self._summarize_cluster(comments, cluster_id)

            summaries.append(
                {
                    "rank": rank,
                    "cluster_id": int(cluster_id),  # Convert numpy.int64 to Python int
                    "size": len(comments),
                    "summary": summary,
                    "keywords": self._extract_keywords(
                        comments, top_k=SUMMARY_PARAMS["keywords_per_cluster"]
                    ),
                    "sample_comments": random.sample(
                        comments,
                        min(
                            SUMMARY_PARAMS["sample_comments_per_cluster"], len(comments)
                        ),
                    ),
                }
            )

        return summaries

    def _extract_keywords(self, text_list, top_k=5):
        combined_text = " ".join(text_list).lower()

        # Remove punctuation
        translator = str.maketrans("", "", string.punctuation)
        words = combined_text.translate(translator).split()

        # Filter and count word frequencies - use config stop words
        filtered_words = [
            word for word in words if len(word) > 2 and word not in STOP_WORDS
        ]
        word_freq = Counter(filtered_words)
        return [word for word, _ in word_freq.most_common(top_k)]

    def _summarize_cluster(self, comments, cluster_id):
        if not comments:
            return "Empty cluster"

        # Extract keywords
        keywords = self._extract_keywords(
            comments, top_k=SUMMARY_PARAMS["keywords_per_cluster"]
        )

        # Sentiment analysis - use config sentiment words
        combined_text = " ".join(comments).lower()
        pos_count = sum(
            1 for word in SENTIMENT_WORDS["positive"] if word in combined_text
        )
        neg_count = sum(
            1 for word in SENTIMENT_WORDS["negative"] if word in combined_text
        )

        # Determine sentiment tendency
        if pos_count > neg_count:
            sentiment = "supportive"
        elif neg_count > pos_count:
            sentiment = "critical"
        else:
            sentiment = "discussing"

        # Generate summary template
        if len(comments) == 1:
            summary = f"Single viewpoint: {sentiment} related topic"
        elif len(comments) <= 3:
            summary = (
                f"Few users {sentiment} about {', '.join(keywords[:2])} viewpoints"
            )
        elif len(comments) <= 10:
            summary = f"Some users {sentiment} about {', '.join(keywords[:3])} related content"
        else:
            summary = (
                f"Many users {sentiment} about {', '.join(keywords[:3])} discussion"
            )

        # Topic detection
        if keywords:
            # Detect discussion type
            if any(word in TOPIC_KEYWORDS["discussion"] for word in keywords):
                summary = (
                    f"Discussion: {sentiment} about {', '.join(keywords[:2])} topics"
                )
            elif any(word in TOPIC_KEYWORDS["question"] for word in keywords):
                summary = f"Q&A: {sentiment} questions about {', '.join(keywords[:2])}"
            elif any(word in TOPIC_KEYWORDS["experience"] for word in keywords):
                summary = (
                    f"Experience sharing: {sentiment} {', '.join(keywords[:2])} stories"
                )
            elif any(word in TOPIC_KEYWORDS["technical"] for word in keywords):
                summary = f"Technical: {sentiment} {', '.join(keywords[:2])} discussion"
            elif any(word in TOPIC_KEYWORDS["humor"] for word in keywords):
                summary = f"Humor: {sentiment} {', '.join(keywords[:2])} content"
            elif any(word in TOPIC_KEYWORDS["social"] for word in keywords):
                summary = f"Social: {sentiment} {', '.join(keywords[:2])} interaction"
            # Sentiment-oriented classification
            elif any(word in TOPIC_KEYWORDS["positive"] for word in keywords):
                summary = f"Positive feedback: {', '.join(keywords[:2])} appreciation"
            elif any(word in TOPIC_KEYWORDS["negative"] for word in keywords):
                summary = f"Critical feedback: {', '.join(keywords[:2])} concerns"

        return summary
