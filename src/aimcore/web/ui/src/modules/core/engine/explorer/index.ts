import { isEmpty } from 'lodash-es';

import { ExplorerEngineConfiguration } from 'modules/BaseExplorer/types';
import getUrlSearchParam from 'modules/core/utils/getUrlSearchParam';
import browserHistory from 'modules/core/services/browserHistory';

import createQueryState, { QueryState } from './query';
import createGroupingsEngine from './groupings';

function createExplorerAdditionalEngine<T>(
  config: ExplorerEngineConfiguration,
  store: any,
  persist?: boolean, // TODO later use StatePersistOption,
) {
  const queryState = createQueryState<T>(store);
  const query = {
    ...queryState,
    initialize: () => {
      if (persist) {
        const stateFromStorage = getUrlSearchParam('query') || {};

        // update state
        if (!isEmpty(stateFromStorage)) {
          query.ranges.update(stateFromStorage.ranges);
          query.form.update(stateFromStorage.form);
        }

        const removeSearchParamListener = browserHistory.listenSearchParam<any>(
          'query',
          (query: QueryState) => {
            if (!isEmpty(query)) {
              queryState.ranges.update(query.ranges);
              queryState.form.update(query.form);
            } else {
              queryState.reset();
            }
          },
          ['PUSH'],
        );

        return () => {
          removeSearchParamListener();
        };
      }

      return () => {};
    },
  };
  const groupings = createGroupingsEngine(
    config.groupings || {},
    store,
    persist,
  );

  const initialState = {
    query: { ...query.initialState },
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
