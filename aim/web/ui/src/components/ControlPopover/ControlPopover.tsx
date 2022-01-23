import React from 'react';

import { Popover } from '@material-ui/core';

import { Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import IControlPopoverProps from 'types/components/ControlPopover/ControlPopover';

import stopPropagation from 'utils/stopPropagation';

import './ControlPopover.scss';

function ControlPopover({
  component,
  title,
  titleClassName = '',
  anchor,
  anchorOrigin = {
    vertical: 'top',
    horizontal: 'left',
  },
  transformOrigin = {
    vertical: 'top',
    horizontal: 'right',
  },
  open = true,
}: IControlPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const onAnchorClick = React.useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
    },
    [],
  );

  const handleClose = React.useCallback(() => {
    setAnchorEl(null);
  }, []);

  React.useEffect(() => {
    if (!open) {
      setAnchorEl(null);
    }
  }, [open]);

  return (
    <ErrorBoundary>
      {anchor({ onAnchorClick, opened: open && !!anchorEl })}
      <Popover
        open={open && !!anchorEl}
        anchorEl={anchorEl}
        onClick={stopPropagation}
        onClose={handleClose}
        anchorPosition={{ left: 20, top: 0 }}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        PaperProps={{ className: 'ControlPopover' }}
      >
        <div onClick={stopPropagation} className='ControlPopover__container'>
          {title && (
            <div
              onClick={stopPropagation}
              className={`ControlPopover__title ${titleClassName}`}
            >
              <Text component='h3' size={14} weight={700} tint={100}>
                {title}
              </Text>
            </div>
          )}
          <ErrorBoundary>
            <div className='ControlPopover__component'>
              {typeof component === 'function'
                ? component({ handleClose, opened: open && !!anchorEl })
                : component}
            </div>
          </ErrorBoundary>
        </div>
      </Popover>
    </ErrorBoundary>
  );
}

export default React.memo(ControlPopover);
