import {
  IRunProgressObject,
  RunsSearchQueryParams,
} from 'modules/core/api/runsApi';

import { RunSearchRunView } from 'types/core/AimObjects';

export type Query = {
  execute: (
    query: RunsSearchQueryParams,
    ignoreCache: boolean,
  ) => Promise<RunSearchRunView[]>;
  cancel: () => void;
  clearCache: () => void;
};

export type RequestProgressCallback = (progress: IRunProgressObject) => void;
export type ExceptionCallback = (error: Error) => void;
