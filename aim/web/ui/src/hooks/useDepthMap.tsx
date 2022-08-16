import * as React from 'react';
import _ from 'lodash-es';

/**
 *
 * @param data {Array<T>} - Array of items which needs for grouping and calculating the initial depth map
 * @param groupItemCb {(item: T) => string} - callback function which calls for every item when grouping the data
 * @param state {any} - engine depthMap state
 * @param deps {unknown[]} - the dependency array, after changing the item of the array will reset the depth map. The default value is: []
 *
 * return [depthSelector, onDepthMapChange] {IUseDepthMap}
 */

interface IUseDepthMapProps<T> {
  data: Array<T>;
  groupItemCb: (item: T) => string;
  state: any;
  deps: unknown[];
  synced?: boolean;
}

type IUseDepthMap = [
  (groupKey: string) => (state: any) => number,
  (value: number, groupKey: string) => void,
];

function useDepthMap<T>({
  data,
  groupItemCb,
  state,
  deps = [],
  synced = false,
}: IUseDepthMapProps<T>): IUseDepthMap {
  const grouped = _.groupBy(data, groupItemCb);

  const generateMapBy = React.useCallback((value: number = 0) => {
    const newDepthMap: Record<string, number> = {};

    for (let [groupKey, items] of Object.entries(grouped)) {
      // const { rows = [], columns = [] } = items[0].groups || {};
      // const groupId = rows.concat(columns).join('__');
      console.log(items);
      const maxValue = items.length - 1;
      if (value > maxValue) {
        debugger;
      }
      newDepthMap[groupKey] = value > maxValue ? maxValue : value;
    }
    return newDepthMap;
  }, deps);

  const initialMap = React.useMemo(() => generateMapBy(0), [generateMapBy]);

  const depthSelector = React.useCallback(
    (groupKey: string) => (state: any) => state.depthMap[groupKey] || 0,
    [],
  );
  const onDepthMapChange = React.useCallback(
    (value: number, groupKey: string): void => {
      if (synced) {
        const syncedDepthMap = generateMapBy(value);
        state.methods.update(syncedDepthMap);
      } else {
        state.methods.update({ [groupKey]: value });
      }
    },
    [synced, generateMapBy],
  );

  React.useEffect(() => {
    // set/reset depth map
    state.methods.update(initialMap);
  }, deps);

  return [depthSelector, onDepthMapChange];
}

export default useDepthMap;
