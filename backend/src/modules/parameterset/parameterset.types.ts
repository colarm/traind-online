export interface ClusteringConfig {
  min_cluster_size: number;
  min_samples: number;
  metric: string;
  cluster_selection_method: string;
  cluster_selection_epsilon: number;
}

export interface SaveParameterSetInput {
  userId: string;
  name: string;
  config: ClusteringConfig;
}

export interface LoadParameterSetInput {
  id: string;
}

export interface CopyParameterInput {
  traindId: string;
  name: string;
}

export interface GetMyParameterSetsInput {
  userId: string;
  cursor?: string;
  limit?: number;
}

export interface PaginatedParameterSetList {
  parameterSets: any[];
  nextCursor?: string | null;
  hasNextPage: boolean;
  totalCount: number;
}
