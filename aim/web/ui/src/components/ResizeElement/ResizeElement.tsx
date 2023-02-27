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
    initialSizes = {},
    useLocalStorage = false,
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
      maxWidth: '100%' as WidthProperty<string | number>,
      maxHeight: '100%' as HeightProperty<string | number>,
      ...initialSizes,
    }),
    [initialSizes],
  );

  const getResizeHandler = React.useCallback(
    (side: ResizableSideEnum, containerNode: HTMLDivElement) => {
      const { maxWidth, maxHeight } = initialSizes;

      const checkVerticalBounds = (height: number) => {
        return !(height < gutterSize || (maxHeight && height > maxHeight));
      };
      const checkHorizontalBounds = (width: number) => {
        return !(width < gutterSize || (maxWidth && width > maxWidth));
      };

      const setHeight = (height: number) => {
        if (height < snapOffset) {
          containerNode.style.height = `${gutterSize}px`;
        } else if (maxHeight && maxHeight - height < snapOffset) {
          containerNode.style.height = `${maxHeight}px`;
        } else {
          containerNode.style.height = `${height}px`;
        }
      };
      const setWidth = (width: number) => {
        if (width < snapOffset) {
          containerNode.style.width = `${gutterSize}px`;
        } else if (maxWidth && maxWidth - width < snapOffset) {
          containerNode.style.width = `${maxWidth}px`;
        } else {
          containerNode.style.width = `${width}px`;
        }
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
    [gutterSize, snapOffset, initialSizes],
  );

  React.useEffect(() => {
    const containerNode = containerRef.current;
    if (!containerNode) return;

    /**
     * Set initial sizes
     */
    const { maxHeight, maxWidth } = containerInitialSize;
    containerNode.style.maxHeight =
      typeof maxHeight === 'string' ? maxHeight : `${maxHeight}px`;
    containerNode.style.maxWidth =
      typeof maxWidth === 'string' ? maxWidth : `${maxWidth}px`;

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
    containerNode.style.width =
      typeof width === 'string' ? width : `${width}px`;
    containerNode.style.height =
      typeof height === 'string' ? height : `${height}px`;
  }, [containerInitialSize, useLocalStorage, id]);

  React.useEffect(() => {
    const containerNode = containerRef.current;
    const gutterNode = gutterElemRef.current;
    if (!containerNode || !gutterNode) return;

    /**
     * Set resize listeners/handlers
     */
    const resizeHandler = getResizeHandler(side, containerNode);

    const onResize = (e: MouseEvent) => {
      e.stopPropagation();
      const rect = containerRectRef.current as DOMRect;
      resizeHandler(e, rect);
    };
    const onResizeEnd = (e: MouseEvent) => {
      e.stopPropagation();
      setResizing(false);
      document.removeEventListener('mousemove', onResize);
      document.removeEventListener('mouseup', onResizeEnd);
      document.body.style.userSelect = 'unset';
      document.body.style.cursor = 'unset';
      document.body.style.pointerEvents = 'unset';
      if (useLocalStorage) {
        localStorage.setItem(
          id,
          JSON.stringify({
            width: containerNode.style.width,
            height: containerNode.style.height,
          }),
        );
      }
    };
    const onResizeStart = (e: MouseEvent) => {
      e.stopPropagation();
      setResizing(true);
      document.body.style.pointerEvents = 'none';
      document.body.style.userSelect = 'none';
      document.body.style.cursor = isHorizontal ? 'col-resize' : 'row-resize';
      document.addEventListener('mousemove', onResize);
      document.addEventListener('mouseup', onResizeEnd);
      containerRectRef.current = containerNode.getBoundingClientRect();
    };

    gutterNode.addEventListener('mousedown', onResizeStart);
    return () => {
      gutterNode.removeEventListener('mousedown', onResizeStart);
    };
  }, [
    side,
    id,
    useLocalStorage,
    isHorizontal,
    gutterSize,
    snapOffset,
    getResizeHandler,
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
