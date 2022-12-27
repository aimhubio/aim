import * as React from 'react';
import Plot from 'react-plotly.js';

function Figures(props: any) {
  let [data, setData] = React.useState<any>(null);
  let [scale, setScale] = React.useState<number | null | undefined>(
    !!props.style ? undefined : null,
  );
  let containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    let rafId = window.requestAnimationFrame(() => {
      setData(JSON.parse(props.data.data.data));
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [props.data.data.data]);

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
