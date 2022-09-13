import { getActivity, GetActivityResult } from 'modules/core/api/projectApi';
import createResource from 'modules/core/utils/createResource';

function createActivityEngine() {
  const { fetchData, state } = createResource<GetActivityResult>(getActivity);
  return { fetchActivity: fetchData, activityState: state };
}

export default createActivityEngine();
