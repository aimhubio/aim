import { isEmpty } from 'lodash-es';

import { ExplorerEngineConfiguration } from 'modules/BaseExplorer/types';
import getUrlSearchParam from 'modules/core/utils/getUrlSearchParam';
import browserHistory from 'modules/core/services/browserHistory';

import createQueryState from './query';
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
          query.ranges.update(stateFromStorage.queryState.ranges);
          query.form.update(stateFromStorage.queryState.form);
        }

        const removeSearchParamListener = browserHistory.listenSearchParam<any>(
          'query',
          (query: any) => {
            if (!isEmpty(query)) {
              queryState.ranges.update(query.queryState.ranges);
              queryState.form.update(query.queryState.form);
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
