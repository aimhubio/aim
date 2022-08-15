import * as React from 'react';
import _ from 'lodash-es';
import { useResizeObserver } from 'hooks';

import { AimFlatObjectBase } from 'modules/BaseExplorerCore/pipeline/adapter/processor';

import { IBoxVirtualizerProps } from './';

import './BoxVirtualizer.scss';

function BoxVirtualizer(props: IBoxVirtualizerProps) {
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

  const filteredItems = React.useMemo(
    () =>
      data.filter(
        (item: AimFlatObjectBase<any>) =>
          item.style.left >= gridWindow.left - item.style.width &&
          item.style.left <= gridWindow.left + gridWindow.width &&
          item.style.top >= gridWindow.top - item.style.height &&
          item.style.top <= gridWindow.top + gridWindow.height,
      ),
    [data, gridWindow],
  );

  const groupedByPosition = React.useMemo(
    () =>
      _.groupBy(
        filteredItems,
        (item) => `${item.style.top}__${item.style.left}`,
      ),
    [filteredItems],
  );

  // @TODO remove this variable and calculate width and height of the container with optimized way
  // Sort items to find the edges for container size calculation
  const sortedByPosition = React.useMemo(
    () =>
      data
        .sort((a: any, b: any) => a.style.left - b.style.left)
        .sort((a: any, b: any) => a.style.top - b.style.top),
    [data],
  );

  const gridWidth =
    sortedByPosition?.[sortedByPosition?.length - 1]?.style?.left +
    sortedByPosition?.[sortedByPosition?.length - 1]?.style?.width +
    props.offset;

  const gridHeight =
    sortedByPosition?.[sortedByPosition?.length - 1]?.style?.top +
    sortedByPosition?.[sortedByPosition?.length - 1]?.style?.height;

  return (
    <div className='BoxVirtualizer'>
      {columnsAxisItems &&
        columnsAxisItems.length > 0 &&
        rowsAxisItems &&
        rowsAxisItems.length > 0 && (
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
              width: gridWidth || 0,
            }}
          >
            {columnsAxisItems?.map(props.axisItemRenderer?.columns)}
          </div>
        )}
        {rowsAxisItems && rowsAxisItems.length > 0 && (
          <div
            className='BoxVirtualizer__container__verticalRuler'
            style={{
              height: gridHeight || 0,
            }}
          >
            {rowsAxisItems?.map(props.axisItemRenderer?.rows)}
          </div>
        )}
        <div
          ref={grid}
          style={{
            display: 'inline',
            width: gridWidth || 0,
            height: gridHeight || 0,
            overflow: 'hidden',
          }}
        >
          {Object.entries(groupedByPosition).map(props.itemsRenderer)}
        </div>
      </div>
    </div>
  );
}

export default React.memo<IBoxVirtualizerProps>(BoxVirtualizer);
