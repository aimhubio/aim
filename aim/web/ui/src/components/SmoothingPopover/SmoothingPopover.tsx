import React from 'react';

import { Divider, MenuItem, Slider } from '@material-ui/core';

import { Text, ToggleButton } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ISmoothingPopoverProps } from 'types/components/SmoothingPopover/SmoothingPopover';

import { SmoothingAlgorithmEnum } from 'utils/smoothingData';
import { CurveEnum } from 'utils/d3';

import './SmoothingPopover.scss';

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

  function handleInterpolation(value: CurveEnum, id: string | number): void {
    props.onSmoothingChange({
      curveInterpolation: value,
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
    <ErrorBoundary>
      <div className='SmoothingPopover'>
        <div className='SmoothingPopover__section'>
          <Text tint={50} component='h4' className='SmoothingPopover__subtitle'>
            Chart Smoothing
          </Text>
          <div className='SmoothingPopover__Slider'>
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
          </div>
          <div>
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
          </div>
        </div>
        <Divider className='SmoothingPopover__Divider' />
        <div className='SmoothingPopover__section'>
          <Text component='h4' tint={50} className='SmoothingPopover__subtitle'>
            Curve Interpolation method
          </Text>
          <ToggleButton
            className='SmoothingPopover__ToggleButton'
            title='Select Method'
            onChange={handleInterpolation}
            id='smoothing'
            rightLabel='Cubic'
            leftLabel='Linear'
            leftValue={CurveEnum.Linear}
            rightValue={CurveEnum.MonotoneX}
            value={props.curveInterpolation}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(SmoothingPopover);
