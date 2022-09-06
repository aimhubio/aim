import { IEngineConfigFinal } from '../types';

import createState from './state';

function createExplorerEngine<T>(config: IEngineConfigFinal, store: any) {
  const state = createState(config, store);

  return state;
}

export default createExplorerEngine;
