import React from 'react';

import DepthSlider, { IDepthSliderProps } from 'components/DepthSlider';
import { Button, Icon, Text } from 'components/kit';

import BoxFullViewPopover from '../BoxFullViewPopover';

import { IBoxWrapperProps } from '.';

import './BoxWrapper.scss';

function BoxWrapper(props: IBoxWrapperProps) {
  const {
    engine,
    items,
    component: BoxContent,
    groupKey,
    depthSelector,
    onDepthMapChange,
  } = props;

  const [fullView, setFullView] = React.useState<boolean>(false);
  const sequenceName = engine.useStore((state: any) => state.sequenceName);
  const boxConfig = engine.useStore(engine.boxConfig.stateSelector);
  const foundGroups = engine.useStore(engine.foundGroupsSelector);
  const depth = engine.useStore(depthSelector(groupKey));

  const currentItem = React.useMemo(() => items[depth], [items, depth]);
  const groupInfo = React.useMemo(() => {
    const groupTypes = Object.keys(currentItem?.groups || {});
    const info: Record<string, object> = {};
    if (!foundGroups || !currentItem) {
      return info;
    }

    groupTypes.forEach((groupType) => {
      const current = foundGroups[currentItem.groups[groupType]];
      if (current) {
        info[groupType] = {
          key: current.key,
          config: current.fields,
          items_count_in_group: current.items.length,
          order: current.order,
        };
      }
    });

    return info;
  }, [foundGroups, currentItem]);

  const renderDepthSlider = (props: Partial<IDepthSliderProps> = {}) => {
    return items.length > 1 ? (
      <DepthSlider
        items={items}
        depth={depth}
        onDepthChange={(value) => onDepthMapChange(value, groupKey)}
        valueLabelDisplay='on'
        {...props}
      />
    ) : null;
  };

  return currentItem ? (
    <div
      className='BoxWrapper'
      style={{
        ...boxConfig,
        ...currentItem.style,
      }}
    >
      <Button
        onClick={() => setFullView(true)}
        size='xSmall'
        withOnlyIcon
        className='BoxWrapper__fullScreen'
      >
        <Icon name='full-screen' />
      </Button>
      <div className='BoxWrapper__box'>
        {BoxContent && (
          <BoxContent
            data={currentItem}
            engine={engine}
            style={currentItem.style}
          />
        )}
      </div>
      {renderDepthSlider({ className: 'BoxWrapper__depthSlider' })}
      {fullView && (
        <BoxFullViewPopover
          onClose={() => setFullView(false)}
          groupInfo={groupInfo}
          sequenceName={sequenceName}
          item={items[depth]}
        >
          <div className='BoxWrapper__fullViewContent'>
            <div className='BoxWrapper__fullViewContent__box'>
              {BoxContent && <BoxContent data={currentItem} engine={engine} />}
            </div>
          </div>
          {renderDepthSlider({
            className: 'BoxWrapper__fullViewContent__depthSlider',
            label: <Text className='depthSliderLabel'>Depth</Text>,
          })}
        </BoxFullViewPopover>
      )}
    </div>
  ) : null;
}

BoxWrapper.displayName = 'BoxWrapper';

export default React.memo<IBoxWrapperProps>(BoxWrapper);
