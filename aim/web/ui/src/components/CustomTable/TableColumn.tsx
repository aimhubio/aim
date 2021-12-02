// @ts-nocheck
/* eslint-disable react/prop-types */

import * as React from 'react';
import classNames from 'classnames';
import { isNil } from 'lodash-es';

import { MenuItem, Tooltip, Divider } from '@material-ui/core';

import { Button, Icon, Text } from 'components/kit';
import GroupConfigPopover from 'components/GroupConfigPopover/GroupConfigPopover';

import { viewPortOffset } from 'config/table/tableConfigs';

import ControlPopover from '../ControlPopover/ControlPopover';

import Cell from './TableCell';

function Column({
  topHeader,
  showTopHeaderContent,
  showTopHeaderBorder,
  col,
  data,
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
  onRowHover,
  onRowClick,
  columnOptions,
  listWindow,
}) {
  const [maxWidth, setMaxWidth] = React.useState(width);
  const [isResizing, setIsResizing] = React.useState(false);
  const widthClone = React.useRef(width);
  const columnRef = React.useRef();
  const startingPoint = React.useRef(null);

  const groups = !Array.isArray(data);

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
    if (columnRef.current) {
      columnRef.current.style.width = 'initial';
    }
  }

  React.useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', resizeEnd);
    };
  }, []);

  React.useEffect(() => {
    if (columnRef.current) {
      columnRef.current.style.width = 'initial';
    }
  }, [data, expanded, width]);

  const isInViewPort =
    columnRef.current?.classList?.[1] === 'Table__column--groups' ||
    !listWindow ||
    !columnRef.current ||
    (columnRef.current &&
      columnRef.current.offsetLeft > listWindow.left - viewPortOffset &&
      columnRef.current.offsetLeft <
        listWindow.left + listWindow.width + viewPortOffset);

  return (
    <div
      className={classNames({
        Table__column: true,
        'Table__column--actions': col.key === 'actions',
        'Table__column--groups': col.key === 'groups',
      })}
      style={{
        minWidth: maxWidth,
        maxWidth: '100vh',
        width: isInViewPort
          ? 'initial'
          : columnRef.current?.offsetWidth ?? 'initial',
        boxShadow: isInViewPort ? null : '1px 30px 0 0 #dee6f3',
        filter: isInViewPort ? null : 'blur(2px)',
      }}
      ref={columnRef}
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
            <Text component='p' tint={100} size={14} weight={600}>
              {col.topHeader}
            </Text>
          )}
        </div>
      )}
      <div
        className='Table__cell Table__cell--header'
        style={{
          minWidth: col.minWidth,
        }}
      >
        <Text tint={100} size={14} weigh={600}>
          {firstColumn ? headerMeta : null}
          {col.content}
        </Text>
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
                      size='small'
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
                  {columnOptions && (
                    <>
                      {columnOptions?.map((option) => (
                        <MenuItem
                          key={option.value}
                          className='Table__action__popup__item'
                          onClick={option.onClick}
                        >
                          <span className='Table__action__popup__item_icon'>
                            <Icon fontSize={14} name={option.icon} />
                          </span>
                          <span>{option.value}</span>
                        </MenuItem>
                      ))}
                      <Divider
                        orientation='horizontal'
                        style={{ margin: '0.5rem 0' }}
                      />
                    </>
                  )}
                  {!isAlwaysVisible && (
                    <MenuItem
                      className='Table__action__popup__item'
                      onClick={hideColumn}
                    >
                      <span className='Table__action__popup__item_icon'>
                        <Icon fontSize={12} name='eye-outline-hide' />
                      </span>
                      <span>Hide column</span>
                    </MenuItem>
                  )}
                  {(pinnedTo === 'left' || pinnedTo === 'right') && (
                    <MenuItem
                      className='Table__action__popup__item'
                      onClick={() => togglePin(col.key, null)}
                    >
                      <span className='Table__action__popup__item_icon'>
                        <Icon fontSize={12} name='pin' />
                      </span>
                      <span>Unpin</span>
                    </MenuItem>
                  )}
                  {pinnedTo !== 'left' && (
                    <MenuItem
                      className='Table__action__popup__item'
                      onClick={() => togglePin(col.key, 'left')}
                    >
                      <span className='Table__action__popup__item_icon'>
                        <Icon fontSize={12} name='pin-left' />
                      </span>
                      <span>Pin to left</span>
                    </MenuItem>
                  )}
                  {pinnedTo !== 'right' && (
                    <MenuItem
                      className='Table__action__popup__item'
                      onClick={() => togglePin(col.key, 'right')}
                    >
                      <span className='Table__action__popup__item_icon'>
                        <Icon fontSize={12} name='pin-right' />
                      </span>
                      <span>Pin to right</span>
                    </MenuItem>
                  )}
                  {!paneFirstColumn && (
                    <MenuItem
                      className='Table__action__popup__item'
                      onClick={() => moveColumn('left')}
                    >
                      <span className='Table__action__popup__item_icon'>
                        <Icon fontSize={10} name='arrow-left' />
                      </span>
                      <span>Move left</span>
                    </MenuItem>
                  )}
                  {!paneLastColumn && (
                    <MenuItem
                      className='Table__action__popup__item'
                      onClick={() => moveColumn('right')}
                    >
                      <span className='Table__action__popup__item_icon'>
                        <Icon fontSize={10} name='arrow-right' />
                      </span>
                      <span>Move right</span>
                    </MenuItem>
                  )}
                  {pinnedTo === null && !paneFirstColumn && (
                    <MenuItem
                      className='Table__action__popup__item'
                      onClick={() => moveColumn('start')}
                    >
                      <span className='Table__action__popup__item_icon'>
                        <Icon fontSize={10} name='move-to-left' />
                      </span>
                      <span>Move to start</span>
                    </MenuItem>
                  )}
                  {pinnedTo === null && !paneLastColumn && (
                    <MenuItem
                      className='Table__action__popup__item'
                      onClick={() => moveColumn('end')}
                    >
                      <span className='Table__action__popup__item_icon'>
                        <Icon fontSize={10} name='move-to-right' />
                      </span>
                      <span>Move to end</span>
                    </MenuItem>
                  )}
                  {width !== undefined && (
                    <MenuItem
                      className='Table__action__popup__item'
                      onClick={resetWidth}
                    >
                      <span className='Table__action__popup__item_icon'>
                        <Icon name='reset-width-outside' />
                      </span>
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
      {isInViewPort &&
        (groups
          ? Object.keys(data).map((groupKey) => (
              <div
                key={groupKey}
                className='Table__group'
                style={
                  col.key === '#' && data[groupKey].data.meta.color
                    ? {
                        borderLeft: 'none',
                      }
                    : null
                }
              >
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
                className={`rowKey-${item.key}${
                  item.isHidden ? ' hidden' : ''
                }`}
                metadata={firstColumn ? item.rowMeta : null}
                onRowHover={() => onRowHover(item)}
                onRowClick={() => onRowClick(item)}
              />
            )))}
    </div>
  );
}

