import * as React from 'react';
import * as _ from 'lodash-es';

import DepthSlider, { IDepthSliderProps } from 'components/DepthSlider';
import { Button, Icon, Text } from 'components/kit';

import { SequenceTypesEnum } from 'types/core/enums';
import { AimFlatObjectBase } from 'types/core/AimObjects';

import CaptionBox from '../CaptionBox';
import BoxFullViewPopover from '../BoxFullViewPopover';
import { ICaptionProperties } from '../Controls/CaptionProperties';
import { IGroupInfo } from '../../types';

import { IBoxWithStackingProps } from './';

function BoxWithStacking(props: IBoxWithStackingProps<AimFlatObjectBase>) {
  const {
    engine,
    boxId,
    boxIndex,
    boxItems,
    visualizationName,
    component: BoxContent,
    depthSelector,
    onDepthMapChange,
  } = props;

  const vizEngine = engine.visualizations[visualizationName];
  const boxConfig = engine.useStore(vizEngine.box.stateSelector);
  const sequenceName: SequenceTypesEnum = engine.pipeline.getSequenceName();

  const foundGroups = engine.useStore(engine.pipeline.foundGroupsSelector);
  const [fullView, setFullView] = React.useState<boolean>(false);
  const { sync: syncDepthMap, depth } = engine.useStore(depthSelector(boxId));

  const currentItem = React.useMemo(() => boxItems[depth], [boxItems, depth]);
  const itemGroupInfo = React.useMemo(() => {
    const currentItemGroups = currentItem?.groups || {};
    const groupTypes = Object.keys(currentItemGroups);
    const info: Record<string, IGroupInfo> = {};
    if (!foundGroups || !currentItem) {
      return info;
    }

    groupTypes.forEach((groupType) => {
      const groupKey = currentItemGroups[groupType];
      const group = foundGroups[groupKey[0]];
      if (group) {
        info[groupType] = {
          key: group.key,
          config: group.fields,
          items_count_in_group: group.items.length,
          order: group.order,
        };
      }
    });

    return info;
  }, [foundGroups, currentItem]);
  const captionProperties: ICaptionProperties = engine.useStore(
    vizEngine.controls.captionProperties.stateSelector,
  );
  const captionBoxRef = React.useRef<HTMLDivElement>(null);
  const [captionBoxHeight, setCaptionBoxHeight] = React.useState(0);

  React.useEffect(() => {
    setCaptionBoxHeight(captionBoxRef.current?.offsetHeight ?? 0);
  }, [
    captionBoxRef.current?.offsetHeight,
    captionProperties?.selectedFields,
    captionProperties?.displayBoxCaption,
    boxConfig.height,
  ]);

  const renderDepthSlider = (props: Partial<IDepthSliderProps> = {}) => {
    return boxItems.length > 1 ? (
      <DepthSlider
        items={boxItems}
        depth={depth}
        onDepthChange={(value) => onDepthMapChange(value, boxId, syncDepthMap)}
        valueLabelDisplay='on'
        {...props}
      />
    ) : null;
  };

  return currentItem ? (
    <div className='BoxWrapper' style={{ ...boxConfig, ...currentItem.style }}>
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
            key={boxId + '-' + currentItem.key}
            index={boxIndex}
            id={boxId}
            data={currentItem}
            engine={engine}
            style={currentItem.style}
            itemGroupInfo={itemGroupInfo}
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
          itemGroupInfo={itemGroupInfo}
          sequenceName={sequenceName}
          item={currentItem}
        >
          <div className='BoxWrapper__fullViewContent'>
            <div className='BoxWrapper__fullViewContent__box'>
              {BoxContent && (
                <BoxContent
                  key={'fullView-' + currentItem.key}
                  data={currentItem}
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

export default React.memo<IBoxWithStackingProps<AimFlatObjectBase>>(
  BoxWithStacking,
);
