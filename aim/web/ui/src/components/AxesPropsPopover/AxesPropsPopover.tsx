import React from 'react';
import _ from 'lodash-es';

import { Divider } from '@material-ui/core';

import { Text, SelectDropdown, InputWrapper } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { isSystemMetric } from 'utils/isSystemMetric';
import { AlignmentOptionsEnum } from 'utils/d3';

import { ISelectDropdownOption as ISelectOption } from '../kit/SelectDropdown';

import {
  IAxesPropsPopoverProps,
  IAxesRangeValidation,
  IAxesRangeValue,
  DROPDOWN_LIST_HEIGHT,
  METRICS_ALIGNMENT_LIST,
} from './';

import './AxesPropsPopover.scss';

function AxesPropsPopover({
  onAlignmentTypeChange,
  onAlignmentMetricChange,
  onAxesScaleRangeChange,
  alignmentConfig,
  selectFormOptions,
  axesScaleRange,
}: IAxesPropsPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  const [yScaleRange, setYScaleRange] = React.useState<IAxesRangeValue>({});
  const [isYScaleRangeValid, setIsYScaleRangeValid] =
    React.useState<IAxesRangeValidation>({
      min: true,
      max: true,
    });
  const [xScaleRange, setXScaleRange] = React.useState<IAxesRangeValue>({});
  const [isXScaleRangeValid, setIsXScaleRangeValid] =
    React.useState<IAxesRangeValidation>({
      min: true,
      max: true,
    });

  const handleAlignmentChange = React.useCallback(
    (option: ISelectOption): void => {
      if (option) {
        if (option.group === 'METRIC') {
          onAlignmentMetricChange(option.value);
        } else {
          onAlignmentTypeChange(option.value as AlignmentOptionsEnum);
        }
      }
    },
    [onAlignmentMetricChange, onAlignmentTypeChange],
  );

  const alignmentOptions: ISelectOption[] = React.useMemo(() => {
    let metricOptions: { value: string; label: string; group: string }[] = [];
    if (selectFormOptions) {
      for (let option of selectFormOptions) {
        if (
          option?.value?.option_name &&
          option?.value?.context === null &&
          !isSystemMetric(option.value.option_name)
        ) {
          metricOptions.push({
            value: option.label,
            label: option.label,
            group: 'METRIC',
          });
        }
      }
    }
    return METRICS_ALIGNMENT_LIST.concat(metricOptions);
  }, [selectFormOptions]);

  const selected = React.useMemo(() => {
    return alignmentConfig.type === AlignmentOptionsEnum.CUSTOM_METRIC
      ? alignmentConfig.metric
      : alignmentConfig.type;
  }, [alignmentConfig]);

  const onScaleRangeChange = React.useCallback(
    (
      axisType: 'x' | 'y',
      key: string,
      newValue: number,
      metadata: any = { isValid: true },
    ) => {
      const axisRelated = {
        x: {
          scaleRange: xScaleRange,
          setScaleRange: setXScaleRange,
          setIsScaleRangeValid: setIsXScaleRangeValid,
          stateKey: 'xAxis',
        },
        y: {
          scaleRange: yScaleRange,
          setScaleRange: setYScaleRange,
          setIsScaleRangeValid: setIsYScaleRangeValid,
          stateKey: 'yAxis',
        },
      };
      const { setScaleRange, setIsScaleRangeValid, stateKey, scaleRange } =
        axisRelated[axisType];

      setScaleRange((prev) => ({
        ...prev,
        [key]: newValue,
      }));
      setIsScaleRangeValid({
        min: true,
        max: true,
        [key]: metadata.isValid,
      });

      if (metadata.isValid) {
        onAxesScaleRangeChange({
          [stateKey]: { ...scaleRange, [key]: newValue },
        });
      }
    },
    [
      xScaleRange,
      yScaleRange,
      setXScaleRange,
      setYScaleRange,
      onAxesScaleRangeChange,
    ],
  );

  const validationPatterns = React.useCallback(
    ({ min, max }: { min?: number; max?: number }) => [
      {
        errorCondition: (value: number) =>
          min === undefined ? false : value < min,
        errorText: `Value should be equal or greater then ${min}`,
      },
      {
        errorCondition: (value: number) =>
          max === undefined ? false : value > max,
        errorText: `Value should be equal or smaller then ${max}`,
      },
    ],
    [],
  );

  React.useEffect(() => {
    setYScaleRange((state) =>
      _.isEmpty(state) ? axesScaleRange.yAxis : state,
    );
  }, [axesScaleRange.yAxis, setYScaleRange]);

  React.useEffect(() => {
    setXScaleRange((state) =>
      _.isEmpty(state) ? axesScaleRange.xAxis : state,
    );
  }, [axesScaleRange.xAxis, setXScaleRange]);

  return (
    <ErrorBoundary>
      <div className='AxesPropsPopover'>
        <div className='AxesPropsPopover__alignment'>
          <Text component='p' tint={50} className='AxesPropsPopover__subtitle'>
            X AXIS ALIGNMENT:
          </Text>
          <SelectDropdown
            selectOptions={alignmentOptions}
            selected={selected}
            handleSelect={handleAlignmentChange}
            ListboxProps={{
              style: { height: DROPDOWN_LIST_HEIGHT, padding: 0 },
            }}
          />
        </div>
        <Divider className='AxesPropsPopover__divider' />
        <div className='AxesPropsPopover__range'>
          <Text component='p' tint={50} className='AxesPropsPopover__subtitle'>
            SELECT RANGE:
          </Text>
          <div className='AxesPropsPopover__range__container xAxis'>
            <Text size={14} className='scaleRangeInputs__label'>
              X-axis range
            </Text>
            <InputWrapper
              key='x-min'
              label='Min'
              type='number'
              wrapperClassName='scaleRangeInputs__min'
              value={xScaleRange.min}
              inputProps={{ step: 2 }}
              showMessageByTooltip
              tooltipPlacement='bottom'
              isRequiredNumberValue={false}
              isNumberValueFloat
              onChange={(e, value, metadata) => {
                onScaleRangeChange('x', 'min', value, metadata);
              }}
              validationPatterns={validationPatterns({
                min: xScaleRange.min,
                max: xScaleRange.max,
              })}
              isValid={isXScaleRangeValid.min}
            />
            <InputWrapper
              key='x-max'
              label='Max'
              type='number'
              wrapperClassName='scaleRangeInputs__max'
              value={xScaleRange.max}
              inputProps={{ step: 2 }}
              showMessageByTooltip
              tooltipPlacement='bottom'
              isRequiredNumberValue={false}
              isNumberValueFloat
              onChange={(e, value, metadata) => {
                onScaleRangeChange('x', 'max', value, metadata);
              }}
              validationPatterns={validationPatterns({
                min: xScaleRange.min,
                max: xScaleRange.max,
              })}
              isValid={isXScaleRangeValid.max}
            />
          </div>
          <div className='AxesPropsPopover__range__container yAxis'>
            <Text size={14} className='scaleRangeInputs__label'>
              Y-axis range
            </Text>
            <InputWrapper
              key='y-min'
              label='Min'
              type='number'
              wrapperClassName='scaleRangeInputs__min'
              value={yScaleRange.min}
              inputProps={{ step: 2 }}
              showMessageByTooltip
              tooltipPlacement='bottom'
              isRequiredNumberValue={false}
              isNumberValueFloat
              onChange={(e, value, metadata) => {
                onScaleRangeChange('y', 'min', value, metadata);
              }}
              validationPatterns={validationPatterns({
                min: yScaleRange.min,
                max: yScaleRange.max,
              })}
              isValid={isYScaleRangeValid.min}
            />
            <InputWrapper
              key='y-max'
              label='Max'
              type='number'
              wrapperClassName='scaleRangeInputs__max'
              value={yScaleRange.max}
              inputProps={{ step: 2 }}
              showMessageByTooltip
              tooltipPlacement='bottom'
              isRequiredNumberValue={false}
              isNumberValueFloat
              onChange={(e, value, metadata) => {
                onScaleRangeChange('y', 'max', value, metadata);
              }}
              validationPatterns={validationPatterns({
                min: yScaleRange.min,
                max: yScaleRange.max,
              })}
              isValid={isYScaleRangeValid.max}
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(AxesPropsPopover);
