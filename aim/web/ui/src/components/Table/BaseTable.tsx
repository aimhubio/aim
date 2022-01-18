// @ts-nocheck
/* eslint-disable react/prop-types */

import React from 'react';
import memoize from 'memoize-one';
import cn from 'classnames';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { getValue } from 'utils/helper';

import GridTable from './GridTable';
import TableHeaderRow from './TableHeaderRow';
import TableRow from './TableRow';
import TableHeaderCell from './TableHeaderCell';
import TableCell from './TableCell';
import Column, { Alignment, FrozenDirection } from './Column';
import SortOrder from './SortOrder';
import ExpandIcon from './ExpandIcon';
import SortIndicator from './SortIndicator';
import ColumnResizer from './ColumnResizer';
import ColumnManager from './ColumnManager';
import {
  renderElement,
  normalizeColumns,
  getEstimatedTotalRowsHeight,
  isObjectEqual,
  callOrReturn,
  hasChildren,
  flattenOnKeys,
  cloneArray,
  throttle,
  debounce,
  noop,
} from './utils';

import './BaseTable.scss';

const getColumns = memoize(
  (columns, children) => columns || normalizeColumns(children),
);

const getContainerStyle = (width, maxWidth, height) => ({
  width,
  maxWidth,
  height,
  overflow: 'hidden',
});

const DEFAULT_COMPONENTS = {
  TableCell,
  TableHeaderCell,
  ExpandIcon,
  SortIndicator,
};

const RESIZE_THROTTLE_WAIT = 50;

// used for memoization
const EMPTY_ARRAY: void[] = [];

/**
 * React table component // TODO: change to function component
 */
class BaseTable extends React.PureComponent {
  constructor(props) {
    super(props);

    const { columns, children, defaultExpandedRowKeys } = props;
    this.state = {
      scrollbarSize: 0,
      hoveredRowKey: null,
      activeRowKey: null,
      resizingKey: null,
      resizingWidth: 0,
      expandedRowKeys: cloneArray(defaultExpandedRowKeys),
    };
    this.columnManager = new ColumnManager(
      getColumns(columns, children),
      props.fixed,
    );

    this._setContainerRef = this._setContainerRef.bind(this);
    this._setMainTableRef = this._setMainTableRef.bind(this);
    this._setLeftTableRef = this._setLeftTableRef.bind(this);
    this._setRightTableRef = this._setRightTableRef.bind(this);

    this.renderExpandIcon = this.renderExpandIcon.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.renderRowCell = this.renderRowCell.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderHeaderCell = this.renderHeaderCell.bind(this);

    this._handleScroll = this._handleScroll.bind(this);
    this._handleVerticalScroll = this._handleVerticalScroll.bind(this);
    this._handleRowsRendered = this._handleRowsRendered.bind(this);
    this._handleRowHover = this._handleRowHover.bind(this);
    this._handleRowClick = this._handleRowClick.bind(this);
    this._handleRowExpand = this._handleRowExpand.bind(this);
    this._handleColumnResize = throttle(
      this._handleColumnResize.bind(this),
      RESIZE_THROTTLE_WAIT,
    );
    this._handleColumnResizeStart = this._handleColumnResizeStart.bind(this);
    this._handleColumnResizeStop = this._handleColumnResizeStop.bind(this);
    this._handleColumnSort = this._handleColumnSort.bind(this);
    this._handleFrozenRowHeightChange =
      this._handleFrozenRowHeightChange.bind(this);
    this._handleRowHeightChange = this._handleRowHeightChange.bind(this);

    this._getLeftTableContainerStyle = memoize(getContainerStyle);
    this._getRightTableContainerStyle = memoize(getContainerStyle);
    this._flattenOnKeys = memoize((tree, keys, dataKey) => {
      this._depthMap = {};
      return flattenOnKeys(tree, keys, this._depthMap, dataKey);
    });
    this._resetColumnManager = memoize(
      (columns, fixed) => {
        this.columnManager.reset(columns, fixed);

        if (this.props.estimatedRowHeight && fixed) {
          if (!this.columnManager.hasLeftFrozenColumns()) {
            this._leftRowHeightMap = {};
          }
          if (!this.columnManager.hasRightFrozenColumns()) {
            this._rightRowHeightMap = {};
          }
        }
      },
      (newArgs, lastArgs) =>
        isObjectEqual(
          newArgs,
          lastArgs,
          this.props.ignoreFunctionInColumnCompare,
        ),
    );

    this._isResetting = false;
    this._resetIndex = null;
    this._rowHeightMap = {};
    this._rowHeightMapBuffer = {};
    this._mainRowHeightMap = {};
    this._leftRowHeightMap = {};
    this._rightRowHeightMap = {};
    this._getEstimatedTotalRowsHeight = memoize(getEstimatedTotalRowsHeight);
    this._getRowHeight = this._getRowHeight.bind(this);
    this._updateRowHeights = debounce(() => {
      this._isResetting = true;
      this._rowHeightMap = {
        ...this._rowHeightMap,
        ...this._rowHeightMapBuffer,
      };
      this.resetAfterRowIndex(this._resetIndex, false);
      this._rowHeightMapBuffer = {};
      this._resetIndex = null;
      this.forceUpdateTable();
      this.forceUpdate();
      this._isResetting = false;
    }, 0);

    this._scroll = { scrollLeft: 0, scrollTop: 0 };
    this._scrollHeight = 0;
    this._lastScannedRowIndex = -1;
    this._hasDataChangedSinceEndReached = true;

    this._data = props.data;
    this._depthMap = {};

    this._horizontalScrollbarSize = 0;
    this._verticalScrollbarSize = 0;
    this._scrollbarPresenceChanged = false;
  }

