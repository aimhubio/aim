import create from 'zustand';

import {
  deleteDashboard,
  fetchDashboardsList,
} from 'modules/core/api/dashboardsApi';

import appsService from 'services/api/apps/appsService';

const useBookmarksStore = create<any, any>((set, get) => ({
  bookmarks: [],
  isLoading: false,
  getBookmarks: async () => {
    try {
      set({ isLoading: true });
      const bookmarks = await fetchDashboardsList();
      const appsList = await appsService.fetchAppsList().call();
      const listData = bookmarks.map((item: any) => {
        const app = appsList.find((appData: any) => appData.id === item.app_id);
        return { ...item, select: app.state.select, type: app.type };
      });
      set({ bookmarks: listData, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },
  onBookmarkDelete: async (id: string) => {
    try {
      set({ isLoading: true });
      await deleteDashboard(id);
      const bookmarks = get().bookmarks;
      const newBookmarks = [...bookmarks].filter(
        (bookmark: any) => bookmark.id !== id,
      );
      set({ bookmarks: newBookmarks, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },
  destroy: () => {},
}));

export default useBookmarksStore;
