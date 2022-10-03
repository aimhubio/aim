import React from 'react';

import { GetProjectContributionsResult } from 'modules/core/api/projectApi';
import { IResourceState } from 'modules/core/utils/createResource';

import projectContributionsEngine from './ProjectContributionsStore';

function useProjectContributions() {
  const { current: engine } = React.useRef(projectContributionsEngine);
  const projectContributionsStore: IResourceState<GetProjectContributionsResult> =
    engine.projectContributionsState((state) => state);

  React.useEffect(() => {
    if (!projectContributionsStore.data) {
      engine.fetchProjectContributions();
    }
    return () => {
      engine.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    projectContributionsStore,
  };
}

export default useProjectContributions;