  /**
   * Get the DOM node of the table
   */
  getDOMNode() {
    return this.tableNode;
  }

  /**
   * Get the column manager
   */
  getColumnManager() {
    return this.columnManager;
  }

  /**
   * Get internal `expandedRowKeys` state
   */
  getExpandedRowKeys() {
    const { expandedRowKeys } = this.props;
    return expandedRowKeys !== undefined
      ? expandedRowKeys || EMPTY_ARRAY
      : this.state.expandedRowKeys;
  }

  /**
   * Get the expanded state, fallback to normal state if not expandable.
   */
  getExpandedState() {
    return {
      expandedData: this._data,
      expandedRowKeys: this.getExpandedRowKeys(),
      expandedDepthMap: this._depthMap,
    };
  }

  /**
   * Get the total height of all rows, including expanded rows.
   */
  getTotalRowsHeight() {
    const { rowHeight, estimatedRowHeight } = this.props;

    if (estimatedRowHeight) {
      return this.table
        ? this.table.getTotalRowsHeight()
        : this._getEstimatedTotalRowsHeight(this._data, estimatedRowHeight);
    }
    return this._data.length * rowHeight;
  }

  /**
   * Get the total width of all columns.
   */
  getTotalColumnsWidth() {
    return this.columnManager.getColumnsWidth();
  }

  /**
   * Forcefully re-render the inner Grid component.
   *
   * Calling `forceUpdate` on `Table` may not re-render the inner Grid since it uses `shallowCompare` as a performance optimization.
   * Use this method if you want to manually trigger a re-render.
   * This may be appropriate if the underlying row data has changed but the row sizes themselves have not.
   */
  forceUpdateTable() {
    this.table && this.table.forceUpdateTable();
    this.leftTable && this.leftTable.forceUpdateTable();
    this.rightTable && this.rightTable.forceUpdateTable();
  }

  /**
   * Reset cached offsets for positioning after a specific rowIndex, should be used only in dynamic mode(estimatedRowHeight is provided)
   *
   * @param {number} rowIndex
   * @param {boolean} shouldForceUpdate
   */
  resetAfterRowIndex(rowIndex = 0, shouldForceUpdate = true) {
    if (!this.props.estimatedRowHeight) return;

    this.table && this.table.resetAfterRowIndex(rowIndex, shouldForceUpdate);
    this.leftTable &&
      this.leftTable.resetAfterRowIndex(rowIndex, shouldForceUpdate);
    this.rightTable &&
      this.rightTable.resetAfterRowIndex(rowIndex, shouldForceUpdate);
  }

  /**
   * Reset row height cache, useful if `data` changed entirely, should be used only in dynamic mode(estimatedRowHeight is provided)
   */
  resetRowHeightCache() {
    if (!this.props.estimatedRowHeight) return;

    this._resetIndex = null;
    this._rowHeightMapBuffer = {};
    this._rowHeightMap = {};
    this._mainRowHeightMap = {};
    this._leftRowHeightMap = {};
    this._rightRowHeightMap = {};
  }

  /**
   * Scroll to the specified offset.
   * Useful for animating position changes.
   *
   * @param {object} offset
   */
  scrollToPosition(offset) {
    this._scroll = offset;

    this.table && this.table.scrollToPosition(offset);
    this.leftTable && this.leftTable.scrollToTop(offset.scrollTop);
    this.rightTable && this.rightTable.scrollToTop(offset.scrollTop);
  }

  /**
   * Scroll to the specified offset vertically.
   *
   * @param {number} scrollTop
   */
  scrollToTop(scrollTop) {
    this._scroll.scrollTop = scrollTop;

    this.table && this.table.scrollToPosition(this._scroll);
    this.leftTable && this.leftTable.scrollToTop(scrollTop);
    this.rightTable && this.rightTable.scrollToTop(scrollTop);
  }

  /**
   * Scroll to the specified offset horizontally.
   *
   * @param {number} scrollLeft
   */
  scrollToLeft(scrollLeft) {
    this._scroll.scrollLeft = scrollLeft;

    this.table && this.table.scrollToPosition(this._scroll);
  }

