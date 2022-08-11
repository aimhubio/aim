import * as React from 'react';
import * as _ from 'lodash-es';

/**
 *
 * @param data {Array<T>} - Array of items which needs for grouping and calculating the initial depth map
 * @param groupData {(data: Array<T>) => Record<string, Array<T>>} - callback function which takes data and group them dynamically
 * @param dependencies {unknown[]} - resets the depth map on changing item from dependency array, the default value is: [data]
 *
 * return [depthMap, onDepthMapChange, groupedItems] {[number[], (value: number, index: number) => void, Record<string, Array<T>>]}
 */

function useDepthMap<T>(
  data: Array<T>,
  groupData: (data: Array<T>) => Record<string, Array<T>>,
  dependencies: unknown[] = [data],
): [
  number[],
  (value: number, index: number) => void,
  Record<string, Array<T>>,
] {
  const { initialMap, groupedItems } = React.useMemo(() => {
    const grouped = groupData(data);
    return {
      initialMap: Array(Object.keys(grouped).length).fill(0),
      groupedItems: grouped,
    };
  }, [groupData, data]);
  const [depthMap, setDepthMap] = React.useState<number[]>(initialMap);

  const onDepthMapChange = React.useCallback(
    (value: number, index: number): void => {
      if (value !== depthMap[index]) {
        let tmpDepthMap = [...depthMap];
        tmpDepthMap[index] = value;
        setDepthMap(tmpDepthMap);
      }
    },
    [depthMap, setDepthMap],
  );

  React.useEffect(() => {
    if (!_.isEqual(initialMap, depthMap)) {
      setDepthMap(initialMap);
    }
  }, dependencies);

  return [depthMap, onDepthMapChange, groupedItems];
}

export default useDepthMap;
