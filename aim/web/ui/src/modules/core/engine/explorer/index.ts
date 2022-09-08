import { ExplorerEngineConfiguration } from 'modules/BaseExplorerNew/types';

import { IEngineConfigFinal } from '../types';

import createState from './state';

function createExplorerEngine<T>(
  config: ExplorerEngineConfiguration,
  store: any,
) {
  const state = createState(config, store);

  return state;
}

export default createExplorerEngine;