  /**
   * Scroll to the specified row.
   * By default, the table will scroll as little as possible to ensure the row is visible.
   * You can control the alignment of the row though by specifying an align property. Acceptable values are:
   *
   * - `auto` (default) - Scroll as little as possible to ensure the row is visible.
   * - `smart` - Same as `auto` if it is less than one viewport away, or it's the same as`center`.
   * - `center` - Center align the row within the table.
   * - `end` - Align the row to the bottom side of the table.
   * - `start` - Align the row to the top side of the table.
   *
   * @param {number} rowIndex
   * @param {string} align
   */
  scrollToRow(rowIndex = 0, align = 'auto') {
    this.table && this.table.scrollToRow(rowIndex, align);
    this.leftTable && this.leftTable.scrollToRow(rowIndex, align);
    this.rightTable && this.rightTable.scrollToRow(rowIndex, align);
  }

  scrollToRowByKey = (rowKey) => {
    let rowIndex = 0;
    for (let i = 0; i < this.props.data.length; i++) {
      if (this.props.data[i].key === rowKey) {
        rowIndex = i;
        break;
      }
    }

    this.scrollToRow(rowIndex, 'smart');
  };

  /**
   * Set `expandedRowKeys` manually.
   * This method is available only if `expandedRowKeys` is uncontrolled.
   *
   * @param {array} expandedRowKeys
   */
  setExpandedRowKeys(expandedRowKeys) {
    // if `expandedRowKeys` is controlled
    if (this.props.expandedRowKeys !== undefined) return;

    this.setState({
      expandedRowKeys: cloneArray(expandedRowKeys),
    });
  }

  /**
   * Set `hoveredRowKey` manually.
   *
   * @param {string} rowKey
   */
  setHoveredRow = (rowKey) => {
    this.setState({ hoveredRowKey: rowKey });
  };

  /**
   * Set `activeRowKey` manually.
   *
   * @param {string} rowKey
   */
  setActiveRow = (rowKey) => {
    this.setState({ activeRowKey: rowKey });
  };

  renderExpandIcon({ rowData, rowIndex, depth, onExpand }) {
    const { rowKey, expandColumnKey, expandIconProps } = this.props;
    if (!expandColumnKey) return null;

    const expandable = rowIndex >= 0 && hasChildren(rowData);
    const expanded =
      rowIndex >= 0 && this.getExpandedRowKeys().indexOf(rowData[rowKey]) >= 0;
    const extraProps = callOrReturn(expandIconProps, {
      rowData,
      rowIndex,
      depth,
      expandable,
      expanded,
    });
    const ExpandIcon = this._getComponent('ExpandIcon');

    return (
      <ExpandIcon
        depth={depth}
        expandable={expandable}
        expanded={expanded}
        {...extraProps}
        onExpand={onExpand}
      />
    );
  }

  renderRow({ isScrolling, columns, rowData, rowIndex, style }) {
    const {
      rowClassName,
      rowRenderer,
      rowEventHandlers,
      expandColumnKey,
      estimatedRowHeight,
    } = this.props;

    const rowClass = callOrReturn(rowClassName, { columns, rowData, rowIndex });
    const extraProps = callOrReturn(this.props.rowProps, {
      columns,
      rowData,
      rowIndex,
    });
    const rowKey = rowData[this.props.rowKey];
    const depth = this._depthMap[rowKey] || 0;

    const className = cn(this._prefixClass('row'), rowClass, {
      [this._prefixClass(`row--depth-${depth}`)]:
        !!expandColumnKey && rowIndex >= 0,
      [this._prefixClass('row--expanded')]:
        !!expandColumnKey && this.getExpandedRowKeys().indexOf(rowKey) >= 0,
      [this._prefixClass('row--hovered')]:
        !isScrolling && rowKey === this.state.hoveredRowKey,
      [this._prefixClass('row--frozen')]: depth === 0 && rowIndex < 0,
      [this._prefixClass('row--customized')]: rowRenderer,
    });

    const hasFrozenColumns = this.columnManager.hasFrozenColumns();
    const rowProps = {
      ...extraProps,
      role: 'row',
      key: `row-${rowKey}`,
      isScrolling,
      className,
      style: {
        ...style,
        ...rowData?.rowProps?.style,
      },
      columns,
      rowIndex,
      rowData,
      rowKey,
      expandColumnKey,
      depth,
      rowEventHandlers,
      rowRenderer,
      // for frozen rows we use fixed rowHeight
      estimatedRowHeight: rowIndex >= 0 ? estimatedRowHeight : undefined,
      getIsResetting: this._getIsResetting,
      cellRenderer: this.renderRowCell,
      expandIconRenderer: this.renderExpandIcon,
      onRowExpand: this._handleRowExpand,
      // for fixed table, we need to sync the hover state across the inner tables
      onRowHover: this._handleRowHover,
      onRowClick: this._handleRowClick,
      onRowHeightChange: hasFrozenColumns
        ? this._handleFrozenRowHeightChange
        : this._handleRowHeightChange,
    };

    return <TableRow {...rowProps} />;
  }

