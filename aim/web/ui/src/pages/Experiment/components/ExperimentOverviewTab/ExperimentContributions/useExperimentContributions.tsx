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
    return () => engine.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (experimentContributionsState.data) {
      engine.destroy();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentId]);

  return {
    experimentContributionsState,
  };
}

export default useExperimentContributions;
