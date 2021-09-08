import React from 'react';
import { Box, Divider, MenuItem, MenuList } from '@material-ui/core';
import { IZoomInPopoverProps } from 'types/components/ZoomInPopover/ZoomInPopover';

export enum ZoomEnum {
  SINGLE,
  MULTIPLE,
}

function ZoomInPopover({
  mode,
  onChange,
}: IZoomInPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  function handleChange(e: React.ChangeEvent<any>): void {
    const value = e.target?.getAttribute('data-name');
    if (value && mode !== parseInt(value) && typeof onChange === 'function') {
      onChange({ mode: parseInt(value), active: true });
    }
  }
  return (
    <Box>
      <Box p={0.5}>Select Zoom Mode</Box>
      <Divider />
      <MenuList>
        <MenuItem
          data-name={ZoomEnum.SINGLE}
          selected={mode === ZoomEnum.SINGLE}
          onClick={handleChange}
        >
          Single Zooming
        </MenuItem>
        <MenuItem
          data-name={ZoomEnum.MULTIPLE}
          selected={mode === ZoomEnum.MULTIPLE}
          onClick={handleChange}
        >
          Multiple Zooming
        </MenuItem>
      </MenuList>
    </Box>
  );
}

export default React.memo(ZoomInPopover);
