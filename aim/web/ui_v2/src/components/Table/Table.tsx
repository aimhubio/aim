// @ts-nocheck
/* eslint-disable react/prop-types */

import React from 'react';
import { Box, Button, Grid } from '@material-ui/core';
import { isEmpty } from 'lodash-es';

import { ITableProps } from 'types/components/Table/Table';
import BaseTable from './BaseTable';
import AutoResizer from './AutoResizer';
import CustomTable from '../CustomTable/Table';

import manageColumnsIcon from 'assets/icons/table/manageColumns.svg';
import rowHeightIcon from 'assets/icons/table/rowHeight.svg';
import sortIcon from 'assets/icons/table/sort.svg';
import visibilityOffIcon from 'assets/icons/table/visibilityOff.svg';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import HideRows from 'pages/Metrics/components/Table/HideRowsPopover/HideRows';
import RowHeight from 'pages/Metrics/components/Table/RowHeightPopover/RowHeight';
import ManageColumns from 'pages/Metrics/components/Table/ManageColumnsPopover/ManageColumnsPopover';
import SortPopover from 'pages/Metrics/components/Table/SortPopover/SortPopover';
import EmptyComponent from 'components/EmptyComponent/EmptyComponent';

import './Table.scss';

const Table = React.forwardRef(function Table(
  {
    onManageColumns,
    onSort,
    onRowsChange,
    onExport,
    onRowHeightChange,
    data,
    columns,
    navBarItems,
    rowHeight = 30,
    headerHeight = 30,
    sortOptions,
    onRowHover,
    onRowClick,
    hideHeaderActions = false,
    fixed = true,
    emptyText = 'No Data',
  }: ITableProps,
  ref,
): React.FunctionComponentElement<React.ReactNode> {
  const tableRef = React.useRef();
  const scrollTop = React.useRef(0);
  const expandedGroups = React.useRef([]);
  const tableContainerRef = React.useRef();
  const [rowData, setRowData] = React.useState(data);
  const [columnsData, setColumnsData] = React.useState(columns);

  React.useImperativeHandle(ref, () => ({
    updateData: ({ newData, newColumns }) => {
      if (props.custom) {
        // tableContainerRef.current.
      } else {
        if (!!newData) {
          setRowData(newData);
        }
        if (!!newColumns) {
          setColumnsData(newColumns);
        }
      }
    },
    setHoveredRow: tableRef.current?.setHoveredRow,
    setActiveRow: tableRef.current?.setActiveRow,
    scrollToRow: tableRef.current?.scrollToRowByKey,
  }));

  React.useEffect(() => {
    if (props.custom) {
      tableContainerRef.current.onscroll = ({ target }) => {
        console.log(target.scrollHeight, target.scrollTop);
      };
    }

    return () => {
      if (props.custom && tableContainerRef.current) {
        tableContainerRef.current.onscroll = null;
      }
    };
  }, [props.custom]);

  return !isEmpty(rowData) ? (
    <Box borderColor='grey.400' borderRadius={2} style={{ height: '100%' }}>
      {!hideHeaderActions && (
        <Box component='nav' p={0.5}>
          <Grid container justifyContent='space-between' alignItems='center'>
            <Grid xs item>
              <Grid container spacing={1}>
                {onManageColumns && (
                  <ControlPopover
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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
                        <img src={manageColumnsIcon} alt='manage Columns' />
                        <span onClick={onManageColumns}>Manage Columns</span>
                      </Grid>
                    )}
                    component={<ManageColumns columnsData={columns} />}
                  />
                )}
                {onRowsChange && (
                  <ControlPopover
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'center',
                    }}
                    title='Manage Rows Visibility'
                    anchor={({ onAnchorClick, opened }) => (
                      <Grid
                        onClick={onAnchorClick}
                        className='Table__header__item'
                        item
                      >
                        <img src={visibilityOffIcon} alt='sort' />
                        <span onClick={onSort}>Hide Rows</span>
                      </Grid>
                    )}
                    component={<HideRows />}
                  />
                )}
                {onSort && (
                  <ControlPopover
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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
                        <img src={sortIcon} alt='sort' />
                        <span onClick={onSort}>Sort</span>
                      </Grid>
                    )}
                    component={<SortPopover sortOptions={sortOptions} />}
                  />
                )}
                {onRowHeightChange && (
                  <ControlPopover
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'center',
                    }}
                    title='Select Row Height'
                    anchor={({ onAnchorClick }) => (
                      <Grid
                        onClick={onAnchorClick}
                        className='Table__header__item'
                        item
                      >
                        <img src={rowHeightIcon} alt='rowHeight' />
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
            props.custom ? (
              <div style={{ width, height }}>
                <CustomTable
                  excludedFields={props.excludedFields}
                  setExcludedFields={props.setExcludedFields}
                  alwaysVisibleColumns={props.alwaysVisibleColumns}
                  rowHeightMode={props.rowHeightMode}
                  columnsOrder={props.columnsOrder}
                  updateColumns={() => null}
                  columnsWidths={props.columnsWidths}
                  updateColumnsWidths={() => null}
                  sortFields={props.sortFields}
                  setSortFields={props.setSortFields}
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
                rowProps={({ rowIndex }) => data[rowIndex]?.rowProps}
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
  );
});

export default React.memo(Table, () => true);
