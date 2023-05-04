import * as React from 'react';
import classNames from 'classnames';

import { ResizeElementContext, ResizableElementProps } from './';

const ResizableElement = React.forwardRef(function ResizableElement(
  props: ResizableElementProps,
  ref?: React.LegacyRef<HTMLDivElement>,
) {
  const {
    children,
    className = '',
    resizingFallback = null,
    hide = false,
  } = props;
  const { resizing } = React.useContext(ResizeElementContext);

  const childrenElement = React.useMemo(() => {
    return typeof children === 'function' ? children(resizing) : children;
  }, [children, resizing]);
  return (
    <div
      ref={ref}
      className={classNames('ResizableElement', {
        [className]: !!className,
        hide,
      })}
    >
      {hide
        ? null
        : resizing && resizingFallback
        ? resizingFallback
        : childrenElement}
    </div>
  );
});

ResizableElement.displayName = 'ResizableElement';

export default ResizableElement;
