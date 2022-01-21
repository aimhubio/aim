import React from 'react';
import { areEqual, VariableSizeList as List } from 'react-window';

import { MediaTypeEnum } from 'components/MediaPanel/config';
import AudioBox from 'components/kit/AudioBox';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import {
  MEDIA_ITEMS_SIZES,
  MEDIA_LIST_HEIGHT,
} from 'config/mediaConfigs/mediaConfigs';

import getBiggestImageFromList from 'utils/getBiggestImageFromList';

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
  additionalProperties,
  tooltip,
  mediaType,
  wrapperOffsetHeight,
}: IMediaListProps): React.FunctionComponentElement<React.ReactNode> {
  const itemSize = React.useCallback(
    (index: number) => {
      if (mediaType === MediaTypeEnum.AUDIO) {
        return MEDIA_ITEMS_SIZES[mediaType]().width;
      } else {
        return MEDIA_ITEMS_SIZES[mediaType]({
          data,
          index,
          additionalProperties,
          wrapperOffsetWidth,
          wrapperOffsetHeight,
        }).width;
      }
    },
    [
      additionalProperties,
      data,
      mediaType,
      wrapperOffsetHeight,
      wrapperOffsetWidth,
    ],
  );

  const listHeight = React.useMemo(() => {
    const { maxWidth, maxHeight } = getBiggestImageFromList(data);
    const { alignmentType, mediaItemSize } = additionalProperties;
    if (mediaType === MediaTypeEnum.IMAGE) {
      return MEDIA_LIST_HEIGHT[mediaType]({
        alignmentType,
        maxHeight,
        maxWidth,
        wrapperOffsetWidth,
        mediaItemSize,
        mediaItemHeight,
      });
    } else {
      return MEDIA_LIST_HEIGHT[mediaType](mediaItemHeight);
    }
  }, [
    additionalProperties,
    data,
    mediaItemHeight,
    mediaType,
    wrapperOffsetWidth,
  ]);

  return (
    <ErrorBoundary>
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
          mediaItemHeight: listHeight,
          focusedState,
          additionalProperties,
          tooltip,
          mediaType,
        }}
      >
        {MediaBoxMemoized}
      </List>
    </ErrorBoundary>
  );
}

export default MediaList;

const MediaBoxMemoized = React.memo(function MediaBoxMemoized(props: any) {
  const { index, style, data } = props;
  const Component = mediaBoxType[data.mediaType];

  return (
    <ErrorBoundary>
      <Component
        key={index}
        index={index}
        style={style}
        data={data.data[index]}
        addUriToList={data.addUriToList}
        mediaItemHeight={data.mediaItemHeight}
        focusedState={data.focusedState}
        additionalProperties={data.additionalProperties}
        tooltip={data.tooltip}
      />
    </ErrorBoundary>
  );
}, areEqual);
