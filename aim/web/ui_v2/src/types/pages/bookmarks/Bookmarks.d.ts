import {
  IDashboardData,
  IMetricAppConfig,
} from 'types/services/models/metrics/metricsAppModel';

export interface IBookmarksProps {
  data: IBookmarksData[];
  onBookmarkDelete: (id) => void;
}

interface IBookmarksData extends IDashboardData {
  select: IMetricAppConfig['select'];
  type: string;
}
