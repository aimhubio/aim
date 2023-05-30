import { IRunProgressObject } from 'modules/core/api/runsApi';

import { GroupedSequence } from 'types/core/AimObjects/GroupedSequences';

import { GroupedSequencesSearchQueryParams } from '../../api/dataFetchApi/types';

export type Query = {
  execute: (
    query: GroupedSequencesSearchQueryParams,
    ignoreCache: boolean,
  ) => Promise<Array<GroupedSequence>>;
  cancel: () => void;
  clearCache: () => void;
};

export type RequestProgressCallback = (progress: IRunProgressObject) => void;
export type ExceptionCallback = (error: Error) => void;
