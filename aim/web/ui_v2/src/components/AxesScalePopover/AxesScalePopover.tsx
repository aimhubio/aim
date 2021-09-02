import React, { ChangeEvent } from 'react';

import { ScaleEnum } from 'utils/d3';
import ToggleButton from 'components/ToggleButton/ToggleButton';
import {
  IAxesScalePopoverProps,
  IAxesScaleState,
} from 'types/components/AxesScalePopover/AxesScalePopover';

import './AxesScalePopover.scss';

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
    <div className='AxesScalePopover__container'>
      <div>
        <span>X-axis scale:</span>
        <ToggleButton
          checked={props.axesScaleType.xAxis === ScaleEnum.Log}
          id='xAxis'
          leftLabel='Linear'
          rightLabel='Log'
          onChange={handleScaleChange}
        />
      </div>
      <div>
        Y-axis scale:
        <ToggleButton
          checked={props.axesScaleType.yAxis === ScaleEnum.Log}
          id='yAxis'
          leftLabel='Linear'
          rightLabel='Log'
          onChange={handleScaleChange}
        />
      </div>
    </div>
  );
}

export default React.memo(AxesScalePopover);
