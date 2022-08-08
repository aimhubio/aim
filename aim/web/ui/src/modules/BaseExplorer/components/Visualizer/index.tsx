import * as React from 'react';
import { ReactChildren } from 'react';

import { IVisualizationProps } from '../../types';
import Box from '../Box';
import BoxVirtualizer from '../BoxVirtualizer';

function BaseVisualizer(props: IVisualizationProps) {
  const {
    engine,
    engine: {
      useStore,
      boxConfig: { stateSelector: boxConfigSelector },
      foundGroupsSelector,
      dataSelector,
    },
    box: BoxContent,
    controlComponent: ControlComponent,
  } = props;
  const boxConfig = useStore(boxConfigSelector);
  const foundGroups = useStore(foundGroupsSelector);
  const dataState = useStore(dataSelector);

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
        engine.styleAppliers.forEach((applier: any) => {
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

  // FOR COLUMNS
  const ColumnAxisComponents = React.useMemo(() => {
    let components: any[] = [];
    if (foundGroups) {
      components = Object.keys(foundGroups).map((key: string) => {
        const value = foundGroups[key];
        if (value.fields['run.hash']) {
          return (
            <engine.groupings.columns.axisComponent
              key={key}
              group={value}
              boxConfig={boxConfig}
              order={value.order}
            />
          );
        }
      });
    }
    return components;
  }, [foundGroups, boxConfig, engine]);

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
      }}
    >
      <BoxVirtualizer
        data={data}
        itemRenderer={(item: any, i: number) => (
          <Box
            key={i} // replace with some unique key of box data
            engine={engine}
            style={item.style}
          >
            {BoxContent && <BoxContent engine={engine} data={item} />}
          </Box>
        )}
      >
        {ColumnAxisComponents as unknown as ReactChildren}
      </BoxVirtualizer>
      {ControlComponent && <ControlComponent engine={engine} />}
    </div>
  );
}

BaseVisualizer.displayName = 'Visualization';

export default BaseVisualizer;
