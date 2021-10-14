import React from 'react';
import { MenuItem, Select } from '@material-ui/core';

import { IAlignmentPopoverProps } from 'types/components/AlignmentPopover/AlignmentPopover';
import { AlignmentOptions } from 'config/alignment/alignmentOptions';
import { DensityOptions } from 'config/enums/densityEnum';
import { Text } from 'components/kit';

import './AlignmentPopover.scss';

const alignmentList: { type: AlignmentOptions; name: string }[] = [
  {
    type: AlignmentOptions.STEP,
    name: 'Step',
  },
  {
    type: AlignmentOptions.EPOCH,
    name: 'Epoch',
  },
  {
    type: AlignmentOptions.RELATIVE_TIME,
    name: 'Relative Time',
  },
  {
    type: AlignmentOptions.ABSOLUTE_TIME,
    name: 'Absolute Time',
  },
];

const densityList: { type: DensityOptions; name: string }[] = [
  {
    type: DensityOptions.Minimum,
    name: 'Minimum',
  },
  {
    type: DensityOptions.Medium,
    name: 'Medium',
  },
  {
    type: DensityOptions.Maximum,
    name: 'Maximum',
  },
];

function AlignmentPopover({
  onAlignmentTypeChange,
  onDensityTypeChange,
  onAlignmentMetricChange,
  alignmentConfig,
  densityType,
  projectsDataMetrics,
}: IAlignmentPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  function handleAlignmentTypeChange(e: React.ChangeEvent<any>) {
    const { id } = e.target;
    onAlignmentTypeChange(+id);
  }

  function handleDensityTypeChange(e: React.ChangeEvent<any>) {
    const { id } = e.target;
    onDensityTypeChange(+id);
  }

  function onMetricChange(e: React.ChangeEvent<any>) {
    const value = e.target.value;
    onAlignmentMetricChange(value);
  }

  const metricOptions: string[] = React.useMemo(() => {
    let data: string[] = [];
    if (projectsDataMetrics) {
      for (let key in projectsDataMetrics) {
        data.push(key);
      }
    }
    return data;
  }, [projectsDataMetrics]);

  return (
    <div className='AlignmentPopover__container'>
      <div className='AlignmentPopover__container__densityOptions AlignmentPopover__container__options'>
        <Text
          component='p'
          size={6}
          color='primary'
          tint={50}
          className='AlignmentPopover__container__options__title'
        >
          Density:
        </Text>
        {densityList.map(({ name, type }) => (
          <MenuItem
            key={name}
            selected={type === densityType}
            id={`${type}`}
            onClick={handleDensityTypeChange}
          >
            {name}
          </MenuItem>
        ))}
      </div>
      <div className='AlignmentPopover__container__options'>
        <Text
          component='p'
          size={6}
          color='primary'
          tint={50}
          className='AlignmentPopover__container__options__title'
        >
          Alignment:
        </Text>
        {alignmentList.map(({ name, type }) => (
          <MenuItem
            key={name}
            selected={type === alignmentConfig.type}
            id={`${type}`}
            onClick={handleAlignmentTypeChange}
          >
            {name}
          </MenuItem>
        ))}
      </div>
      <div className='AlignmentPopover__container__selectContainer AlignmentPopover__container__options'>
        <Text
          component='p'
          size={6}
          color='primary'
          tint={50}
          className='AlignmentPopover__container__options__title'
        >
          Metric:
        </Text>
        {/* @TODO Change to our dropdown component,because this one doesn't match to our design*/}
        <Select
          className='AlignmentPopover__container__selectContainer__select'
          variant='outlined'
          value={alignmentConfig.metric}
          onChange={onMetricChange}
          label={'Select...'}
        >
          {metricOptions.map((metric) => (
            <MenuItem key={metric} value={metric}>
              {metric}
            </MenuItem>
          ))}
        </Select>
      </div>
    </div>
  );
}

export default React.memo(AlignmentPopover);
