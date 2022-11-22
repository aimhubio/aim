import React from 'react';

import { GetExperimentContributionsResult } from 'modules/core/api/experimentsApi';
import { IResourceState } from 'modules/core/utils/createResource';

import experimentContributionsEngine from './ExperimentContributionsStore';

function useExperimentContributions(experimentId: string) {
  const { current: engine } = React.useRef(experimentContributionsEngine);
  const experimentContributionsState: IResourceState<GetExperimentContributionsResult> =
    engine.experimentContributionsState((state) => state);

  React.useEffect(() => {
    if (!experimentContributionsState.data) {
      engine.fetchExperimentContributions(experimentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentContributionsState.data]);

  React.useEffect(() => {
    return () => {
      engine.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    experimentContributionsState,
  };
}

export default useExperimentContributions;
