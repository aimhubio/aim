import * as React from 'react';
import _ from 'lodash-es';

/**
 *
 * @param data {Array<T>} - Array of items which needs for grouping and calculating the initial depth map
 * @param groupItemCb {(item: T) => string} - callback function which calls for every item when grouping the data
 * @param state {any} - engine depthMap state
 * @param deps {unknown[]} - the dependency array, after changing the item of the array will reset the depth map. The default value is: [data]
 *
 * return [depthMap, onDepthMapChange] {[Record<string, number>, (value: number, groupKey: string) => void]}
 */

interface IUseDepthMapProps<T> {
  data: Array<T>;
  groupItemCb: (item: T) => string;
  state: any;
  deps: unknown[];
}

function useDepthMap<T>({
  data,
  groupItemCb,
  state,
  deps = [data],
}: IUseDepthMapProps<T>): [
  (groupKey: string) => (state: any) => number,
  (value: number, groupKey: string) => void,
] {
  const initialMap = React.useMemo(() => {
    const grouped = _.groupBy(data, groupItemCb);
    const initial: Record<string, number> = {};
    Object.keys(grouped).forEach((groupKey: string) => (initial[groupKey] = 0));
    return initial;
  }, [data]);

  const depthSelector = React.useCallback(
    (groupKey: string) => (state: any) => state.depthMap[groupKey] || 0,
    [],
  );
  const onDepthMapChange = React.useCallback(
    (value: number, groupKey: string): void => {
      state.methods.update({ [groupKey]: value });
    },
    [],
  );

  React.useEffect(() => {
    // set/reset depth map
    state.methods.update(initialMap);
  }, deps);

  return [depthSelector, onDepthMapChange];
}

export default useDepthMap;
