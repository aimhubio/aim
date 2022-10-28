import { memoize } from 'modules/core/cache';

import { AimFlatObjectBase } from 'types/core/AimObjects';

import {
  PipelinePhasesEnum,
  StatusChangeCallback,
  BettaGroupOption,
} from '../types';

import group from './group';
import GroupingError from './GroupingError';

export type GroupingConfigOptions = {
  useCache?: boolean;
  statusChangeCallback: StatusChangeCallback;
};

export type GroupingExecutionOptions = {
  objectList: AimFlatObjectBase<any>[];
  grouping: BettaGroupOption[];
};

export type GroupingResult = {
  objectList: any[];
  appliedGroupsConfig: any;
  foundGroups: any;
};

export type Grouping = {
  execute: (params: GroupingExecutionOptions) => GroupingResult;
};

// later usage in modification
let groupingConfig: {
  useCache: boolean;
  statusChangeCallback?: StatusChangeCallback;
};

function setGroupingConfig(options: GroupingConfigOptions): void {
  const { useCache } = options;
  groupingConfig = {
    useCache: !!useCache,
    statusChangeCallback: options.statusChangeCallback,
  };
}

export function grouping({
  objectList,
  grouping,
}: GroupingExecutionOptions): GroupingResult {
  groupingConfig.statusChangeCallback &&
    groupingConfig.statusChangeCallback(PipelinePhasesEnum.Grouping);
  // found groups
  let fg = {};
  // data
  let d = objectList;

  try {
    grouping?.forEach((g: BettaGroupOption) => {
      const { foundGroups, data } = group(d, g);
      d = data;
      fg = {
        ...fg,
        ...foundGroups,
      };
    });
  } catch (e) {
    throw new GroupingError(e.message || e, e.detail).getError();
  }

  return {
    appliedGroupsConfig: grouping,
    objectList: d,
    foundGroups: fg,
  };
}

function createGrouping({
  useCache = false,
  statusChangeCallback,
}: GroupingConfigOptions): Grouping {
  setGroupingConfig({ useCache, statusChangeCallback });

  const execute = useCache
    ? memoize<GroupingExecutionOptions, GroupingResult>(grouping)
    : grouping;
  return {
    execute,
  };
}

export default createGrouping;
