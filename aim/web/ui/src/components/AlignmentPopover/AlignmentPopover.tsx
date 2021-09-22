import React from 'react';
import { MenuItem, Select } from '@material-ui/core';

import { IAlignmentPopoverProps } from 'types/components/AlignmentPopover/AlignmentPopover';
import { AlignmentOptions } from 'config/alignment/alignmentOptions';

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

function AlignmentPopover({
  onAlignmentTypeChange,
  onAlignmentMetricChange,
  alignmentConfig,
  projectsDataMetrics,
}: IAlignmentPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  function handleTypeChange(e: React.ChangeEvent<any>) {
    const { id } = e.target;
    onAlignmentTypeChange(+id);
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
      <div className='AlignmentPopover__types'>
        {alignmentList.map(({ name, type }) => (
          <MenuItem
            key={name}
            selected={type === alignmentConfig.type}
            id={`${type}`}
            onClick={handleTypeChange}
          >
            {name}
          </MenuItem>
        ))}
      </div>
      <div className='AlignmentPopover__select'>
        <span>Metric:</span>
        <Select
          fullWidth
          // variant='outlined'
          value={alignmentConfig.metric}
          onChange={onMetricChange}
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
