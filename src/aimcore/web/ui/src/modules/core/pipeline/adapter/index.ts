import { memoize } from 'modules/core/cache';

import { AimObjectDepths, SequenceType } from 'types/core/enums';
import { GroupedSequence } from 'types/core/AimObjects/GroupedSequences';

import { PipelinePhasesEnum, StatusChangeCallback } from '../types';

import depthInterceptors from './depthInterceptors';
import processor, { ProcessedData, ProcessInterceptor } from './processor';
import AdapterError from './AdapterError';

export type AdapterConfigOptions = {
  objectDepth: AimObjectDepths;
  sequenceType: SequenceType;
  customInterceptor?: ProcessInterceptor;
  useCache?: boolean;
  statusChangeCallback?: (status: string) => void;
};

export type Adapter = {
  execute: (data: Array<GroupedSequence>) => Promise<ProcessedData>;
};

let adapterConfig: {
  objectDepth: AimObjectDepths;
  customInterceptor: ProcessInterceptor;
  sequenceType: SequenceType;
  useCache: boolean;
  statusChangeCallback?: StatusChangeCallback;
};

function setAdapterConfig(options: AdapterConfigOptions): void {
  const { objectDepth, useCache, customInterceptor, sequenceType } = options;
  adapterConfig = {
    ...options,
    sequenceType,
    objectDepth,
    useCache: !!useCache,
    customInterceptor:
      customInterceptor || depthInterceptors[options.objectDepth],
  };
}

function baseProcessor(seqs: Array<GroupedSequence>): Promise<ProcessedData> {
  const { sequenceType, objectDepth } = adapterConfig;
  adapterConfig.statusChangeCallback?.(PipelinePhasesEnum.Adopting);
  try {
    return Promise.resolve(processor(seqs, sequenceType, objectDepth));
  } catch (e) {
    throw new AdapterError(e.message || e, e.detail).getError();
  }
}

function createAdapter({
  objectDepth,
  sequenceType,
  useCache = false,
  customInterceptor,
  statusChangeCallback,
}: AdapterConfigOptions): Adapter {
  setAdapterConfig({
    objectDepth,
    useCache,
    customInterceptor,
    sequenceType,
    statusChangeCallback,
  });

  const execute = useCache
    ? memoize<Array<GroupedSequence>, Promise<ProcessedData>>(baseProcessor)
    : baseProcessor;
  return {
    execute,
  };
}

export default createAdapter;
