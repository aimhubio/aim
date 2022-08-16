import * as React from 'react';
import _ from 'lodash-es';
import { useDepthMap } from 'hooks';

import {
  AimFlatObjectBase,
  IQueryableData,
} from 'modules/BaseExplorerCore/pipeline/adapter/processor';

import { IVisualizationProps } from '../../types';
import BoxVirtualizer from '../BoxVirtualizer';
import BoxWrapper from '../BoxWrapper';
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
  const dataState = useStore(dataSelector);
  const rangesData: IQueryableData = useStore(queryableDataSelector);

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

  const [depthSelector, onDepthMapChange] = useDepthMap<AimFlatObjectBase<any>>(
    {
      data,
      groupItemCb: (item) => `${item.style.top}__${item.style.left}`,
      state: engine.depthMap,
      synced: true,
      deps: [dataState, foundGroups],
    },
  );

  return (
    <div className='Visualizer'>
      <div className='VisualizerContainer'>
        <BoxVirtualizer
          data={data}
          itemsRenderer={([groupKey, items]) => (
            <BoxWrapper
              key={groupKey}
              groupKey={groupKey}
              engine={engine}
              component={BoxContent}
              items={items}
              depthSelector={depthSelector}
              onDepthMapChange={onDepthMapChange}
            />
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

Visualizer.displayName = 'Visualization';

export default Visualizer;
