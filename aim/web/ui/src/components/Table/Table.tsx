// @ts-nocheck
/* eslint-disable react/prop-types */

import React from 'react';
import { isEmpty, isEqual, isNil } from 'lodash-es';
import { useResizeObserver } from 'hooks';
import _ from 'lodash-es';

import { Button, Icon, Text } from 'components/kit';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';
import ResizeModeActions from 'components/ResizeModeActions/ResizeModeActions';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import {
  ROW_CELL_SIZE_CONFIG,
  RowHeightSize,
  TABLE_DEFAULT_CONFIG,
} from 'config/table/tableConfigs';
import { IllustrationsEnum } from 'config/illustrationConfig/illustrationConfig';

import SortPopover from 'pages/Metrics/components/Table/SortPopover/SortPopover';
import ManageColumnsPopover from 'pages/Metrics/components/Table/ManageColumnsPopover/ManageColumnsPopover';
import HideRowsPopover from 'pages/Metrics/components/Table/HideRowsPopover/HideRowsPopover';
import RowHeightPopover from 'pages/Metrics/components/Table/RowHeightPopover/RowHeightPopover';
import CompareSelectedRunsPopover from 'pages/Metrics/components/Table/CompareSelectedRunsPopover';
import MetricsValueKeyPopover from 'pages/Metrics/components/Table/MetricsValueKeyPopover';

import { ITableProps } from 'types/components/Table/Table';

import CustomTable from '../CustomTable/Table';

import ArchiveModal from './ArchiveModal';
import DeleteModal from './DeleteModal';
import AutoResizer from './AutoResizer';
import BaseTable from './BaseTable';

import './Table.scss';