  renderRowCell({
    isScrolling,
    columns,
    column,
    columnIndex,
    rowData,
    rowIndex,
    expandIcon,
  }) {
    if (column[ColumnManager.PlaceholderKey]) {
      return (
        <ErrorBoundary
          key={`row-${rowData[this.props.rowKey]}-cell-${
            column.key
          }-placeholder`}
        >
          <div
            className={this._prefixClass('row-cell-placeholder')}
            style={this.columnManager.getColumnStyle(column.key)}
          />
        </ErrorBoundary>
      );
    }

    const { className, dataKey, dataGetter, cellRenderer } = column;
    const TableCell = this._getComponent('TableCell');

    const cellData = dataGetter
      ? dataGetter({ columns, column, columnIndex, rowData, rowIndex })
      : getValue(rowData, dataKey);
    const cellProps = {
      isScrolling,
      cellData,
      columns,
      column,
      columnIndex,
      rowData,
      rowIndex,
      container: this,
    };
    const cell = renderElement(
      cellRenderer || (
        <TableCell className={this._prefixClass('row-cell-text')} />
      ),
      cellProps,
    );

    const cellCls = callOrReturn(className, {
      cellData,
      columns,
      column,
      columnIndex,
      rowData,
      rowIndex,
    });
    const cls = cn(this._prefixClass('row-cell'), cellCls, {
      [this._prefixClass('row-cell--align-center')]:
        column.align === Alignment.CENTER,
      [this._prefixClass('row-cell--align-right')]:
        column.align === Alignment.RIGHT,
    });

    const extraProps = callOrReturn(this.props.cellProps, {
      columns,
      column,
      columnIndex,
      rowData,
      rowIndex,
    });
    const { tagName, ...rest } = extraProps || {};
    const Tag = tagName || 'div';
    return (
      <Tag
        role='gridcell'
        key={`row-${rowData[this.props.rowKey]}-cell-${column.key}`}
        {...rest}
        className={cls}
        style={this.columnManager.getColumnStyle(column.key)}
      >
        {expandIcon}
        {cell}
      </Tag>
    );
  }

  renderHeader({ columns, headerIndex, style }) {
    const { headerClassName, headerRenderer } = this.props;

    const headerClass = callOrReturn(headerClassName, { columns, headerIndex });
    const extraProps = callOrReturn(this.props.headerProps, {
      columns,
      headerIndex,
    });

    const className = cn(this._prefixClass('header-row'), headerClass, {
      [this._prefixClass('header-row--resizing')]: !!this.state.resizingKey,
      [this._prefixClass('header-row--customized')]: headerRenderer,
    });

    const headerProps = {
      ...extraProps,
      role: 'row',
      key: `header-${headerIndex}`,
      className,
      style,
      columns,
      headerIndex,
      headerRenderer,
      cellRenderer: this.renderHeaderCell,
      expandColumnKey: this.props.expandColumnKey,
      expandIcon: this._getComponent('ExpandIcon'),
    };

    return <TableHeaderRow {...headerProps} />;
  }

  renderHeaderCell({ columns, column, columnIndex, headerIndex, expandIcon }) {
    if (column[ColumnManager.PlaceholderKey]) {
      return (
        <div
          key={`header-${headerIndex}-cell-${column.key}-placeholder`}
          className={this._prefixClass('header-cell-placeholder')}
          style={this.columnManager.getColumnStyle(column.key)}
        />
      );
    }

    const { headerClassName, headerRenderer } = column;
    const { sortBy, sortState, headerCellProps } = this.props;
    const TableHeaderCell = this._getComponent('TableHeaderCell');
    const SortIndicator = this._getComponent('SortIndicator');

    const cellProps = {
      columns,
      column,
      columnIndex,
      headerIndex,
      container: this,
    };
    const cell = renderElement(
      headerRenderer || (
        <TableHeaderCell className={this._prefixClass('header-cell-text')} />
      ),
      cellProps,
    );

    let sorting, sortOrder;

    if (sortState) {
      const order = sortState[column.key];
      sorting = order === SortOrder.ASC || order === SortOrder.DESC;
      sortOrder = sorting ? order : SortOrder.ASC;
    } else {
      sorting = column.key === sortBy.key;
      sortOrder = sorting ? sortBy.order : SortOrder.ASC;
    }

    const cellCls = callOrReturn(headerClassName, {
      columns,
      column,
      columnIndex,
      headerIndex,
    });
    const cls = cn(this._prefixClass('header-cell'), cellCls, {
      [this._prefixClass('header-cell--align-center')]:
        column.align === Alignment.CENTER,
      [this._prefixClass('header-cell--align-right')]:
        column.align === Alignment.RIGHT,
      [this._prefixClass('header-cell--sortable')]: column.sortable,
      [this._prefixClass('header-cell--sorting')]: sorting,
      [this._prefixClass('header-cell--resizing')]:
        column.key === this.state.resizingKey,
    });
    const extraProps = callOrReturn(headerCellProps, {
      columns,
      column,
      columnIndex,
      headerIndex,
    });
    const { tagName, ...rest } = extraProps || {};
    const Tag = tagName || 'div';
    return (
      <ErrorBoundary key={`header-${headerIndex}-cell-${column.key}`}>
        <Tag
          role='gridcell'
          onClick={column.sortable ? this._handleColumnSort : null}
          {...rest}
          className={cls}
          style={this.columnManager.getColumnStyle(column.key)}
          data-key={column.key}
        >
          {expandIcon}
          {cell}
          {column.sortable && (
            <SortIndicator
              sortOrder={sortOrder}
              className={cn(this._prefixClass('sort-indicator'), {
                [this._prefixClass('sort-indicator--descending')]:
                  sortOrder === SortOrder.DESC,
              })}
            />
          )}
          {column.resizable && (
            <ColumnResizer
              className={this._prefixClass('column-resizer')}
              column={column}
              onResizeStart={this._handleColumnResizeStart}
              onResizeStop={this._handleColumnResizeStop}
              onResize={this._handleColumnResize}
            />
          )}
        </Tag>
      </ErrorBoundary>
    );
  }

