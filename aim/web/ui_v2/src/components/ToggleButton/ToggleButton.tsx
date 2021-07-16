import React from 'react';
import { Box, Switch } from '@material-ui/core';
import IToggleButtonProps from 'types/components/ToggleButton/ToggleButton';

function ToggleButton(
  props: IToggleButtonProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Box>
      <Box component='span' marginLeft={1}>
        {props.label}
      </Box>
      <Switch
        color={props.color || 'primary'}
        id={props.id}
        checked={props.checked}
        inputProps={props.inputProps}
        onChange={props.onChange}
      />
      {props.secondLabel && <Box component='span'>{props.secondLabel}</Box>}
    </Box>
  );
}

export default React.memo(ToggleButton);
