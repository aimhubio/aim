// @ts-nocheck
/* eslint-disable react/prop-types */

import React from 'react';
import { Avatar, Box, Button, Chip, Grid } from '@material-ui/core';

import ITableProps from 'types/components/Table/Table';
import BaseTable from './BaseTable';
import AutoResizer from './AutoResizer';

function Table(
  props: ITableProps,
): React.FunctionComponentElement<React.ReactNode> {
  const [index, setIndex] = React.useState(0);

  const tableRef = React.useRef();

  const columns = React.useMemo(() => {
    return [
      {
        dataKey: 'experiment',
        frozen: 'left',
        key: 'experiment',
        title: 'Experiment',
        dataGetter: ({ rowData }) => rowData.run.experiment_name,
        width: 150,
        resizable: true,
      },
      {
        dataKey: 'run',
        key: 'run',
        title: 'Run',
        dataGetter: ({ rowData }) => rowData.run.name,
        width: 150,
      },
      {
        dataKey: 'metric',
        key: 'metric',
        title: 'Metric',
        dataGetter: ({ rowData }) => rowData.metric_name,
        width: 150,
      },
      {
        dataKey: 'context',
        key: 'context',
        title: 'Context',
        dataGetter: ({ rowData }) => Object.entries(rowData.context),
        cellRenderer: ({ cellData }) =>
          cellData.map((c, i) => (
            <Chip
              key={i}
              variant='outlined'
              color='primary'
              label={c.join(':')}
              size='small'
              avatar={
                <Avatar>
                  {c[0][0]}:{c[1][0]}
                </Avatar>
              }
            />
          )),
        width: 150,
      },
      {
        dataKey: 'value',
        key: 'value',
        title: 'Value',
        dataGetter: ({ rowData }) =>
          rowData.data.values[
            rowData.data.values.length > index
              ? index
              : rowData.data.values.length - 1
          ],
        width: 150,
      },
      {
        dataKey: 'iteration',
        key: 'iteration',
        title: 'Iteration',
        dataGetter: ({ rowData }) =>
          rowData.data.iterations[
            rowData.data.iterations.length > index
              ? index
              : rowData.data.iterations.length - 1
          ],
        width: 150,
      },
    ];
  }, [index]);

  React.useEffect(() => {
    setTimeout(() => {
      tableRef.current?.forceUpdateTable();
    }, 100);
  }, [columns]);

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
              data={props.data}
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
            />
          )}
        </AutoResizer>
      </Box>
    </Box>
  );
}

export default React.memo(Table);

{
  /* <BaseTable
  columns={[
    {
      dataKey: 'column_0',
      frozen: 'left',
      key: 'column-0',
      title: 'Column 0',
      width: 150,
    },
    {
      dataKey: 'column_1',
      key: 'column-1',
      title: 'Column 1',
      width: 150,
    },
    {
      dataKey: 'column_2',
      key: 'column-2',
      title: 'Column 2',
      width: 150,
    },
    {
      dataKey: 'column_3',
      frozen: 'right',
      key: 'column-3',
      title: 'Column 3',
      width: 150,
    },
  ]}
  data={[
    {
      id: 'row_0',
      column_0: 'Foo',
      column_1: 12863127,
      column_2: 345983497,
      column_3: new Date().toLocaleDateString(),
    },
  ]}
  frozenData={[]}
  width={700}
  height={400}
  fixed
  rowKey='id'
  headerHeight={30}
  rowHeight={30}
  footerHeight={0}
  defaultExpandedRowKeys={[]}
  sortBy={{}}
  useIsScrolling={false}
  overscanRowCount={1}
  onEndReachedThreshold={500}
  getScrollbarSize={() => null}
  ignoreFunctionInColumnCompare={true}
  onScroll={() => null}
  onRowsRendered={() => null}
  onScrollbarPresenceChange={() => null}
  onRowExpand={() => null}
  onExpandedRowsChange={() => null}
  onColumnSort={() => null}
  onColumnResize={() => null}
  onColumnResizeEnd={() => null}
/>; */
}
