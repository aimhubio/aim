import { ISelectConfig } from 'services/models/explorer/createAppModel';

import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import { IDashboardData } from 'types/services/models/metrics/metricsAppModel';

export interface IBookmarksProps {
  data: IBookmarksData[];
  onBookmarkDelete: (id) => void;
  isLoading: boolean;
  notifyData: INotification[];
  onNotificationDelete: (id: number) => void;
}

interface IBookmarksData extends IDashboardData {
  select: ISelectConfig;
  type: string;
}
