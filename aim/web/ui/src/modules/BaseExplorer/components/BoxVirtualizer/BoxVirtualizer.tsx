import * as React from 'react';
import _ from 'lodash-es';
import { useResizeObserver } from 'hooks';

import { AimFlatObjectBase } from 'types/core/AimObjects';

import { IBoxVirtualizerProps } from './';

import './BoxVirtualizer.scss';

function BoxVirtualizer(props: IBoxVirtualizerProps<AimFlatObjectBase<any>>) {
  const { data = [] } = props;
  let container: React.MutableRefObject<HTMLDivElement> =
    React.useRef<HTMLDivElement>(document.createElement('div'));
  let grid: React.MutableRefObject<HTMLDivElement> =
    React.useRef<HTMLDivElement>(document.createElement('div'));
  const rafIDRef = React.useRef<number>();

  let [gridWindow, setGridWindow] = React.useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });

  const onScroll = React.useCallback(({ target }: any) => {
    setGridWindow({
      left: target.scrollLeft,
      top: target.scrollTop,
      width: container.current.offsetWidth,
      height: container.current.offsetHeight,
    });
  }, []);

  // Filter column group values based on their position intersection with the viewport
  let columnsAxisItems = props.axisData?.columns?.filter(
    (item: any) =>
      item.style.left >= gridWindow.left - item.style.width &&
      item.style.left <= gridWindow.left + gridWindow.width,
  );

  // Filter row group values based on their position intersection with the viewport
  let rowsAxisItems = props.axisData?.rows?.filter(
    (item: any) =>
      item.style.top >= gridWindow.top - item.style.height &&
      item.style.top <= gridWindow.top + gridWindow.height,
  );

  React.useEffect(() => {
    setGridWindow({
      left: grid.current.scrollLeft,
      top: grid.current.scrollTop,
      width: container.current.offsetWidth,
      height: container.current.offsetHeight,
    });
  }, []);

  const resizeObserverCallback: ResizeObserverCallback = React.useCallback(
    (entries: ResizeObserverEntry[]) => {
      if (entries?.length) {
        rafIDRef.current = window.requestAnimationFrame(() => {
          setGridWindow((gW) => ({
            left: gW.left,
            top: gW.top,
            width: container.current.offsetWidth,
            height: container.current.offsetHeight,
          }));
        });
      }
    },
    [setGridWindow],
  );

  const observerReturnCallback = React.useCallback(() => {
    if (rafIDRef.current) {
      window.cancelAnimationFrame(rafIDRef.current);
    }
  }, []);

  useResizeObserver(resizeObserverCallback, container, observerReturnCallback);

  const filteredItems = data.filter(
    (item: AimFlatObjectBase<any>) =>
      item.style.left >= gridWindow.left - item.style.width &&
      item.style.left <= gridWindow.left + gridWindow.width &&
      item.style.top >= gridWindow.top - item.style.height &&
      item.style.top <= gridWindow.top + gridWindow.height,
  );
  const groupedByPosition = _.groupBy(filteredItems, (item) => {
    const rowId = item.groups?.rows ? item.groups.rows[0] : '';
    const columnId = item.groups?.columns ? item.groups.columns[0] : '';
    return `${rowId}--${columnId}`;
  });

  // Find the edges for container size calculation
  const gridSize = React.useMemo(() => {
    let rightEdge = 0;
    let bottomEdge = 0;

    let itemWidth = 0;
    let itemHeight = 0;

    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      if (item.style.left > rightEdge) {
        rightEdge = item.style.left;
        itemWidth = item.style.width;
      }

      if (item.style.top > bottomEdge) {
        bottomEdge = item.style.top;
        itemHeight = item.style.height;
      }
    }

    const horizontalRulerHeight = 30;

    return {
      width: rightEdge + itemWidth + props.offset,
      height: bottomEdge + itemHeight + props.offset - horizontalRulerHeight,
    };
  }, [data, props.offset]);

  return (
    <div className='BoxVirtualizer'>
      {rowsAxisItems && rowsAxisItems.length > 0 && (
        <div className='BoxVirtualizer__placeholder' />
      )}
      <div
        ref={container}
        className='BoxVirtualizer__container'
        onScroll={onScroll}
      >
        {((columnsAxisItems && columnsAxisItems.length > 0) ||
          (rowsAxisItems && rowsAxisItems.length > 0)) && (
          <div
            className='BoxVirtualizer__container__horizontalRuler'
            style={{
              width: gridSize.width,
            }}
          >
            {columnsAxisItems?.map(props.axisItemRenderer?.columns)}
          </div>
        )}
        {rowsAxisItems && rowsAxisItems.length > 0 && (
          <div
            className='BoxVirtualizer__container__verticalRuler'
            style={{
              height: gridSize.height,
            }}
          >
            {rowsAxisItems?.map(props.axisItemRenderer?.rows)}
          </div>
        )}
        <div
          ref={grid}
          className='BoxVirtualizer__grid'
          style={{
            width: gridSize.width,
            height: gridSize.height,
          }}
        >
          {Object.entries(groupedByPosition).map(props.itemsRenderer)}
        </div>
      </div>
    </div>
  );
}

export default React.memo<IBoxVirtualizerProps<AimFlatObjectBase<any>>>(
  BoxVirtualizer,
);
