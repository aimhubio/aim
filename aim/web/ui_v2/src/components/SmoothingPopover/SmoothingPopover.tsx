import React from 'react';
import {
  Box,
  Divider,
  MenuItem,
  MenuList,
  Slider,
  Switch,
} from '@material-ui/core';

import { ISmoothingPopoverProps } from 'types/components/SmoothingPopover/SmoothingPopover';
import { SmoothingAlgorithmEnum } from 'utils/smoothingData';
import { CurveEnum } from 'utils/d3';

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
  step: 2,
  min: 1,
  max: 99,
};

function SmoothingPopover(
  props: ISmoothingPopoverProps,
): React.FunctionComponentElement<React.ReactNode> {
  const [factor, setFactor] = React.useState<number>(props.smoothingFactor);

  const handleAlgorithmChange = React.useCallback(
    (event): void => {
      const factorMin: number =
        event.target.id === SmoothingAlgorithmEnum.EMA
          ? emaProps.min
          : cmaProps.min;
      setFactor(factorMin);
      props.onSmoothingChange({
        smoothingAlgorithm: event.target.id,
        smoothingFactor: factorMin,
      });
    },
    [props],
  );

  function handleFactorChange(
    event: React.ChangeEvent<any>,
    val: number | any,
  ): void {
    if (val !== factor) {
      setFactor(val);
    }
  }

  function handleInterpolation(ev: React.ChangeEvent, checked: boolean): void {
    props.onSmoothingChange({
      curveInterpolation: checked ? CurveEnum.MonotoneX : CurveEnum.Linear,
    });
  }

  function handleSmoothingData(
    ev: React.ChangeEvent<any>,
    value: number | any,
  ): void {
    props.onSmoothingChange({
      smoothingFactor: value,
    });
  }

  const sliderProps = React.useMemo(() => {
    return props.smoothingAlgorithm === SmoothingAlgorithmEnum.EMA
      ? emaProps
      : cmaProps;
  }, [props.smoothingAlgorithm]);

  return (
    <Box>
      <Box p={1}>
        <div>Chart Smoothening:</div>
        <Slider
          defaultValue={0}
          valueLabelDisplay='auto'
          getAriaValueText={(val) => `${val}s`}
          value={factor}
          onChange={handleFactorChange}
          onChangeCommitted={handleSmoothingData}
          marks={sliderProps.marks}
          step={sliderProps.step}
          max={sliderProps.max}
          min={sliderProps.min}
        />
      </Box>
      <Divider />
      <MenuList>
        <MenuItem
          id={SmoothingAlgorithmEnum.EMA}
          selected={props.smoothingAlgorithm === SmoothingAlgorithmEnum.EMA}
          onClick={handleAlgorithmChange}
        >
          Exponential Moving Average
        </MenuItem>
        <MenuItem
          id={SmoothingAlgorithmEnum.CMA}
          selected={props.smoothingAlgorithm === SmoothingAlgorithmEnum.CMA}
          onClick={handleAlgorithmChange}
        >
          Centred Moving Average
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
          checked={props.curveInterpolation === CurveEnum.MonotoneX}
          color='primary'
          inputProps={{ 'aria-label': 'checkbox with default color' }}
          onChange={handleInterpolation}
        />
        <Box component='span'>Cubic</Box>
      </Box>
    </Box>
  );
}

export default React.memo(SmoothingPopover);
