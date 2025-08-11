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
}

export interface TraindStreamProps {
  trainds: Traind[];
  loading?: boolean;
  onTraindClick?: (traind: Traind) => void;
  onStarToggle?: (traindId: string, isStarred: boolean) => void;
  onDelete?: (traindId: string) => void;
  showActions?: boolean;
  emptyMessage?: string;
}

export interface TraindApiResponse {
  data?: Traind[];
  trainds?: Traind[];
  error?: string;
  success?: boolean;
}
