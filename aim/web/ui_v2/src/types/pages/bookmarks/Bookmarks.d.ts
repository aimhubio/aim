import { IDashboardData } from 'types/services/models/metrics/metricsAppModel';

export interface IBookmarksProps {
  data: IDashboardData[];
  onBookmarkDelete: (id) => void;
}
