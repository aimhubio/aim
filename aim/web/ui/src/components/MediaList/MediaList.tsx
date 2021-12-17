import React from 'react';
import { areEqual, VariableSizeList as List } from 'react-window';

import { MediaTypeEnum } from 'components/MediaPanel/config';
import AudioBox from 'components/kit/AudioBox';

import { MediaItemAlignmentEnum } from 'config/enums/imageEnums';
import {
  AUDIO_FIXED_WIDTH,
  IMAGE_FIXED_HEIGHT,
} from 'config/mediaConfigs/mediaConfigs';

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
  const itemSize = React.useCallback(
    (index: number) => {
      if (
        additionalProperties?.alignmentType === MediaItemAlignmentEnum.Width
      ) {
        return (wrapperOffsetWidth * additionalProperties?.mediaItemSize) / 100;
      } else if (
        additionalProperties?.alignmentType === MediaItemAlignmentEnum.Height
      ) {
        return (mediaItemHeight / data[index].height) * data[index].width;
      } else {
        return mediaType === MediaTypeEnum.AUDIO
          ? AUDIO_FIXED_WIDTH
          : IMAGE_FIXED_HEIGHT;
        // TODO: Need to be refactored in Image size alignment by width and original size
      }
    },
    [additionalProperties, mediaType],
  );

  return (
    <List
      height={mediaItemHeight}
      itemCount={data.length}
      itemSize={itemSize}
      layout='horizontal'
      width={wrapperOffsetWidth}
      style={{ overflowY: 'hidden' }}
      itemData={{
        data,
        addUriToList,
        mediaItemHeight,
        focusedState,
        syncHoverState,
        additionalProperties,
        tooltip,
        mediaType,
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
  );
}, areEqual);
