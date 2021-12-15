import React from 'react';
import _ from 'lodash-es';
import { VariableSizeList as List, areEqual } from 'react-window';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';

import MediaList from 'components/MediaList';
import { JsonViewPopover } from 'components/kit';
import ControlPopover from 'components/ControlPopover/ControlPopover';

import { formatValue } from 'utils/formatValue';
import { jsonParse } from 'utils/jsonParse';

import { IMediaSetProps } from './MediaSet.d';

import './MediaSet.scss';

const itemWrapperHeight = 33;
const setTitleHeight = 17;
const setWrapperPaddingHeight = 6;

const MediaSet = ({
  data,
  onListScroll,
  addUriToList,
  index = 0,
  setKey,
  wrapperOffsetHeight,
  wrapperOffsetWidth,
  orderedMap,
  mediaItemHeight,
  focusedState,
  syncHoverState,
  additionalProperties,
  tableHeight,
  tooltip,
  mediaType,
}: IMediaSetProps): React.FunctionComponentElement<React.ReactNode> => {
  let content: [string[], []][] = []; // the actual items list to be passed to virtualized list component
  let keysMap: { [key: string]: number } = {}; // cache for checking whether the group title is already added to list

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

    if (items.length > 0) {
      return mediaItemHeight + itemWrapperHeight;
    }

    return setTitleHeight + setWrapperPaddingHeight;
  }

  return (
    <List
      key={content.length + tableHeight + setKey}
      height={wrapperOffsetHeight || 0}
      itemCount={content.length}
      itemSize={getItemSize}
      width={'100%'}
      onScroll={onListScroll}
      itemData={{
        data: content,
        addUriToList,
        wrapperOffsetWidth,
        index,
        setKey,
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
    prevProps.setKey !== nextProps.setKey ||
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
