import React, { useEffect } from 'react';

import { Text } from 'components/kit';

import { IVisualizationProps } from '../../types';
import Box from '../Box';
import BoxConfig from '../Controls/BoxConfig';
import Controls from '../Controls';

function BaseVisualizer(props: IVisualizationProps) {
  const engine = props.engine;

  const boxConfig = props.engine.useStore(props.engine.boxConfig.stateSelector);
  const styleAppliers = props.engine.styleAppliers;

  const foundGroups = props.engine.useStore(props.engine.foundGroupsSelector);

  // calculate styles by position
  // get style applier of box  from engine
  // listen to found groups
  function applyStyles(obj: any, group: any, iteration: number) {
    let style = {};
    styleAppliers.forEach((applier: any) => {
      style = {
        ...style,
        ...applier(obj, group, boxConfig, iteration),
      };
    });

    return style;
  }

  const dataState = engine.useStore(engine.dataSelector);

  const data = React.useMemo(() => {
    return dataState?.map((d: any, i: number) => {
      const groupTypes = Object.keys(d.groups || {});
      const info: Record<string, object> = {};
      if (foundGroups) {
        groupTypes.forEach((groupType) => {
          info[groupType] = {
            key: foundGroups[d.groups?.[groupType]].key,
            config: foundGroups[d.groups[groupType]].fields,
            items_count_in_group: foundGroups[d.groups[groupType]].items.length,
            order: foundGroups[d.groups[groupType]].order,
          };
        });
      }

      return {
        ...d,
        style: {
          width: boxConfig.width,
          height: boxConfig.height,
          ...applyStyles(d, info, i),
        },
      };
    });
  }, [dataState, foundGroups, boxConfig, applyStyles]);

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

  useEffect(() => {
    container.current.scrollTo(200, 200);
  }, []);

  return (
    <div
      style={{
        padding: '0 0.625rem',
        width: '100%',
        display: 'flex',
      }}
    >
      <div
        ref={container}
        style={{
          width: '100%',
          height: '100%',
          top: '20px',
          maxHeight: 'calc(100vh - 160px)',
          position: 'relative',
          overflow: 'auto',
        }}
        onScroll={onScroll}
      >
        <Text>
          Rendered boxes {items?.length || 0}/{data?.length || 0}
        </Text>
        <div
          ref={grid}
          style={{
            marginTop: '20px',
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
      <Controls engine={engine} />
    </div>
  );
}

BaseVisualizer.displayName = 'Visualization';

export default BaseVisualizer;
