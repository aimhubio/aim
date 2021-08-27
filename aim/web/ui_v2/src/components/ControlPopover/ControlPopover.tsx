import React from 'react';
import { Popover } from '@material-ui/core';

import IControlPopoverProps from 'types/components/ControlPopover/ControlPopover';

import './ControlPopover.scss';

function ControlPopover({
  component,
  title,
  anchor,
  anchorOrigin,
  transformOrigin,
}: IControlPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const onAnchorClick = React.useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    },
    [],
  );

  const handleClose = React.useCallback(() => {
    setAnchorEl(null);
  }, []);

  return (
    <>
      {anchor({ onAnchorClick, opened: !!anchorEl })}
      <Popover
        open={!!anchorEl}
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
      >
        <div className='ControlPopover__container'>
          {title && <div className='ControlPopover__title'>{title}</div>}
          {component}
        </div>
      </Popover>
    </>
  );
}

export default React.memo(ControlPopover);
