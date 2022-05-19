import { memoize } from 'modules/BaseExplorerCore/cache';

import { AimObjectDepths, SequenceTypesEnum } from 'types/core/enums';
import { RunSearchRunView } from 'types/core/AimObjects/Run';

import depthInterceptors, { ProcessInterceptor } from './depthInterceptors';
import processor, { ProcessedData } from './processor';

export type AdapterConfigOptions = {
  objectDepth: AimObjectDepths;
  sequenceName: SequenceTypesEnum;
  customInterceptor?: ProcessInterceptor;
  useCache?: boolean;
};

export type Adapter = {
  execute: (data: RunSearchRunView[]) => ProcessedData;
};

let adapterConfig: {
  objectDepth: AimObjectDepths;
  customInterceptor: ProcessInterceptor;
  sequenceName: SequenceTypesEnum;
  useCache: boolean;
};

function setAdapterConfig(options: AdapterConfigOptions): void {
  const { objectDepth, useCache, customInterceptor, sequenceName } = options;
  adapterConfig = {
    sequenceName,
    objectDepth,
    useCache: !!useCache,
    customInterceptor:
      customInterceptor || depthInterceptors[options.objectDepth],
  };
}

function baseProcessor(runs: RunSearchRunView[]): ProcessedData {
  const { sequenceName, objectDepth } = adapterConfig;
  return processor(runs, sequenceName, objectDepth);
}

function createAdapter({
  objectDepth,
  sequenceName,
  useCache = false,
  customInterceptor,
}: AdapterConfigOptions): Adapter {
  setAdapterConfig({ objectDepth, useCache, customInterceptor, sequenceName });

  const execute = useCache
    ? memoize<RunSearchRunView[], ProcessedData>(baseProcessor)
    : baseProcessor;
  return {
    execute,
  };
}

export default createAdapter;
