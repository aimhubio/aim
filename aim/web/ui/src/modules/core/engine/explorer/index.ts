import { isEmpty } from 'lodash-es';
import { UseBoundStore } from 'zustand';

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
  const query = {
    ...createQueryState<T>(store),
    initialize: (store: UseBoundStore<any>) => {
      // checks for storage type
      const stateFromStorage = getUrlSearchParam('query') || {};

      // update state
      if (!isEmpty(stateFromStorage)) {
        query.ranges.update(stateFromStorage.queryState.ranges);
        query.form.update(stateFromStorage.queryState.form);
      }

      // subscribe to changes
      store.subscribe(
        (state: any) => state.pipeline.currentQuery,
        (data: any) => {
          const url = updateUrlSearchParam(
            'query',
            encode({
              queryState: store.getState().query,
              readyQuery: data,
            }),
          );
          if (url === `${window.location.pathname}${window.location.search}`) {
            return;
          }

          window.history.pushState(null, '', url);
        },
      );

      listenToSearchParam<any>('query', (query: any) => {
        console.log('update history ----> ', query, store.getState().query);
      });
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
