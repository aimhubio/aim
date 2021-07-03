import React from 'react';
import {
  Box,
  Divider,
  MenuItem,
  MenuList,
  Slider,
  Switch,
} from '@material-ui/core';

const marks = [
  { value: 0, label: '0' },
  { value: 0.25, label: '0.25' },
  { value: 0.5, label: '0.5' },
  { value: 0.75, label: '0.75' },
  { value: 0.99, label: '0.99' },
];
function SmootheningPopup(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Box>
      <Box p={1}>
        <div>Chart Smoothening:</div>
        <Slider
          defaultValue={0}
          getAriaValueText={(val) => `${val}s`}
          marks={marks}
          step={0.25}
          max={0.99}
          min={0}
          valueLabelDisplay='auto'
        />
      </Box>
      <Divider />
      <MenuList>
        <MenuItem>Exponantial Moving area</MenuItem>
        <MenuItem>Central Moving area</MenuItem>
      </MenuList>
      <Divider />
      <Box p={0.5}>Curve Interpolation method:</Box>

      <Box p={1}>
        Select Method
        <Box component='span' marginLeft={1}>
          Linear
        </Box>
        <Switch
          defaultChecked
          color='primary'
          inputProps={{ 'aria-label': 'checkbox with default color' }}
        />
        <Box component='span'>Cubic</Box>
      </Box>
    </Box>
  );
}

export default React.memo(SmootheningPopup);
