import React from 'react';

import { IResourceState } from 'modules/core/utils/createResource';
import { IExperimentData } from 'modules/core/api/experimentsApi';

import experimentEngine from './ExperimentStore';

function useExperimentData(experimentId: string) {
  const { current: engine } = React.useRef(experimentEngine);
  const experimentStore: IResourceState<IExperimentData> =
    engine.experimentState((state) => state);

  React.useEffect(() => {
    if (!experimentStore.data) {
      engine.fetchExperimentData(experimentId as any);
    }
    return () => {
      engine.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    experimentStore,
  };
}

export default useExperimentData;
