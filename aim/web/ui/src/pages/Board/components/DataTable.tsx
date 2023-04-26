// @ts-nocheck
/*eslint-disable */

import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import Grid, {
  IChildrenProps,
  Cell as DefaultCell,
  useSelection,
  useEditable,
  useSizer as useAutoSizer,
  useTooltip,
  Direction,
  SelectionProps,
  Selection,
} from '@rowsncolumns/grid';
import { Rect, Text, Group, RegularPolygon } from 'react-konva';
import { useMeasure } from 'react-use';

export default ({ data }) => {
  const dragHandleWidth = 2;
  const DraggableRect = (props) => {
    return (
      <Rect
        fill='#1473e6'
        draggable
        hitStrokeWidth={20}
        onMouseEnter={() => (document.body.style.cursor = 'ew-resize')}
        onMouseLeave={() => (document.body.style.cursor = 'default')}
        dragBoundFunc={(pos) => {
          return {
            ...pos,
            y: 0,
          };
        }}
        {...props}
      />
    );
  };
  const HeaderComponent = ({
    rowIndex,
    columnIndex,
    x,
    y,
    width,
    height,
    onResize,
  }) => {
    const text = Object.keys(data[0])[columnIndex];
    const fill = '#eee';
    return (
      <Group>
        <Rect
          x={x}
          y={y}
          height={height}
          width={width}
          fill={fill}
          stroke='grey'
          strokeWidth={0.5}
        />
        <Text
          x={x}
          y={y}
          height={height}
          width={width}
          text={text}
          fontStyle='bold'
          verticalAlign='middle'
          align='center'
        />
        <DraggableRect
          x={x + width - dragHandleWidth}
          y={y}
          width={dragHandleWidth}
          height={height}
          onDragMove={(e) => {
            const node = e.target;
            const newWidth = node.x() - x + dragHandleWidth;

            onResize(columnIndex, newWidth);
          }}
        />
      </Group>
    );
  };
  const Cell = ({
    rowIndex,
    columnIndex,
    x,
    y,
    width,
    height,
    key,
  }: IChildrenProps) => {
    const text = data[rowIndex][Object.keys(data[0])[columnIndex]];
    const fill = 'white';
    return (
      <React.Fragment key={key}>
        <Rect
          x={x}
          y={y}
          height={height}
          width={width}
          fill={fill}
          stroke='grey'
          strokeWidth={0.5}
        />
        <Text
          x={x}
          y={y}
          height={height}
          width={width}
          text={text}
          fontStyle='normal'
          verticalAlign='middle'
          align='center'
        />
      </React.Fragment>
    );
  };
  const columnCount = Object.keys(data[0] ?? {}).length;
  const rowCount = data.length;

  const gridRef = useRef();
  const mainGridRef = useRef();
  const [containerRef, { width, height }] = useMeasure();
  const [columnWidthMap, setColumnWidthMap] = useState({});
  const handleResize = (columnIndex, newWidth) => {
    setColumnWidthMap((prev) => {
      return {
        ...prev,
        [columnIndex]: newWidth,
      };
    });
    gridRef.current.resizeColumns([columnIndex]);
    mainGridRef.current.resizeColumns([columnIndex]);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
      }}
      ref={containerRef}
    >
      <Grid
        columnCount={columnCount}
        height={20}
        rowCount={1}
        ref={gridRef}
        width={width}
        columnWidth={(index) => {
          if (index in columnWidthMap) return columnWidthMap[index];
          return 200;
        }}
        rowHeight={(index) => 20}
        showScrollbar={false}
        itemRenderer={(props) => (
          <HeaderComponent onResize={handleResize} {...props} />
        )}
      />
      <Grid
        columnCount={columnCount}
        rowCount={rowCount}
        height={height - 20}
        width={width}
        ref={mainGridRef}
        columnWidth={(index) => {
          if (index in columnWidthMap) return columnWidthMap[index];
          return 200;
        }}
        rowHeight={(index) => 20}
        onScroll={({ scrollLeft }) => {
          gridRef.current.scrollTo({ scrollLeft });
        }}
        itemRenderer={Cell}
      />
    </div>
  );
};

/*eslint-disable */
