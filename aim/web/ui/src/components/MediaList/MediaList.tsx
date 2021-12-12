import React from 'react';
import { areEqual, VariableSizeList as List } from 'react-window';

import { MediaTypeEnum } from 'components/MediaPanel/config';

import { MediaItemAlignmentEnum } from 'config/enums/imageEnums';

import ImageBox from './ImageBox';
import { IMediaListProps } from './MediaList.d';

const mediaBoxType: any = {
  [MediaTypeEnum.IMAGE]: ImageBox,
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
  return (
    <List
      height={mediaItemHeight}
      itemCount={data.length}
      itemSize={(index: number) => {
        return additionalProperties?.alignmentType ===
          MediaItemAlignmentEnum.Width
          ? (wrapperOffsetWidth * additionalProperties?.mediaItemSize) / 100
          : (mediaItemHeight / data[index].height) * data[index].width;
      }}
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
