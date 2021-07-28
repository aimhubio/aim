import React from 'react';
import { Box, Popover } from '@material-ui/core';

import IControlPopoverProps from 'types/components/ControlPopover/ControlPopover';

function ControlPopover({
  component,
  title,
  anchor,
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
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box>
          {title && (
            <Box
              padding='0.5em 1em'
              borderBottom='1px solid #dfe6f7'
              color='#243969'
              bgcolor='#f7faff'
              fontWeight={700}
              style={{ textTransform: 'uppercase' }}
            >
              {title}
            </Box>
          )}
          {component}
        </Box>
      </Popover>
    </>
  );
}

export default React.memo(ControlPopover);
