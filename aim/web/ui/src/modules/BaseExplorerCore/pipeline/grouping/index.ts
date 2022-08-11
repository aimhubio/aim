import { memoize } from 'modules/BaseExplorerCore/cache';

import { AimFlatObjectBase } from '../adapter/processor';

import { BettaGroupOption, GroupType, Order } from './types';
import group from './group';

export type GroupingConfigOptions = {
  useCache?: boolean;
  statusChangeCallback: (status: string) => void;
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
  statusChangeCallback?: (status: string) => void;
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
    groupingConfig.statusChangeCallback('grouping');

  let fg = {};
  let d = objectList;

  grouping?.forEach((g: BettaGroupOption) => {
    const { foundGroups, data } = group(d, g);
    d = data;
    fg = {
      ...fg,
      ...foundGroups,
    };
  });

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
