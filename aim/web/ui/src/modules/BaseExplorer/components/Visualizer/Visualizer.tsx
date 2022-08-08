import * as React from 'react';
import _ from 'lodash-es';

import { IQueryableData } from 'modules/BaseExplorerCore/pipeline/adapter/processor';

import { IVisualizationProps } from '../../types';
import Box from '../Box';
import BoxVirtualizer from '../BoxVirtualizer';
import RangePanel from '../RangePanel';

import './Visualizer.scss';

function BaseVisualizer(props: IVisualizationProps) {
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
        />
        {ControlComponent && <ControlComponent engine={engine} />}
      </div>
      {!_.isEmpty(rangesData) && (
        <RangePanel engine={engine} rangesData={rangesData} />
      )}
    </div>
  );
}

BaseVisualizer.displayName = 'Visualization';

export default BaseVisualizer;
