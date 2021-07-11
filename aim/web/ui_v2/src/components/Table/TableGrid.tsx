import React from 'react';
import { Grid } from '@material-ui/core';
import { VariableSizeGrid } from 'react-window';
// import { AutoSizer, MultiGrid } from 'react-virtualized';

function TableGrid() {
  let leftTable = React.useRef();
  let midTable = React.useRef();
  let rightTable = React.useRef();
  function onScroll(params: { scrollTop: number }) {
    const rowIndex = Math.floor(params.scrollTop / 30);
    (leftTable?.current as any)?.scrollToItem({
      rowIndex,
    });
    (midTable?.current as any)?.scrollToItem({
      rowIndex,
    });
    (rightTable?.current as any)?.scrollToItem({
      rowIndex,
    });
  }
  return (
    <Grid item xs={12}>
      <Grid container spacing={0}>
        <Grid item>
          <Pane girdRef={leftTable} onScroll={onScroll} />
        </Grid>
        <Grid item>
          <Pane girdRef={midTable} onScroll={onScroll} />
        </Grid>
        <Grid item>
          <Pane girdRef={rightTable} onScroll={onScroll} />
        </Grid>
      </Grid>
    </Grid>
  );
}

interface ICell {
  columnIndex: number;
  rowIndex: number;
  style: {};
}

const Cell = (props: ICell) => (
  <div
    className={
      props.columnIndex % 2
        ? props.rowIndex % 2 === 0
          ? 'GridItemOdd'
          : 'GridItemEven'
        : props.rowIndex % 2
        ? 'GridItemOdd'
        : 'GridItemEven'
    }
    style={props.style}
  >
    r{props.rowIndex}, c{props.columnIndex}
  </div>
);

interface ISize {
  height: number;
  width: number;
}

// const MultiGridWrapper = (props: ISize) => {
//   React.useEffect(() => {
//     setTimeout(() => {
//       const grids = document.querySelectorAll('.ReactVirtualized__Grid');
//       // (window as any).registerScrollTarget(grids[1]);
//     });
//   }, []);

//   return (
//     <MultiGrid
//       className='Grid'
//       cellRenderer={Cell}
//       columnCount={1000}
//       columnWidth={100}
//       fixedColumnCount={2}
//       fixedRowCount={0}
//       height={props.height}
//       overscanColumnCount={1}
//       overscanRowCount={1}
//       rowCount={1000}
//       rowHeight={35}
//       width={props.width}
//     />
//   );
// };

// const TableGrid = () => (
//   <AutoSizer>
//     {(size: ISize) => (
//       <MultiGridWrapper height={size.height} width={size.width} />
//     )}
//   </AutoSizer>
// );

const Pane = (props: any) => (
  <VariableSizeGrid
    ref={props.girdRef}
    onScroll={props.onScroll}
    columnCount={3}
    columnWidth={(index: number) => 100}
    width={300}
    rowCount={1000}
    rowHeight={(index: number) => 30}
    height={200}
  >
    {Cell}
  </VariableSizeGrid>
);

export default TableGrid;