function GroupConfig({ config, expand, expanded, groupKey }) {
  const configData = React.useMemo(() => {
    return Object.keys(config.config).map((key, index) => {
      return { name: key, value: config.config[key] };
    });
  }, [config.config]);
  return (
    <div className='Table__group__config' onClick={(evt) => expand(groupKey)}>
      <Button
        size='small'
        withOnlyIcon={true}
        className='Table__group__config_expandButton'
      >
        <Text className='flex'>
          <Icon name={expanded[groupKey] ? 'arrow-up' : 'arrow-down'} />
        </Text>
      </Button>
      {configData?.length > 0 && (
        <ControlPopover
          title='Group Config'
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          anchor={({ onAnchorClick, opened }) => (
            <Tooltip
              title={`${config.itemsCount} item${
                config.itemsCount > 1 ? 's' : ''
              } in the group, grouped by ${configData.map(
                (item) => ` ${item.name}`,
              )}`}
            >
              <div>
                <Button
                  size='small'
                  className='Table__group__config__popover'
                  onClick={onAnchorClick}
                  withOnlyIcon={true}
                >
                  <Text>{config.itemsCount}</Text>
                </Button>
              </div>
            </Tooltip>
          )}
          component={<GroupConfigPopover configData={configData} />}
        />
      )}
      {!isNil(config.chartIndex) && config.chartIndex !== 0 && (
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
            <span className='Table__action__popup__item_icon'>
              <Icon
                name={
                  expanded[groupKey] ? 'collapse-inside' : 'collapse-outside'
                }
              />
            </span>
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
              <span className='Table__action__popup__item_icon'>
                <Icon name='collapse-inside' />
              </span>
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
              <span className='Table__action__popup__item_icon'>
                <Icon name='collapse-outside' />
              </span>
              <span>Expand all</span>
            </MenuItem>
          )}
        </div>
      )}
    />
  );
}

export default Column;
