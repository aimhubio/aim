import { IDashboardData } from 'modules/core/api/dashboardsApi';

import { ISelectConfig } from 'types/services/models/explorer/createAppModel';

interface IBookmarkProps extends IDashboardData {
  select: ISelectConfig;
  type: string;
}

interface IBookmarksStore {
  bookmarks: IBookmarkProps[];
  isLoading: boolean;
  getBookmarks: () => Promise<void>;
  onBookmarkDelete: (id: string) => Promise<void>;
  destroy: () => void;
}
