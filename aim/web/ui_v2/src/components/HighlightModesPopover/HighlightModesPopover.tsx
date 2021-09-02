import React from 'react';
import { Box, MenuItem, MenuList } from '@material-ui/core';

import { IHighlightModesPopoverProps } from 'types/components/HighlightModesPopover/HighlightModesPopover';

export enum HighlightEnum {
  Off = 0,
  Run = 1,
  Metric = 2,
  Custom = 3,
}

function HighlightModesPopover({
  mode,
  onChange,
}: IHighlightModesPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  function handleClick(e: React.ChangeEvent<any>): void {
    const value = e.target?.getAttribute('data-name');
    if (value && mode !== parseInt(value) && typeof onChange === 'function') {
      onChange(parseInt(value));
    }
  }

  return (
    <Box p='0.5rem'>
      <MenuItem
        data-name={HighlightEnum.Off}
        selected={mode === HighlightEnum.Off}
        onClick={handleClick}
      >
        Highlight Off
      </MenuItem>
      <MenuItem
        data-name={HighlightEnum.Run}
        selected={mode === HighlightEnum.Run}
        onClick={handleClick}
      >
        Highlight Metric on Hover
      </MenuItem>
      <MenuItem
        data-name={HighlightEnum.Metric}
        selected={mode === HighlightEnum.Metric}
        onClick={handleClick}
      >
        Highlight Run On Hover
      </MenuItem>
    </Box>
  );
}

export default React.memo(HighlightModesPopover);
