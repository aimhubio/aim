import * as React from 'react';

import LineChart from 'components/LineChart/LineChart';

import { ScaleEnum } from 'utils/d3';

function Metrics(props: any) {
  let [data, setData] = React.useState<any>(null);
  let [scale, setScale] = React.useState<number | null | undefined>(
    !!props.style ? undefined : null,
  );
  let containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    let rAFRef = window.requestAnimationFrame(() => {
      setData(props.data.data);
    });

    return () => window.cancelAnimationFrame(rAFRef);
  }, [props.data.data]);

  React.useEffect(() => {
    if (data && containerRef.current && props.style) {
      let plot = containerRef.current.firstChild;
      let container = containerRef.current.parentElement;
      if (plot && container) {
        let width = containerRef.current.offsetWidth + 20;
        let height = containerRef.current.offsetHeight + 20;
        let containerWidth = container.offsetWidth;
        let containerHeight = container.offsetHeight - 30;

        let wK = containerWidth / width; // Calculate width ratio
        let hK = containerHeight / height; // Calculate height ratio

        if (wK < 1 || hK < 1) {
          setScale(Math.min(wK, hK)); // Apply scale based on object-fit: 'contain' pattern
        } else {
          setScale(null);
        }
      }
    }
  }, [data, props.style]);

  return (
    data && (
      <div
        style={{
          display: 'inline-block',
          visibility: scale === undefined ? 'hidden' : 'visible',
          transform:
            scale === undefined || scale === null ? '' : `scale(${scale})`,
        }}
        ref={containerRef}
      >
        <LineChart
          data={[
            {
              key: props.data.key,
              data,
              color: '#1c2852',
              dasharray: 'none',
            },
          ]}
          style={{ minHeight: 300, minWidth: 400 }}
          axesScaleType={{
            xAxis: ScaleEnum.Linear,
            yAxis: ScaleEnum.Linear,
          }}
        />
      </div>
    )
  );
}

export default React.memo(Metrics);
