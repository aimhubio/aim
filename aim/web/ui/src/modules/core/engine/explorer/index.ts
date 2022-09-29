import { ExplorerEngineConfiguration } from 'modules/BaseExplorer/types';

import createQueryState from './query';
import createGroupingsEngine from './groupings';

function createExplorerAdditionalEngine<T>(
  config: ExplorerEngineConfiguration,
  store: any,
) {
  const query = createQueryState<T>(store);
  const groupings = createGroupingsEngine(config.groupings || {}, store);

  const initialState = {
    query: {
      ...query.initialState,
    },
    ...groupings.state,
  };

  return {
    initialState,
    engine: {
      query,
      groupings: groupings.engine,
    },
  };
}

export default createExplorerAdditionalEngine;
