import React from 'react';

import { IResourceState } from 'modules/core/utils/createResource';
import { IExperimentData } from 'modules/core/api/experimentsApi';

import experimentEngine from './ExperimentStore';

function useExperimentData(experimentId: string) {
  const { current: engine } = React.useRef(experimentEngine);
  const experimentStore: IResourceState<IExperimentData> =
    engine.experimentState((state) => state);
  const experimentsStore: IResourceState<IExperimentData[]> =
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
    experimentStore,
    experimentsStore,
    getExperimentsData: engine.fetchExperimentsData,
  };
}

export default useExperimentData;
