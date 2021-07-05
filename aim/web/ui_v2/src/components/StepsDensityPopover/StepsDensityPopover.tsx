import React from 'react';
import { Box, Slider } from '@material-ui/core';

const marks = [
  { value: 10, label: '10' },
  { value: 100, label: '100' },
  { value: 200, label: '200' },
  { value: 300, label: '300' },
  { value: 400, label: '400' },
  { value: 500, label: '500' },
];
function StepsDensityPopover(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Box width={300}>
      <Box p={0.5}>Number Of Steps:</Box>
      <Box m={1}>
        <Slider
          valueLabelDisplay='auto'
          defaultValue={0}
          min={0}
          max={500}
          step={1}
          marks={marks}
        />
      </Box>
    </Box>
  );
}

export default React.memo(StepsDensityPopover);
