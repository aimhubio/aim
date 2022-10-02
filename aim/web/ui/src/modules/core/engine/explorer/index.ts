import { isEmpty } from 'lodash-es';
import { UseBoundStore } from 'zustand';

import history from 'history/browser';
import { ExplorerEngineConfiguration } from 'modules/BaseExplorer/types';
import listenToSearchParam from 'modules/core/utils/listenToSearchParam';
import getUrlSearchParam from 'modules/core/utils/getUrlSearchParam';
import updateUrlSearchParam from 'modules/core/utils/updateUrlSearchParam';

import { encode } from 'utils/encoder/encoder';

import createQueryState from './query';
import createGroupingsEngine from './groupings';

function createExplorerAdditionalEngine<T>(
  config: ExplorerEngineConfiguration,
  store: any,
) {
  const queryState = createQueryState<T>(store);
  const query = {
    ...queryState,
    initialize: (store: UseBoundStore<any>) => {
      // checks for storage type
      const stateFromStorage = getUrlSearchParam('query') || {};

      // update state
      if (!isEmpty(stateFromStorage)) {
        query.ranges.update(stateFromStorage.queryState.ranges);
        query.form.update(stateFromStorage.queryState.form);
      }

      const removeSearchParamListener = listenToSearchParam<any>(
        'query',
        (query: any) => {
          if (!isEmpty(query)) {
            queryState.ranges.update(query.queryState.ranges);
            queryState.form.update(query.queryState.form);
          } else {
            queryState.reset();
          }
        },
      );

      return () => {
        console.log('destroying');
        removeSearchParamListener();
      };
    },
  };
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
