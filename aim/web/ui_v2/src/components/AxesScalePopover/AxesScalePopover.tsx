import React, { ChangeEvent } from 'react';
import { Box, Divider, MenuList } from '@material-ui/core';

import { ScaleEnum } from 'utils/d3';
import ToggleButton from 'components/ToggleButton/ToggleButton';
import {
  IAxesScalePopoverProps,
  IAxesScaleState,
} from 'types/components/AxesScalePopover/AxesScalePopover';

function AxesScalePopover(
  props: IAxesScalePopoverProps,
): React.FunctionComponentElement<React.ReactNode> {
  function handleScaleChange(
    event: ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) {
    const { id } = event.target;
    const value: ScaleEnum = checked ? ScaleEnum.Log : ScaleEnum.Linear;
    const scaleParams: IAxesScaleState = {
      ...props.axesScaleType,
      [id]: value,
    };
    props.onAxesScaleTypeChange(scaleParams);
  }

  return (
    <div>
      <Box p={0.5}>Select Axes Scale:</Box>
      <Divider />
      <MenuList>
        <Box display='flex' alignItems='center' p={1}>
          <span>X-axis scale:</span>
          <ToggleButton
            checked={props.axesScaleType.xAxis === ScaleEnum.Log}
            id='xAxis'
            leftLabel='Linear'
            rightLabel='Log'
            onChange={handleScaleChange}
          />
        </Box>
        <Box display='flex' alignItems='center' p={1}>
          Y-axis scale:
          <ToggleButton
            checked={props.axesScaleType.yAxis === ScaleEnum.Log}
            id='yAxis'
            leftLabel='Linear'
            rightLabel='Log'
            onChange={handleScaleChange}
          />
        </Box>
      </MenuList>
    </div>
  );
}

export default React.memo(AxesScalePopover);
