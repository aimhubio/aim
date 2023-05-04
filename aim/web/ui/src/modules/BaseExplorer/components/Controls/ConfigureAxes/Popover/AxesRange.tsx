import React from 'react';
import _ from 'lodash-es';

import { Button, Icon, InputWrapper, Text } from 'components/kit';
import {
  IAxesRangeValidation,
  IAxesRangeValue,
} from 'components/AxesPropsPopover';

import { IAxesRangeProps } from './index';

const RANGE_DEBOUNCE_DELAY = 300;

function AxesRange(props: IAxesRangeProps) {
  const {
    visualizationName,
    engine: { visualizations },
    axesRangeConfig,
  } = props;
  const vizEngine = visualizations[visualizationName];
  const updateAxesProps = vizEngine.controls.axesProperties.methods.update;

  const [yScaleRange, setYScaleRange] = React.useState<IAxesRangeValue>({});
  const [isYScaleRangeValid, setIsYScaleRangeValid] =
    React.useState<IAxesRangeValidation>({ min: true, max: true });
  const [xScaleRange, setXScaleRange] = React.useState<IAxesRangeValue>({});
  const [isXScaleRangeValid, setIsXScaleRangeValid] =
    React.useState<IAxesRangeValidation>({ min: true, max: true });

  const updateAxesScaleRange = React.useCallback(
    (range) => {
      updateAxesProps({
        axesScaleRange: { ...axesRangeConfig, ...range },
      });
    },
    [updateAxesProps, axesRangeConfig],
  );

  const axesProps = React.useMemo(
    () => ({
      xAxis: {
        scaleRange: xScaleRange,
        setScaleRange: setXScaleRange,
        setIsScaleRangeValid: setIsXScaleRangeValid,
      },
      yAxis: {
        scaleRange: yScaleRange,
        setScaleRange: setYScaleRange,
        setIsScaleRangeValid: setIsYScaleRangeValid,
      },
    }),
    [xScaleRange, yScaleRange],
  );

  const onScaleRangeChange = React.useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      value: any,
      metadata: any = { isValid: true },
    ) => {
      const [axisType, key] = (e.target?.id || '').split('-') as [
        axisType: 'xAxis' | 'yAxis',
        key: 'min' | 'max',
      ];
      if (axisType && key) {
        const { setScaleRange, setIsScaleRangeValid, scaleRange } =
          axesProps[axisType];
        setScaleRange((prev) => ({
          ...prev,
          [key]: value,
        }));
        setIsScaleRangeValid({
          min: true,
          max: true,
          [key]: metadata.isValid,
        });
        if (metadata.isValid) {
          updateAxesScaleRange({ [axisType]: { ...scaleRange, [key]: value } });
        }
      }
    },
    [updateAxesScaleRange, axesProps],
  );

  const onResetRange = React.useCallback(
    (axisType: 'xAxis' | 'yAxis') => {
      updateAxesScaleRange({ [axisType]: { min: undefined, max: undefined } });
    },
    [updateAxesScaleRange],
  );

  const validationPatterns = React.useMemo(
    () => ({
      min: (max?: number) => [
        {
          errorCondition: (value: number) =>
            max === undefined ? false : value > max,
          errorText: `Value should be equal or smaller then ${max}`,
        },
      ],
      max: (min?: number) => [
        {
          errorCondition: (value: number) =>
            min === undefined ? false : value < min,
          errorText: `Value should be equal or greater then ${min}`,
        },
      ],
    }),
    [],
  );

  React.useEffect(() => {
    setXScaleRange((prevState) =>
      _.isEqual(axesRangeConfig.xAxis, prevState)
        ? prevState
        : axesRangeConfig.xAxis,
    );
    setYScaleRange((prevState) =>
      _.isEqual(axesRangeConfig.yAxis, prevState)
        ? prevState
        : axesRangeConfig.yAxis,
    );
  }, [axesRangeConfig]);

  const xResetBtnDisabled = React.useMemo(
    () => xScaleRange.min === undefined && xScaleRange.max === undefined,
    [xScaleRange],
  );
  const yResetBtnDisabled = React.useMemo(
    () => yScaleRange.min === undefined && yScaleRange.max === undefined,
    [yScaleRange],
  );

  return (
    <div className='AxesRange'>
      <Text component='p' tint={50} className='AxesRange__subtitle'>
        SET AXES RANGE:
      </Text>
      <div className='AxesRange__container xAxis'>
        <Text size={14} className='scaleRangeInputs__label'>
          X-axis
        </Text>
        <InputWrapper
          id='xAxis-min'
          key='xAxis-min'
          label='Min'
          type='number'
          InputLabelProps={{ shrink: true }}
          wrapperClassName='scaleRangeInputs__min'
          value={xScaleRange.min}
          showMessageByTooltip
          tooltipPlacement='bottom'
          isRequiredNumberValue={false}
          isNumberValueFloat
          debounceDelay={RANGE_DEBOUNCE_DELAY}
          onChange={onScaleRangeChange}
          validationPatterns={validationPatterns.min(xScaleRange.max)}
          isValid={isXScaleRangeValid.min}
        />
        <InputWrapper
          id='xAxis-max'
          key='xAxis-max'
          label='Max'
          type='number'
          InputLabelProps={{ shrink: true }}
          wrapperClassName='scaleRangeInputs__max'
          value={xScaleRange.max}
          showMessageByTooltip
          tooltipPlacement='bottom'
          isRequiredNumberValue={false}
          isNumberValueFloat
          debounceDelay={RANGE_DEBOUNCE_DELAY}
          onChange={onScaleRangeChange}
          validationPatterns={validationPatterns.max(xScaleRange.min)}
          isValid={isXScaleRangeValid.max}
        />
        <Button
          disabled={xResetBtnDisabled}
          className='scaleRangeInputs__resetButton'
          onClick={() => !xResetBtnDisabled && onResetRange('xAxis')}
          withOnlyIcon={true}
        >
          <Icon name='reset' />
        </Button>
      </div>
      <div className='AxesRange__container yAxis'>
        <Text size={14} className='scaleRangeInputs__label'>
          Y-axis
        </Text>
        <InputWrapper
          id='yAxis-min'
          key='yAxis-min'
          label='Min'
          type='number'
          InputLabelProps={{ shrink: true }}
          wrapperClassName='scaleRangeInputs__min'
          value={yScaleRange.min}
          showMessageByTooltip
          tooltipPlacement='bottom'
          isRequiredNumberValue={false}
          isNumberValueFloat
          debounceDelay={RANGE_DEBOUNCE_DELAY}
          onChange={onScaleRangeChange}
          validationPatterns={validationPatterns.min(yScaleRange.max)}
          isValid={isYScaleRangeValid.min}
        />
        <InputWrapper
          id='yAxis-max'
          key='yAxis-max'
          label='Max'
          type='number'
          InputLabelProps={{ shrink: true }}
          wrapperClassName='scaleRangeInputs__max'
          value={yScaleRange.max}
          showMessageByTooltip
          tooltipPlacement='bottom'
          isRequiredNumberValue={false}
          isNumberValueFloat
          debounceDelay={RANGE_DEBOUNCE_DELAY}
          onChange={onScaleRangeChange}
          validationPatterns={validationPatterns.max(yScaleRange.min)}
          isValid={isYScaleRangeValid.max}
        />
        <Button
          disabled={yResetBtnDisabled}
          className='scaleRangeInputs__resetButton'
          onClick={() => !yResetBtnDisabled && onResetRange('yAxis')}
          withOnlyIcon={true}
        >
          <Icon name='reset' />
        </Button>
      </div>
    </div>
  );
}

export default React.memo(AxesRange);
