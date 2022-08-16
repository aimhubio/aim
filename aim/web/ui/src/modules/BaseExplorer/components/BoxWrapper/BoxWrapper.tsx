import React from 'react';
import _ from 'lodash-es';

import DepthSlider, { IDepthSliderProps } from 'components/DepthSlider';
import { Button, Icon, Text } from 'components/kit';

import { SequenceTypesEnum } from 'types/core/enums';

import BoxFullViewPopover from '../BoxFullViewPopover';
import CaptionBox from '../CaptionBox';
import { ICaptionProperties } from '../Controls/CaptionProperties';

import { IBoxWrapperProps } from '.';

import './BoxWrapper.scss';

function BoxWrapper(props: IBoxWrapperProps) {
  const {
    engine,
    engine: {
      useStore,
      sequenceNameSelector,
      boxConfig: { stateSelector: boxConfigStateSelector },
      controls: {
        captionProperties: { stateSelector: captionPropertiesStateSelector },
      },
    },
    items,
    component: BoxContent,
    groupKey,
    depthSelector,
    onDepthMapChange,
  } = props;

  const [fullView, setFullView] = React.useState<boolean>(false);
  const sequenceName: SequenceTypesEnum = useStore(sequenceNameSelector);
  const boxConfig = useStore(boxConfigStateSelector);
  const captionProperties: ICaptionProperties = useStore(
    captionPropertiesStateSelector,
  );
  const foundGroups = engine.useStore(engine.foundGroupsSelector);
  const depth = engine.useStore(depthSelector(groupKey));
  const captionBoxRef: React.RefObject<HTMLDivElement | null> =
    React.useRef<HTMLDivElement>(null);
  const [captionBoxHeight, setCaptionBoxHeight] = React.useState<number>(0);

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

  const boxHeight = React.useMemo(() => {
    const tmpStyles = { ...boxConfig, ...currentItem.style };
    let height = 0;
    if (captionBoxHeight > (tmpStyles.height / 100) * 30) {
      height = tmpStyles.height - (tmpStyles.height / 100) * 30;
    } else {
      height = tmpStyles.height - captionBoxHeight;
    }
    return height;
  }, [boxConfig, currentItem.style, captionBoxHeight]);

  React.useEffect(() => {
    setCaptionBoxHeight(captionBoxRef.current?.offsetHeight ?? 0);
  }, [
    captionBoxRef.current?.offsetHeight,
    captionProperties.selectedFields,
    captionProperties.displayBoxCaption,
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
      <div className='BoxWrapper__box' style={{ height: boxHeight }}>
        {BoxContent && <BoxContent data={currentItem} engine={engine} />}
      </div>
      {renderDepthSlider({
        className: 'BoxWrapper__depthSlider',
        style: { bottom: captionBoxHeight },
      })}
      {captionProperties.displayBoxCaption &&
        !_.isEmpty(captionProperties.selectedFields) && (
          <CaptionBox
            captionBoxRef={captionBoxRef}
            engine={engine}
            item={currentItem}
          />
        )}
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
