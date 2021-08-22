import React from 'react';
import { Box, MenuList, MenuItem, Select, Divider } from '@material-ui/core';
import { XAlignmentEnum } from 'utils/d3';
import { IAlignmentPopoverProps } from 'types/components/AlignmentPopover/AlignmentPopover';

const alignmentList = [
  {
    type: XAlignmentEnum.Step,
    name: 'Step',
  },
  {
    type: XAlignmentEnum.Epoch,
    name: 'Epoch',
  },
  {
    type: XAlignmentEnum.RelativeTime,
    name: 'Relative Time',
  },
  {
    type: XAlignmentEnum.AbsoluteTime,
    name: 'Absolute Time',
  },
];
function AlignmentPopover({
  onAlignmentTypeChange,
  onAlignmentMetricChange,
  alignmentConfig,
}: IAlignmentPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  function handleTypeChange(e: React.ChangeEvent<any>) {
    const { id } = e.target;
    onAlignmentTypeChange(id);
  }

  function onMetricChange() {}
  return (
    <Box>
      <Box p={0.5}>Align X axis by:</Box>
      <Divider />
      <MenuList>
        {alignmentList.map(({ name, type }) => (
          <MenuItem
            key={name}
            selected={type === alignmentConfig.type}
            id={type}
            onClick={handleTypeChange}
          >
            {name}
          </MenuItem>
        ))}
        <MenuItem>
          Metric: <Select />
        </MenuItem>
      </MenuList>
    </Box>
  );
}

export default React.memo(AlignmentPopover);
