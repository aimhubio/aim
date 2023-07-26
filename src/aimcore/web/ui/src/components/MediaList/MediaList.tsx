import React from 'react';
import { areEqual, VariableSizeList as List } from 'react-window';

import AudioBox from 'components/AudioBox';
import ImageBox from 'components/ImageBox';
import ErrorBoundary from 'components/ErrorBoundary';

import {
  MediaTypeEnum,
  MEDIA_ITEMS_SIZES,
  MEDIA_LIST_HEIGHT,
} from 'config/mediaConfigs/mediaConfigs';

import getBiggestImageFromList from 'utils/getBiggestImageFromList';

import { IMediaListProps } from './MediaList.d';

const MediaBoxComponent: any = {
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
  selectOptions,
  onRunsTagsChange,
}: IMediaListProps): React.FunctionComponentElement<React.ReactNode> {
  const itemSize = React.useCallback(
    (index: number) => {
      if (mediaType === MediaTypeEnum.AUDIO) {
        return MEDIA_ITEMS_SIZES[MediaTypeEnum.AUDIO]().width;
      } else {
        return MEDIA_ITEMS_SIZES[MediaTypeEnum.IMAGE]({
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
      return MEDIA_LIST_HEIGHT[MediaTypeEnum.IMAGE]({
        alignmentType,
        maxHeight,
        maxWidth,
        wrapperOffsetWidth,
        mediaItemSize,
        mediaItemHeight,
      });
    } else {
      return MEDIA_LIST_HEIGHT[MediaTypeEnum.AUDIO](mediaItemHeight);
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
          selectOptions,
          onRunsTagsChange,
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
  const Component = MediaBoxComponent[data.mediaType];

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
        selectOptions={data.selectOptions}
        onRunsTagsChange={data.onRunsTagsChange}
      />
    </ErrorBoundary>
  );
}, areEqual);
