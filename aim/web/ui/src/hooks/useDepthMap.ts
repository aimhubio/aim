import * as React from 'react';
import _ from 'lodash-es';

/**
 *
 * @param data {Array<T>} - Array of items which needs for grouping and calculating the initial depth map
 * @param groupItemCb {(item: T) => string} - callback function which calls for every item when grouping the data
 * @param state {any} - engine depthMap state
 * @param deps {unknown[]} - the dependency array, after changing the item of the array will reset the depth map. The default value is: []
 * @param sync {boolean} - it enables the depth map synchronization mechanism. The default value is: false
 *
 * return [depthSelector, onDepthMapChange] {UseDepthMap}
 */

interface IUseDepthMapProps<T> {
  data: Array<T>;
  groupItemCb: (item: T) => string;
  state: any;
  deps: unknown[];
  sync?: boolean;
}

type UseDepthMap = [
  (groupId: string) => (state: any) => number,
  (value: number, groupId: string) => void,
];

function useDepthMap<T>({
  data,
  groupItemCb,
  state,
  deps = [],
  sync = false,
}: IUseDepthMapProps<T>): UseDepthMap {
  const generateMapBy = React.useCallback((value: number = 0) => {
    const grouped = _.groupBy(data, groupItemCb);
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
    (groupId: string) => (state: any) => state.depthMap[groupId] || 0,
    [],
  );
  const onDepthMapChange = React.useCallback(
    (value: number, groupId: string): void => {
      if (sync) {
        const syncedDepthMap = generateMapBy(value);
        state.update(syncedDepthMap);
      } else {
        state.update({ [groupId]: value });
      }
    },
    [sync, generateMapBy, state],
  );

  React.useEffect(() => {
    // set/reset depth map
    state.update(initialMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return [depthSelector, onDepthMapChange];
}

export default useDepthMap;
