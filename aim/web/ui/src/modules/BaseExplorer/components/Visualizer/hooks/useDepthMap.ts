import * as React from 'react';
import _ from 'lodash-es';

import { AimFlatObjectBase } from 'types/core/AimObjects';

/**
 *
 * @param data {Array<T>} - Array of items which needs for grouping and calculating the initial depth map
 * @param groupItemCb {(item: T) => string} - callback function which calls for every item when grouping the data
 * @param state {any} - engine depthMap state
 * @param deps {unknown[]} - the dependency array, after changing the item of the array will reset the depth map. The default value is: []
 *
 * return [depthSelector, onDepthMapChange] {UseDepthMap}
 */

interface IUseDepthMapProps<T> {
  data: Array<T>;
  groupItemCb?: GroupItemCb<T>;
  state: any;
  deps: unknown[];
}

type GroupItemCb<T> = (item: T) => string;

export interface UseDepthMap {
  depthSelector: (groupId: string) => (state: any) => {
    depth: number;
    sync: boolean;
  };
  onDepthMapChange: (value: number, groupId: string, sync?: boolean) => void;
}

function useDepthMap({
  data,
  state,
  deps = [],
  groupItemCb,
}: IUseDepthMapProps<AimFlatObjectBase>): UseDepthMap {
  const groupItem: GroupItemCb<AimFlatObjectBase> = React.useCallback(
    (item) => {
      if (groupItemCb) {
        return groupItemCb(item);
      }
      const rowId = item.groups?.rows ? item.groups.rows[0] : '';
      const columnId = item.groups?.columns ? item.groups.columns[0] : '';
      return `${rowId}--${columnId}`;
    },
    [groupItemCb],
  );

  const generateMapBy = React.useCallback((value: number = 0) => {
    const grouped = _.groupBy(data, groupItem);
    const newDepthMap: Record<string, number> = {};
    for (let [groupId, items] of Object.entries(grouped)) {
      const maxValue = items.length - 1;
      newDepthMap[groupId] = value > maxValue ? maxValue : value;
    }
    return newDepthMap;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const initialMap = React.useMemo(() => generateMapBy(0), [generateMapBy]);

  const depthSelector = React.useCallback(
    (groupId: string) => (state: any) => ({
      sync: state.depthMap.sync,
      depth: state.depthMap[groupId] || 0,
    }),
    [],
  );
  const onDepthMapChange = React.useCallback(
    (value: number, groupId: string, sync: boolean = false): void => {
      if (sync) {
        const syncedDepthMap = generateMapBy(value);
        state.update(syncedDepthMap);
      } else {
        state.update({ [groupId]: value });
      }
    },
    [generateMapBy, state],
  );

  React.useEffect(() => {
    // set/reset depth map
    state.update(initialMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { depthSelector, onDepthMapChange };
}

export default useDepthMap;
