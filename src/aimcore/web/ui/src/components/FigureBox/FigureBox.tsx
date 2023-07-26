import React from 'react';
import Plot from 'react-plotly.js';
import { useFigureBlobURI } from 'hooks';

import ErrorBoundary from 'components/ErrorBoundary';
import { Spinner } from 'components/kit';

import { FigureBoxProps } from './';

function FigureBox(props: FigureBoxProps) {
  const [scale, setScale] = React.useState<number>(1);
  const [visibility, setVisibility] =
    React.useState<React.CSSProperties['visibility']>('hidden');

  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const { data } = useFigureBlobURI(props);
  function setContainerScale() {
    const container = containerRef.current;
    let plot = container?.firstChild;
    let parentElement = container?.parentElement;
    if (container && plot && parentElement) {
      let width = container.offsetWidth + 20;
      let height = container.offsetHeight + 20;
      let containerWidth = parentElement.offsetWidth;
      let containerHeight = parentElement.offsetHeight - 30;
      let wK = containerWidth / width; // Calculate width ratio
      let hK = containerHeight / height; // Calculate height ratio
      if (wK < 1 || hK < 1) {
        setScale(Math.min(wK, hK)); // Apply scale based on object-fit: 'contain' pattern
      } else {
        setScale(1);
      }
    }
  }

  function onAutoSize() {
    window.requestAnimationFrame(() => {
      if (containerRef.current) {
        setContainerScale();
        setVisibility('visible');
      }
    });
  }

  React.useEffect(() => {
    if (containerRef.current && props.style) {
      setContainerScale();
    }
  }, [props.style]);

  return (
    <ErrorBoundary>
      <div
        ref={containerRef}
        style={{
          display: 'inline-block',
          transform: data ? `scale(${scale})` : '',
        }}
      >
        {data ? (
          <Plot
            style={{ visibility }}
            data={data.data || []}
            layout={{ ...(data.layout || {}) }}
            frames={data.frames}
            useResizeHandler={true}
            onAutoSize={onAutoSize}
            onInitialized={onAutoSize}
            onUpdate={onAutoSize}
          />
        ) : (
          <Spinner size={24} thickness={2} />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default FigureBox;
