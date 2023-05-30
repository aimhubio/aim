import React from 'react';

import { Divider, MenuItem, Slider } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary';
import { Text, ToggleButton } from 'components/kit';

import { CONTROLS_DEFAULT_CONFIG } from 'config/controls/controlsDefaultConfig';

import { SmoothingAlgorithmEnum } from 'utils/smoothingData';
import { CurveEnum } from 'utils/d3';

import { ISmoothingPopoverProps } from './index';

import './SmoothingPopover.scss';

const EMA_PROPS = {
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
  default: CONTROLS_DEFAULT_CONFIG.metrics.smoothing.factor,
};

const CMA_PROPS = {
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
  default: 59,
};

function SmoothingPopover(props: ISmoothingPopoverProps) {
  const {
    visualizationName,
    engine: { useStore, visualizations },
  } = props;
  const vizEngine = visualizations[visualizationName];
  const smoothing = useStore(vizEngine.controls.smoothing.stateSelector);
  const updateSmoothingConfig = vizEngine.controls.smoothing.methods.update;

  const [factor, setFactor] = React.useState<number>(smoothing.factor);

  const handleAlgorithmChange = React.useCallback(
    (event): void => {
      const factorMin =
        event.target.id === SmoothingAlgorithmEnum.EMA
          ? EMA_PROPS.default
          : CMA_PROPS.default;

      setFactor(factorMin);

      updateSmoothingConfig({ algorithm: event.target.id, factor: factorMin });
    },
    [updateSmoothingConfig, setFactor],
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
    updateSmoothingConfig({ curveInterpolation: value });
  }

  function handleSmoothingData(
    ev: React.ChangeEvent<any>,
    value: number | any,
  ): void {
    updateSmoothingConfig({ factor: value });
  }

  const sliderProps = React.useMemo(() => {
    return smoothing.algorithm === SmoothingAlgorithmEnum.EMA
      ? EMA_PROPS
      : CMA_PROPS;
  }, [smoothing.algorithm]);

  return (
    <ErrorBoundary>
      <div className='SmoothingPopover'>
        <div>
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
              selected={smoothing.algorithm === SmoothingAlgorithmEnum.EMA}
              onClick={handleAlgorithmChange}
            >
              Exponential Moving Average
            </MenuItem>
            <MenuItem
              id={SmoothingAlgorithmEnum.CMA}
              selected={smoothing.algorithm === SmoothingAlgorithmEnum.CMA}
              onClick={handleAlgorithmChange}
            >
              Centred Moving Average
            </MenuItem>
          </div>
        </div>
        <Divider className='SmoothingPopover__divider' />
        <div>
          <Text component='h4' tint={50} className='SmoothingPopover__subtitle'>
            Curve Interpolation method
          </Text>
          <ToggleButton
            className='SmoothingPopover__toggleButton'
            title='Select Method'
            onChange={handleInterpolation}
            id='smoothing'
            rightLabel='Cubic'
            leftLabel='Linear'
            leftValue={CurveEnum.Linear}
            rightValue={CurveEnum.MonotoneX}
            value={smoothing.curveInterpolation}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

SmoothingPopover.displayName = 'SmoothingPopover';

export default React.memo(SmoothingPopover);
