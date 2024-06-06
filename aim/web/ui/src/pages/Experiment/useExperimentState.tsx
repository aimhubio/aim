import React from 'react';

import { IResourceState } from 'modules/core/utils/createResource';
import { IExperimentData } from 'modules/core/api/experimentsApi';

import experimentEngine from './ExperimentStore';

function useExperimentState(experimentId: string) {
  const { current: engine } = React.useRef(experimentEngine);
  const experimentState: IResourceState<IExperimentData> =
    engine.experimentState((state) => state);
  const experimentsState: IResourceState<IExperimentData[]> =
    engine.experimentsState((state) => state);

  React.useEffect(() => {
    return () => {
      engine.destroyExperiment();
      engine.destroyExperiments();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    engine.fetchExperimentData(experimentId as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentId]);

  return {
    experimentState,
    experimentsState,
    getExperimentsData: engine.fetchExperimentsData,
    updateExperiment: engine.updateExperiment,
    deleteExperiment: engine.deleteExperiment,
  };
}

export default useExperimentState;
