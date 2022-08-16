import * as React from 'react';
import Plot from 'react-plotly.js';

function Figures(props: any) {
  let [data, setData] = React.useState<any>(null);
  let [scale, setScale] = React.useState<number | null | undefined>(
    !!props.style ? undefined : null,
  );
  let containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    let timerID = setTimeout(() => {
      setData(JSON.parse(props.data.data.data));
    }, 250);

    return () => clearTimeout(timerID);
  }, [props.data.data.data]);

  React.useEffect(() => {
    if (data && containerRef.current && props.style) {
      let plot = containerRef.current.querySelector('.plot-container');
      if (plot) {
        let width = containerRef.current.offsetWidth;
        let height = containerRef.current.offsetHeight;

        let wK = props.style.width / width; // Calculate width ratio
        let hK = props.style.height / height; // Calculate height ratio

        if (wK < 1 || hK < 1) {
          setScale(Math.min(wK, hK)); // Apply scale based on object-fit: 'contain' pattern
        } else {
          setScale(null);
        }
      }
    }
  }, [data, props.style?.width, props.style?.height]);

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
        <Plot
          data={data.data}
          layout={data.layout}
          frames={data.frames}
          useResizeHandler={true}
        />
      </div>
    )
  );
}

export default React.memo(Figures);
