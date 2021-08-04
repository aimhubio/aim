// @ts-nocheck
/* eslint-disable react/prop-types */

import React from 'react';
import { Box, Button, Grid } from '@material-ui/core';

import { ITableProps } from 'types/components/Table/Table';
import BaseTable from './BaseTable';
import AutoResizer from './AutoResizer';

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
  }));

  return (
    <Box borderColor='grey.400' borderRadius={2} style={{ height: '100%' }}>
      <Box component='nav' p={0.5}>
        <Grid container justify='space-between' alignItems='center'>
          <Grid xs item>
            <Grid container spacing={1}>
              {props.onManageColumns && (
                <Grid xs={1} item>
                  <Button
                    fullWidth
                    variant='outlined'
                    color='primary'
                    size='small'
                    onClick={props.onManageColumns}
                  >
                    Manage Columns
                  </Button>
                </Grid>
              )}
              {props.onRowsChange && (
                <Grid xs={1} item>
                  <Button
                    fullWidth
                    variant='outlined'
                    color='primary'
                    size='small'
                    onClick={props.onRowsChange}
                  >
                    Hide Rows
                  </Button>
                </Grid>
              )}
              {props.onSort && (
                <Grid xs={1} item>
                  <Button
                    fullWidth
                    variant='outlined'
                    color='primary'
                    size='small'
                    onClick={props.onSort}
                  >
                    Sort
                  </Button>
                </Grid>
              )}
              {props.onRowHeightChange && (
                <Grid xs={1} item>
                  <Button
                    fullWidth
                    variant='outlined'
                    color='primary'
                    size='small'
                    onClick={props.onRowHeightChange}
                  >
                    Row Height
                  </Button>
                </Grid>
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
              rowHeight={30}
              footerHeight={0}
              defaultExpandedRowKeys={[]}
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
