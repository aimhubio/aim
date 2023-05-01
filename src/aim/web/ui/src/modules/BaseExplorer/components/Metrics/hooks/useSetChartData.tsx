import * as React from 'react';
import * as _ from 'lodash-es';

import { buildObjectHash } from 'modules/core/utils/hashing';

import { ILine } from 'types/components/LineChart/LineChart';

function useSetChartData(data: any[]): ILine[] {
  const [chartData, setChartData] = React.useState<ILine[]>([]);

  React.useEffect(() => {
    const chartData: ILine[] = [];
    for (let item of data || []) {
      chartData.push({
        key: item.key,
        groupKey: item.groupKey,
        data: item.data,
        color: item.style.color,
        dasharray: item.style.dasharray,
        selectors: [
          item.key,
          item.key,
          buildObjectHash({ runHash: item.run.hash }),
        ],
      });
    }
    setChartData((prevState) => {
      if (prevState && _.isEqual(prevState, chartData)) {
        return prevState;
      }
      return chartData;
    });
  }, [data]);

  return chartData;
}

export default useSetChartData;
