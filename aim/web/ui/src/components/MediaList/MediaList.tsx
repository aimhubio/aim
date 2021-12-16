import React from 'react';
import { areEqual, VariableSizeList as List } from 'react-window';

import { MediaTypeEnum } from 'components/MediaPanel/config';
import AudioBox from 'components/kit/AudioBox';

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
}: IMediaListProps): React.FunctionComponentElement<React.ReactNode> {
  console.log(data);
  return (
    <List
      height={mediaItemHeight}
      itemCount={data.length}
      // itemSize={(index: number) => {
      //   return additionalProperties?.alignmentType ===
      //     MediaItemAlignmentEnum.Width
      //     ? (wrapperOffsetWidth * additionalProperties?.mediaItemSize) / 100
      //     : MediaItemAlignmentEnum.Height
      //     ? (mediaItemHeight / data[index].height) * data[index].width
      //     : 268;
      // }}
      itemSize={(index: number) => 268}
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
