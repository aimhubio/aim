import React from 'react';

import { GetActivityResult } from 'modules/core/api/projectApi';
import { IResourceState } from 'modules/core/utils/createResource';

import createActivityEngine from './ActivityStore';
import ActivityStore from './ActivityStore';

function useActivity() {
  const { current: activityEngine } = React.useRef(createActivityEngine);
  const activityStore: IResourceState<GetActivityResult> =
    ActivityStore.activityState((state) => state);

  React.useEffect(() => {
    activityEngine.fetchActivity();
    return () => {
      activityEngine.activityState.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    activityStore,
  };
}

export default useActivity;
