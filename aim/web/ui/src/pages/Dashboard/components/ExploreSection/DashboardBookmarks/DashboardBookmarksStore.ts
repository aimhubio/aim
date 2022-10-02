import {
  fetchDashboardsList,
  IDashboardData,
} from 'modules/core/api/dashboardsApi';
import createResource from 'modules/core/utils/createResource';

function createDashboardBookmarksEngine() {
  const { fetchData, state, destroy } =
    createResource<IDashboardData[]>(fetchDashboardsList);
  return {
    fetchDashboardBookmarks: fetchData,
    dashboardBookmarksState: state,
    destroy,
  };
}

export default createDashboardBookmarksEngine();
