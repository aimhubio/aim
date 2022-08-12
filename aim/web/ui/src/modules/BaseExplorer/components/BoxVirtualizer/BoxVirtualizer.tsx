import * as React from 'react';
import * as _ from 'lodash-es';

import useResizeObserver from 'hooks/window/useResizeObserver';

import { BoxVirtualizerProps } from './types';

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

  let sortedByPosition = props.data
    ?.sort((a: any, b: any) => a.style.left - b.style.left)
    .sort((a: any, b: any) => a.style.top - b.style.top);

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

  let columnsAxisItems = props.axisData?.columns?.filter(
    (item: any) =>
      item.style.left >= gridWindow.left - item.style.width &&
      item.style.left <= gridWindow.left + gridWindow.width,
  );

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
    <div
      ref={container}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'auto',
      }}
      onScroll={onScroll}
    >
      {((columnsAxisItems && columnsAxisItems.length > 0) ||
        (rowsAxisItems && rowsAxisItems.length > 0)) && (
        <div
          style={{
            position: 'sticky',
            top: 0,
            width:
              sortedByPosition?.[sortedByPosition?.length - 1]?.style?.left +
              sortedByPosition?.[sortedByPosition?.length - 1]?.style?.width +
              30,
            height: 30,
            minWidth: '100%',
            borderBottom: '1px solid #dceafb',
            backgroundColor: '#fff',
            zIndex: 3,
          }}
        >
          {columnsAxisItems?.map(props.axisItemRenderer?.columns)}
        </div>
      )}
      {rowsAxisItems && rowsAxisItems.length > 0 && (
        <div
          style={{
            position: 'sticky',
            left: 0,
            width: 200,
            height:
              sortedByPosition?.[sortedByPosition?.length - 1]?.style?.top +
              sortedByPosition?.[sortedByPosition?.length - 1]?.style?.height,
            minHeight: '100%',
            borderRight: '1px solid #dceafb',
            backgroundColor: '#fff',
            zIndex: 2,
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
  );
}

export default React.memo(BoxVirtualizer);
