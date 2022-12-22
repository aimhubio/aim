import * as React from 'react';

import { IBoxProps } from 'modules/BaseExplorer/types';

import LineChart from 'components/LineChart/LineChart';

import { ScaleEnum } from 'utils/d3';

function Metrics(props: IBoxProps) {
  let [data, setData] = React.useState<any>(null);
  let containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    let rAFRef = window.requestAnimationFrame(() => {
      setData(props.data);
    });

    return () => window.cancelAnimationFrame(rAFRef);
  }, [props.data]);

  console.log(data);

  const lineChartData = React.useMemo(() => {
    return (data || []).map((item: any) => ({
      key: item.key,
      data: item.data,
      color: item.style.color,
      dasharray: item.style.dasharray,
      selectors: [item.key],
    }));
  }, [data]);

  return (
    data && (
      <div
        style={{
          width: '100%',
          height: '100%',
          padding: 20,
        }}
        ref={containerRef}
      >
        <LineChart
          index={props.index}
          data={lineChartData}
          axesScaleType={{
            xAxis: ScaleEnum.Linear,
            yAxis: ScaleEnum.Linear,
          }}
          margin={{
            top: 30,
            right: 40,
            bottom: 30,
            left: 60,
          }}
        />
      </div>
    )
  );
}

export default React.memo(Metrics);
