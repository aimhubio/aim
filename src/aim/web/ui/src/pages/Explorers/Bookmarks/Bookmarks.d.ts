import { IDashboardData } from 'modules/core/api/dashboardsApi';

import { ISelectConfig } from 'types/services/models/explorer/createAppModel';

interface IBookmarkProps extends IDashboardData {
  /**
   * @description select config for bookmark
   * @required
   */
  select: ISelectConfig;
  /**
   * @description type of bookmark (app type)
   * @required
   * @example 'metrics' | 'images'
   * @type string
   */
  type: string;
}

/**
 * @description bookmarks store is zustand store for bookmarks data
 */
interface IBookmarksStore {
  /**
   * @description bookmarks list data
   * @required
   * @type IBookmarkProps[]
   */
  bookmarks: IBookmarkProps[];
  /**
   * @description request loading state for bookmarks list
   * @required
   * @type boolean
   */
  isLoading: boolean;
  /**
   * @description getting bookmarks list from api and setting it to bookmarks state
   * @required
   * @returns {Promise<void>}
   * @example
   * getBookmarks();
   * @type () => Promise<void>
   */
  getBookmarks: () => Promise<void>;
  /**
   * @description deleting bookmark from bookmarks list and from api
   * @required
   * @param {string} id - bookmark id
   * @returns {Promise<void>}
   */
  onBookmarkDelete: (id: string) => Promise<void>;
  /**
   * @description destroying bookmarks store after explorers page unmount
   * @required
   * @returns {void}
   */
  destroy: () => void;
}
