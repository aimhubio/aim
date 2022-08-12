import * as React from 'react';
import * as _ from 'lodash-es';

import useResizeObserver from 'hooks/window/useResizeObserver';

import { BoxVirtualizerProps } from './types';

import './BoxVirtualizer.scss';

function BoxVirtualizer(props: BoxVirtualizerProps) {
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

  function onScroll({ target }: any) {
    setGridWindow({
      left: target.scrollLeft,
      top: target.scrollTop,
      width: container.current.offsetWidth,
      height: container.current.offsetHeight,
    });
  }

  // Sort items to find the edges for container size calculation
  let sortedByPosition = props.data
    ?.sort((a: any, b: any) => a.style.left - b.style.left)
    .sort((a: any, b: any) => a.style.top - b.style.top);

  // Filter boxes/items based on their position intersection with the viewport
  let items = _.uniqWith<{ style: React.CSSProperties }>(
    props.data?.filter(
      (item: any) =>
        item.style.left >= gridWindow.left - item.style.width &&
        item.style.left <= gridWindow.left + gridWindow.width &&
        item.style.top >= gridWindow.top - item.style.height &&
        item.style.top <= gridWindow.top + gridWindow.height,
    ),
    (a, b) => _.isEqual(a.style, b.style),
  );

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
              width:
                sortedByPosition?.[sortedByPosition?.length - 1]?.style?.left +
                sortedByPosition?.[sortedByPosition?.length - 1]?.style?.width +
                30,
            }}
          >
            {columnsAxisItems?.map(props.axisItemRenderer?.columns)}
          </div>
        )}
        {rowsAxisItems && rowsAxisItems.length > 0 && (
          <div
            className='BoxVirtualizer__container__verticalRuler'
            style={{
              height:
                sortedByPosition?.[sortedByPosition?.length - 1]?.style?.top +
                sortedByPosition?.[sortedByPosition?.length - 1]?.style?.height,
            }}
          >
            {rowsAxisItems?.map(props.axisItemRenderer?.rows)}
          </div>
        )}
        <div
          ref={grid}
          style={{
            display: 'inline',
            width:
              sortedByPosition?.[sortedByPosition?.length - 1]?.style?.left +
              sortedByPosition?.[sortedByPosition?.length - 1]?.style?.width +
              30,
            height:
              sortedByPosition?.[sortedByPosition?.length - 1]?.style?.top +
              sortedByPosition?.[sortedByPosition?.length - 1]?.style?.height,
            overflow: 'hidden',
          }}
        >
          {items?.map(props.itemRenderer)}
        </div>
      </div>
    </div>
  );
}

export default React.memo(BoxVirtualizer);
