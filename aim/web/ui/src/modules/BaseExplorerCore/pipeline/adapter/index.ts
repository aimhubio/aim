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
  statusChangeCallback?: (status: string) => void;
};

export type Adapter = {
  execute: (data: RunSearchRunView[]) => Promise<ProcessedData>;
};

let adapterConfig: {
  objectDepth: AimObjectDepths;
  customInterceptor: ProcessInterceptor;
  sequenceName: SequenceTypesEnum;
  useCache: boolean;
  statusChangeCallback?: (status: string) => void;
};

function setAdapterConfig(options: AdapterConfigOptions): void {
  const { objectDepth, useCache, customInterceptor, sequenceName } = options;
  adapterConfig = {
    ...options,
    sequenceName,
    objectDepth,
    useCache: !!useCache,
    customInterceptor:
      customInterceptor || depthInterceptors[options.objectDepth],
  };
}

function baseProcessor(runs: RunSearchRunView[]): Promise<ProcessedData> {
  const { sequenceName, objectDepth } = adapterConfig;
  adapterConfig.statusChangeCallback &&
    adapterConfig.statusChangeCallback('adopting');

  return Promise.resolve(processor(runs, sequenceName, objectDepth));
}

function createAdapter({
  objectDepth,
  sequenceName,
  useCache = false,
  customInterceptor,
  statusChangeCallback,
}: AdapterConfigOptions): Adapter {
  setAdapterConfig({
    objectDepth,
    useCache,
    customInterceptor,
    sequenceName,
    statusChangeCallback,
  });

  const execute = useCache
    ? memoize<RunSearchRunView[], Promise<ProcessedData>>(baseProcessor)
    : baseProcessor;
  return {
    execute,
  };
}

export default createAdapter;
