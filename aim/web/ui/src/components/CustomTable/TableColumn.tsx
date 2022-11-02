// @ts-nocheck
/* eslint-disable react/prop-types */

import * as React from 'react';
import classNames from 'classnames';
import _ from 'lodash-es';
import { useResizeObserver } from 'hooks';

import { MenuItem, Tooltip, Divider, Checkbox } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { Button, Icon, Text } from 'components/kit';
import GroupConfigPopover from 'components/GroupConfigPopover/GroupConfigPopover';

import { BGColorLighten } from 'config/colors/colors';
import {
  TABLE_COLUMN_START_COLOR_SCALE,
  TABLE_COLUMN_END_COLOR_SCALE,
  RowHeightSize,
  ROW_CELL_SIZE_CONFIG,
} from 'config/table/tableConfigs';

import getColorFromRange from 'utils/d3/getColorFromRange';
import changeDasharraySize from 'utils/changeDasharraySize';

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
  multiSelect,
  selectedRows,
  onRowSelect,
  onToggleColumnsColorScales,
  columnsColorScales,
  rowHeightMode,
  setColWidth,
  colLeft,
  listWindow,
  noColumnActions,
}) {
  const [maxWidth, setMaxWidth] = React.useState(width);
  const [isResizing, setIsResizing] = React.useState(false);
  const widthClone = React.useRef(width);
  const columnRef = React.useRef();
  const startingPoint = React.useRef(null);
  const groups = !Array.isArray(data);

  const dataLength = React.useMemo(() => {
    if (Array.isArray(data)) {
      return data.length;
    } else {
      return Object.values(data).reduce((acc: number, value: any) => {
        acc += value.items.length;
        return acc;
      }, 0);
    }
  }, [data]);

  const colorScaleRange = React.useMemo(() => {
    const columnData = _.isArray(data)
      ? data
      : _.values(data).reduce((acc, item) => {
          return [...acc, ...item.items];
        }, []);

    let range = _.sortBy([
      ...new Set(
        columnData
          ?.filter((a) => !_.isArray(a[col.key]) && !_.isNaN(+a[col.key]))
          .map((a) => +a[col.key]) ?? [],
      ),
    ]);

    if (_.isEmpty(range)) {
      return null;
    } else if (range.length === 1) {
      return [range[0] - 0.1, range[0]];
    }
    return range;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getColumnCelBGColor = React.useCallback(
    getColorFromRange(
      colorScaleRange ? [colorScaleRange[0], _.last(colorScaleRange)] : null,
      TABLE_COLUMN_START_COLOR_SCALE,
      TABLE_COLUMN_END_COLOR_SCALE,
    ),
    [data],
  );

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
    document.body.style.webkitUserSelect = 'none';
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
    }, 50);
  }

  function resetWidth() {
    updateColumnWidth(col.key, widthClone.current, true);
    setMaxWidth(undefined);
    if (columnRef.current) {
      columnRef.current.style.width = 'initial';
    }
  }

  React.useEffect(() => {
    if (setColWidth) {
      setColWidth(columnRef.current?.offsetWidth);
    }
    return () => {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', resizeEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (columnRef.current && col.key !== 'selection') {
      columnRef.current.style.width = widthClone.current ?? 'initial';
      setMaxWidth(width);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, expanded, width]);

  const rafIDRef = React.useRef();

  const resizeObserverCallback = React.useCallback(
    (entries: ResizeObserverEntry[]) => {
      if (entries?.length) {
        rafIDRef.current = window.requestAnimationFrame(() => {
          if (setColWidth) {
            setColWidth(columnRef.current?.offsetWidth);
          }
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, expanded, width],
  );

  const observerReturnCallback = React.useCallback(() => {
    if (rafIDRef.current) {
      window.cancelAnimationFrame(rafIDRef.current);
    }
  }, []);

  useResizeObserver(resizeObserverCallback, columnRef, observerReturnCallback);

  function getColumnHeight() {
    if (groups) {
      const groupKeys = Object.keys(data);
      let expandedGroupKeys = groupKeys.filter((key) => expanded[key]);
      let expandedGroupsDataCount = expandedGroupKeys.reduce(
        (acc, currKey) => acc + data[currKey].items.length,
        0,
      );
      return (
        ((topHeader ? 1 : 0) + 1 + groupKeys.length + expandedGroupsDataCount) *
          rowHeightMode +
        groupKeys.length *
          (ROW_CELL_SIZE_CONFIG[rowHeightMode]?.groupMargin ??
            ROW_CELL_SIZE_CONFIG[RowHeightSize.md].groupMargin) +
        groupKeys.length
      );
    }

    return ((topHeader ? 1 : 0) + 1 + dataLength) * rowHeightMode;
  }

  let firstVisibleCellTop = null;
  let firstVisibleGroupTop = null;

  function fixColumnWidth(width) {
    if (maxWidth === undefined || width > maxWidth) {
      setMaxWidth(width);
    }
  }

  return (
    <ErrorBoundary>
      <div
        className={classNames('Table__column', {
          'Table__column--actions': col.key === 'actions',
          'Table__column--groups': col.key === 'groups',
          'Table__column--selection': col.key === 'selection',
        })}
        style={{
          minWidth: maxWidth,
          maxWidth: '100vw',
          width: col.key === 'selection' ? 32 : widthClone.current ?? 'initial',
          left: colLeft,
          visibility: colLeft === null ? 'hidden' : null,
          height: getColumnHeight(),
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
              <Text
                component='p'
                tint={100}
                size={rowHeightMode === RowHeightSize.sm ? 12 : 14}
                weight={600}
              >
                {col.topHeader}
              </Text>
            )}
          </div>
        )}
        <div
          className='Table__cell Table__cell--header'
          style={{ minWidth: col.minWidth }}
        >
          {multiSelect && col.key === '#' && (
            <Checkbox
              color='primary'
              size='small'
              icon={<span className='Table__column__defaultSelectIcon'></span>}
              className='Table__column__selectCheckbox'
              checkedIcon={
                dataLength === Object.keys(selectedRows)?.length ? (
                  <span className='Table__column__selectedSelectIcon'>
                    <Icon name='check' fontSize={9} />
                  </span>
                ) : (
                  <span className='Table__column__partiallySelectedSelectIcon'>
                    <Icon name='partially-selected' fontSize={16} />
                  </span>
                )
              }
              onClick={() =>
                onRowSelect({
                  actionType: _.isEmpty(selectedRows)
                    ? 'selectAll'
                    : 'removeAll',
                  data: data,
                })
              }
              checked={!_.isEmpty(selectedRows)}
            />
          )}
          <Text
            tint={100}
            size={rowHeightMode === RowHeightSize.sm ? 12 : 14}
            weigh={600}
          >
            {firstColumn ? headerMeta : null}
            {col.content}
          </Text>
          {!noColumnActions &&
            col.key !== 'actions' &&
            col.key !== '#' &&
            col.key !== 'selection' && (
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
                          size='xxSmall'
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
                      {!_.isEmpty(colorScaleRange) &&
                        onToggleColumnsColorScales && (
                          <MenuItem
                            className='Table__action__popup__item'
                            onClick={() => onToggleColumnsColorScales(col.key)}
                          >
                            {columnsColorScales[col.key] ? (
                              <>
                                <span className='Table__action__popup__item_icon'>
                                  <Icon fontSize={12} name='color-scale-off' />
                                </span>
                                <span>Reset color scale</span>
                              </>
                            ) : (
                              <>
                                <span className='Table__action__popup__item_icon'>
                                  <Icon fontSize={13} name='color-scale-on' />
                                </span>
                                <span>Apply color scale</span>
                              </>
                            )}
                          </MenuItem>
                        )}
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
                  className={classNames('Table__column__resizeHandler', {
                    leftResize: pinnedTo === 'right',
                    isResizing: isResizing,
                  })}
                  onMouseDown={resizeStart}
                />
              </>
            )}
        </div>
        {groups
          ? Object.keys(data).map((groupKey) => {
              let top =
                ROW_CELL_SIZE_CONFIG[rowHeightMode]?.groupMargin ??
                ROW_CELL_SIZE_CONFIG[RowHeightSize.md].groupMargin;
              let height = rowHeightMode;
              for (let key in data) {
                if (key === groupKey) {
                  if (expanded[key]) {
                    height += data[key].items.length * rowHeightMode;
                  }
                  break;
                }
                top +=
                  (ROW_CELL_SIZE_CONFIG[rowHeightMode]?.groupMargin ??
                    ROW_CELL_SIZE_CONFIG[RowHeightSize.md].groupMargin) +
                  rowHeightMode +
                  1;
                if (expanded[key]) {
                  top += data[key].items.length * rowHeightMode;
                }
              }
              const isVisible =
                (top >= listWindow.top - rowHeightMode * 20 &&
                  top <=
                    listWindow.top + listWindow.height + rowHeightMode * 20) ||
                (top < listWindow.top - rowHeightMode * 20 &&
                  top + height >= listWindow.top);

              if (isVisible && firstVisibleGroupTop === null) {
                firstVisibleGroupTop = top;
              } else {
                top = null;
              }
              const groupColor = data[groupKey].data.meta.color;

              return (
                isVisible && (
                  <div
                    key={groupKey}
                    className={classNames('Table__group', {
                      colorIndicator: groupColor,
                    })}
                    style={{
                      ...(col.key === '#' && groupColor
                        ? {
                            borderTopLeftRadius: '0.375rem',
                            borderBottomLeftRadius: '0.375rem',
                            '--color-indicator': groupColor,
                            '--extended-group-background-color':
                              BGColorLighten[groupColor] ?? '#ffffff', // default to white if no color is found
                          }
                        : groupColor
                        ? {
                            '--extended-group-background-color':
                              BGColorLighten[groupColor] ?? '#ffffff', // default to white if no color is found
                          }
                        : {}),
                      marginTop: top,
                    }}
                  >
                    {col.key === '#' ? (
                      <div
                        className={classNames(
                          'Table__cell Table__group__config__cell Table__group__header__cell expandable',
                          {
                            expanded: expanded[groupKey],
                          },
                        )}
                      >
                        <GroupConfig
                          config={data[groupKey].data.meta}
                          expand={expand}
                          expanded={expanded}
                          groupKey={groupKey}
                          multiSelect={multiSelect}
                          onRowSelect={onRowSelect}
                          selectedRows={selectedRows}
                          data={data[groupKey].items}
                        />
                      </div>
                    ) : col.key === 'actions' ? (
                      <div
                        className={classNames(
                          'Table__cell Table__group__config__cell Table__group__header__cell expandable',
                          {
                            expanded: expanded[groupKey],
                          },
                        )}
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
                        multiSelect={multiSelect}
                        getColumnCelBGColor={getColumnCelBGColor}
                        columnsColorScales={columnsColorScales}
                        isNumeric={colorScaleRange}
                        item={
                          typeof data[groupKey].data[col.key] === 'object' &&
                          data[groupKey].data[col.key]?.hasOwnProperty(
                            'content',
                          )
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
                        className={classNames(
                          'Table__group__header__cell expandable',
                          {
                            expanded: expanded[groupKey],
                          },
                        )}
                        setColumnWidth={fixColumnWidth}
                      />
                    )}
                    {expanded[groupKey] && (
                      <>
                        {data[groupKey]?.items?.map((item, i) => {
                          let absoluteTop =
                            (ROW_CELL_SIZE_CONFIG[rowHeightMode]?.groupMargin ??
                              ROW_CELL_SIZE_CONFIG[RowHeightSize.md]
                                .groupMargin) + rowHeightMode;
                          let top = 0;
                          for (let key in data) {
                            if (key === groupKey) {
                              break;
                            }
                            absoluteTop +=
                              (ROW_CELL_SIZE_CONFIG[rowHeightMode]
                                ?.groupMargin ??
                                ROW_CELL_SIZE_CONFIG[RowHeightSize.md]
                                  .groupMargin) + rowHeightMode;
                            if (expanded[key]) {
                              absoluteTop +=
                                data[key].items.length * rowHeightMode;
                            }
                          }
                          absoluteTop += i * rowHeightMode;
                          top = i * rowHeightMode;
                          const isVisible =
                            absoluteTop >=
                              listWindow.top - rowHeightMode * 20 &&
                            absoluteTop <=
                              listWindow.top +
                                listWindow.height +
                                rowHeightMode * 20;
                          if (isVisible && firstVisibleCellTop === null) {
                            firstVisibleCellTop = absoluteTop;
                          }

                          return (
                            isVisible && (
                              <React.Fragment key={col.key + item.index}>
                                <Cell
                                  index={item.index}
                                  col={col}
                                  multiSelect={multiSelect}
                                  getColumnCelBGColor={getColumnCelBGColor}
                                  columnsColorScales={columnsColorScales}
                                  isNumeric={colorScaleRange}
                                  item={
                                    col.key === '#' ? (
                                      <>
                                        <Checkbox
                                          color='primary'
                                          size='small'
                                          icon={
                                            <span className='Table__column__defaultSelectIcon'></span>
                                          }
                                          checkedIcon={
                                            <span className='Table__column__selectedSelectIcon'>
                                              <Icon name='check' fontSize={9} />
                                            </span>
                                          }
                                          className='Table__column__selectCheckbox'
                                          checked={
                                            !!selectedRows[item.selectKey]
                                          }
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onRowSelect({
                                              actionType: 'single',
                                              data: item,
                                            });
                                          }}
                                        />
                                      </>
                                    ) : (
                                      item[col.key] ||
                                      data[groupKey].data[col.key]
                                    )
                                  }
                                  groupColumnColored={
                                    !!data[groupKey].data.meta.color
                                  }
                                  className={classNames(`rowKey-${item.key}`, {
                                    inactive: item.isHidden,
                                    selected: !!selectedRows?.[item.selectKey],
                                  })}
                                  isConfigColumn={col.key === '#'}
                                  metadata={firstColumn ? item.rowMeta : null}
                                  box={{
                                    top:
                                      firstVisibleCellTop === absoluteTop
                                        ? top
                                        : null,
                                  }}
                                  onRowHover={
                                    onRowHover
                                      ? () => onRowHover(item)
                                      : undefined
                                  }
                                  onRowClick={
                                    onRowClick
                                      ? () => onRowClick(item)
                                      : undefined
                                  }
                                  setColumnWidth={fixColumnWidth}
                                />
                              </React.Fragment>
                            )
                          );
                        })}
                      </>
                    )}
                  </div>
                )
              );
            })
          : data.map((item) => {
              const top = item.index * rowHeightMode;
              const isVisible =
                top >= listWindow.top - rowHeightMode * 20 &&
                top <= listWindow.top + listWindow.height + rowHeightMode * 20;
              if (isVisible && firstVisibleCellTop === null) {
                firstVisibleCellTop = top;
              }

              return (
                isVisible && (
                  <React.Fragment key={col.key + item.index}>
                    {col.key === 'selection' ? (
                      <Cell
                        index={item.index}
                        col={col}
                        item={
                          <>
                            <Checkbox
                              color='primary'
                              size='small'
                              icon={
                                <span className='Table__column__defaultSelectIcon'></span>
                              }
                              checkedIcon={
                                <span className='Table__column__selectedSelectIcon'>
                                  <Icon name='check' fontSize={9} />
                                </span>
                              }
                              className='Table__column__selectCheckbox'
                              checked={!!selectedRows[item.selectKey]}
                              onClick={(e) => {
                                e.stopPropagation();
                                onRowSelect({
                                  data: item,
                                  actionType: 'single',
                                });
                              }}
                            />
                          </>
                        }
                        className={classNames(`rowKey-${item.key}`, {
                          inactive: item.isHidden,
                          selected: !!selectedRows?.[item.selectKey],
                        })}
                        metadata={
                          firstColumn &&
                          ((multiSelect && col.key === 'selection') ||
                            !multiSelect)
                            ? item.rowMeta
                            : null
                        }
                        box={{
                          top: firstVisibleCellTop === top ? top : null,
                        }}
                        onRowHover={
                          onRowHover ? () => onRowHover(item) : undefined
                        }
                        onRowClick={
                          onRowClick ? () => onRowClick(item) : undefined
                        }
                        setColumnWidth={fixColumnWidth}
                      />
                    ) : (
                      <Cell
                        index={item.index}
                        col={col}
                        item={item[col.key]}
                        getColumnCelBGColor={getColumnCelBGColor}
                        isNumeric={colorScaleRange}
                        columnsColorScales={columnsColorScales}
                        className={classNames(`rowKey-${item.key}`, {
                          inactive: item.isHidden,
                          selected: !!selectedRows?.[item.selectKey],
                        })}
                        metadata={
                          firstColumn &&
                          ((multiSelect && col.key === 'selection') ||
                            !multiSelect)
                            ? item.rowMeta
                            : null
                        }
                        box={{
                          top: firstVisibleCellTop === top ? top : null,
                        }}
                        onRowHover={
                          onRowHover ? () => onRowHover(item) : undefined
                        }
                        onRowClick={
                          onRowClick ? () => onRowClick(item) : undefined
                        }
                        setColumnWidth={fixColumnWidth}
                      />
                    )}
                  </React.Fragment>
                )
              );
            })}
      </div>
    </ErrorBoundary>
  );
}

