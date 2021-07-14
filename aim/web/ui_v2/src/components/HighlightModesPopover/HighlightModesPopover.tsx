import React from 'react';
import { Box, Divider, MenuItem, MenuList } from '@material-ui/core';
import { IHighlightModesPopoverProps } from '../../types/components/HighlightModesPopover/HighlightModesPopover';
import HighlightModesEnum from './HighlightModesEnum';

function HighlightModesPopover(
  props: IHighlightModesPopoverProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Box>
      <Box p={0.5}>Highlight Modes</Box>
      <Divider />
      <MenuList>
        <MenuItem
          selected={props.mode === HighlightModesEnum.Off}
          onClick={props.onChange(HighlightModesEnum.Off)}
        >
          Highlight Off
        </MenuItem>
        <MenuItem
          selected={props.mode === HighlightModesEnum.Run}
          onClick={props.onChange(HighlightModesEnum.Run)}
        >
          Highlight Metric on Hover
        </MenuItem>
        <MenuItem
          selected={props.mode === HighlightModesEnum.Metric}
          onClick={props.onChange(HighlightModesEnum.Metric)}
        >
          Highlight Run On Hover
        </MenuItem>
      </MenuList>
    </Box>
  );
}

export default React.memo(HighlightModesPopover);
