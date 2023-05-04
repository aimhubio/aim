export interface IContributionsFeedProps {
  data: Record<string, any>;
  loadMore: () => void;
  isLoading: boolean;
  totalRunsCount?: number;
  fetchedCount?: number;
  archivedRunsCount?: number;
}
