import create from 'zustand';

import dashboardService from 'services/api/dashboard/dashboardService';

const useHomeBookmarksStore = create((set) => ({
  bookmarks: [],
  fetchBookmarks: async () => {
    console.log('fetchBookmarks');
    const bookmarks = await dashboardService
      .fetchDashboardsList()
      .call((detail: any) => console.log(detail));
    console.log(bookmarks);
    set({ bookmarks });
  },
}));

export default useHomeBookmarksStore;