  renderMainTable() {
    const {
      width,
      headerHeight,
      rowHeight,
      fixed,
      estimatedRowHeight,
      ...rest
    } = this.props;
    const height = this._getTableHeight();

    let tableWidth = width - this._verticalScrollbarSize;
    if (fixed) {
      const columnsWidth = this.columnManager.getColumnsWidth();
      // make sure `scrollLeft` is always integer to fix a sync bug when scrolling to end horizontally
      tableWidth = Math.max(Math.round(columnsWidth), tableWidth);
    }
    return (
      <ErrorBoundary>
        <GridTable
          {...rest}
          {...this.state}
          className={this._prefixClass('table-main')}
          ref={this._setMainTableRef}
          data={this._data}
          columns={this.columnManager.getMainColumns()}
          width={width}
          height={height}
          headerHeight={headerHeight}
          rowHeight={rowHeight}
          estimatedRowHeight={estimatedRowHeight}
          getRowHeight={estimatedRowHeight ? this._getRowHeight : undefined}
          headerWidth={tableWidth + (fixed ? this._verticalScrollbarSize : 0)}
          bodyWidth={tableWidth}
          headerRenderer={this.renderHeader}
          rowRenderer={this.renderRow}
          onScroll={this._handleScroll}
          onRowsRendered={this._handleRowsRendered}
        />
      </ErrorBoundary>
    );
  }

  renderLeftTable() {
    if (!this.columnManager.hasLeftFrozenColumns()) return null;

    const { width, headerHeight, rowHeight, estimatedRowHeight, ...rest } =
      this.props;

    const containerHeight = this._getFrozenContainerHeight();
    const offset = this._verticalScrollbarSize || 20;
    const columnsWidth = this.columnManager.getLeftFrozenColumnsWidth();
    return (
      <ErrorBoundary>
        <GridTable
          {...rest}
          {...this.state}
          containerStyle={this._getLeftTableContainerStyle(
            columnsWidth,
            width,
            containerHeight,
          )}
          className={this._prefixClass('table-frozen-left')}
          ref={this._setLeftTableRef}
          data={this._data}
          columns={this.columnManager.getLeftFrozenColumns()}
          initialScrollTop={this._scroll.scrollTop}
          width={columnsWidth + offset}
          height={containerHeight}
          headerHeight={headerHeight}
          rowHeight={rowHeight}
          estimatedRowHeight={estimatedRowHeight}
          getRowHeight={estimatedRowHeight ? this._getRowHeight : undefined}
          headerWidth={columnsWidth + offset}
          bodyWidth={columnsWidth + offset}
          headerRenderer={this.renderHeader}
          rowRenderer={this.renderRow}
          onScroll={this._handleVerticalScroll}
          onRowsRendered={noop}
        />
      </ErrorBoundary>
    );
  }

  renderRightTable() {
    if (!this.columnManager.hasRightFrozenColumns()) return null;

    const { width, headerHeight, rowHeight, estimatedRowHeight, ...rest } =
      this.props;

    const containerHeight = this._getFrozenContainerHeight();
    const columnsWidth = this.columnManager.getRightFrozenColumnsWidth();
    const scrollbarWidth = this._verticalScrollbarSize;
    return (
      <ErrorBoundary>
        <GridTable
          {...rest}
          {...this.state}
          containerStyle={this._getLeftTableContainerStyle(
            columnsWidth + scrollbarWidth,
            width,
            containerHeight,
          )}
          className={this._prefixClass('table-frozen-right')}
          ref={this._setRightTableRef}
          data={this._data}
          columns={this.columnManager.getRightFrozenColumns()}
          initialScrollTop={this._scroll.scrollTop}
          width={columnsWidth + scrollbarWidth}
          height={containerHeight}
          headerHeight={headerHeight}
          rowHeight={rowHeight}
          estimatedRowHeight={estimatedRowHeight}
          getRowHeight={estimatedRowHeight ? this._getRowHeight : undefined}
          headerWidth={columnsWidth + scrollbarWidth}
          bodyWidth={columnsWidth}
          headerRenderer={this.renderHeader}
          rowRenderer={this.renderRow}
          onScroll={this._handleVerticalScroll}
          onRowsRendered={noop}
        />
      </ErrorBoundary>
    );
  }

