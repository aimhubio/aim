import { IBookmarksProps } from '../Bookmarks';
import { IDashboardData } from 'types/services/models/metrics/metricsAppModel';

export interface IBookmarkCardProps extends IDashboardData {
  onBookmarkDelete: IBookmarksProps['onBookmarkDelete'];
}
