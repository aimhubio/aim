import * as React from 'react';
import Split from 'react-split';
import classNames from 'classnames';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { SplitPaneProps, SplitPaneContext } from '.';

import './SplitPane.scss';

function SplitPane(props: SplitPaneProps) {
  const {
    children,
    resizing,
    direction = 'horizontal',
    className = '',
    onDragStart,
    onDragEnd,
    ...rest
  } = props;
  const isControlled = React.useMemo(
    () => typeof resizing === 'boolean',
    [resizing],
  );
  const [resizingPane, setResizingPane] = React.useState(false);

  const onResizeStart = React.useCallback(
    (sizes: number[]) => {
      setResizingPane(true);
      if (typeof onDragStart === 'function') {
        onDragStart(sizes);
      }
    },
    [onDragStart],
  );

  const onResizeEnd = React.useCallback(
    (sizes: number[]) => {
      setResizingPane(false);
      if (typeof onDragEnd === 'function') {
        onDragEnd(sizes);
      }
    },
    [onDragEnd],
  );

  React.useEffect(() => {
    if (isControlled) {
      setResizingPane(!!resizing);
    }
  }, [resizing, isControlled]);

  return (
    <ErrorBoundary>
      <SplitPaneContext.Provider value={{ resizing: resizingPane }}>
        <Split
          {...rest}
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
