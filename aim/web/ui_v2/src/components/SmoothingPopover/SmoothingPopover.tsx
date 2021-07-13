import React, { useState } from 'react';
import {
  Box,
  Divider,
  MenuItem,
  MenuList,
  Slider,
  Switch,
} from '@material-ui/core';

const emaProps = {
  marks: [
    { value: 0, label: '0' },
    { value: 0.25, label: '0.25' },
    { value: 0.5, label: '0.5' },
    { value: 0.75, label: '0.75' },
    { value: 0.99, label: '0.99' },
  ],
  step: 0.01,
  min: 0,
  max: 0.99,
};

const cmaProps = {
  marks: [
    { value: 1, label: '1' },
    { value: 25, label: '25' },
    { value: 51, label: '51' },
    { value: 75, label: '75' },
    { value: 99, label: '99' },
  ],
  step: 1,
  min: 2,
  max: 99,
};

function SmoothingPopover(): React.FunctionComponentElement<React.ReactNode> {
  const [smoothingAlgorithm, setSmoothingAlgorithm] =
    React.useState<string>('ema');

  const [factor, setFactor] = useState<number>(emaProps.min);

  const handleAlgorithmChange = React.useCallback((event) => {
    setSmoothingAlgorithm(event.target.id);
    const sliderProps = smoothingAlgorithm === 'ema' ? emaProps : cmaProps;
    setFactor(sliderProps.min);
  }, []);

  const handleFactorChange = (event: any, val: any) => {
    if (val !== factor) {
      setFactor(val);
    }
  };
  const sliderProps = smoothingAlgorithm === 'ema' ? emaProps : cmaProps;
  return (
    <Box>
      <Box p={1}>
        <div>Chart Smoothening:</div>
        <Slider
          defaultValue={0}
          getAriaValueText={(val) => `${val}s`}
          onChange={handleFactorChange}
          marks={sliderProps.marks}
          step={sliderProps.step}
          max={sliderProps.max}
          min={sliderProps.min}
          valueLabelDisplay='auto'
        />
      </Box>
      <Divider />
      <MenuList>
        <MenuItem id='ema' onClick={handleAlgorithmChange}>
          Exponential Moving area
        </MenuItem>
        <MenuItem id='cma' onClick={handleAlgorithmChange}>
          Central Moving area
        </MenuItem>
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

export default React.memo(SmoothingPopover);
