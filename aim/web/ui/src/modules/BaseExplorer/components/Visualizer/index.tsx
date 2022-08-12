import * as React from 'react';

import { Tooltip } from '@material-ui/core';
import { GroupType } from 'modules/BaseExplorerCore/pipeline/grouping/types';

import { Text } from 'components/kit';

import contextToString from 'utils/contextToString';

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

  // FOR ROWS
  const rowsAxisData = React.useMemo(() => {
    if (foundGroups) {
      return Object.keys(foundGroups)
        .filter((key: string) => foundGroups[key].type === GroupType.ROW)
        .map((key: string) => {
          const item = foundGroups[key];
          return {
            key: key,
            value: contextToString(item.fields),
            style: {
              position: 'absolute',
              top: item.order * (boxConfig.height + boxConfig.gap),
              right: 10,
              height: boxConfig.height,
              width: 180,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#fff',
              contentVisibility: 'auto',
              overflow: 'hidden',
              wordBreak: 'break-all',
              textOverflow: 'ellipsis',
              zIndex: 1,
            },
          };
        });
    }
  }, [foundGroups, boxConfig, engine]);

  // FOR COLUMNS
  const columnsAxisData = React.useMemo(() => {
    if (foundGroups) {
      return Object.keys(foundGroups)
        .filter((key: string) => foundGroups[key].type === GroupType.COLUMN)
        .map((key: string) => {
          const item = foundGroups[key];
          return {
            key: key,
            value: contextToString(item.fields),
            style: {
              position: 'absolute',
              top: 5,
              left:
                item.order * (boxConfig.width + boxConfig.gap) +
                30 +
                (rowsAxisData && rowsAxisData.length > 0 ? 200 : 0),
              height: 20,
              width: boxConfig.width,
              backgroundColor: '#fff',
              contentVisibility: 'auto',
              textAlign: 'center',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              zIndex: 1,
            },
          };
        });
    }
  }, [foundGroups, boxConfig, engine, rowsAxisData]);

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
        axisData={{
          columns: columnsAxisData,
          rows: rowsAxisData,
        }}
        axisItemRenderer={{
          columns: (item: any, i: number) => (
            <div key={item.key} style={item.style}>
              <Tooltip title={item.value}>
                <span>
                  <Text>{item.value}</Text>
                </span>
              </Tooltip>
            </div>
          ),
          rows: (item: any, i: number) => (
            <div key={item.key} style={item.style}>
              <Tooltip title={item.value}>
                <span>
                  <Text>{item.value}</Text>
                </span>
              </Tooltip>
            </div>
          ),
        }}
      />
      {ControlComponent && <ControlComponent engine={engine} />}
    </div>
  );
}

BaseVisualizer.displayName = 'Visualization';

export default BaseVisualizer;
