import * as React from 'react';
import classNames from 'classnames';

import { SplitPaneContext, SplitPaneItemProps } from '.';

const SplitPaneItem = React.forwardRef(function SplitPaneItem(
  props: SplitPaneItemProps,
  ref?: React.LegacyRef<HTMLDivElement>,
) {
  const {
    children,
    className = '',
    index = 0,
    resizingFallback = null,
  } = props;
  const { resizing } = React.useContext(SplitPaneContext);

  const childrenElement = React.useMemo(() => {
    return typeof children === 'function' ? children(resizing) : children;
  }, [children, resizing]);
  return (
    <div
      ref={ref}
      id={`split-pane-item-${index}`}
      className={classNames('SplitPaneItem', {
        [className]: !!className,
      })}
    >
      {resizing && resizingFallback ? resizingFallback : childrenElement}
    </div>
  );
});

SplitPaneItem.displayName = 'SplitPaneItem';

export default SplitPaneItem;
