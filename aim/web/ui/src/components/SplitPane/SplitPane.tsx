import * as React from 'react';
import Split from 'react-split';
import classNames from 'classnames';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { SplitPaneProps, SplitPaneContext } from '.';

import './SplitPane.scss';

function SplitPane(props: SplitPaneProps) {
  const {
    id = '',
    sizes,
    children,
    resizing,
    direction = 'horizontal',
    gutterSize = 4,
    className = '',
    onDragStart,
    onDragEnd,
    useLocalStorage = false,
    ...rest
  } = props;
  const [resizingPane, setResizingPane] = React.useState(false);

  const onResizeStart = React.useCallback(
    (startSizes: number[]) => {
      setResizingPane(true);
      if (typeof onDragStart === 'function') {
        onDragStart(startSizes);
      }
    },
    [onDragStart],
  );

  const onResizeEnd = React.useCallback(
    (endSizes: number[]) => {
      setResizingPane(false);
      if (typeof onDragEnd === 'function') {
        onDragEnd(endSizes);
      }
      if (useLocalStorage) {
        localStorage.setItem(`${id}-panesSizes`, JSON.stringify(endSizes));
      }
    },
    [onDragEnd, id, useLocalStorage],
  );

  const getSizes = React.useCallback(
    (useLocalStorage: boolean, id: string, sizes?: number[]) => {
      if (useLocalStorage) {
        const savedSizes = localStorage.getItem(`${id}-panesSizes`);
        if (savedSizes) {
          return JSON.parse(savedSizes);
        }
      }
      return sizes;
    },
    [],
  );

  React.useEffect(() => {
    if (typeof resizing === 'boolean') {
      setResizingPane(resizing);
    }
  }, [resizing]);

  return (
    <ErrorBoundary>
      <SplitPaneContext.Provider value={{ resizing: resizingPane }}>
        <Split
          {...rest}
          sizes={getSizes(useLocalStorage, id, sizes)}
          direction={direction}
          gutterSize={gutterSize}
          className={classNames('SplitPane', {
            [direction]: true,
            [className]: !!className,
          })}
          onDragStart={onResizeStart}
          onDragEnd={onResizeEnd}
        >
          {children}
        </Split>
      </SplitPaneContext.Provider>
    </ErrorBoundary>
  );
}

SplitPane.displayName = 'SplitPane';

export default SplitPane;
