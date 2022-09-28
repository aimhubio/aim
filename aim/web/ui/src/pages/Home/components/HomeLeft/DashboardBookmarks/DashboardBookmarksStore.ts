import {
  fetchDashboardsList,
  IDashboardData,
} from 'modules/core/api/dashboardsApi';
import createResource from 'modules/core/utils/createResource';

function createDashboardBookmarksEngine() {
  const { fetchData, state } =
    createResource<IDashboardData[]>(fetchDashboardsList);
  return { fetchDashboardBookmarks: fetchData, dashboardBookmarksState: state };
}

export default createDashboardBookmarksEngine();