  renderResizingLine() {
    const { width, fixed } = this.props;
    const { resizingKey } = this.state;
    if (!fixed || !resizingKey) return null;

    const columns = this.columnManager.getMainColumns();
    const idx = columns.findIndex((column) => column.key === resizingKey);
    const column = columns[idx];
    const { width: columnWidth, frozen } = column;
    const leftWidth = this.columnManager.recomputeColumnsWidth(
      columns.slice(0, idx),
    );

    let left = leftWidth + columnWidth;
    if (!frozen) {
      left -= this._scroll.scrollLeft;
    } else if (frozen === FrozenDirection.RIGHT) {
      const rightWidth = this.columnManager.recomputeColumnsWidth(
        columns.slice(idx + 1),
      );
      if (rightWidth + columnWidth > width - this._verticalScrollbarSize) {
        left = columnWidth;
      } else {
        left = width - this._verticalScrollbarSize - rightWidth;
      }
    }
    const style = {
      left,
      height: this._getTableHeight() - this._horizontalScrollbarSize,
    };
    return <div className={this._prefixClass('resizing-line')} style={style} />;
  }

  renderFooter() {
    const { footerHeight, footerRenderer } = this.props;
    if (footerHeight === 0) return null;
    return (
      <div
        className={this._prefixClass('footer')}
        style={{ height: footerHeight }}
      >
        {renderElement(footerRenderer)}
      </div>
    );
  }

  renderEmptyLayer() {
    const { data, frozenData, footerHeight, emptyRenderer } = this.props;

    if ((data && data.length) || (frozenData && frozenData.length)) return null;
    const headerHeight = this._getHeaderHeight();
    return (
      <div
        className={this._prefixClass('empty-layer')}
        style={{ top: headerHeight, bottom: footerHeight }}
      >
        {renderElement(emptyRenderer)}
      </div>
    );
  }

  renderOverlay() {
    const { overlayRenderer } = this.props;

    return (
      <div className={this._prefixClass('overlay')}>
        {!!overlayRenderer && renderElement(overlayRenderer)}
      </div>
    );
  }

  render() {
    const {
      columns,
      children,
      width,
      fixed,
      data,
      frozenData,
      expandColumnKey,
      disabled,
      className,
      style,
      footerHeight,
      classPrefix,
      estimatedRowHeight,
    } = this.props;
    this._resetColumnManager(getColumns(columns, children), fixed);

    const _data = expandColumnKey
      ? this._flattenOnKeys(data, this.getExpandedRowKeys(), this.props.rowKey)
      : data;
    if (this._data !== _data) {
      this.resetAfterRowIndex(0, false);
      this._data = _data;
    }
    // should be after `this._data` assigned
    this._calcScrollbarSizes();
    this._totalRowsHeight = this.getTotalRowsHeight();

    const containerStyle = {
      ...style,
      width,
      height: this._getTableHeight() + footerHeight,
      position: 'relative',
    };
    const cls = cn(classPrefix, className, {
      [`${classPrefix}--fixed`]: fixed,
      [`${classPrefix}--expandable`]: !!expandColumnKey,
      [`${classPrefix}--empty`]: data.length === 0,
      [`${classPrefix}--has-frozen-rows`]: frozenData.length > 0,
      [`${classPrefix}--has-frozen-columns`]:
        this.columnManager.hasFrozenColumns(),
      [`${classPrefix}--disabled`]: disabled,
      [`${classPrefix}--dynamic`]: !!estimatedRowHeight,
    });
    return (
      <div ref={this._setContainerRef} className={cls} style={containerStyle}>
        {this.renderFooter()}
        {this.renderMainTable()}
        {this.renderLeftTable()}
        {this.renderRightTable()}
        {this.renderResizingLine()}
        {this.renderEmptyLayer()}
        {this.renderOverlay()}
      </div>
    );
  }

