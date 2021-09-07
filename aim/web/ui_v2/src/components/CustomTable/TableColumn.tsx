// @ts-nocheck
/* eslint-disable react/prop-types */

import * as React from 'react';
import classNames from 'classnames';
import { Typography } from '@material-ui/core';

import Cell from './TableCell';
import Popover from './TablePopover';
import Icon from 'components/Icon/Icon';

function Column({
  topHeader,
  showTopHeaderContent,
  showTopHeaderBorder,
  col,
  data,
  groups,
  expanded,
  expand,
  togglePin,
  pinnedTo,
  firstColumn,
  width,
  updateColumnWidth,
  headerMeta,
  isAlwaysVisible,
  hideColumn,
  paneFirstColumn,
  paneLastColumn,
  moveColumn,
  sortable,
  sortByColumn,
  onRowHover,
  onRowClick,
}) {
  const [maxWidth, setMaxWidth] = React.useState(width);
  const [isResizing, setIsResizing] = React.useState(false);
  const widthClone = React.useRef(width);
  const startingPoint = React.useRef(null);
  function resizeStart({ target }) {
    setIsResizing(true);
    if (pinnedTo === 'right') {
      startingPoint.current = target.parentNode.getBoundingClientRect().right;
    } else {
      startingPoint.current = target.parentNode.getBoundingClientRect().left;
    }
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', resizeEnd);
  }
  function resize(evt) {
    let newWidth;
    if (pinnedTo === 'right') {
      newWidth = startingPoint.current - evt.pageX;
    } else {
      newWidth = evt.pageX - startingPoint.current;
    }
    if (newWidth > 85) {
      widthClone.current = newWidth;
      setMaxWidth(newWidth);
    }
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  }
  function resizeEnd() {
    setIsResizing(false);
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', resizeEnd);
    document.body.style.userSelect = 'unset';
    document.body.style.cursor = 'unset';
    setTimeout(() => {
      updateColumnWidth(col.key, widthClone.current);
    }, 100);
  }
  function resetWidth() {
    updateColumnWidth(col.key, widthClone.current, true);
    setMaxWidth(undefined);
  }

  React.useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', resizeEnd);
    };
  }, []);
  return (
    <div
      className='Table__column Table__column--data'
      style={{
        minWidth: maxWidth,
        maxWidth,
      }}
    >
      {topHeader && (
        <div
          className='Table__cell Table__cell--header Table__cell--topHeader'
          style={{
            minWidth: col.minWidth,
            borderRight: showTopHeaderBorder ? '' : 'none',
          }}
        >
          {showTopHeaderContent && col.topHeader && (
            <Typography>{col.topHeader}</Typography>
          )}
        </div>
      )}
      <div
        className='Table__cell Table__cell--header'
        style={{
          minWidth: col.minWidth,
        }}
      >
        {firstColumn ? headerMeta : null}
        {col.content}
        <Popover
          target={<Icon name='more-vertical' />}
          targetClassName='Table__action'
          tooltip='Column actions'
          content={(opened, setOpened) => (
            <div className='Table__action__popup__body'>
              {!isAlwaysVisible && (
                <div
                  className='Table__action__popup__item'
                  onClick={(evt) => {
                    hideColumn();
                    setOpened(false);
                  }}
                >
                  <Icon name='eye-outline-hide' />
                  <Typography small>Hide column</Typography>
                </div>
              )}
              {(pinnedTo === 'left' || pinnedTo === 'right') && (
                <div
                  className='Table__action__popup__item'
                  onClick={(evt) => {
                    togglePin(col.key, null);
                    setOpened(false);
                  }}
                >
                  <Icon name='pin' />
                  <Typography small>Unpin</Typography>
                </div>
              )}
              {pinnedTo !== 'left' && (
                <div
                  className='Table__action__popup__item'
                  onClick={(evt) => {
                    togglePin(col.key, 'left');
                    setOpened(false);
                  }}
                >
                  <Icon name='pin-left' />
                  <Typography small>Pin to left</Typography>
                </div>
              )}
              {pinnedTo !== 'right' && (
                <div
                  className='Table__action__popup__item'
                  onClick={(evt) => {
                    togglePin(col.key, 'right');
                    setOpened(false);
                  }}
                >
                  <Icon name='pin-right' />
                  <Typography small>Pin to right</Typography>
                </div>
              )}
              {!paneFirstColumn && (
                <div
                  className='Table__action__popup__item'
                  onClick={(evt) => {
                    moveColumn('left');
                    setOpened(false);
                  }}
                >
                  <Icon name='arrow-left' />
                  <Typography small>Move left</Typography>
                </div>
              )}
              {!paneLastColumn && (
                <div
                  className='Table__action__popup__item'
                  onClick={(evt) => {
                    moveColumn('right');
                    setOpened(false);
                  }}
                >
                  <Icon name='arrow-right' />
                  <Typography small>Move right</Typography>
                </div>
              )}
              {pinnedTo === null && !paneFirstColumn && (
                <div
                  className='Table__action__popup__item'
                  onClick={(evt) => {
                    moveColumn('start');
                    setOpened(false);
                  }}
                >
                  <Icon name='move-to-left' />
                  <Typography small>Move to start</Typography>
                </div>
              )}
              {pinnedTo === null && !paneLastColumn && (
                <div
                  className='Table__action__popup__item'
                  onClick={(evt) => {
                    moveColumn('end');
                    setOpened(false);
                  }}
                >
                  <Icon name='move-to-right' />
                  <Typography small>Move to end</Typography>
                </div>
              )}
              {sortable && (
                <div
                  className='Table__action__popup__item'
                  onClick={(evt) => {
                    sortByColumn('asc');
                    setOpened(false);
                  }}
                >
                  <Icon name='sort-outside' />
                  <Typography small>
                    Sort by <em>ASC</em>
                  </Typography>
                </div>
              )}
              {sortable && (
                <div
                  className='Table__action__popup__item'
                  onClick={(evt) => {
                    sortByColumn('desc');
                    setOpened(false);
                  }}
                >
                  <Icon name='sort-outside' />
                  <Typography small>
                    Sort by <em>DESC</em>
                  </Typography>
                </div>
              )}
              {width !== undefined && (
                <div
                  className='Table__action__popup__item'
                  onClick={(evt) => {
                    resetWidth();
                    setOpened(false);
                  }}
                >
                  <Icon name='reset-width-outside' />
                  <Typography small>Reset width</Typography>
                </div>
              )}
            </div>
          )}
          popupClassName='Table__action__popup'
        />
        <div
          className={classNames({
            Table__column__resizeHandler: true,
            leftResize: pinnedTo === 'right',
            isResizing: isResizing,
          })}
          onMouseDown={resizeStart}
        />
      </div>
      {groups
        ? Object.keys(data).map((groupKey) => (
            <div key={groupKey} className='Table__group'>
              <Cell
                index={groupKey}
                col={col}
                item={
                  typeof data[groupKey].data[col.key] === 'object' &&
                  data[groupKey].data[col.key]?.hasOwnProperty('content')
                    ? {
                        ...data[groupKey].data[col.key],
                        props: {
                          ...data[groupKey].data[col.key]?.props,
                          onClick: (e) => expand(groupKey),
                        },
                      }
                    : {
                        content: data[groupKey].data[col.key],
                        props: {
                          onClick: (e) => expand(groupKey),
                        },
                      }
                }
                className={classNames({
                  Table__group__header__cell: true,
                  expanded: expanded[groupKey],
                  expandable: true,
                })}
              />
              {expanded[groupKey] && (
                <>
                  {data[groupKey]?.items?.map((item, i) => (
                    <Cell
                      key={col.key + i}
                      index={item.index}
                      col={col}
                      item={item[col.key]}
                      className={`rowKey-${item.key}`}
                      onRowHover={() => onRowHover(item)}
                      onRowClick={() => onRowClick(item)}
                    />
                  ))}
                </>
              )}
            </div>
          ))
        : data.map((item, i) => (
            <Cell
              key={col.key + i}
              index={item.index}
              col={col}
              item={item[col.key]}
              className={`rowKey-${item.key}`}
              metadata={firstColumn ? item.rowMeta : null}
              onRowHover={() => onRowHover(item)}
              onRowClick={() => onRowClick(item)}
            />
          ))}
    </div>
  );
}

export default Column;
