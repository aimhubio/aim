import React from 'react';
import { Box, Popover } from '@material-ui/core';

import IControlPopoverProps from 'types/components/ControlPopover/ControlPopover';

function ControlPopover(
  props: IControlPopoverProps,
): React.FunctionComponentElement<React.ReactNode> {
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
    <Box>
      {props.anchor({ onAnchorClick, opened: !!anchorEl })}
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
        {props.component}
      </Popover>
    </Box>
  );
}

export default React.memo(ControlPopover);