function GroupConfig({
  config,
  expand,
  expanded,
  groupKey,
  multiSelect,
  onRowSelect,
  selectedRows,
  data,
}) {
  const configData = React.useMemo(() => {
    return Object.keys(config.config).map((key) => {
      return { name: key, value: config.config[key] };
    });
  }, [config.config]);

  const groupSelectedRows = React.useMemo(() => {
    return data
      .map((item) => item.selectKey)
      .filter((selectKey: string) => selectedRows[selectKey]);
  }, [data, selectedRows]);

  return (
    <ErrorBoundary>
      <div className='Table__group__config' onClick={() => expand(groupKey)}>
        <Button
          size='xSmall'
          className='Table__group__config_expandButton'
          withOnlyIcon={true}
        >
          <Text className='flex'>
            <Icon name={expanded[groupKey] ? 'arrow-up' : 'arrow-down'} />
          </Text>
        </Button>
        {multiSelect && (
          <Checkbox
            color='primary'
            size='small'
            icon={<span className='Table__column__defaultSelectIcon'></span>}
            className='Table__column__selectCheckbox configCheckbox'
            checkedIcon={
              data.length === groupSelectedRows?.length ? (
                <span className='Table__column__selectedSelectIcon'>
                  <Icon name='check' fontSize={9} />
                </span>
              ) : (
                <span className='Table__column__partiallySelectedSelectIcon'>
                  <Icon name='partially-selected' fontSize={16} />
                </span>
              )
            }
            onClick={(e) => {
              e.stopPropagation();
              onRowSelect({
                actionType: _.isEmpty(groupSelectedRows)
                  ? 'selectAll'
                  : 'removeAll',
                data: data,
              });
            }}
            checked={!_.isEmpty(groupSelectedRows)}
          />
        )}
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
                    size='xSmall'
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
        {!_.isNil(config.chartIndex) && config.chartIndex !== 0 && (
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
                  strokeDasharray: changeDasharraySize(config.dasharray, 3 / 5),
                }}
              />
            </svg>
          </Tooltip>
        )}
      </div>
    </ErrorBoundary>
  );
}

function GroupActions({ expand, expanded, groupKeys, groupKey }) {
  return (
    <ErrorBoundary>
      <ControlPopover
        anchor={({ onAnchorClick }) => (
          <Tooltip title='Expand options'>
            <div>
              <Button
                size='xSmall'
                color='secondary'
                withOnlyIcon
                onClick={onAnchorClick}
              >
                <Icon
                  className='Table__action__anchor'
                  name='more-horizontal'
                />
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
            {(expanded[groupKey] ||
              groupKeys.some((key) => !!expanded[key])) && (
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
            {(!expanded[groupKey] ||
              groupKeys.some((key) => !expanded[key])) && (
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
    </ErrorBoundary>
  );
}

export default Column;
