import React from 'react';
import _ from 'lodash-es';
import { VariableSizeList as List, areEqual } from 'react-window';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';

import MediaList from 'components/MediaList';
import { JsonViewPopover, Slider } from 'components/kit';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import { MediaTypeEnum } from 'components/MediaPanel/config';

import {
  MEDIA_ITEMS_SIZES,
  MEDIA_SET_SIZE,
  MEDIA_SET_SLIDER_HEIGHT,
  MEDIA_SET_TITLE_HEIGHT,
  MEDIA_SET_WRAPPER_PADDING_HEIGHT,
} from 'config/mediaConfigs/mediaConfigs';

import { formatValue } from 'utils/formatValue';
import { jsonParse } from 'utils/jsonParse';
import getBiggestImageFromList from 'utils/getBiggestImageFromList';

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
  let content: [(string | {})[], [] | [][]][] = []; // the actual items list to be passed to virtualized list component
  let keysMap: { [key: string]: number } = {}; // cache for checking whether the group title is already added to list

  const mediaItemHeight = React.useMemo(() => {
    if (mediaType === MediaTypeEnum.AUDIO) {
      return MEDIA_ITEMS_SIZES[mediaType]()?.height;
    } else {
      return MEDIA_ITEMS_SIZES[mediaType]({
        data,
        additionalProperties,
        wrapperOffsetWidth,
        wrapperOffsetHeight,
      })?.height;
    }
  }, [
    additionalProperties,
    data,
    mediaType,
    wrapperOffsetHeight,
    wrapperOffsetWidth,
  ]);

  function setStackedList(list: [], stackedList: [][]): void {
    for (let j = 0; j < list.length; j++) {
      if (!stackedList[j]) {
        stackedList[j] = [];
      }
      stackedList[j].push(list[j]);
    }
  }

  function fillContent(
    list: [] | { [key: string]: [] | {} },
    path: (string | {})[] = [''],
    orderedMap: { [key: string]: any },
  ) {
    if (Array.isArray(list)) {
      if (additionalProperties.stacking && content.length) {
        const [lastContentPath, lastContentList] = content[content.length - 1];
        const [orderedMapKey, value] = (path[path.length - 1] as string).split(
          '=',
        );
        if (path.length === lastContentPath.length) {
          (lastContentPath[lastContentPath.length - 1] as any)[
            orderedMapKey
          ].push(value);
          setStackedList(list, lastContentList);
        } else {
          let stackedList: [][] = [];
          setStackedList(list, stackedList);
          path[path.length - 1] = { [orderedMapKey]: [value] };
          content.push([path, stackedList]);
        }
      } else {
        content.push([path, list]);
      }
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

  function getItemSize(index: number): number {
    let [path, items] = content[index];
    const { maxHeight, maxWidth } = getBiggestImageFromList(items.flat());
    const { mediaItemSize, alignmentType, stacking } = additionalProperties;
    const lastPath = path[path.length - 1];
    const isStackedPath = stacking && typeof lastPath === 'object';
    const { pathValue } = getPathDetails({
      isStackedPath,
      lastPath,
    });
    if (path.length === 1) {
      return 0;
    }
    if (items.length > 0) {
      if (mediaType === MediaTypeEnum.IMAGE) {
        return MEDIA_SET_SIZE[mediaType]({
          maxHeight,
          maxWidth,
          mediaItemHeight,
          alignmentType,
          wrapperOffsetWidth,
          mediaItemSize,
          stacking: isStackedPath && pathValue.length > 1,
        });
      }
      if (mediaType === MediaTypeEnum.AUDIO) {
        return MEDIA_SET_SIZE[mediaType]();
      }
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

const MediaGroupedList = React.memo(function MediaGroupedList({
  index,
  style,
  data,
}: {
  index: number;
  style: React.CSSProperties;
  data: { [key: string]: any };
}) {
  const [depth, setDepth] = React.useState(0);
  const [path, items] = data.data[index];
  const lastPath = path[path.length - 1];
  const isStackedPath =
    data.additionalProperties.stacking && typeof lastPath === 'object';
  const { pathKey, pathValue } = getPathDetails({
    isStackedPath,
    lastPath,
  });
  const { currentValue, currentItems } = getCurrentContent({
    isStackedPath,
    pathValue,
    depth,
    items,
  });
  const json: string | object = jsonParse(currentValue);
  const isJson: boolean = typeof json === 'object';

  function onSliderChange(
    event: React.ChangeEvent<{}>,
    value: number | number[],
  ): void & React.FormEventHandler<HTMLSpanElement> {
    if (value !== depth) {
      setDepth(value as number);
    }
  }
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
          style={{ left: `calc(0.625rem * ${i})` }}
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
                title={isJson ? `${pathKey} = ${currentValue}` : ''}
              >
                <span
                  onClick={isJson ? onAnchorClick : undefined}
                  className={classNames('MediaSet__container__title', {
                    MediaSet__container__title__pointer: isJson,
                  })}
                >
                  {`${pathKey} = ${currentValue}`}
                </span>
              </Tooltip>
            )}
            component={<JsonViewPopover json={json as object} />}
          />
        )}
        {currentItems.length > 0 && isStackedPath && pathValue.length > 1 && (
          <div
            className='MediaSet__container__sliderContainer'
            style={{ height: MEDIA_SET_SLIDER_HEIGHT }}
          >
            <Slider
              aria-labelledby='track-false-slider'
              track={false}
              valueLabelDisplay='off'
              getAriaValueText={(value) => `${pathValue[value]}`}
              value={depth}
              onChange={onSliderChange}
              step={null}
              marks={(pathValue as string[]).map((l, i) => ({ value: i }))}
              min={0}
              max={pathValue.length - 1}
            />
          </div>
        )}
        {currentItems.length > 0 && (
          <div className='MediaSet__container__mediaItemsList'>
            <MediaList
              key={`${index}-${depth}`}
              data={currentItems}
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
},
areEqual);

function getPathDetails({
  isStackedPath,
  lastPath,
}: {
  isStackedPath: boolean;
  lastPath: any;
}) {
  let pathKey = '';
  let pathValue: string | string[] = '';
  if (isStackedPath) {
    pathKey = Object.keys(lastPath)[0];
    pathValue = lastPath[pathKey];
  } else {
    [pathKey = '', pathValue = ''] = lastPath?.split('=');
  }
  return { pathKey, pathValue };
}

function getCurrentContent({
  isStackedPath,
  pathValue,
  depth,
  items,
}: {
  isStackedPath: boolean;
  pathValue: string | string[];
  depth: number;
  items: [] | [][];
}) {
  let currentValue = '';
  let currentItems: [] = [];

  if (isStackedPath) {
    currentValue = (pathValue[depth] as string)?.trim();
    for (let item of items) {
      if (item[depth]) {
        currentItems.push(item[depth]);
      }
    }
  } else {
    currentValue = (pathValue as string)?.trim();
    currentItems = items as [];
  }
  return { currentValue, currentItems };
}
