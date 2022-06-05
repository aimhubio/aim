import { memoize } from 'modules/BaseExplorerCore/cache';

import { AimFlatObjectBase } from '../adapter/processor';

import { BettaGroupOption, GroupType, Order } from './types';
import group from './group';

export type GroupingConfigOptions = {
  useCache?: boolean;
  statusChangeCallback: (status: string) => void;
};

export type GroupingExecutionOptions = {
  objectList: AimFlatObjectBase[];
  grouping: {
    columns: BettaGroupOption[];
  };
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

  const { columns } = grouping;
  const groupingParams: {
    type: GroupType;
    fields: string[];
    orders: Order[];
  } = {
    type: GroupType.COLUMN,
    fields: [],
    orders: [],
  };

  columns.length &&
    columns.forEach((item: BettaGroupOption) => {
      groupingParams.fields.push(item.field);
      groupingParams.orders.push(item.order);
    });

  const { foundGroups, data } = group(objectList, groupingParams);

  return {
    appliedGroupsConfig: grouping,
    objectList: data,
    foundGroups,
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
