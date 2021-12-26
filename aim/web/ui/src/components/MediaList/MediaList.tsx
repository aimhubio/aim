import React from 'react';
import { areEqual, VariableSizeList as List } from 'react-window';
import _ from 'lodash-es';

import { SlideshowRounded } from '@material-ui/icons';

import { MediaTypeEnum } from 'components/MediaPanel/config';
import AudioBox from 'components/kit/AudioBox';

import { MediaItemAlignmentEnum } from 'config/enums/imageEnums';
import {
  AUDIO_FIXED_WIDTH,
  IMAGE_FIXED_HEIGHT,
} from 'config/mediaConfigs/mediaConfigs';

import { Slider } from '../kit';
import { IImageData } from '../../types/services/models/imagesExplore/imagesExploreAppModel';

import ImageBox from './ImageBox';
import { IMediaListProps } from './MediaList.d';

const mediaBoxType: any = {
  [MediaTypeEnum.IMAGE]: ImageBox,
  [MediaTypeEnum.AUDIO]: AudioBox,
};

function MediaList({
  data,
  wrapperOffsetWidth,
  addUriToList,
  mediaItemHeight,
  focusedState,
  syncHoverState,
  additionalProperties,
  tooltip,
  mediaType,
}: IMediaListProps): React.FunctionComponentElement<React.ReactNode> {
  const [depth, setDepth] = React.useState<number[][] | null>(initDepth);

  function initDepth() {
    if (additionalProperties.zIndex) {
      return (data as IImageData[][]).map((listArr) => [0, listArr.length]);
    }
    return null;
  }

  let content: IImageData[] =
    depth && additionalProperties.zIndex
      ? fillContent()
      : (data as IImageData[]);

  function fillContent() {
    const tmpContent: [] = [];
    if (depth) {
      for (let i = 0; i < data.length; i++) {
        tmpContent[i] = (data[i] as [])[depth[i][0]];
      }
    }
    return tmpContent;
  }

  const itemSize = React.useCallback(
    (index: number) => {
      if (
        additionalProperties?.alignmentType === MediaItemAlignmentEnum.Width
      ) {
        return (wrapperOffsetWidth * additionalProperties?.mediaItemSize) / 100;
      } else if (
        additionalProperties?.alignmentType === MediaItemAlignmentEnum.Height
      ) {
        return (mediaItemHeight / content[index].height) * content[index].width;
      } else {
        return mediaType === MediaTypeEnum.AUDIO
          ? AUDIO_FIXED_WIDTH
          : IMAGE_FIXED_HEIGHT;
        // TODO: Need to be refactored in Image size alignment by width and original size
      }
    },
    [additionalProperties, mediaType],
  );

  function onDepthValueChange(
    event: React.ChangeEvent<{}>,
    newValue: number | number[],
  ): void & React.FormEventHandler<HTMLSpanElement> {
    console.log('onDepthValueChange', event, newValue);
    // setDepth(newValue as number);
  }

  React.useEffect(() => {
    debugger;
    let currentDepth = initDepth();
    if (_.isEqual(currentDepth, depth)) {
      setDepth(currentDepth);
    }
  }, [data, additionalProperties.zIndex]);

  console.log(data, depth);
  return (
    <List
      height={mediaItemHeight}
      itemCount={data.length}
      itemSize={itemSize}
      layout='horizontal'
      width={wrapperOffsetWidth}
      style={{ overflowY: 'hidden' }}
      itemData={{
        data: content,
        addUriToList,
        mediaItemHeight,
        focusedState,
        syncHoverState,
        additionalProperties,
        tooltip,
        mediaType,
        depth,
        onDepthValueChange,
      }}
    >
      {MediaBoxMemoized}
    </List>
  );
}

export default MediaList;

const MediaBoxMemoized = React.memo(function MediaBoxMemoized(props: any) {
  const { index, style, data } = props;
  const Component = mediaBoxType[data.mediaType];

  return (
    <div>
      {data.additionalProperties.zIndex ? (
        <Slider
          valueLabelDisplay='auto'
          getAriaValueText={(val) => `${val}`}
          value={data.depth[index][0]}
          onChange={(e, value) => {
            debugger;
            console.log(e, e.target, value);
            data.onDepthValueChange(e, value);
          }}
          step={1}
          max={data.depth[index][1]}
          min={0}
        />
      ) : null}
      <Component
        index={index}
        style={style}
        data={data.data[index]}
        addUriToList={data.addUriToList}
        mediaItemHeight={data.mediaItemHeight}
        focusedState={data.focusedState}
        syncHoverState={data.syncHoverState}
        additionalProperties={data.additionalProperties}
        tooltip={data.tooltip}
      />
    </div>
  );
}, areEqual);
