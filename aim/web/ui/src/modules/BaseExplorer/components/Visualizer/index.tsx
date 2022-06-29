import React from 'react';

import { Button, Text } from 'components/kit';

import { IVisualizationProps } from '../../types';
import Box from '../Box';

function BaseVisualizer(props: IVisualizationProps) {
  const engine = props.engine;
  const boxConfig = props.engine.useStore(props.engine.boxConfig.stateSelector);
  const data = engine
    .useStore(engine.dataSelector)
    ?.map((d: any, i: number) => ({
      ...d,
      style: {
        width: boxConfig.width,
        height: boxConfig.height,
        left: (i % 10) * (boxConfig.width + boxConfig.gap),
        top: Math.floor(i / 10) * (boxConfig.height + boxConfig.gap),
      },
    }));

  let container: React.MutableRefObject<HTMLDivElement> =
    React.useRef<HTMLDivElement>(document.createElement('div'));
  let grid: React.MutableRefObject<HTMLDivElement> =
    React.useRef<HTMLDivElement>(document.createElement('div'));

  let [gridWindow, setGridWindow] = React.useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });

  function onScroll({ target }: any) {
    setGridWindow({
      left: target.scrollLeft,
      top: target.scrollTop,
      width: container.current.offsetWidth,
      height: container.current.offsetHeight,
    });
  }

  React.useEffect(() => {
    setGridWindow({
      left: grid.current.scrollLeft,
      top: grid.current.scrollTop,
      width: container.current.offsetWidth,
      height: container.current.offsetHeight,
    });
  }, []);

  let sortedByPosition = data
    ?.sort((a: any, b: any) => a.style.left - b.style.left)
    .sort((a: any, b: any) => a.style.top - b.style.top);

  let items = data?.filter(
    (item: any) =>
      item.style.left >= gridWindow.left - item.style.width &&
      item.style.left <= gridWindow.left + gridWindow.width &&
      item.style.top >= gridWindow.top - item.style.height &&
      item.style.top <= gridWindow.top + gridWindow.height,
  );

  return (
    <div
      ref={container}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'auto',
      }}
      onScroll={onScroll}
    >
      <div
        ref={grid}
        style={{
          overflow: 'hidden',
          width:
            sortedByPosition?.[sortedByPosition?.length - 1]?.style?.left +
            sortedByPosition?.[sortedByPosition?.length - 1]?.style?.width,
          height:
            sortedByPosition?.[sortedByPosition?.length - 1]?.style?.top +
            sortedByPosition?.[sortedByPosition?.length - 1]?.style?.height,
        }}
      >
        {items?.map((item: any, i: number) => (
          <Box
            key={i} // replace with some unique key of box data
            engine={props.engine}
            style={item.style}
          >
            {/* @ts-ignore */}
            <props.box engine={props.engine} data={item} />
          </Box>
        ))}
      </div>
    </div>
  );
}

BaseVisualizer.displayName = 'Visualization';

export default BaseVisualizer;
