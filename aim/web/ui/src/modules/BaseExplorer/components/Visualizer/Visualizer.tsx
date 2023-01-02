import * as React from 'react';
import _ from 'lodash-es';
import { useDepthMap } from 'hooks';

import { Tooltip } from '@material-ui/core';

import { Text } from 'components/kit';

import { GroupType } from 'modules/core/pipeline';
import { IQueryableData } from 'modules/core/pipeline';

import { AimFlatObjectBase } from 'types/core/AimObjects';

import contextToString from 'utils/contextToString';

import { IVisualizationProps } from '../../types';
import BoxVirtualizer from '../BoxVirtualizer';
import BoxWrapper from '../BoxWrapper';
import RangePanel from '../RangePanel';

import './Visualizer.scss';

function Visualizer(props: IVisualizationProps) {
  const {
    engine,
    engine: { useStore, pipeline },
    name,
    box: BoxContent,
    hasDepthSlider,
    panelRenderer,
  } = props;

  const foundGroups = useStore(pipeline.foundGroupsSelector);
  const dataState = useStore(pipeline.dataSelector);
  const rangesData: IQueryableData = useStore(pipeline.queryableDataSelector);

  const vizEngine = engine.visualizations[name];
  const boxConfig = useStore(vizEngine.box.stateSelector);

  const data = React.useMemo(() => {
    return dataState?.map((d: any, i: number) => {
      const groupTypes = Object.keys(d.groups || {});
      const info: Record<string, object> = {};
      if (foundGroups) {
        groupTypes.forEach((groupType) => {
          const current = foundGroups[d.groups[groupType]];
          if (current) {
            info[groupType] = {
              key: current.key,
              config: current.fields,
              items_count_in_group: current.items.length,
              order: current.order,
            };
          }
        });
      }

      // calculate styles by position
      // get style applier of box  from engine
      // listen to found groups
      function applyStyles(obj: any, group: any, iteration: number) {
        let style = {};
        engine.groupings.styleAppliers.forEach((applier: any) => {
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
  }, [dataState, foundGroups, boxConfig, engine.groupings.styleAppliers]);

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
                boxConfig.gap -
                boxConfig.gap / 2,
              left: -1,
              height: boxConfig.height + boxConfig.gap,
              width: 200,
              padding: `${boxConfig.gap / 2 / 16 + 0.5}rem 0.5rem`,
              backgroundColor: '#fff',
              boxShadow: 'inset 0 -1px 0 0 #b5b9c5',
              overflow: 'hidden',
              textAlign: 'right',
              textOverflow: 'ellipsis',
              lineHeight: '0.875rem',
              zIndex: foundGroups[key].order,
            },
          };
        });
    }
  }, [foundGroups, boxConfig]);

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
                (rowsAxisData && rowsAxisData.length > 0 ? 200 : 0) +
                boxConfig.gap -
                boxConfig.gap / 2,
              height: 30,
              width: boxConfig.width + boxConfig.gap,
              padding: '0.25rem 0.5rem',
              backgroundColor: '#fff',
              boxShadow: '-1px 0 0 0 #b5b9c5',
              textAlign: 'center',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              zIndex: foundGroups[key].order,
            },
          };
        });
    }
  }, [foundGroups, boxConfig, rowsAxisData]);

  const [depthSelector, onDepthMapChange] = useDepthMap<AimFlatObjectBase<any>>(
    {
      data,
      groupItemCb: (item) => {
        const rowId = item.groups?.rows ? item.groups.rows[0] : '';
        const columnId = item.groups?.columns ? item.groups.columns[0] : '';
        return `${rowId}--${columnId}`;
      },
      state: engine.depthMap,
      sync: true,
      deps: [dataState, foundGroups],
    },
  );

  return (
    <div className='Visualizer'>
      {panelRenderer()}
      <div className='VisualizerContainer'>
        {!_.isEmpty(dataState) && (
          <BoxVirtualizer
            data={data}
            itemsRenderer={([groupId, items]) => {
              return (
                <BoxWrapper
                  visualizationName={name}
                  key={groupId}
                  groupId={groupId}
                  engine={engine}
                  component={BoxContent}
                  hasDepthSlider={hasDepthSlider}
                  items={items}
                  depthSelector={depthSelector}
                  onDepthMapChange={onDepthMapChange}
                />
              );
            }}
            offset={boxConfig.gap}
            axisData={{
              columns: columnsAxisData,
              rows: rowsAxisData,
            }}
            axisItemRenderer={{
              columns: (item: any) => (
                <Tooltip key={item.key} title={item.value}>
                  <div style={item.style}>
                    <Text>{item.value}</Text>
                  </div>
                </Tooltip>
              ),
              rows: (item: any) => (
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
        )}
      </div>
      {!_.isEmpty(rangesData) && (
        <RangePanel engine={engine} rangesData={rangesData} />
      )}
    </div>
  );
}

Visualizer.displayName = 'Visualization';

export default Visualizer;
