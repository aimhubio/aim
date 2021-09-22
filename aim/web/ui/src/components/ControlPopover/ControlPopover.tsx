import React from 'react';
import { Popover } from '@material-ui/core';

import IControlPopoverProps from 'types/components/ControlPopover/ControlPopover';

import './ControlPopover.scss';

function ControlPopover({
  component,
  title,
  titleClassName = '',
  anchor,
  anchorOrigin,
  transformOrigin,
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
    <>
      {anchor({ onAnchorClick, opened: open && !!anchorEl })}
      <Popover
        open={open && !!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorPosition={{ left: 20, top: 0 }}
        anchorOrigin={
          anchorOrigin || {
            vertical: 'top',
            horizontal: 'left',
          }
        }
        transformOrigin={
          transformOrigin || {
            vertical: 'top',
            horizontal: 'right',
          }
        }
        PaperProps={{ className: 'ControlPopover' }}
      >
        <div className='ControlPopover__container'>
          {title && (
            <div className={`ControlPopover__title ${titleClassName}`}>
              {title}
            </div>
          )}
          <div className='ControlPopover__component'>
            {typeof component === 'function'
              ? component({ handleClose, opened: open && !!anchorEl })
              : component}
          </div>
        </div>
      </Popover>
    </>
  );
}

export default React.memo(ControlPopover);
