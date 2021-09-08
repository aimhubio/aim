// @ts-nocheck
/* eslint-disable react/prop-types */

import React from 'react';
import { Box, Grid } from '@material-ui/core';
import Button from 'components/Button/Button';
import { debounce, isEmpty, isNil } from 'lodash-es';

import { ITableProps } from 'types/components/Table/Table';
import BaseTable from './BaseTable';
import AutoResizer from './AutoResizer';
import CustomTable from '../CustomTable/Table';

import ControlPopover from 'components/ControlPopover/ControlPopover';
import HideRows from 'pages/Metrics/components/Table/HideRowsPopover/HideRowsPopover';
import RowHeight from 'pages/Metrics/components/Table/RowHeightPopover/RowHeightPopover';
import ManageColumns from 'pages/Metrics/components/Table/ManageColumnsPopover/ManageColumnsPopover';
import SortPopover from 'pages/Metrics/components/Table/SortPopover/SortPopover';
import EmptyComponent from 'components/EmptyComponent/EmptyComponent';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import Icon from 'components/Icon/Icon';

import './Table.scss';
import TableLoader from '../TableLoader/TableLoader';

const Table = React.forwardRef(function Table(
  {
    onManageColumns,
    onSort,
    onRowsChange,
    onExport,
    onRowHeightChange,
    onRowHover,
    onRowClick,
    custom,
    data,
    columns,
    navBarItems,
    rowHeight = 30,
    headerHeight = 30,
    sortOptions,
    hideHeaderActions = false,
    fixed = true,
    emptyText = 'No Data',
    excludedFields,
    setExcludedFields,
    alwaysVisibleColumns,
    rowHeightMode,
    columnsOrder,
    updateColumns,
    columnsWidths,
    updateColumnsWidths,
    sortFields,
    setSortFields,
    groups,
    isLoading,
    ...props
  }: ITableProps,
  ref,
): React.FunctionComponentElement<React.ReactNode> {
  const tableRef = React.useRef();
  const startIndex = React.useRef(0);
  const endIndex = React.useRef(0);
  const expandedGroups = React.useRef([]);
  const hoveredRowKey = React.useRef(null);
  const activeRowKey = React.useRef(null);
  const tableContainerRef = React.useRef();
  const dataRef = React.useRef(data);
  const columnsRef = React.useRef(columns);

  const [rowData, setRowData] = React.useState(data);
  const [columnsData, setColumnsData] = React.useState(columns);
  const [expanded, setExpanded] = React.useState({});

  React.useImperativeHandle(ref, () => ({
    updateData: updateData,
    setHoveredRow: setHoveredRow,
    setActiveRow: setActiveRow,
    scrollToRow: scrollToRow,
  }));

  function calculateWindow({
    scrollTop,
    offsetHeight,
    itemHeight,
    groupMargin,
  }) {
    const offset = 10;

    if (groups) {
      let beforeScrollHeight = 0;
      let scrollBottomHeight = 0;
      let start = 0;
      let end = 0;
      let startIsSet = false;
      let endIsSet = false;
      for (let groupKey in dataRef.current) {
        beforeScrollHeight += itemHeight + groupMargin;
        scrollBottomHeight += itemHeight + groupMargin;
        if (expandedGroups.current.includes(groupKey)) {
          dataRef.current[groupKey].items.forEach((row) => {
            if (scrollTop > beforeScrollHeight) {
              beforeScrollHeight += itemHeight;
            } else if (!startIsSet) {
              start = row.index;
              startIsSet = true;
            }

            if (scrollBottomHeight < scrollTop + offsetHeight) {
              scrollBottomHeight += itemHeight;
            } else if (!endIsSet) {
              end = row.index;
              endIsSet = true;
            }
          });
        } else {
          if (!endIsSet && !!dataRef.current[groupKey]?.items[0]?.index) {
            end = dataRef.current[groupKey]?.items[0]?.index;
          }
        }
      }

      const startIndex = start < offset ? 0 : start - offset;
      const endIndex = end + offset;

      return {
        startIndex,
        endIndex,
      };
    }

    const windowSize = Math.ceil(offsetHeight / itemHeight);
    const start = Math.floor(scrollTop / itemHeight);
    const startIndex = start < offset ? 0 : start - offset;
    const endIndex = start + windowSize + offset;

    return {
      startIndex,
      endIndex,
    };
  }

  function updateData({ newData, newColumns, dynamicData }) {
    if (custom && dynamicData) {
      if (!!newData) {
        dataRef.current = newData;
      }
      if (!!newColumns) {
        columnsRef.current = newColumns;
        setColumnsData(newColumns);
      }
      virtualizedUpdate();
    } else {
      if (!!newData) {
        dataRef.current = newData;
        setRowData(newData);
      }
      if (!!newColumns) {
        columnsRef.current = newColumns;
        setColumnsData(newColumns);
      }
    }
  }

  function setHoveredRow(rowKey: string) {
    window.requestAnimationFrame(() => {
      if (custom) {
        if (hoveredRowKey.current === rowKey) {
          hoveredRowKey.current = null;
        } else {
          hoveredRowKey.current = rowKey;
        }
        if (activeRowKey.current === null) {
          updateHoveredRow(`rowKey-${hoveredRowKey.current}`);
        }
      } else {
        tableRef.current?.setHoveredRow(rowKey);
      }
    });
  }

  function setActiveRow(rowKey: string, toggle = false) {
    window.requestAnimationFrame(() => {
      if (custom) {
        if (toggle && activeRowKey.current === rowKey) {
          activeRowKey.current = null;
        } else {
          activeRowKey.current = rowKey;
        }
        updateHoveredRow(`rowKey-${activeRowKey.current}`);
      } else {
        tableRef.current?.setActiveRow(rowKey);
      }
    });
  }

  function scrollToRow(rowKey: string) {
    window.requestAnimationFrame(() => {
      if (custom) {
        function scrollToElement() {
          const rowCell = document.querySelector(
            `.Table__cell.rowKey-${rowKey}`,
          );

          if (!!rowCell) {
            const top = rowCell.offsetTop - (groups ? 3 : 2) * rowHeight;
            if (
              tableContainerRef.current.scrollTop > top ||
              tableContainerRef.current.scrollTop +
                tableContainerRef.current.offsetHeight <
                top
            ) {
              tableContainerRef.current.scrollTo({
                top,
              });
            }
          }
        }
        if (groups) {
          for (let groupKey in dataRef.current) {
            if (dataRef.current[groupKey].data.groupRowsKeys.includes(rowKey)) {
              if (expandedGroups.current.includes(groupKey)) {
                scrollToElement();
              } else {
                expandedGroups.current.push(groupKey);
                setExpanded(
                  Object.fromEntries(
                    expandedGroups.current.map((key) => [key, true]),
                  ),
                );
                // TODO: probably need useEffect for this
                setTimeout(() => {
                  window.requestAnimationFrame(() => {
                    updateHoveredRow(`rowKey-${rowKey}`);
                    scrollToElement();
                  });
                }, 100);
              }
            }
          }
        } else {
          scrollToElement();
        }
      } else {
        tableRef.current?.scrollToRowByKey(rowKey);
      }
    });
  }

  function virtualizedUpdate() {
    if (groups) {
      window.requestAnimationFrame(() => {
        ['value', 'step', 'epoch', 'time'].forEach((colKey) => {
          for (let groupKey in dataRef.current) {
            const groupHeaderRowCell = document.querySelector(
              `.Table__cell.${colKey}.index-${groupKey}`,
            );
            if (!!groupHeaderRowCell) {
              const groupRow = dataRef.current[groupKey];
              if (!!groupRow && !!groupRow.data) {
                groupHeaderRowCell.textContent = groupRow.data[colKey];
                if (expandedGroups.current.includes(groupKey)) {
                  groupRow.items.forEach((row) => {
                    if (row.index > endIndex.current) {
                      return;
                    }
                    if (row.index >= startIndex.current) {
                      const cell = document.querySelector(
                        `.Table__cell.${colKey}.index-${row.index}`,
                      );
                      if (!!cell) {
                        cell.textContent = row[colKey];
                      }
                    }
                  });
                }
              }
            }
          }
        });
      });
    } else {
      window.requestAnimationFrame(() => {
        ['value', 'step', 'epoch', 'time'].forEach((colKey) => {
          for (let i = startIndex.current; i < endIndex.current; i++) {
            const cell = document.querySelector(
              `.Table__cell.${colKey}.index-${i}`,
            );
            if (!!cell) {
              const row = dataRef.current[i];
              if (!!row) {
                cell.textContent = row[colKey];
              }
            }
          }
        });
      });
    }
  }

  function onGroupExpandToggle(groupKey) {
    if (Array.isArray(groupKey)) {
      expandedGroups.current = expandedGroups.current;
    } else if (expandedGroups.current.includes(groupKey)) {
      expandedGroups.current = expandedGroups.current.filter(
        (item) => item !== groupKey,
      );
    } else {
      expandedGroups.current = expandedGroups.current.concat([groupKey]);
    }

    const windowEdges = calculateWindow({
      scrollTop: tableContainerRef.current.scrollTop,
      offsetHeight: tableContainerRef.current.offsetHeight,
      scrollHeight: tableContainerRef.current.scrollHeight,
      itemHeight: 32,
      groupMargin: 8,
    });

    startIndex.current = windowEdges.startIndex;
    endIndex.current = windowEdges.endIndex;

    virtualizedUpdate();
  }

  function rowHoverHandler(row) {
    if (activeRowKey.current === null) {
      if (typeof onRowHover === 'function') {
        onRowHover(row.key);
      }
      updateHoveredRow(`rowKey-${row.key}`);
    }
  }

  function rowClickHandler(row) {
    if (activeRowKey.current === row.key) {
      activeRowKey.current = null;
    } else {
      activeRowKey.current = row.key;
    }

    updateHoveredRow(`rowKey-${activeRowKey.current}`);

    if (typeof onRowClick === 'function') {
      onRowClick(
        activeRowKey.current === null ? undefined : activeRowKey.current,
      );
    }
  }

  function updateHoveredRow(activeRowClass) {
    if (activeRowClass !== 'rowKey-null') {
      window.requestAnimationFrame(() => {
        const prevActiveRow = document.querySelectorAll('.Table__cell.active');
        if (!!prevActiveRow && prevActiveRow.length > 0) {
          prevActiveRow.forEach((cell) => cell.classList.remove('active'));
        }

        const activeRow = document.querySelectorAll(
          `.Table__cell.${activeRowClass}`,
        );

        if (!!activeRow && activeRow.length > 0) {
          activeRow.forEach((cell) => cell.classList.add('active'));
        }
      });
    }
  }

  React.useEffect(() => {
    if (custom && !!tableContainerRef.current) {
      const windowEdges = calculateWindow({
        scrollTop: tableContainerRef.current.scrollTop,
        offsetHeight: tableContainerRef.current.offsetHeight,
        scrollHeight: tableContainerRef.current.scrollHeight,
        itemHeight: 32,
        groupMargin: 8,
      });

      startIndex.current = windowEdges.startIndex;
      endIndex.current = windowEdges.endIndex;

      virtualizedUpdate();

      tableContainerRef.current.onscroll = debounce(({ target }) => {
        const windowEdges = calculateWindow({
          scrollTop: target.scrollTop,
          offsetHeight: target.offsetHeight,
          scrollHeight: target.scrollHeight,
          itemHeight: 32,
          groupMargin: 8,
        });

        startIndex.current = windowEdges.startIndex;
        endIndex.current = windowEdges.endIndex;
        virtualizedUpdate();
        if (props.isInfiniteLoading && props.infiniteLoadHandler) {
          const index = windowEdges.endIndex - 10 - 3; // 10: offset, 3: header rows
          if (index + 5 >= rowData.length) {
            props.infiniteLoadHandler(rowData[index]);
          }
        }
      }, 100);
    }

    return () => {
      if (custom && tableContainerRef.current) {
        tableContainerRef.current.onscroll = null;
      }
    };
  }, [custom, rowData]);

  return (
    <BusyLoaderWrapper
      isLoading={isLoading || isNil(rowData)}
      loaderComponent={<TableLoader />}
      className='Tags__TagList__tagListBusyLoader'
    >
      {!isEmpty(rowData) ? (
        <Box borderColor='grey.400' borderRadius={2} style={{ height: '100%' }}>
          {!hideHeaderActions && (
            <Box component='nav' p={0.5}>
              <Grid
                container
                justifyContent='space-between'
                alignItems='center'
              >
                <Grid xs item>
                  <Grid container spacing={1}>
                    {onManageColumns && (
                      <ControlPopover
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'center',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'center',
                        }}
                        title='Manage Table Columns'
                        anchor={({ onAnchorClick, opened }) => (
                          <Grid
                            onClick={onAnchorClick}
                            className='Table__header__item'
                            item
                          >
                            <Icon name='manage-calumn' />
                            <span onClick={onManageColumns}>
                              Manage Columns
                            </span>
                          </Grid>
                        )}
                        component={<ManageColumns columnsData={columns} />}
                      />
                    )}
                    {onRowsChange && (
                      <ControlPopover
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'center',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'center',
                        }}
                        anchor={({ onAnchorClick, opened }) => (
                          <Grid
                            onClick={onAnchorClick}
                            className='Table__header__item'
                            item
                          >
                            <Icon name='eye-outline-hide' />
                            <span onClick={onSort}>Hide Rows</span>
                          </Grid>
                        )}
                        component={<HideRows />}
                      />
                    )}
                    {onSort && (
                      <ControlPopover
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'center',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'center',
                        }}
                        title='Sort table by:'
                        anchor={({ onAnchorClick }) => (
                          <Grid
                            onClick={onAnchorClick}
                            className='Table__header__item'
                            item
                          >
                            <Icon name='sort-outside' />
                            <span onClick={onSort}>Sort</span>
                          </Grid>
                        )}
                        component={<SortPopover sortOptions={sortOptions} />}
                      />
                    )}
                    {onRowHeightChange && (
                      <ControlPopover
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'center',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'center',
                        }}
                        anchor={({ onAnchorClick }) => (
                          <Grid
                            onClick={onAnchorClick}
                            className='Table__header__item'
                            item
                          >
                            <Icon name='row-height' />
                            <span onClick={onRowHeightChange}>Row Height</span>
                          </Grid>
                        )}
                        component={<RowHeight />}
                      />
                    )}
                    <Grid item xs />
                    {onExport && (
                      <Grid item xs={1}>
                        <Button
                          fullWidth
                          variant='outlined'
                          color='primary'
                          size='small'
                          onClick={onExport}
                        >
                          Export
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          )}
          <div
            style={{ height: 'calc(100% - 52px)', overflow: 'auto' }}
            ref={tableContainerRef}
          >
            <AutoResizer>
              {({ width, height }) =>
                custom ? (
                  <div style={{ width, height }}>
                    <CustomTable
                      expanded={expanded}
                      excludedFields={excludedFields}
                      setExcludedFields={setExcludedFields}
                      alwaysVisibleColumns={alwaysVisibleColumns}
                      rowHeightMode={rowHeightMode}
                      columnsOrder={columnsOrder}
                      updateColumns={() => null}
                      columnsWidths={columnsWidths}
                      updateColumnsWidths={() => null}
                      sortFields={sortFields}
                      setSortFields={setSortFields}
                      data={rowData}
                      columns={columnsData}
                      groups={groups}
                      onGroupExpandToggle={onGroupExpandToggle}
                      onRowHover={rowHoverHandler}
                      onRowClick={rowClickHandler}
                      {...props}
                    />
                  </div>
                ) : (
                  <BaseTable
                    ref={tableRef}
                    classPrefix='BaseTable'
                    columns={columnsData}
                    data={rowData}
                    frozenData={[]}
                    width={width}
                    height={height}
                    fixed={fixed}
                    rowKey='key'
                    isScrolling
                    headerHeight={headerHeight}
                    rowHeight={rowHeight}
                    footerHeight={0}
                    defaultExpandedRowKeys={[]}
                    expandColumnKey='#'
                    rowProps={({ rowIndex }) => rowData[rowIndex]?.rowProps}
                    sortBy={{}}
                    useIsScrolling={false}
                    overscanRowCount={1}
                    onEndReachedThreshold={500}
                    getScrollbarSize={() => null}
                    ignoreFunctionInColumnCompare={false}
                    onScroll={() => null}
                    onRowsRendered={() => null}
                    onScrollbarPresenceChange={() => null}
                    onRowExpand={() => null}
                    onExpandedRowsChange={() => null}
                    onColumnSort={() => null}
                    onColumnResize={() => null}
                    onColumnResizeEnd={() => null}
                    onRowHover={onRowHover}
                    onRowClick={onRowClick}
                  />
                )
              }
            </AutoResizer>
          </div>
        </Box>
      ) : (
        <EmptyComponent size='big' content={emptyText} />
      )}
    </BusyLoaderWrapper>
  );
});

export default React.memo(Table);