  componentDidMount() {
    const scrollbarSize = this.props.getScrollbarSize();
    if (scrollbarSize > 0) {
      this.setState({ scrollbarSize });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { data, height, maxHeight, estimatedRowHeight } = this.props;
    if (data !== prevProps.data) {
      this._lastScannedRowIndex = -1;
      this._hasDataChangedSinceEndReached = true;
    }

    if (maxHeight !== prevProps.maxHeight || height !== prevProps.height) {
      this._maybeCallOnEndReached();
    }
    this._maybeScrollbarPresenceChange();

    if (estimatedRowHeight) {
      if (this.getTotalRowsHeight() !== this._totalRowsHeight) {
        this.forceUpdate();
      }
    }
  }

  _prefixClass(className) {
    return `${this.props.classPrefix}__${className}`;
  }

  _setContainerRef(ref) {
    this.tableNode = ref;
  }

  _setMainTableRef(ref) {
    this.table = ref;
  }

  _setLeftTableRef(ref) {
    this.leftTable = ref;
  }

  _setRightTableRef(ref) {
    this.rightTable = ref;
  }

  _getComponent(name) {
    if (this.props.components && this.props.components[name])
      return this.props.components[name];
    return DEFAULT_COMPONENTS[name];
  }

  // for dynamic row height
  _getRowHeight(rowIndex) {
    const { estimatedRowHeight, rowKey } = this.props;
    return (
      this._rowHeightMap[this._data[rowIndex][rowKey]] ||
      callOrReturn(estimatedRowHeight, {
        rowData: this._data[rowIndex],
        rowIndex,
      })
    );
  }

  _getIsResetting() {
    return this._isResetting;
  }

  _getHeaderHeight() {
    const { headerHeight } = this.props;
    if (Array.isArray(headerHeight)) {
      return headerHeight.reduce((sum, height) => sum + height, 0);
    }
    return headerHeight;
  }

  _getFrozenRowsHeight() {
    const { frozenData, rowHeight } = this.props;
    return frozenData.length * rowHeight;
  }

  _getTableHeight() {
    const { height, maxHeight, footerHeight } = this.props;
    let tableHeight = height - footerHeight;

    if (maxHeight > 0) {
      const frozenRowsHeight = this._getFrozenRowsHeight();
      const totalRowsHeight = this.getTotalRowsHeight();
      const headerHeight = this._getHeaderHeight();
      const totalHeight =
        headerHeight +
        frozenRowsHeight +
        totalRowsHeight +
        this._horizontalScrollbarSize;
      tableHeight = Math.min(totalHeight, maxHeight - footerHeight);
    }

    return tableHeight;
  }

  _getBodyHeight() {
    return (
      this._getTableHeight() -
      this._getHeaderHeight() -
      this._getFrozenRowsHeight()
    );
  }

  _getFrozenContainerHeight() {
    const { maxHeight } = this.props;

    const tableHeight =
      this._getTableHeight() -
      (this._data.length > 0 ? this._horizontalScrollbarSize : 0);
    // in auto height mode tableHeight = totalHeight
    if (maxHeight > 0) return tableHeight;

    const totalHeight =
      this.getTotalRowsHeight() +
      this._getHeaderHeight() +
      this._getFrozenRowsHeight();
    return Math.min(tableHeight, totalHeight);
  }

  _calcScrollbarSizes() {
    const { fixed, width } = this.props;
    const { scrollbarSize } = this.state;

    const totalRowsHeight = this.getTotalRowsHeight();
    const totalColumnsWidth = this.getTotalColumnsWidth();

    const prevHorizontalScrollbarSize = this._horizontalScrollbarSize;
    const prevVerticalScrollbarSize = this._verticalScrollbarSize;

    if (scrollbarSize === 0) {
      this._horizontalScrollbarSize = 0;
      this._verticalScrollbarSize = 0;
    } else {
      // we have to set `this._horizontalScrollbarSize` before calling `this._getBodyHeight`
      if (!fixed || totalColumnsWidth <= width - scrollbarSize) {
        this._horizontalScrollbarSize = 0;
        this._verticalScrollbarSize =
          totalRowsHeight > this._getBodyHeight() ? scrollbarSize : 0;
      } else {
        if (totalColumnsWidth > width) {
          this._horizontalScrollbarSize = scrollbarSize;
          this._verticalScrollbarSize =
            totalRowsHeight >
            this._getBodyHeight() - this._horizontalScrollbarSize
              ? scrollbarSize
              : 0;
        } else {
          this._horizontalScrollbarSize = 0;
          this._verticalScrollbarSize = 0;
          if (totalRowsHeight > this._getBodyHeight()) {
            this._horizontalScrollbarSize = scrollbarSize;
            this._verticalScrollbarSize = scrollbarSize;
          }
        }
      }
    }

    if (
      prevHorizontalScrollbarSize !== this._horizontalScrollbarSize ||
      prevVerticalScrollbarSize !== this._verticalScrollbarSize
    ) {
      this._scrollbarPresenceChanged = true;
    }
  }

  _maybeScrollbarPresenceChange() {
    if (this._scrollbarPresenceChanged) {
      const { onScrollbarPresenceChange } = this.props;
      this._scrollbarPresenceChanged = false;

      onScrollbarPresenceChange({
        size: this.state.scrollbarSize,
        horizontal: this._horizontalScrollbarSize > 0,
        vertical: this._verticalScrollbarSize > 0,
      });
    }
  }

  _maybeCallOnEndReached() {
    const { onEndReached, onEndReachedThreshold } = this.props;
    const { scrollTop } = this._scroll;
    const scrollHeight = this.getTotalRowsHeight();
    const clientHeight = this._getBodyHeight();

    if (!onEndReached || !clientHeight || !scrollHeight) return;
    const distanceFromEnd =
      scrollHeight - scrollTop - clientHeight + this._horizontalScrollbarSize;
    if (
      this._lastScannedRowIndex >= 0 &&
      distanceFromEnd <= onEndReachedThreshold &&
      (this._hasDataChangedSinceEndReached ||
        scrollHeight !== this._scrollHeight)
    ) {
      this._hasDataChangedSinceEndReached = false;
      this._scrollHeight = scrollHeight;
      onEndReached({ distanceFromEnd });
    }
  }

  _handleScroll(args) {
    const lastScrollTop = this._scroll.scrollTop;
    this.scrollToPosition(args);
    this.props.onScroll(args);

    if (args.scrollTop > lastScrollTop) this._maybeCallOnEndReached();
  }

  _handleVerticalScroll({ scrollTop }) {
    const lastScrollTop = this._scroll.scrollTop;

    if (scrollTop !== lastScrollTop) this.scrollToTop(scrollTop);
    if (scrollTop > lastScrollTop) this._maybeCallOnEndReached();
  }

  _handleRowsRendered(args) {
    this.props.onRowsRendered(args);

    if (args.overscanStopIndex > this._lastScannedRowIndex) {
      this._lastScannedRowIndex = args.overscanStopIndex;
      this._maybeCallOnEndReached();
    }
  }

  _handleRowHover({ rowKey, hovered }) {
    if (this.state.activeRowKey !== null) {
      return;
    }

    this.setHoveredRow(hovered ? rowKey : null);
    if (typeof this.props.onRowHover === 'function') {
      this.props.onRowHover(hovered ? rowKey : undefined);
    }
  }

  _handleRowClick({ rowKey }) {
    const clickedOnSameRow = this.state.activeRowKey === rowKey;
    this.setState({
      hoveredRowKey: rowKey,
      activeRowKey: clickedOnSameRow ? null : rowKey,
    });
    if (typeof this.props.onRowClick === 'function') {
      this.props.onRowClick(clickedOnSameRow ? undefined : rowKey);
    }
  }

  _handleRowExpand({ expanded, rowData, rowIndex, rowKey }) {
    const expandedRowKeys = cloneArray(this.getExpandedRowKeys());
    if (expanded) {
      if (!expandedRowKeys.indexOf(rowKey) >= 0) expandedRowKeys.push(rowKey);
    } else {
      const index = expandedRowKeys.indexOf(rowKey);
      if (index > -1) {
        expandedRowKeys.splice(index, 1);
      }
    }
    // if `expandedRowKeys` is uncontrolled, update internal state
    if (this.props.expandedRowKeys === undefined) {
      this.setState({ expandedRowKeys });
    }
    this.props.onRowExpand({ expanded, rowData, rowIndex, rowKey });
    this.props.onExpandedRowsChange(expandedRowKeys);
  }

  _handleColumnResize({ key }, width) {
    this.columnManager.setColumnWidth(key, width);
    this.setState({ resizingWidth: width });

    const column = this.columnManager.getColumn(key);
    this.props.onColumnResize({ column, width });
  }

  _handleColumnResizeStart({ key }) {
    this.setState({ resizingKey: key });
  }

  _handleColumnResizeStop() {
    const { resizingKey, resizingWidth } = this.state;
    this.setState({ resizingKey: null, resizingWidth: 0 });

    if (!resizingKey || !resizingWidth) return;

    const column = this.columnManager.getColumn(resizingKey);
    this.props.onColumnResizeEnd({ column, width: resizingWidth });
  }

  _handleColumnSort(event) {
    const key = event.currentTarget.dataset.key;
    const { sortBy, sortState, onColumnSort } = this.props;
    let order = SortOrder.ASC;

    if (sortState) {
      order = sortState[key] === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC;
    } else if (key === sortBy.key) {
      order = sortBy.order === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC;
    }

    const column = this.columnManager.getColumn(key);
    onColumnSort({ column, key, order });
  }

  _handleFrozenRowHeightChange(rowKey, size, rowIndex, frozen) {
    if (!frozen) {
      this._mainRowHeightMap[rowKey] = size;
    } else if (frozen === FrozenDirection.RIGHT) {
      this._rightRowHeightMap[rowKey] = size;
    } else {
      this._leftRowHeightMap[rowKey] = size;
    }

    const height = Math.max(
      this._mainRowHeightMap[rowKey] || 0,
      this._leftRowHeightMap[rowKey] || 0,
      this._rightRowHeightMap[rowKey] || 0,
    );

    if (this._rowHeightMap[rowKey] !== height) {
      this._handleRowHeightChange(rowKey, height, rowIndex);
    }
  }

  _handleRowHeightChange(rowKey, size, rowIndex) {
    if (this._resetIndex === null) this._resetIndex = rowIndex;
    else if (this._resetIndex > rowIndex) this._resetIndex = rowIndex;

    this._rowHeightMapBuffer[rowKey] = size;
    this._updateRowHeights();
  }
}

BaseTable.Column = Column;
BaseTable.PlaceholderKey = ColumnManager.PlaceholderKey;

export default BaseTable;
