export interface TaskConfig {
  description: string;
  required_params: string[];
  optional_params: string[];
  default_params: {
    max_comments: number;
    comment_limit: number | null;
    skip_removed: boolean;
    skip_deleted: boolean;
    min_score: number;
    hdbscan_params: {
      min_cluster_size: number;
      min_samples: number;
      metric: string;
      cluster_selection_epsilon: number;
      alpha: number;
    };
    preprocessing_params: {
      min_comment_length: number;
      min_word_count: number;
      filter_prefixes: string[];
      filter_deleted: boolean;
      filter_removed: boolean;
    };
    model_params: {
      sentence_transformer_model: string;
      batch_size: number;
      normalization: string;
    };
    summary_params: {
      top_clusters_display: number;
      keywords_per_cluster: number;
      enhanced_keywords: number;
      sample_comments_per_cluster: number;
    };
    sentiment_words: {
      positive: string[];
      negative: string[];
    };
    topic_keywords: {
      discussion: string[];
      experience: string[];
      question: string[];
      humor: string[];
      technical: string[];
      social: string[];
    };
    stop_words: string[];
    reddit_fetch_params: {
      max_comments: number;
      comment_limit: number | null;
      skip_removed: boolean;
      skip_deleted: boolean;
      min_score: number;
    };
  };
}

export interface UIConfig {
  metric_options: Array<{ value: string; label: string }>;
  normalization_options: Array<{ value: string; label: string }>;
  step_values: {
    cluster_selection_epsilon: number;
    alpha: number;
  };
  text_fields: {
    target_placeholder: string;
    filter_prefixes_placeholder: string;
    positive_words_placeholder: string;
    negative_words_placeholder: string;
    stop_words_placeholder: string;
  };
  section_labels: Record<string, string>;
  field_labels: Record<string, string>;
  button_labels: Record<string, string>;
  panel_titles: Record<string, string>;
  input_labels: Record<string, string>;
}

export interface TaskConfigs {
  task_configs: {
    reddit_analysis: TaskConfig;
  };
}

export interface UIConfigs {
  ui_configs: {
    reddit_analysis: UIConfig;
  };
}

export type ParamsType = TaskConfig["default_params"];
