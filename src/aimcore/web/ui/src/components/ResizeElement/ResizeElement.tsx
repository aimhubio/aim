import * as React from 'react';
import { WidthProperty, HeightProperty } from 'csstype';

import ErrorBoundary from 'components/ErrorBoundary';

import {
  ResizeElementProps,
  ResizeElementContext,
  ResizableSideEnum,
} from './';

import './ResizeElement.scss';

function ResizeElement(props: ResizeElementProps) {
  const {
    id = 'ResizeElement',
    children,
    gutterSize = 4,
    snapOffset = 0,
    side = ResizableSideEnum.LEFT,
    initialSizes,
    useLocalStorage = false,
    onMount,
    onResizeEnd,
    onResizeStart,
    onResize,
  } = props;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const gutterElemRef = React.useRef<HTMLDivElement>(null);
  const containerRectRef = React.useRef<DOMRect>();

  const [resizing, setResizing] = React.useState(false);

  const isHorizontal = [
    ResizableSideEnum.LEFT,
    ResizableSideEnum.RIGHT,
  ].includes(side);

  const containerInitialSize = React.useMemo(
    () => ({
      width: '100%' as WidthProperty<string | number>,
      height: '100%' as HeightProperty<string | number>,
      ...initialSizes,
    }),
    [initialSizes],
  );

  const getResizeHandler = React.useCallback(
    (side: ResizableSideEnum, containerNode: HTMLElement) => {
      const { maxWidth, maxHeight } = containerInitialSize;

      const checkVerticalBounds = (height: number) => {
        return !(height < gutterSize || (maxHeight && height > maxHeight));
      };
      const checkHorizontalBounds = (width: number) => {
        return !(width < gutterSize || (maxWidth && width > maxWidth));
      };

      const getSize = (size: number, maxSize?: number): number => {
        let newSize;
        if (size < snapOffset) {
          newSize = gutterSize;
        } else if (maxSize && maxSize - size < snapOffset) {
          newSize = maxSize;
        } else {
          newSize = size;
        }
        return newSize;
      };
      const setHeight = (height: number) => {
        const newHeight = getSize(height, maxHeight);
        containerNode.style.height = `${newHeight}px`;
      };
      const setWidth = (width: number) => {
        const newWidth = getSize(width, maxWidth);
        containerNode.style.width = `${newWidth}px`;
      };

      const dict = {
        [ResizableSideEnum.LEFT]: (e: MouseEvent, rect: DOMRect) => {
          const width = rect.right - e.pageX;
          if (checkHorizontalBounds(width)) {
            setWidth(width);
          }
        },
        [ResizableSideEnum.RIGHT]: (e: MouseEvent, rect: DOMRect) => {
          const width = e.pageX - rect.left;
          if (checkHorizontalBounds(width)) {
            setWidth(width);
          }
        },
        [ResizableSideEnum.TOP]: (e: MouseEvent, rect: DOMRect) => {
          const height = rect.bottom - e.pageY;
          if (checkVerticalBounds(height)) {
            setHeight(height);
          }
        },
        [ResizableSideEnum.BOTTOM]: (e: MouseEvent, rect: DOMRect) => {
          const height = e.pageY - rect.top;
          if (checkVerticalBounds(height)) {
            setHeight(height);
          }
        },
      };
      return dict[side];
    },
    [gutterSize, snapOffset, containerInitialSize],
  );

  const getStringifiedSize = (size: string | number) => {
    return typeof size === 'string' ? size : `${size}px`;
  };

  React.useEffect(() => {
    if (onMount) {
      onMount(containerRef);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const containerNode = containerRef.current;
    if (!containerNode) return;

    /**
     * Set initial sizes
     */
    const { maxHeight, maxWidth } = containerInitialSize;
    containerNode.style.maxHeight = getStringifiedSize(maxHeight);
    containerNode.style.maxWidth = getStringifiedSize(maxWidth);

    if (useLocalStorage) {
      const savedSizes = localStorage.getItem(id);
      if (savedSizes) {
        const { width, height } = JSON.parse(savedSizes);

        containerNode.style.width = width;
        containerNode.style.height = height;
        return;
      }
    }

    const { width, height } = containerInitialSize;
    containerNode.style.width = getStringifiedSize(width);
    containerNode.style.height = getStringifiedSize(height);
  }, [containerInitialSize, useLocalStorage, id]);

  React.useEffect(() => {
    const containerNode = containerRef.current;
    const gutterNode = gutterElemRef.current;
    if (!containerNode || !gutterNode) return;

    /**
     * Set resize listeners/handlers
     */
    const resizeHandler = getResizeHandler(side, containerNode);

    const onMouseMove = (e: MouseEvent) => {
      e.stopPropagation();
      const rect = containerRectRef.current as DOMRect;
      resizeHandler(e, rect);
      onResize && onResize(containerRef, gutterSize);
    };

    const onMouseUp = (e: MouseEvent) => {
      e.stopPropagation();
      setResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.userSelect = 'unset';
      document.body.style.cursor = 'unset';
      document.body.style.pointerEvents = 'unset';
      if (useLocalStorage) {
        const { offsetWidth, offsetHeight } = containerNode;
        const sizes: Record<string, string> = {
          width:
            offsetWidth < snapOffset
              ? getStringifiedSize(containerInitialSize.width)
              : containerNode.style.width,
          height:
            offsetHeight < snapOffset
              ? getStringifiedSize(containerInitialSize.height)
              : containerNode.style.height,
        };
        localStorage.setItem(id, JSON.stringify(sizes));
      }
      onResizeEnd && onResizeEnd(containerRef, gutterSize);
    };

    const onMouseDown = (e: MouseEvent) => {
      e.stopPropagation();
      setResizing(true);
      document.body.style.pointerEvents = 'none';
      document.body.style.userSelect = 'none';
      document.body.style.cursor = isHorizontal ? 'col-resize' : 'row-resize';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      containerRectRef.current = containerNode.getBoundingClientRect();
      onResizeStart && onResizeStart(containerRef, gutterSize);
    };

    gutterNode.addEventListener('mousedown', onMouseDown);
    return () => {
      gutterNode.removeEventListener('mousedown', onMouseDown);
    };
  }, [
    side,
    id,
    useLocalStorage,
    isHorizontal,
    gutterSize,
    snapOffset,
    getResizeHandler,
    onResize,
    onResizeEnd,
    onResizeStart,
    containerInitialSize,
  ]);

  const gutterStyle = {
    width: isHorizontal ? gutterSize : '100%',
    height: !isHorizontal ? gutterSize : '100%',
  };
  return (
    <ErrorBoundary>
      <ResizeElementContext.Provider value={{ resizing }}>
        <div ref={containerRef} className='ResizeElement'>
          <div
            ref={gutterElemRef}
            style={gutterStyle}
            className={`ResizeElement__gutter ResizeElement__gutter__${side}`}
          />
          {children}
        </div>
      </ResizeElementContext.Provider>
    </ErrorBoundary>
  );
}

ResizeElement.displayName = 'ResizeElement';

export default React.memo(ResizeElement);
