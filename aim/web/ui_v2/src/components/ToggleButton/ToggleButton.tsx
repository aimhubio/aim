import React from 'react';
import { Box, Switch } from '@material-ui/core';
import IToggleButtonProps from 'types/components/ToggleButton/ToggleButton';

function ToggleButton(
  props: IToggleButtonProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Box>
      <Box component='span' marginLeft={1}>
        {props.leftLabel}
      </Box>
      <Switch
        color={props.color || 'primary'}
        id={props.id}
        checked={props.checked}
        inputProps={props.inputProps}
        onChange={props.onChange}
      />
      {props.rightLabel && <Box component='span'>{props.rightLabel}</Box>}
    </Box>
  );
}

export default React.memo(ToggleButton);
