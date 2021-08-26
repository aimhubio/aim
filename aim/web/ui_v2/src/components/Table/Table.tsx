// @ts-nocheck
/* eslint-disable react/prop-types */

import React from 'react';
import { Box, Button, Grid } from '@material-ui/core';

import { ITableProps } from 'types/components/Table/Table';
import BaseTable from './BaseTable';
import AutoResizer from './AutoResizer';

import manageColumnsIcon from 'assets/icons/table/manageColumns.svg';
import rowHeightIcon from 'assets/icons/table/rowHeight.svg';
import sortIcon from 'assets/icons/table/sort.svg';
import visibilityOffIcon from 'assets/icons/table/visibilityOff.svg';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import HideRows from 'pages/Metrics/components/Table/HideRowsPopover/HideRows';
import RowHeight from 'pages/Metrics/components/Table/RowHeightPopover/RowHeight';
import ManageColumns from 'pages/Metrics/components/Table/ManageColumnsPopover/ManageColumnsPopover';
import SortPopover from 'pages/Metrics/components/Table/SortPopover/SortPopover';

import './Table.scss';

const Table = React.forwardRef(function Table(
  props: ITableProps,
  ref,
): React.FunctionComponentElement<React.ReactNode> {
  const tableRef = React.useRef();
  const [data, setData] = React.useState(props.data);
  const [columns, setColumns] = React.useState(props.columns);

  React.useImperativeHandle(ref, () => ({
    updateData: ({ newData, newColumns }) => {
      if (!!newData) {
        setData(newData);
      }
      if (!!newColumns) {
        setColumns(newColumns);
      }
      // tableRef.current?.forceUpdateTable();
    },
    setHoveredRow: tableRef.current?.setHoveredRow,
    setActiveRow: tableRef.current?.setActiveRow,
    scrollToRow: tableRef.current?.scrollToRowByKey,
  }));

  return (
    <Box borderColor='grey.400' borderRadius={2} style={{ height: '100%' }}>
      <Box component='nav' p={0.5}>
        <Grid container justifyContent='space-between' alignItems='center'>
          <Grid xs item>
            <Grid container spacing={1}>
              {props.onManageColumns && (
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
                      <span onClick={props.onManageColumns}>
                        Manage Columns
                      </span>
                    </Grid>
                  )}
                  component={<ManageColumns columnsData={columns} />}
                />
              )}
              {props.onRowsChange && (
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
                      <span onClick={props.onSort}>Hide Rows</span>
                    </Grid>
                  )}
                  component={<HideRows />}
                />
              )}
              {props.onSort && (
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
                      <span onClick={props.onSort}>Sort</span>
                    </Grid>
                  )}
                  component={<SortPopover sortOptions={props.sortOptions} />}
                />
              )}
              {props.onRowHeightChange && (
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
                      <span onClick={props.onRowHeightChange}>Row Height</span>
                    </Grid>
                  )}
                  component={<RowHeight />}
                />
              )}
              <Grid item xs />
              {props.onExport && (
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
      <Box style={{ height: 'calc(100% - 44px)' }}>
        <AutoResizer>
          {({ width, height }) => (
            <BaseTable
              ref={tableRef}
              classPrefix='BaseTable'
              columns={columns}
              data={data}
              frozenData={[]}
              width={width}
              height={height}
              fixed
              rowKey='key'
              headerHeight={30}
              rowHeight={props.rowHeight}
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
              onRowHover={props.onRowHover}
              onRowClick={props.onRowClick}
            />
          )}
        </AutoResizer>
      </Box>
    </Box>
  );
});

export default React.memo(Table);
