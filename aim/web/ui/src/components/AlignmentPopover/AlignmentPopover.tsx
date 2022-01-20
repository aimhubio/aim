import React, { useState } from 'react';

import { Divider, MenuItem } from '@material-ui/core';

import { Text, Dropdown } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { DensityOptions } from 'config/enums/densityEnum';

import { IAlignmentPopoverProps } from 'types/components/AlignmentPopover/AlignmentPopover';

import { isSystemMetric } from 'utils/isSystemMetric';
import { AlignmentOptionsEnum } from 'utils/d3';

import './AlignmentPopover.scss';

const alignmentList: { type: AlignmentOptionsEnum; name: string }[] = [
  {
    type: AlignmentOptionsEnum.STEP,
    name: 'Step',
  },
  {
    type: AlignmentOptionsEnum.EPOCH,
    name: 'Epoch',
  },
  {
    type: AlignmentOptionsEnum.RELATIVE_TIME,
    name: 'Relative Time',
  },
  {
    type: AlignmentOptionsEnum.ABSOLUTE_TIME,
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
  const [open, setOpen] = useState<boolean>(false);
  function handleAlignmentTypeChange(e: React.ChangeEvent<any>): void {
    const { id } = e.target;
    onAlignmentTypeChange(+id);
  }

  function handleDensityTypeChange(e: React.ChangeEvent<any>): void {
    const { id } = e.target;
    onDensityTypeChange(+id);
  }

  function onMetricChange(
    field: { value: string; label: string } | null,
  ): void {
    if (field) {
      onAlignmentMetricChange(field.value);
    }
  }

  const metricOptions: { value: string; label: string }[] =
    React.useMemo(() => {
      let data: { value: string; label: string }[] = [];
      if (projectsDataMetrics) {
        for (let key in projectsDataMetrics) {
          if (!isSystemMetric(key)) {
            data.push({ value: key, label: key });
          }
        }
      }
      return data;
    }, [projectsDataMetrics]);

  return (
    <ErrorBoundary>
      <div className='AlignmentPopover'>
        <div>
          <Text
            component='p'
            size={12}
            color='primary'
            tint={50}
            className='AlignmentPopover__subtitle'
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
        <Divider className='AlignmentPopover__Divider' />
        <div>
          <Text
            component='p'
            size={12}
            color='primary'
            tint={50}
            className='AlignmentPopover__subtitle'
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
        <div className='AlignmentPopover__selectContainer'>
          <Text
            component='p'
            size={12}
            color='primary'
            tint={50}
            className='AlignmentPopover__subtitle'
          >
            Metric:
          </Text>
          <div className='AlignmentPopover__selectContainer__selectBox'>
            <Dropdown
              size='large'
              isColored
              onChange={onMetricChange}
              value={alignmentConfig.metric}
              options={metricOptions}
              onMenuOpen={() => setOpen(true)}
              onMenuClose={() => setOpen(false)}
              open={open}
              withPortal
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(AlignmentPopover);
