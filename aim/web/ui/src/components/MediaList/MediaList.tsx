import React from 'react';
import { areEqual, VariableSizeList as List } from 'react-window';
import _ from 'lodash-es';

import { SlideshowRounded } from '@material-ui/icons';

import { MediaTypeEnum } from 'components/MediaPanel/config';
import AudioBox from 'components/kit/AudioBox';

import {
  MEDIA_ITEMS_SIZES,
  MEDIA_LIST_HEIGHT,
} from 'config/mediaConfigs/mediaConfigs';

import getBiggestImageFromList from 'utils/getBiggestImageFromList';

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
  wrapperOffsetHeight,
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
    <List
      height={listHeight}
      itemCount={data.length}
      itemSize={itemSize}
      layout='horizontal'
      width={wrapperOffsetWidth}
      style={{ overflowY: 'hidden' }}
      itemData={{
        data: content,
        addUriToList,
        mediaItemHeight: listHeight,
        focusedState,
        syncHoverState,
        additionalProperties,
        tooltip,
        mediaType,
        depth,
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
            data.onDepthValueChange?.(e, value);
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
