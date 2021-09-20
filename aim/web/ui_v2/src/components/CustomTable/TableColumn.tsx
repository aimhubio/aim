// @ts-nocheck
/* eslint-disable react/prop-types */

import * as React from 'react';
import classNames from 'classnames';
import { MenuItem, Tooltip } from '@material-ui/core';

import Cell from './TableCell';
import Icon from 'components/Icon/Icon';
import ControlPopover from '../ControlPopover/ControlPopover';
import Button from 'components/Button/Button';

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
    if (newWidth > 85 && newWidth < 500) {
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
          {showTopHeaderContent && col.topHeader && <p>{col.topHeader}</p>}
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
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              anchor={({ onAnchorClick }) => (
                <Tooltip title='Column actions'>
                  <div>
                    <Button
                      withOnlyIcon
                      onClick={onAnchorClick}
                      color='secondary'
                    >
                      <Icon
                        className='Table__action__anchor'
                        name='more-vertical'
                      />
                    </Button>
                  </div>
                </Tooltip>
              )}
              component={
                <div className='Table__action__popup__body'>
                  {!isAlwaysVisible && (
                    <MenuItem
                      className='Table__action__popup__item'
                      onClick={hideColumn}
                    >
                      <Icon name='eye-outline-hide' />
                      <span>Hide column</span>
                    </MenuItem>
                  )}
                  {(pinnedTo === 'left' || pinnedTo === 'right') && (
                    <MenuItem
                      className='Table__action__popup__item'
                      onClick={() => togglePin(col.key, null)}
                    >
                      <Icon name='pin' />
                      <span>Unpin</span>
                    </MenuItem>
                  )}
                  {pinnedTo !== 'left' && (
                    <MenuItem
                      className='Table__action__popup__item'
                      onClick={() => togglePin(col.key, 'left')}
                    >
                      <Icon name='pin-left' />
                      <span>Pin to left</span>
                    </MenuItem>
                  )}
                  {pinnedTo !== 'right' && (
                    <MenuItem
                      className='Table__action__popup__item'
                      onClick={() => togglePin(col.key, 'right')}
                    >
                      <Icon name='pin-right' />
                      <span>Pin to right</span>
                    </MenuItem>
                  )}
                  {!paneFirstColumn && (
                    <MenuItem
                      className='Table__action__popup__item'
                      onClick={() => moveColumn('left')}
                    >
                      <Icon fontSize={10} name='arrow-left' />
                      <span>Move left</span>
                    </MenuItem>
                  )}
                  {!paneLastColumn && (
                    <MenuItem
                      className='Table__action__popup__item'
                      onClick={() => moveColumn('right')}
                    >
                      <Icon fontSize={10} name='arrow-right' />
                      <span>Move right</span>
                    </MenuItem>
                  )}
                  {pinnedTo === null && !paneFirstColumn && (
                    <MenuItem
                      className='Table__action__popup__item'
                      onClick={() => moveColumn('start')}
                    >
                      <Icon fontSize={10} name='move-to-left' />
                      <span>Move to start</span>
                    </MenuItem>
                  )}
                  {pinnedTo === null && !paneLastColumn && (
                    <MenuItem
                      className='Table__action__popup__item'
                      onClick={() => moveColumn('end')}
                    >
                      <Icon fontSize={10} name='move-to-right' />
                      <span>Move to end</span>
                    </MenuItem>
                  )}
                  {sortable && (
                    <MenuItem
                      className='Table__action__popup__item'
                      onClick={() => sortByColumn('asc')}
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
                      onClick={() => sortByColumn('desc')}
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
                      onClick={resetWidth}
                    >
                      <Icon name='reset-width-outside' />
                      <span>Reset width</span>
                    </MenuItem>
                  )}
                </div>
              }
            />
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
                  style={
                    data[groupKey].data.meta.color
                      ? {
                          boxShadow: `inset 3px 0 0 0 ${data[groupKey].data.meta.color}`,
                        }
                      : null
                  }
                >
                  <GroupConfig
                    config={data[groupKey].data.meta}
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
                      isConfigColumn={col.key === '#'}
                      metadata={firstColumn ? item.rowMeta : null}
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
    <div className='Table__group__config' onClick={(evt) => expand(groupKey)}>
      <Icon name={expanded[groupKey] ? 'arrow-up' : 'arrow-down'} />
      {config.chartIndex !== null && config.chartIndex !== 0 && (
        <Tooltip title='Group chart index'>
          <span className='Table__group__config__chart'>
            {config.chartIndex}
          </span>
        </Tooltip>
      )}
      {config.dasharray !== null && (
        <Tooltip title='Group stroke style'>
          <svg
            className='Table__group__config__stroke'
            style={{
              borderColor: config.color ? config.color : '#3b5896',
            }}
          >
            <line
              x1='0'
              y1='50%'
              x2='100%'
              y2='50%'
              style={{
                strokeDasharray: config.dasharray
                  .split(' ')
                  .map((elem) => (elem / 5) * 3)
                  .join(' '),
              }}
            />
          </svg>
        </Tooltip>
      )}
      <Tooltip title={`${config.itemsCount} items in the group`}>
        <span className='Table__group__config__itemsCount'>
          {config.itemsCount}
        </span>
      </Tooltip>
    </div>
  );
}

function GroupActions({ expand, expanded, groupKeys, groupKey }) {
  return (
    <ControlPopover
      anchor={({ onAnchorClick }) => (
        <Tooltip title='Expand options'>
          <div>
            <Button color='secondary' withOnlyIcon onClick={onAnchorClick}>
              <Icon className='Table__action__anchor' name='more-horizontal' />
            </Button>
          </div>
        </Tooltip>
      )}
      component={({ handleClose }) => (
        <div className='Table__action__popup__body'>
          <MenuItem
            className='Table__action__popup__item'
            onClick={() => {
              handleClose();
              expand(groupKey);
            }}
          >
            <Icon
              name={expanded[groupKey] ? 'collapse-inside' : 'collapse-outside'}
            />
            <span>
              {expanded[groupKey] ? 'Collapse group' : 'Expand group'}
            </span>
          </MenuItem>
          {(expanded[groupKey] || groupKeys.some((key) => !!expanded[key])) && (
            <MenuItem
              className='Table__action__popup__item'
              onClick={() => {
                handleClose();
                expand('collapse_all');
              }}
            >
              <Icon name='collapse-inside' />
              <span>Collapse all</span>
            </MenuItem>
          )}
          {(!expanded[groupKey] || groupKeys.some((key) => !expanded[key])) && (
            <MenuItem
              className='Table__action__popup__item'
              onClick={() => {
                handleClose();
                expand('expand_all');
              }}
            >
              <Icon name='collapse-outside' />
              <span>Expand all</span>
            </MenuItem>
          )}
        </div>
      )}
    />
  );
}

export default Column;
