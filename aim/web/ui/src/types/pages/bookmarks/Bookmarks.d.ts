import {
  IDashboardData,
  IMetricAppConfig,
} from 'types/services/models/metrics/metricsAppModel';

export interface IBookmarksProps {
  data: IBookmarksData[];
  onBookmarkDelete: (id) => void;
  isLoading: boolean;
}

interface IBookmarksData extends IDashboardData {
  select: IMetricAppConfig['select'] | any;
  type: string;
}
