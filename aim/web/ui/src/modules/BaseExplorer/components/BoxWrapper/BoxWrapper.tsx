import React from 'react';
import _ from 'lodash-es';

import DepthSlider, { IDepthSliderProps } from 'components/DepthSlider';
import { Button, Icon, Text } from 'components/kit';

import { AimFlatObjectBase } from 'types/core/AimObjects';
import { SequenceTypesEnum } from 'types/core/enums';

import BoxFullViewPopover from '../BoxFullViewPopover';
import CaptionBox from '../CaptionBox';
import { ICaptionProperties } from '../Controls/CaptionProperties';

import { IBoxWrapperProps } from '.';

import './BoxWrapper.scss';

function BoxWrapper(props: IBoxWrapperProps<AimFlatObjectBase<any>>) {
  const {
    engine,
    engine: { useStore },
    component: BoxContent,
    hasDepthSlider,
    depthSelector,
    onDepthMapChange,
    boxId,
    boxItems,
    boxIndex,
    visualizationName,
  } = props;
  const vizEngine = engine.visualizations[visualizationName];

  const [fullView, setFullView] = React.useState<boolean>(false);
  const sequenceName: SequenceTypesEnum = engine.pipeline.getSequenceName();
  const boxConfig = useStore(vizEngine.box.stateSelector);
  const captionProperties: ICaptionProperties | null = useStore(
    (state: any) =>
      state.visualizations[visualizationName].controls.captionProperties ||
      null,
  );

  const foundGroups = engine.useStore(engine.pipeline.foundGroupsSelector);
  const depth = engine.useStore(depthSelector(boxId));
  const captionBoxRef: React.RefObject<HTMLDivElement | null> =
    React.useRef<HTMLDivElement>(null);
  const [captionBoxHeight, setCaptionBoxHeight] = React.useState<number>(0);

  const currentItem = React.useMemo(() => boxItems[depth], [boxItems, depth]);
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

  const boxData = React.useMemo(() => {
    if (hasDepthSlider) {
      return currentItem;
    } else {
      return boxItems;
    }
  }, [hasDepthSlider, boxItems, currentItem]);

  const renderDepthSlider = (props: Partial<IDepthSliderProps> = {}) => {
    return hasDepthSlider && boxItems.length > 1 ? (
      <DepthSlider
        items={boxItems}
        depth={depth}
        onDepthChange={(value) => onDepthMapChange(value, boxId)}
        valueLabelDisplay='on'
        {...props}
      />
    ) : null;
  };

  React.useEffect(() => {
    setCaptionBoxHeight(captionBoxRef.current?.offsetHeight ?? 0);
  }, [
    captionBoxRef.current?.offsetHeight,
    captionProperties?.selectedFields,
    captionProperties?.displayBoxCaption,
    boxConfig.height,
  ]);

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
            key={currentItem.key}
            index={boxIndex}
            data={boxData}
            engine={engine}
            style={currentItem.style}
            visualizationName={visualizationName}
          />
        )}
      </div>
      {renderDepthSlider({
        className: 'BoxWrapper__depthSlider',
        style: { bottom: captionBoxHeight + 1 },
      })}
      {captionProperties?.displayBoxCaption &&
        !_.isEmpty(captionProperties.selectedFields) && (
          <CaptionBox
            captionBoxRef={captionBoxRef}
            engine={engine}
            item={currentItem}
            visualizationName={props.visualizationName}
          />
        )}
      {fullView && (
        <BoxFullViewPopover
          onClose={() => setFullView(false)}
          groupInfo={groupInfo}
          sequenceName={sequenceName}
          item={boxData}
        >
          <div className='BoxWrapper__fullViewContent'>
            <div className='BoxWrapper__fullViewContent__box'>
              {BoxContent && (
                <BoxContent
                  key={'fullView-' + currentItem.key}
                  data={boxData}
                  engine={engine}
                  visualizationName={visualizationName}
                  isFullView
                />
              )}
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

export default React.memo<IBoxWrapperProps<AimFlatObjectBase<any>>>(BoxWrapper);
