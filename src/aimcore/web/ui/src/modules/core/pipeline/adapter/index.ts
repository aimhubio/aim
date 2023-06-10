import { memoize } from 'modules/core/cache';

import { SequenceType } from 'types/core/enums';
import { GroupedSequence } from 'types/core/AimObjects/GroupedSequences';

import { PipelinePhasesEnum, StatusChangeCallback } from '../types';

import processor, { ProcessedData, ProcessInterceptor } from './processor';
import AdapterError from './AdapterError';

export type AdapterConfigOptions = {
  sequenceType: SequenceType;
  useCache?: boolean;
  statusChangeCallback?: (status: string) => void;
};

export type Adapter = {
  execute: (data: Array<GroupedSequence>) => Promise<ProcessedData>;
};

let adapterConfig: {
  sequenceType: SequenceType;
  useCache: boolean;
  statusChangeCallback?: StatusChangeCallback;
};

function setAdapterConfig(options: AdapterConfigOptions): void {
  const { useCache, sequenceType } = options;
  adapterConfig = {
    ...options,
    sequenceType,
    useCache: !!useCache,
  };
}

function baseProcessor(seqs: Array<GroupedSequence>): Promise<ProcessedData> {
  const { sequenceType } = adapterConfig;
  adapterConfig.statusChangeCallback?.(PipelinePhasesEnum.Adopting);
  try {
    return Promise.resolve(processor(seqs, sequenceType));
  } catch (e) {
    throw new AdapterError(e.message || e, e.detail).getError();
  }
}

function createAdapter({
  sequenceType,
  useCache = false,
  statusChangeCallback,
}: AdapterConfigOptions): Adapter {
  setAdapterConfig({
    useCache,
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
