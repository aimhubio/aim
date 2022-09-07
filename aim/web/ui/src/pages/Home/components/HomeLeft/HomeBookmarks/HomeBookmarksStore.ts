import {
  fetchDashboardsList,
  IDashboardData,
} from 'modules/core/api/dashboardsApi';
import createResource from 'modules/core/utils/createResource';

function createBookmarksEngine() {
  const { fetchData, state } =
    createResource<IDashboardData>(fetchDashboardsList);
  return { fetchBookmarks: fetchData, bookmarksState: state };
}

export default createBookmarksEngine();
