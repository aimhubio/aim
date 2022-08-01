import * as React from 'react';

import { IVisualizationProps } from '../../types';
import Box from '../Box';
import Controls from '../Controls';
import BoxVirtualizer from '../BoxVirtualizer';

function BaseVisualizer(props: IVisualizationProps) {
  const engine = props.engine;

  const boxConfig = props.engine.useStore(props.engine.boxConfig.stateSelector);
  const styleAppliers = props.engine.styleAppliers;

  const foundGroups = props.engine.useStore(props.engine.foundGroupsSelector);

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

      return {
        ...d,
        style: {
          width: boxConfig.width,
          height: boxConfig.height,
          ...applyStyles(d, info, i),
        },
      };
    });
  }, [dataState, foundGroups, boxConfig]);

  return (
    <div
      style={{
        padding: '0 0.625rem',
        width: '100%',
        height: 'calc(100vh - 160px)',
        display: 'flex',
      }}
    >
      <BoxVirtualizer
        data={data}
        itemRenderer={(item: any, i: number) => (
          <Box
            key={i} // replace with some unique key of box data
            engine={props.engine}
            style={item.style}
          >
            {/* @ts-ignore */}
            <props.box engine={props.engine} data={item} />
          </Box>
        )}
      />
      {props.controlComponent && <props.controlComponent engine={engine} />}
    </div>
  );
}

BaseVisualizer.displayName = 'Visualization';

export default BaseVisualizer;
