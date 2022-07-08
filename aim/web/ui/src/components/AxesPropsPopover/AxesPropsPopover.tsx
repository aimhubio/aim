import React from 'react';
import _ from 'lodash-es';

import { Divider } from '@material-ui/core';

import { Text, SelectDropdown, InputWrapper } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IAxesPropsPopoverProps } from 'types/components/AxesPropsPopover/AxesPropsPopover';

import { isSystemMetric } from 'utils/isSystemMetric';
import { AlignmentOptionsEnum } from 'utils/d3';

import { ISelectDropdownOption } from '../kit/SelectDropdown';

import './AxesPropsPopover.scss';

const alignmentList: { value: string; label: string; group?: string }[] = [
  {
    value: AlignmentOptionsEnum.STEP,
    label: 'Step',
  },
  {
    value: AlignmentOptionsEnum.EPOCH,
    label: 'Epoch',
  },
  {
    value: AlignmentOptionsEnum.RELATIVE_TIME,
    label: 'Relative Time',
  },
  {
    value: AlignmentOptionsEnum.ABSOLUTE_TIME,
    label: 'Absolute Time',
  },
];

function AxesPropsPopover({
  onAlignmentTypeChange,
  onAlignmentMetricChange,
  onAxesScaleRangeChange,
  alignmentConfig,
  selectFormOptions,
  axesScaleRange,
}: IAxesPropsPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  const [yScaleRange, setYScaleRange] = React.useState<{
    min?: number;
    max?: number;
  }>({});
  const [isYScaleRangeValid, setIsYScaleRangeValid] = React.useState({
    min: true,
    max: true,
  });

  const handleAlignmentChange = React.useCallback(
    (option: ISelectDropdownOption): void => {
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

  const alignmentOptions = React.useMemo(() => {
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
    return alignmentList.concat(metricOptions);
  }, [selectFormOptions]);

  const selected = React.useMemo(() => {
    return alignmentConfig.type === AlignmentOptionsEnum.CUSTOM_METRIC
      ? alignmentConfig.metric
      : alignmentConfig.type;
  }, [alignmentConfig]);

  const onScaleRangeChange = React.useCallback(
    (key: string, newValue: number, metadata: any = { isValid: true }) => {
      setYScaleRange((prev) => ({
        ...prev,
        [key]: newValue,
      }));

      setIsYScaleRangeValid({
        min: true,
        max: true,
        [key]: metadata.isValid,
      });

      if (metadata.isValid) {
        const debouncedScaleRangeChange = _.debounce(
          onAxesScaleRangeChange,
          1000,
        );
        debouncedScaleRangeChange({
          yAxis: {
            ...yScaleRange,
            [key]: newValue,
          },
        });
      }
    },
    [onAxesScaleRangeChange, yScaleRange, setIsYScaleRangeValid],
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
  }, [axesScaleRange, setYScaleRange]);

  return (
    <ErrorBoundary>
      <div className='AxesPropsPopover'>
        <div className='AxesPropsPopover__alignment'>
          <Text component='p' tint={50} className='AxesPropsPopover__subtitle'>
            X AXIS ALIGNMENT:
          </Text>
          <SelectDropdown
            options={alignmentOptions}
            selected={selected}
            handleSelect={handleAlignmentChange}
          />
        </div>
        <Divider className='AxesPropsPopover__divider' />
        <div className='AxesPropsPopover__range'>
          <Text component='p' tint={50} className='AxesPropsPopover__subtitle'>
            SELECT RANGE:
          </Text>
          <div className='AxesPropsPopover__range__container'>
            <Text size={14} className='AxesPropsPopover__subtitle'>
              Y-axis range
            </Text>
            <InputWrapper
              key='min'
              label='Min'
              type='number'
              wrapperClassName='scaleRangeInput__min'
              value={yScaleRange.min}
              inputProps={{ step: 2 }}
              showMessageByTooltip
              tooltipPlacement='bottom'
              requiredNumberValue={false}
              onChange={(e, value, metadata) => {
                onScaleRangeChange('min', value, metadata);
              }}
              validationPatterns={validationPatterns({
                min: yScaleRange.min,
                max: yScaleRange.max,
              })}
              isValid={isYScaleRangeValid.min}
            />
            <InputWrapper
              key='max'
              label='Max'
              type='number'
              wrapperClassName='scaleRangeInput__max'
              value={yScaleRange.max}
              inputProps={{ step: 2 }}
              showMessageByTooltip
              tooltipPlacement='bottom'
              requiredNumberValue={false}
              onChange={(e, value, metadata) => {
                onScaleRangeChange('max', value, metadata);
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
