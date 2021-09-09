// @ts-nocheck
/* eslint-disable react/prop-types */

import * as React from 'react';
import classNames from 'classnames';
import { MenuItem, Typography } from '@material-ui/core';

import Cell from './TableCell';
import Popover from './TablePopover';
import Icon from 'components/Icon/Icon';
import ControlPopover from '../ControlPopover/ControlPopover';

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
        {col.key !== 'actions' && col.key !== '#' && (
          <>
            <ControlPopover
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              anchor={({ onAnchorClick, opened }) => (
                <Icon
                  className='Table__action__anchor'
                  onClick={onAnchorClick}
                  name='more-vertical'
                />
              )}
              component={
                <div className='Table__action__popup__body'>
                  {!isAlwaysVisible && (
                    <MenuItem
                      className='Table__action__popup__item'
                      onClick={(evt) => {
                        hideColumn();
                        setOpened(false);
                      }}
                    >
                      <Icon name='eye-outline-hide' />
                      <span>Hide column</span>
                    </MenuItem>
                  )}
                  {(pinnedTo === 'left' || pinnedTo === 'right') && (
                    <MenuItem
                      className='Table__action__popup__item'
                      onClick={(evt) => {
                        togglePin(col.key, null);
                        setOpened(false);
                      }}
                    >
                      <Icon name='pin' />
                      <span>Unpin</span>
                    </MenuItem>
                  )}
                  {pinnedTo !== 'left' && (
                    <MenuItem
                      className='Table__action__popup__item'
                      onClick={(evt) => {
                        togglePin(col.key, 'left');
                        setOpened(false);
                      }}
                    >
                      <Icon name='pin-left' />
                      <span>Pin to left</span>
                    </MenuItem>
                  )}
                  {pinnedTo !== 'right' && (
                    <MenuItem
                      className='Table__action__popup__item'
                      onClick={(evt) => {
                        togglePin(col.key, 'right');
                        setOpened(false);
                      }}
                    >
                      <Icon name='pin-right' />
                      <span>Pin to right</span>
                    </MenuItem>
                  )}
                  {!paneFirstColumn && (
                    <MenuItem
                      className='Table__action__popup__item'
                      onClick={(evt) => {
                        moveColumn('left');
                        setOpened(false);
                      }}
                    >
                      <Icon fontSize={10} name='arrow-left' />
                      <span>Move left</span>
                    </MenuItem>
                  )}
                  {!paneLastColumn && (
                    <MenuItem
                      className='Table__action__popup__item'
                      onClick={(evt) => {
                        moveColumn('right');
                        setOpened(false);
                      }}
                    >
                      <Icon fontSize={10} name='arrow-right' />
                      <span>Move right</span>
                    </MenuItem>
                  )}
                  {pinnedTo === null && !paneFirstColumn && (
                    <MenuItem
                      className='Table__action__popup__item'
                      onClick={(evt) => {
                        moveColumn('start');
                        setOpened(false);
                      }}
                    >
                      <Icon fontSize={10} name='move-to-left' />
                      <span>Move to start</span>
                    </MenuItem>
                  )}
                  {pinnedTo === null && !paneLastColumn && (
                    <MenuItem
                      className='Table__action__popup__item'
                      onClick={(evt) => {
                        moveColumn('end');
                        setOpened(false);
                      }}
                    >
                      <Icon fontSize={10} name='move-to-right' />
                      <span>Move to end</span>
                    </MenuItem>
                  )}
                  {sortable && (
                    <MenuItem
                      className='Table__action__popup__item'
                      onClick={(evt) => {
                        sortByColumn('asc');
                        setOpened(false);
                      }}
                    >
                      <Icon name='sort-outside' />
                      <span>
                        Sort by <em>ASC</em>
                      </span>
                    </MenuItem>
                  )}
                  {sortable && (
                    <MenuItem
                      className='Table__action__popup__item'
                      onClick={(evt) => {
                        sortByColumn('desc');
                        setOpened(false);
                      }}
                    >
                      <Icon name='sort-outside' />
                      <span>
                        Sort by <em>DESC</em>
                      </span>
                    </MenuItem>
                  )}
                  {width !== undefined && (
                    <MenuItem
                      className='Table__action__popup__item'
                      onClick={(evt) => {
                        resetWidth();
                        setOpened(false);
                      }}
                    >
                      <Icon name='reset-width-outside' />
                      <span>Reset width</span>
                    </MenuItem>
                  )}
                </div>
              }
            />
            {/*<Popover*/}
            {/*  target={<Icon name='more-vertical' />}*/}
            {/*  targetClassName='Table__action'*/}
            {/*  tooltip='Column actions'*/}
            {/*  content={(opened, setOpened) => (*/}
            {/*    */}
            {/*  )}*/}
            {/*  popupClassName='Table__action__popup'*/}
            {/*/>*/}
            <div
              className={classNames({
                Table__column__resizeHandler: true,
                leftResize: pinnedTo === 'right',
                isResizing: isResizing,
              })}
              onMouseDown={resizeStart}
            />
          </>
        )}
      </div>
      {groups
        ? Object.keys(data).map((groupKey) => (
            <div key={groupKey} className='Table__group'>
              {col.key === '#' ? (
                <div
                  className={classNames({
                    Table__cell: true,
                    Table__group__config__cell: true,
                    Table__group__header__cell: true,
                    expanded: expanded[groupKey],
                    expandable: true,
                  })}
                >
                  <GroupConfig
                    expand={expand}
                    expanded={expanded}
                    groupKey={groupKey}
                  />
                </div>
              ) : col.key === 'actions' ? (
                <div
                  className={classNames({
                    Table__cell: true,
                    Table__group__config__cell: true,
                    Table__group__header__cell: true,
                    expanded: expanded[groupKey],
                    expandable: true,
                  })}
                >
                  <GroupActions
                    expand={expand}
                    expanded={expanded}
                    groupKeys={Object.keys(data)}
                    groupKey={groupKey}
                  />
                </div>
              ) : (
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
              )}
              {expanded[groupKey] && (
                <>
                  {data[groupKey]?.items?.map((item, i) => (
                    <Cell
                      key={col.key + i}
                      index={item.index}
                      col={col}
                      item={item[col.key]}
                      className={`rowKey-${item.key}${
                        item.isHidden ? ' hidden' : ''
                      }`}
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
              className={`rowKey-${item.key}${item.isHidden ? ' hidden' : ''}`}
              metadata={firstColumn ? item.rowMeta : null}
              onRowHover={() => onRowHover(item)}
              onRowClick={() => onRowClick(item)}
            />
          ))}
    </div>
  );
}

function GroupConfig({ config, expand, expanded, groupKey }) {
  return (
    <div className='Table__action' onClick={(evt) => expand(groupKey)}>
      <Icon name={expanded[groupKey] ? 'arrow-up' : 'arrow-down'} />
    </div>
  );
}

function GroupActions({ expand, expanded, groupKeys, groupKey }) {
  return (
    <Popover
      target={<Icon name='more-horizontal' />}
      targetClassName='Table__action'
      content={(opened, setOpened) => (
        <div className='Table__action__popup__body'>
          <div
            className='Table__action__popup__item'
            onClick={(evt) => {
              expand(groupKey);
              setOpened(false);
            }}
          >
            <Icon
              name={expanded[groupKey] ? 'collapse-inside' : 'collapse-outside'}
            />
            <Typography small>
              {expanded[groupKey] ? 'Collapse group' : 'Expand group'}
            </Typography>
          </div>
          {(expanded[groupKey] || groupKeys.some((key) => !!expanded[key])) && (
            <div
              className='Table__action__popup__item'
              onClick={(evt) => {
                expand('collapse_all');
                setOpened(false);
              }}
            >
              <Icon name='collapse-inside' />
              <Typography small>Collapse all</Typography>
            </div>
          )}
          {(!expanded[groupKey] || groupKeys.some((key) => !expanded[key])) && (
            <div
              className='Table__action__popup__item'
              onClick={(evt) => {
                expand('expand_all');
                setOpened(false);
              }}
            >
              <Icon name='collapse-outside' />
              <Typography small>Expand all</Typography>
            </div>
          )}
        </div>
      )}
      popupClassName='Table__action__popup'
    />
  );
}

export default Column;
