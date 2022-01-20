import React from 'react';
import _ from 'lodash-es';
import { VariableSizeList as List, areEqual } from 'react-window';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';

import MediaList from 'components/MediaList';
import { JsonViewPopover } from 'components/kit';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import { MediaTypeEnum } from 'components/MediaPanel/config';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import {
  MEDIA_ITEMS_SIZES,
  MEDIA_SET_SIZE,
  MEDIA_SET_TITLE_HEIGHT,
  MEDIA_SET_WRAPPER_PADDING_HEIGHT,
} from 'config/mediaConfigs/mediaConfigs';

import { formatValue } from 'utils/formatValue';
import { jsonParse } from 'utils/jsonParse';
import { SortField } from 'utils/getSortedFields';
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
  sortFieldsDict,
  sortFields,
}: IMediaSetProps): React.FunctionComponentElement<React.ReactNode> => {
  let content: [string[], []][] = []; // the actual items list to be passed to virtualized list component
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

  function fillContent(
    list: [] | { [key: string]: [] | {} },
    path = [''],
    orderedMap: { [key: string]: any },
  ) {
    if (Array.isArray(list)) {
      const listKeys: string[] = [];
      const listOrderTypes: any[] = [];
      sortFields?.forEach((sortField: SortField) => {
        listKeys.push(sortField.value);
        listOrderTypes.push(sortField.order);
      });
      const orderedContentList: any = _.orderBy(list, listKeys, listOrderTypes);
      content.push([path, orderedContentList]);
    } else {
      const fieldSortedValues = _.orderBy(
        [...(orderedMap?.ordering || [])].reduce((acc: any, value: any) => {
          acc.push({ [orderedMap.key]: value });
          return acc;
        }, []),
        [orderedMap?.key || ''],
        [sortFieldsDict?.[orderedMap?.orderKey]?.order || 'asc'],
      ).map((value: any) => value[orderedMap?.key]);
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
    const { maxHeight, maxWidth } = getBiggestImageFromList(items);
    const { mediaItemSize, alignmentType } = additionalProperties;
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
    prevProps.focusedState !== nextProps.focusedState ||
    prevProps.sortFieldsDict !== nextProps.sortFieldsDict
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
    <ErrorBoundary>
      <div
        className='MediaSet'
        style={{
          paddingLeft: `calc(0.625rem * ${path.length - 2})`,
          ...style,
        }}
      >
        {path.slice(2).map((key: string, i: number) => (
          <ErrorBoundary key={key}>
            <div
              className='MediaSet__connectorLine'
              style={{
                left: `calc(0.625rem * ${i})`,
              }}
            />
          </ErrorBoundary>
        ))}
        <ErrorBoundary>
          <div
            className={`MediaSet__container ${
              path.length > 2 ? 'withDash' : ''
            }`}
          >
            {path.length > 1 && (
              <ErrorBoundary>
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
              </ErrorBoundary>
            )}
            {items.length > 0 && (
              <ErrorBoundary>
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
              </ErrorBoundary>
            )}
          </div>
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
}, areEqual);
