import React from 'react';
import { Box, Divider, MenuItem, MenuList } from '@material-ui/core';

import { IHighlightModesPopoverProps } from 'types/components/HighlightModesPopover/HighlightModesPopover';
import HighlightEnum from './HighlightEnum';

function HighlightModesPopover(
  props: IHighlightModesPopoverProps,
): React.FunctionComponentElement<React.ReactNode> {
  function handleClick(e: React.ChangeEvent<any>): void {
    props.onChange(e.target.getAttribute('data-name'));
  }
  return (
    <Box>
      <Box p={0.5}>Highlight Modes</Box>
      <Divider />
      <MenuList>
        <MenuItem
          data-name={HighlightEnum.Off}
          selected={props.mode === HighlightEnum.Off}
          onClick={handleClick}
        >
          Highlight Off
        </MenuItem>
        <MenuItem
          data-name={HighlightEnum.Run}
          selected={props.mode === HighlightEnum.Run}
          onClick={handleClick}
        >
          Highlight Metric on Hover
        </MenuItem>
        <MenuItem
          data-name={HighlightEnum.Metric}
          selected={props.mode === HighlightEnum.Metric}
          onClick={handleClick}
        >
          Highlight Run On Hover
        </MenuItem>
      </MenuList>
    </Box>
  );
}

export default React.memo(HighlightModesPopover);
