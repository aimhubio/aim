import React from 'react';
import { Box, Switch } from '@material-ui/core';
import IToggleButtonProps from 'types/components/ToggleButton/ToggleButton';

function ToggleButton({
  leftLabel,
  rightLabel,
  ...rest
}: IToggleButtonProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Box>
      <Box component='span'>{leftLabel}</Box>
      <Switch color={rest.color || 'primary'} {...rest} />
      {rightLabel && <Box component='span'>{rightLabel}</Box>}
    </Box>
  );
}

export default ToggleButton;
