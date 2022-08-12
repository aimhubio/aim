import * as React from 'react';
import _ from 'lodash-es';

import { Tooltip } from '@material-ui/core';
import { IQueryableData } from 'modules/BaseExplorerCore/pipeline/adapter/processor';
import { GroupType } from 'modules/BaseExplorerCore/pipeline/grouping/types';

import { Text } from 'components/kit';

import contextToString from 'utils/contextToString';

import { IVisualizationProps } from '../../types';
import Box from '../Box';
import BoxVirtualizer from '../BoxVirtualizer';
import RangePanel from '../RangePanel';

import './Visualizer.scss';

function Visualizer(props: IVisualizationProps) {
  const {
    engine,
    engine: {
      useStore,
      boxConfig: { stateSelector: boxConfigSelector },
      foundGroupsSelector,
      dataSelector,
      queryableDataSelector,
    },
    box: BoxContent,
    controlComponent: ControlComponent,
  } = props;
  const boxConfig = useStore(boxConfigSelector);
  const foundGroups = useStore(foundGroupsSelector);
  const rangesData: IQueryableData = props.engine.useStore(
    queryableDataSelector,
  );
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
              top:
                item.order * (boxConfig.height + boxConfig.gap) +
                5 -
                boxConfig.gap / 2,
              left: -1,
              height: boxConfig.height + boxConfig.gap,
              width: 200,
              padding: `${boxConfig.gap / 2}px 0.5rem`,
              backgroundColor: '#fff',
              borderBottom: '0.0625rem solid #dceafb',
              overflow: 'hidden',
              textAlign: 'right',
              textOverflow: 'ellipsis',
              lineHeight: '0.875rem',
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
              top: -1,
              left:
                item.order * (boxConfig.width + boxConfig.gap) +
                30 +
                (rowsAxisData && rowsAxisData.length > 0 ? 200 : 0) -
                boxConfig.gap / 2,
              height: 30,
              width: boxConfig.width + boxConfig.gap,
              padding: '0.25rem 0.5rem',
              backgroundColor: '#fff',
              borderRight: '0.0625rem solid #dceafb',
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
    <div className='Visualizer'>
      <div className='VisualizerContainer'>
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
              <Tooltip title={item.value} key={item.key}>
                <div style={item.style}>
                  <Text>{item.value}</Text>
                </div>
              </Tooltip>
            ),
            rows: (item: any, i: number) => (
              <Tooltip title={item.value} key={item.key}>
                <div style={item.style}>
                  <Text>{item.value}</Text>
                </div>
              </Tooltip>
            ),
          }}
        />
        {ControlComponent && <ControlComponent engine={engine} />}
      </div>
      {!_.isEmpty(rangesData) && (
        <RangePanel engine={engine} rangesData={rangesData} />
      )}
    </div>
  );
}

Visualizer.displayName = 'Visualization';

export default Visualizer;
