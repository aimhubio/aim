import React from 'react';
import { areEqual, VariableSizeList as List } from 'react-window';

import { MediaTypeEnum } from 'components/MediaPanel/config';
import AudioBox from 'components/kit/AudioBox';

import {
  ITEM_CAPTION_HEIGHT,
  MEDIA_ITEMS_SIZES,
} from 'config/mediaConfigs/mediaConfigs';
import { MediaItemAlignmentEnum } from 'config/enums/imageEnums';

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
  wrapperOffsetHeight,
}: IMediaListProps): React.FunctionComponentElement<React.ReactNode> {
  const itemSize = React.useCallback(
    (index: number) => {
      if (mediaType === MediaTypeEnum.AUDIO) {
        return MEDIA_ITEMS_SIZES[mediaType]();
      } else {
        return MEDIA_ITEMS_SIZES[mediaType]({
          data,
          index,
          additionalProperties,
          wrapperOffsetWidth,
          mediaItemHeight,
          wrapperOffsetHeight,
        });
      }
    },
    [
      additionalProperties,
      data,
      mediaItemHeight,
      mediaType,
      wrapperOffsetWidth,
      wrapperOffsetHeight,
    ],
  );

  const listHeight = React.useMemo(() => {
    if (mediaType === MediaTypeEnum.IMAGE) {
      let maxHeight = 0;
      let maxWidth = 0;
      data.forEach((item) => {
        if (maxHeight < item.height) {
          maxHeight = item.height;
          maxWidth = item.width;
        }
      });
      if (
        additionalProperties.alignmentType === MediaItemAlignmentEnum.Original
      ) {
        if (maxHeight > wrapperOffsetHeight) {
          maxHeight = wrapperOffsetHeight;
        }
        return maxHeight + ITEM_CAPTION_HEIGHT;
      }
      if (additionalProperties.alignmentType === MediaItemAlignmentEnum.Width) {
        let width =
          (wrapperOffsetWidth * additionalProperties?.mediaItemSize) / 100;
        return (maxHeight / maxWidth) * width + ITEM_CAPTION_HEIGHT;
      }

      return mediaItemHeight + ITEM_CAPTION_HEIGHT;
    } else {
      return mediaItemHeight + ITEM_CAPTION_HEIGHT;
    }
  }, [
    additionalProperties.alignmentType,
    additionalProperties?.mediaItemSize,
    data,
    mediaItemHeight,
    mediaType,
    wrapperOffsetHeight,
    wrapperOffsetWidth,
  ]);

  return (
    <List
      height={listHeight}
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
