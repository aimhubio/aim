import React from 'react';
import { Box, Divider, MenuItem, MenuList } from '@material-ui/core';
import { IHighlightModesPopoverProps } from '../../types/components/HighlightModesPopover/HighlightModesPopover';
import HighlightEnum from './HighlightEnum';

function HighlightModesPopover(
  props: IHighlightModesPopoverProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Box>
      <Box p={0.5}>Highlight Modes</Box>
      <Divider />
      <MenuList>
        <MenuItem
          selected={props.mode === HighlightEnum.Off}
          onClick={props.onChange(HighlightEnum.Off)}
        >
          Highlight Off
        </MenuItem>
        <MenuItem
          selected={props.mode === HighlightEnum.Run}
          onClick={props.onChange(HighlightEnum.Run)}
        >
          Highlight Metric on Hover
        </MenuItem>
        <MenuItem
          selected={props.mode === HighlightEnum.Metric}
          onClick={props.onChange(HighlightEnum.Metric)}
        >
          Highlight Run On Hover
        </MenuItem>
      </MenuList>
    </Box>
  );
}

export default React.memo(HighlightModesPopover);
