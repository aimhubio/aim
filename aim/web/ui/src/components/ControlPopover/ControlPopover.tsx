import React from 'react';

import { Popover } from '@material-ui/core';

import { Text } from 'components/kit';

import IControlPopoverProps from 'types/components/ControlPopover/ControlPopover';

import stopPropagation from 'utils/stopPropagation';

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
        onClick={stopPropagation}
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
