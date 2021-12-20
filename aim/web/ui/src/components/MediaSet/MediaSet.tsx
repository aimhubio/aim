import React from 'react';
import _ from 'lodash-es';
import { VariableSizeList as List, areEqual } from 'react-window';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';

import MediaList from 'components/MediaList';
import { JsonViewPopover } from 'components/kit';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import { MediaTypeEnum } from 'components/MediaPanel/config';

import {
  AUDIO_FIXED_HEIGHT,
  IMAGE_FIXED_HEIGHT,
  ITEM_CAPTION_HEIGHT,
  ITEM_WRAPPER_HEIGHT,
  MEDIA_SET_TITLE_HEIGHT,
  MEDIA_SET_WRAPPER_PADDING_HEIGHT,
} from 'config/mediaConfigs/mediaConfigs';
import { MediaItemAlignmentEnum } from 'config/enums/imageEnums';

import { formatValue } from 'utils/formatValue';
import { jsonParse } from 'utils/jsonParse';

import { IMediaSetProps } from './MediaSet.d';

import './MediaSet.scss';

const MediaSet = ({
  data,
  onListScroll,
  addUriToList,
  index = 0,
  mediaSetKey,
  wrapperOffsetHeight,
  wrapperOffsetWidth,
  orderedMap,
  focusedState,
  syncHoverState,
  additionalProperties,
  tableHeight,
  tooltip,
  mediaType,
}: IMediaSetProps): React.FunctionComponentElement<React.ReactNode> => {
  let content: [string[], []][] = []; // the actual items list to be passed to virtualized list component
  let keysMap: { [key: string]: number } = {}; // cache for checking whether the group title is already added to list

  const mediaItemHeight = React.useMemo(() => {
    if (additionalProperties?.alignmentType === MediaItemAlignmentEnum.Height) {
      return (wrapperOffsetHeight * additionalProperties?.mediaItemSize) / 100;
    } else if (
      additionalProperties?.alignmentType === MediaItemAlignmentEnum.Width
    ) {
      return (wrapperOffsetWidth * additionalProperties?.mediaItemSize) / 100;
    } else {
      return mediaType === MediaTypeEnum.AUDIO
        ? AUDIO_FIXED_HEIGHT
        : IMAGE_FIXED_HEIGHT;
    }
  }, [
    additionalProperties,
    mediaType,
    wrapperOffsetHeight,
    wrapperOffsetWidth,
  ]);

  function fillContent(
    list: [] | { [key: string]: [] | {} },
    path = [''],
    orderedMap: { [key: string]: any },
  ) {
    if (Array.isArray(list)) {
      content.push([path, list]);
    } else {
      const fieldSortedValues = _.sortBy([...orderedMap.ordering]);
      fieldSortedValues.forEach((val: any) => {
        const fieldName = `${orderedMap.key} = ${formatValue(val)}`;
        if (!keysMap.hasOwnProperty(path.join(''))) {
          content.push([path, []]);
          keysMap[path.join('')] = 1;
        }
        fillContent(
          list[fieldName],
          path.concat([fieldName]),
          orderedMap[fieldName],
        );
      });
    }
  }

  fillContent(data, [''], orderedMap);

  function getItemSize(index: number) {
    let [path, items] = content[index];
    if (path.length === 1) {
      return 0;
    }
    let maxHeight = 0;
    let maxWidth = 0;
    items.forEach((item: any) => {
      if (maxHeight < item.height) {
        maxHeight = item.height;
        maxWidth = item.width;
      }
    });

    if (items.length > 0) {
      if (mediaType === MediaTypeEnum.IMAGE) {
        if (
          additionalProperties.alignmentType === MediaItemAlignmentEnum.Original
        ) {
          if (maxHeight > wrapperOffsetHeight) {
            maxHeight = wrapperOffsetHeight;
          }
          return maxHeight + ITEM_WRAPPER_HEIGHT + ITEM_CAPTION_HEIGHT;
        }
      }
      if (additionalProperties.alignmentType === MediaItemAlignmentEnum.Width) {
        let width =
          (wrapperOffsetWidth * additionalProperties?.mediaItemSize) / 100;
        return (maxHeight / maxWidth) * width;
      }

      return mediaItemHeight + ITEM_CAPTION_HEIGHT + ITEM_WRAPPER_HEIGHT;
    }

    return MEDIA_SET_TITLE_HEIGHT + MEDIA_SET_WRAPPER_PADDING_HEIGHT;
  }

  return (
    <List
      key={content.length + tableHeight + mediaSetKey}
      height={wrapperOffsetHeight || 0}
      itemCount={content.length}
      itemSize={getItemSize}
      width={'100%'}
      onScroll={onListScroll}
      itemData={{
        data: content,
        addUriToList,
        wrapperOffsetWidth,
        wrapperOffsetHeight,
        index,
        mediaSetKey,
        mediaItemHeight,
        focusedState,
        syncHoverState,
        additionalProperties,
        tooltip,
        mediaType,
      }}
    >
      {MediaGroupedList}
    </List>
  );
};

function propsComparator(
  prevProps: IMediaSetProps,
  nextProps: IMediaSetProps,
): boolean {
  if (
    prevProps.mediaSetKey !== nextProps.mediaSetKey ||
    prevProps.focusedState !== nextProps.focusedState
  ) {
    return false;
  }
  return true;
}

export default React.memo(MediaSet, propsComparator);

const MediaGroupedList = React.memo(function MediaGroupedList(props: any) {
  const { index, style, data } = props;
  const [path, items] = data.data[index];
  const json: string | object = jsonParse(
    path[path.length - 1]?.split('=')[1]?.trim(),
  );
  const isJson: boolean = typeof json === 'object';

  return (
    <div
      className='MediaSet'
      style={{
        paddingLeft: `calc(0.625rem * ${path.length - 2})`,
        ...style,
      }}
    >
      {path.slice(2).map((key: string, i: number) => (
        <div
          key={key}
          className='MediaSet__connectorLine'
          style={{
            left: `calc(0.625rem * ${i})`,
          }}
        />
      ))}
      <div
        className={`MediaSet__container ${path.length > 2 ? 'withDash' : ''}`}
      >
        {path.length > 1 && (
          <ControlPopover
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            anchor={({ onAnchorClick }) => (
              <Tooltip
                placement='top-start'
                title={isJson ? path[path.length - 1] : ''}
              >
                <span
                  onClick={isJson ? onAnchorClick : () => null}
                  className={classNames(
                    `MediaSet__container__title ${
                      isJson ? 'MediaSet__container__title__pointer' : ''
                    }`,
                  )}
                >
                  {path[path.length - 1]}
                </span>
              </Tooltip>
            )}
            component={<JsonViewPopover json={json as object} />}
          />
        )}
        {items.length > 0 && (
          <div className='MediaSet__container__mediaItemsList'>
            <MediaList
              data={items}
              addUriToList={data.addUriToList}
              wrapperOffsetWidth={data.wrapperOffsetWidth}
              wrapperOffsetHeight={data.wrapperOffsetHeight}
              mediaItemHeight={data.mediaItemHeight}
              focusedState={data.focusedState}
              syncHoverState={data.syncHoverState}
              additionalProperties={data.additionalProperties}
              tooltip={data.tooltip}
              mediaType={data.mediaType}
            />
          </div>
        )}
      </div>
    </div>
  );
}, areEqual);