const Table = React.forwardRef(function Table(
  {
    onManageColumns,
    onColumnsVisibilityChange,
    onTableDiffShow,
    sameValueColumns,
    onSort,
    onRowsChange,
    onExport,
    onRowHeightChange,
    onRowHover = () => {},
    onRowClick = () => {},
    onTableResizeModeChange,
    onMetricsValueKeyChange,
    metricsValueKey,
    custom,
    data,
    columns,
    navBarItems,
    rowHeight = RowHeightSize.md,
    estimatedRowHeight,
    headerHeight = RowHeightSize.md,
    sortOptions,
    hideHeaderActions = false,
    fixed = true,
    excludedFields,
    setExcludedFields,
    alwaysVisibleColumns,
    rowHeightMode,
    hiddenColumns,
    updateColumns,
    columnsWidths,
    updateColumnsWidths,
    sortFields,
    hiddenRows,
    isLoading,
    showRowClickBehaviour = true,
    showResizeContainerActionBar = true,
    resizeMode,
    onSortReset,
    height = 'calc(100% - 40px)',
    multiSelect = false,
    selectedRows,
    onRowSelect,
    minHeight,
    archiveRuns,
    deleteRuns,
    hideSystemMetrics,
    className = '',
    appName,
    hiddenChartRows,
    focusedState,
    columnsOrder,
    illustrationConfig,
    disableRowClick = false,
    onToggleColumnsColorScales,
    columnsColorScales,
    onRowsVisibilityChange,
    visualizationElementType,
    noColumnActions,
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
  const columnsRef = React.useRef(columns ?? []);
  const hiddenColumnsRef = React.useRef(hiddenColumns);
  const scrollTopMutableRef = React.useRef({ top: 0 });

  const [rowData, setRowData] = React.useState(data);
  const [columnsData, setColumnsData] = React.useState(columns ?? []);
  const [expanded, setExpanded] = React.useState({});
  const [isOpenDeleteSelectedPopup, setIsOpenDeleteSelectedPopup] =
    React.useState(false);
  const [isOpenUnarchiveSelectedPopup, setIsOpenUnarchiveSelectedPopup] =
    React.useState(false);
  const [isOpenArchiveSelectedPopup, setIsOpenArchiveSelectedPopup] =
    React.useState(false);
  const [tableBulkActionsVisibility, setTableBulkActionsVisibility] =
    React.useState<{
      delete: boolean;
      archive: boolean;
      unarchive: boolean;
      hideItems: boolean;
      showItems: boolean;
    }>({
      delete: false,
      archive: false,
      unarchive: false,
      hideItems: false,
      showItems: false,
    });
  const [listWindow, setListWindow] = React.useState({
    top: 0,
    left: 0,
    height: 0,
    width: 0,
    availableSpace: 0,
  });

  let groups = !Array.isArray(rowData);

  React.useEffect(() => {
    if (focusedState && !focusedState.active) {
      activeRowKey.current = null;
    }
  }, [focusedState]);

  React.useEffect(() => {
    updateFocusedRow(`rowKey-${activeRowKey.current}`);
  }, [selectedRows]);

  React.useEffect(() => {
    if (activeRowKey.current === null) {
      updateHoveredRow(`rowKey-${hoveredRowKey.current}`);
    } else {
      updateFocusedRow(`rowKey-${activeRowKey.current}`);
    }
  }, [listWindow]);

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
          // eslint-disable-next-line no-loop-func
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

  function updateData({ newData, newColumns, hiddenColumns, dynamicData }) {
    if (custom && dynamicData) {
      if (!!newData) {
        dataRef.current = newData;
      }
      if (!!hiddenColumns) {
        hiddenColumnsRef.current = hiddenColumns;
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
      if (!!hiddenColumns) {
        hiddenColumnsRef.current = hiddenColumns;
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
        updateFocusedRow(`rowKey-${activeRowKey.current}`);
      } else {
        tableRef.current?.setActiveRow(rowKey);
      }
    });
  }

  function scrollToRow(rowKey: string) {
    window.requestAnimationFrame(() => {
      if (custom) {
        let top = 0;
        if (groups) {
          let groupCount = 0;
          loop: for (let key in data) {
            top +=
              ROW_CELL_SIZE_CONFIG[rowHeight]?.groupMargin ??
              ROW_CELL_SIZE_CONFIG[RowHeightSize.md].groupMargins;
            for (let i = 0; i < data[key]?.items?.length; i++) {
              if (data[key].items[i].key === rowKey) {
                top += i * rowHeight;
                if (!expanded[key]) {
                  expandedGroups.current.push(key);
                  setExpanded(
                    Object.fromEntries(
                      expandedGroups.current.map((key) => [key, true]),
                    ),
                  );
                }
                break loop;
              }
            }
            top +=
              rowHeight +
              ((ROW_CELL_SIZE_CONFIG[rowHeight]?.groupMargin ??
                ROW_CELL_SIZE_CONFIG[RowHeightSize.md].groupMargin) /
                2) *
                groupCount;
            if (expanded[key]) {
              top += data[key].items.length * rowHeight;
            }
            groupCount++;
          }
        } else {
          for (let i = 0; i < data?.length; i++) {
            if (data[i].key === rowKey) {
              top = i * rowHeight;
              break;
            }
          }
        }

        if (
          tableContainerRef.current &&
          (tableContainerRef.current.scrollTop > top ||
            tableContainerRef.current.scrollTop +
              tableContainerRef.current.offsetHeight <
              top)
        ) {
          setTimeout(() => {
            window.requestAnimationFrame(() => {
              tableContainerRef.current.scrollTo({
                top,
              });
            });
          }, 100);
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
                if (colKey === 'value') {
                  groupHeaderRowCell.children[0].children[0].children[0].textContent =
                    groupRow.data.aggregation.area.min;
                  groupHeaderRowCell.children[0].children[0].children[1].textContent =
                    groupRow.data.aggregation.line;
                  groupHeaderRowCell.children[0].children[0].children[2].textContent =
                    groupRow.data.aggregation.area.max;
                  if (!isNil(groupRow.data.aggregation.area.stdDevValue)) {
                    groupHeaderRowCell.children[0].children[0].children[3].textContent =
                      groupRow.data.aggregation.area.stdDevValue;
                  }
                  if (!isNil(groupRow.data.aggregation.area.stdErrValue)) {
                    groupHeaderRowCell.children[0].children[0].children[3].textContent =
                      groupRow.data.aggregation.area.stdErrValue;
                  }
                } else {
                  groupHeaderRowCell.textContent = groupRow.data[colKey];
                }
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
      expandedGroups.current = groupKey;
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
      itemHeight: rowHeight,
      groupMargin:
        ROW_CELL_SIZE_CONFIG[rowHeight]?.groupMargin ??
        ROW_CELL_SIZE_CONFIG[RowHeightSize.md].groupMargin,
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
      hoveredRowKey.current = row.key;
      updateHoveredRow(`rowKey-${row.key}`);
    }
  }

  function rowClickHandler(row) {
    if (showRowClickBehaviour) {
      if (activeRowKey.current === row.key) {
        activeRowKey.current = null;
      } else {
        activeRowKey.current = row.key;
      }

      updateFocusedRow(`rowKey-${activeRowKey.current}`);
    }

    if (typeof onRowClick === 'function') {
      onRowClick(
        activeRowKey.current === null ? undefined : activeRowKey.current,
      );
    }
  }

  function updateHoveredRow(activeRowClass) {
    const prevActiveRow = document.querySelectorAll('.Table__cell.focused');
    if (!!prevActiveRow && prevActiveRow.length > 0) {
      prevActiveRow.forEach((cell) => cell.classList.remove('focused'));
    }
    if (activeRowClass !== 'rowKey-null') {
      window.requestAnimationFrame(() => {
        const prevHoveredRow = document.querySelectorAll(
          '.Table__cell.hovered',
        );
        if (!!prevHoveredRow && prevHoveredRow.length > 0) {
          prevHoveredRow.forEach((cell) => cell.classList.remove('hovered'));
        }

        const activeRow = document.querySelectorAll(
          `.Table__cell.${activeRowClass}`,
        );

        if (!!activeRow && activeRow.length > 0) {
          activeRow.forEach((cell) => cell.classList.add('hovered'));
        }
      });
    }
  }

  function updateFocusedRow(activeRowClass) {
    const prevHoveredRow = document.querySelectorAll('.Table__cell.hovered');
    if (!!prevHoveredRow && prevHoveredRow.length > 0) {
      prevHoveredRow.forEach((cell) => cell.classList.remove('hovered'));
    }
    if (activeRowClass !== 'rowKey-null') {
      window.requestAnimationFrame(() => {
        const prevActiveRow = document.querySelectorAll('.Table__cell.focused');
        if (!!prevActiveRow && prevActiveRow.length > 0) {
          prevActiveRow.forEach((cell) => cell.classList.remove('focused'));
        }

        const activeRow = document.querySelectorAll(
          `.Table__cell.${activeRowClass}`,
        );

        if (!!activeRow && activeRow.length > 0) {
          activeRow.forEach((cell) => cell.classList.add('focused'));
        }
      });
    }
  }

  function setListWindowMeasurements() {
    const leftPane =
      tableContainerRef.current?.querySelector('.Table__pane--left');
    const rightPane = tableContainerRef.current?.querySelector(
      '.Table__pane--right',
    );
    let availableSpace = tableContainerRef.current?.offsetWidth ?? 0;

    if (leftPane || rightPane) {
      availableSpace =
        tableContainerRef.current.offsetWidth -
        (leftPane?.offsetWidth ?? 0) -
        (rightPane?.offsetWidth ?? 0) -
        32; // the selection section (checkboxes)
    }

    setListWindow({
      top: tableContainerRef.current?.scrollTop,
      left: tableContainerRef.current?.scrollLeft,
      height: tableContainerRef.current?.offsetHeight,
      width: tableContainerRef.current?.offsetWidth,
      availableSpace,
    });
  }

  function onToggleDeletePopup() {
    setIsOpenDeleteSelectedPopup(!isOpenDeleteSelectedPopup);
  }

  function onToggleArchivePopup() {
    setIsOpenArchiveSelectedPopup(!isOpenArchiveSelectedPopup);
  }

  function onToggleUnarchivePopup() {
    setIsOpenUnarchiveSelectedPopup(!isOpenUnarchiveSelectedPopup);
  }

  function onHideSelectedItems() {
    onBatchRowsVisibilityChange('hide');
  }

  function onShowSelectedItems() {
    onBatchRowsVisibilityChange('show');
  }

  function onBatchRowsVisibilityChange(changeMode: 'hide' | 'show') {
    let data: any[] = [];
    const selectedRowsValues = Object.values(selectedRows);
    selectedRowsValues.forEach((selectedRow: any) => {
      if (changeMode === 'hide') {
        if (!selectedRow.isHidden) {
          data.push(selectedRow.key);
        }
      } else {
        if (selectedRow.isHidden) {
          data.push(selectedRow.key);
        }
      }
    });

    onRowsVisibilityChange(data);
    onRowSelect({ actionType: 'removeAll', data: selectedRowsValues });
  }

  React.useEffect(() => {
    if (custom && !!tableContainerRef.current) {
      const windowEdges = calculateWindow({
        scrollTop: tableContainerRef.current.scrollTop,
        offsetHeight: tableContainerRef.current.offsetHeight,
        scrollHeight: tableContainerRef.current.scrollHeight,
        itemHeight: rowHeight,
        groupMargin:
          ROW_CELL_SIZE_CONFIG[rowHeight]?.groupMargin ??
          ROW_CELL_SIZE_CONFIG[RowHeightSize.md].groupMargin,
      });

      startIndex.current = windowEdges.startIndex;
      endIndex.current = windowEdges.endIndex;

      virtualizedUpdate();

      tableContainerRef.current.onscroll = ({ target }) => {
        const windowEdges = calculateWindow({
          scrollTop: target.scrollTop,
          offsetHeight: target.offsetHeight,
          scrollHeight: target.scrollHeight,
          itemHeight: rowHeight,
          groupMargin:
            ROW_CELL_SIZE_CONFIG[rowHeight]?.groupMargin ??
            ROW_CELL_SIZE_CONFIG[RowHeightSize.md].groupMargin,
        });

        startIndex.current = windowEdges.startIndex;
        endIndex.current = windowEdges.endIndex;
        virtualizedUpdate();

        const isDownScrolling =
          scrollTopMutableRef.current.top < target.scrollTop;
        scrollTopMutableRef.current.top = target.scrollTop;

        if (
          props.allowInfiniteLoading &&
          props.infiniteLoadHandler &&
          isDownScrolling
        ) {
          if (
            target.scrollTop + target.offsetHeight >
            target.scrollHeight - 2 * rowHeight
          ) {
            props.infiniteLoadHandler();
          }
        }
        setListWindowMeasurements();
      };
    }

    return () => {
      if (custom && tableContainerRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        tableContainerRef.current.onscroll = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [custom, rowData]);

  React.useEffect(() => {
    if (custom) {
      setListWindowMeasurements();
    }
  }, [custom, columnsWidths, rowData]);

  React.useEffect(() => {
    if (custom) {
      requestAnimationFrame(() => {
        if (!activeRowKey.current) {
          updateHoveredRow(
            `rowKey-${
              activeRowKey.current
                ? activeRowKey.current
                : hoveredRowKey.current
            }`,
          );
        }
      });
    }
  }, [custom, listWindow]);

  const observerReturnCallback = React.useCallback(() => {
    setListWindowMeasurements();
  }, []);

  React.useEffect(() => {
    const tableBulkActionsVisibility: {
      delete: boolean;
      archive: boolean;
      unarchive: boolean;
      hideItems: boolean;
      showItems: boolean;
    } = {
      delete: false,
      archive: false,
      unarchive: false,
      hideItems: false,
      showItems: false,
    };
    const values = Object.values(selectedRows || {});
    values.forEach((value) => {
      if (
        !tableBulkActionsVisibility.delete ||
        !tableBulkActionsVisibility.archive ||
        !tableBulkActionsVisibility.unarchive ||
        !tableBulkActionsVisibility.hideItems ||
        !tableBulkActionsVisibility.showItems
      ) {
        if (value.archived) {
          tableBulkActionsVisibility.archive = true;
        } else {
          tableBulkActionsVisibility.unarchive = true;
        }
        if (value.end_time) {
          tableBulkActionsVisibility.delete = true;
        }
        if (onRowsVisibilityChange) {
          if (value.isHidden) {
            tableBulkActionsVisibility.showItems = true;
          } else {
            tableBulkActionsVisibility.hideItems = true;
          }
        }
      }
    });

    setTableBulkActionsVisibility(tableBulkActionsVisibility);
  }, [selectedRows, onRowsVisibilityChange]);

  const sortPopoverChanged: boolean = React.useMemo(() => {
    return (
      TABLE_DEFAULT_CONFIG[appName as Exclude<AppNameEnum, 'runs'>]?.sortFields
        ?.length !== sortFields?.length
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortFields]);

  useResizeObserver(
    observerReturnCallback,
    tableContainerRef,
    sortPopoverChanged,
  );

  const isDiffButtonDisabled: boolean = React.useMemo(() => {
    if (sameValueColumns) {
      let filteredColumns: string[] = sameValueColumns?.filter(
        (value) =>
          !TABLE_DEFAULT_CONFIG[appName].nonHidableColumns.has(value) &&
          !hiddenColumns?.includes(value),
      );
      return !filteredColumns.length;
    }
  }, [appName, sameValueColumns, hiddenColumns]);

  const selectedRunsQuery: string = React.useMemo(() => {
    if (!_.isEmpty(selectedRows)) {
      return `run.hash in [${_.uniq(
        Object.values(selectedRows)?.map((row: any) => `"${row.runHash}"`),
      ).join(',')}]`;
    }
  }, [selectedRows]);

  // The right check is !props.isInfiniteLoading && (isLoading || isNil(rowData))
  // but after setting isInfiniteLoading to true, the rowData becomes null, unnecessary renders happening
  // @TODO sanitize this point
  return (
    <ErrorBoundary>
      {!isEmpty(rowData) ? (
        <div style={{ height: '100%', width: '100%' }} className={className}>
          {!hideHeaderActions && isEmpty(selectedRows) ? (
            <div className='Table__header'>
              {showResizeContainerActionBar && (
                <ResizeModeActions
                  resizeMode={resizeMode}
                  onTableResizeModeChange={onTableResizeModeChange}
                />
              )}

              <div className='flex fac Table__header__buttons'>
                {onManageColumns && (
                  <ManageColumnsPopover
                    columnsData={columnsData.filter(
                      (item: any) => item.key !== '#' && item.key !== 'actions',
                    )}
                    columnsOrder={columnsOrder}
                    hiddenColumns={hiddenColumns}
                    hideSystemMetrics={hideSystemMetrics}
                    onManageColumns={onManageColumns}
                    onColumnsVisibilityChange={onColumnsVisibilityChange}
                    appName={appName}
                  />
                )}
                {onRowsChange && (
                  <HideRowsPopover
                    toggleRowsVisibility={onRowsChange}
                    visualizationElementType={visualizationElementType}
                    data={dataRef.current}
                  />
                )}
                {onSort && (
                  <ControlPopover
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                    transformOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                    title='Sort table by:'
                    anchor={({ onAnchorClick, opened }) => (
                      <Button
                        type='text'
                        color='secondary'
                        size='small'
                        onClick={onAnchorClick}
                        className={`Table__header__item ${
                          opened || sortPopoverChanged ? 'opened' : ''
                        }`}
                      >
                        <Icon name='sort-outside' />
                        <Text size={14} tint={100}>
                          Sort
                        </Text>
                      </Button>
                    )}
                    component={
                      <SortPopover
                        sortOptions={sortOptions}
                        sortFields={sortFields}
                        onSort={onSort}
                        onReset={onSortReset}
                      />
                    }
                  />
                )}
                {onRowHeightChange && (
                  <RowHeightPopover
                    rowHeight={rowHeight}
                    onRowHeightChange={onRowHeightChange}
                    appName={appName}
                  />
                )}
                {onMetricsValueKeyChange && (
                  <MetricsValueKeyPopover
                    metricsValueKey={metricsValueKey}
                    onMetricsValueKeyChange={onMetricsValueKeyChange}
                    appName={appName}
                  />
                )}
              </div>
              {onTableDiffShow && (
                <Button
                  size='small'
                  variant='outlined'
                  className='Table__header__item--diffBtn'
                  disabled={isDiffButtonDisabled}
                  onClick={onTableDiffShow}
                >
                  Show Table Diff
                </Button>
              )}
              {onExport && (
                <div className='fac'>
                  <Button
                    fullWidth
                    variant='outlined'
                    size='small'
                    onClick={onExport}
                    startIcon={<Icon fontSize={14} name='download' />}
                  >
                    <Text size={14} color='inherit'>
                      Export
                    </Text>
                  </Button>
                </div>
              )}
            </div>
          ) : !hideHeaderActions && !isEmpty(selectedRows) && multiSelect ? (
            <div className='Table__header selectedRowActionsContainer'>
              <div className='selectedRowActionsContainer__selectedRowsCount'>
                <Text size={14} tint={50}>
                  {Object.keys(selectedRows).length} Selected
                </Text>
              </div>
              {tableBulkActionsVisibility.delete && (
                <div className='selectedRowActionsContainer__selectedItemsDelete'>
                  <Button
                    color='secondary'
                    type='text'
                    size='small'
                    onClick={onToggleDeletePopup}
                    className={`Table__header__item ${
                      isOpenDeleteSelectedPopup ? 'opened' : ''
                    }`}
                  >
                    <Icon name='delete' />
                    <Text size={14} tint={100}>
                      Delete
                    </Text>
                  </Button>
                </div>
              )}
              {tableBulkActionsVisibility.unarchive && (
                <div className='selectedRowActionsContainer__selectedItemsArchive'>
                  <Button
                    color='secondary'
                    type='text'
                    size='small'
                    onClick={onToggleArchivePopup}
                    className={`Table__header__item ${
                      isOpenArchiveSelectedPopup ? 'opened' : ''
                    }`}
                  >
                    <Icon name='archive' />
                    <Text size={14} tint={100}>
                      Archive
                    </Text>
                  </Button>
                </div>
              )}
              {tableBulkActionsVisibility.archive && (
                <div className='selectedRowActionsContainer__selectedItemsArchive'>
                  <Button
                    color='secondary'
                    type='text'
                    size='small'
                    onClick={onToggleUnarchivePopup}
                    className={`Table__header__item ${
                      isOpenUnarchiveSelectedPopup ? 'opened' : ''
                    }`}
                  >
                    <Icon name='unarchive' fontSize={18} />
                    <Text size={14} tint={100}>
                      Unarchive
                    </Text>
                  </Button>
                </div>
              )}
              {tableBulkActionsVisibility.hideItems && (
                <div>
                  <Button
                    color='secondary'
                    type='text'
                    size='small'
                    onClick={onHideSelectedItems}
                    className='Table__header__item'
                  >
                    <Icon name='eye-outline-hide' fontSize={14} />
                    <Text size={14} tint={100}>
                      {`Hide ${visualizationElementType}s`}
                    </Text>
                  </Button>
                </div>
              )}
              {tableBulkActionsVisibility.showItems && (
                <div>
                  <Button
                    color='secondary'
                    type='text'
                    onClick={onShowSelectedItems}
                    className='Table__header__item'
                  >
                    <Icon name='eye-show-outline' fontSize={14} />
                    <Text size={14} tint={100}>
                      {`Show ${visualizationElementType}s`}
                    </Text>
                  </Button>
                </div>
              )}
              <div>
                <CompareSelectedRunsPopover
                  appName={appName}
                  query={selectedRunsQuery}
                />
              </div>
            </div>
          ) : (
            ''
          )}
          <div
            style={{
              height,
              overflow: 'auto',
              minHeight: minHeight || 'unset',
            }}
            ref={tableContainerRef}
          >
            <AutoResizer>
              {({ width, height }) =>
                custom ? (
                  <div style={{ width, height }}>
                    <ErrorBoundary>
                      <CustomTable
                        expanded={expanded}
                        alwaysVisibleColumns={alwaysVisibleColumns}
                        rowHeightMode={rowHeight}
                        updateColumns={onManageColumns}
                        columnsWidths={columnsWidths}
                        updateColumnsWidths={updateColumnsWidths}
                        sortFields={sortFields}
                        setSortFields={onSort}
                        excludedFields={hiddenColumns}
                        setExcludedFields={onColumnsVisibilityChange}
                        hiddenRows={hiddenRows}
                        data={rowData}
                        columns={columnsData.filter((col) => !col.isHidden)}
                        onGroupExpandToggle={onGroupExpandToggle}
                        onRowHover={rowHoverHandler}
                        onRowClick={
                          showRowClickBehaviour ? rowClickHandler : undefined
                        }
                        listWindow={listWindow}
                        multiSelect={multiSelect}
                        selectedRows={selectedRows || {}}
                        onRowSelect={onRowSelect}
                        columnsColorScales={columnsColorScales}
                        onToggleColumnsColorScales={onToggleColumnsColorScales}
                        noColumnActions={noColumnActions}
                        {...props}
                      />
                    </ErrorBoundary>
                  </div>
                ) : (
                  <ErrorBoundary>
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
                      estimatedRowHeight={estimatedRowHeight}
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
                      disableRowClick={disableRowClick}
                    />
                  </ErrorBoundary>
                )
              }
            </AutoResizer>
          </div>
          <ArchiveModal
            opened={isOpenArchiveSelectedPopup}
            onClose={onToggleArchivePopup}
            selectedRows={selectedRows}
            archiveMode
            onRowSelect={onRowSelect}
            archiveRuns={archiveRuns}
          />
          <ArchiveModal
            opened={isOpenUnarchiveSelectedPopup}
            onClose={onToggleUnarchivePopup}
            selectedRows={selectedRows}
            onRowSelect={onRowSelect}
            archiveRuns={archiveRuns}
          />
          <DeleteModal
            opened={isOpenDeleteSelectedPopup}
            onClose={onToggleDeletePopup}
            selectedRows={selectedRows}
            onRowSelect={onRowSelect}
            deleteRuns={deleteRuns}
          />
        </div>
      ) : (
        <IllustrationBlock
          page={illustrationConfig?.page || 'metrics'}
          type={illustrationConfig?.type || IllustrationsEnum.EmptyData}
          size={illustrationConfig?.size || 'xLarge'}
          content={illustrationConfig?.content || ''}
          title={illustrationConfig?.title || ''}
          showImage={illustrationConfig?.showImage}
        />
      )}
    </ErrorBoundary>
  );
});

function propsComparator(
  prevProps: ITableProps,
  nextProps: ITableProps,
): boolean {
  // Add custom here checks here

  if (prevProps.isLoading !== nextProps.isLoading) {
    return false;
  }

  if (prevProps.rowHeight !== nextProps.rowHeight) {
    return false;
  }

  if (prevProps.metricsValueKey !== nextProps.metricsValueKey) {
    return false;
  }

  if (prevProps.sortFields !== nextProps.sortFields) {
    return false;
  }

  if (prevProps.resizeMode !== nextProps.resizeMode) {
    return false;
  }

  if (prevProps.columnsWidths !== nextProps.columnsWidths) {
    return false;
  }

  if (prevProps.selectedRows !== nextProps.selectedRows) {
    return false;
  }

  if (prevProps.hiddenColumns !== nextProps.hiddenColumns) {
    return false;
  }

  if (prevProps.hiddenChartRows !== nextProps.hiddenChartRows) {
    return false;
  }

  if (prevProps.columnsOrder !== nextProps.columnsOrder) {
    return false;
  }

  if (prevProps.focusedState?.active !== nextProps.focusedState?.active) {
    return false;
  }

  if (prevProps.columnsColorScales !== nextProps.columnsColorScales) {
    return false;
  }

  if (!isEqual(prevProps.illustrationConfig, nextProps.illustrationConfig)) {
    return false;
  }

  return true;
}

export default React.memo(Table, propsComparator);
