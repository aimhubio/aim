import { ISelectConfig } from 'services/models/explorer/createAppModel';

import { IDashboardData } from 'types/services/models/metrics/metricsAppModel';

export interface IBookmarksProps {
  data: IBookmarksData[];
  onBookmarkDelete: (id) => void;
  isLoading: boolean;
}

interface IBookmarksData extends IDashboardData {
  select: ISelectConfig;
  type: string;
}
