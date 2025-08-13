export interface Traind {
  id: string;
  postId: string;
  subreddit: string;
  title: string;
  result: any; // JSON result from ML analysis
  parameterSetId: string;
  isPublic: boolean;
  createdAt: string;
  userId: string;
  user?: {
    id: string;
    email: string;
  };
  _count?: {
    stars: number;
    comments: number;
  };
  isStarred?: boolean; // Whether the current user has starred this traind
}

export interface TraindStreamProps {
  trainds: Traind[];
  loading?: boolean;
  hasError?: boolean;
  onTraindClick?: (traind: Traind) => void;
  onDelete?: (traindId: string) => void;
  showActions?: boolean;
  emptyMessage?: string;
}
