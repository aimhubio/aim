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
      <div
        ref={grid}
        style={{
          marginTop: '20px',
          overflow: 'hidden',
          width:
            sortedByPosition?.[sortedByPosition?.length - 1]?.style?.left +
            sortedByPosition?.[sortedByPosition?.length - 1]?.style?.width,
          height:
            sortedByPosition?.[sortedByPosition?.length - 1]?.style?.top +
            sortedByPosition?.[sortedByPosition?.length - 1]?.style?.height,
        }}
      >
        {items?.map(props.itemRenderer)}
      </div>
    </div>
  );
}

export default React.memo(BoxVirtualizer);
