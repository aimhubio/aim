import React from 'react';
import { Grid } from '@material-ui/core';
import { MultilineChart, ColorLens, ShowChart } from '@material-ui/icons';

import { CurveEnum } from 'utils/d3';
import { IControlProps } from 'types/pages/params/components/controls/Controls';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import TooltipContentPopover from 'components/TooltipContentPopover/TooltipContentPopover';

function Controls(
  props: IControlProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Grid
      container
      direction='column'
      justifyContent='center'
      spacing={1}
      alignItems='center'
    >
      <Grid onClick={props.onCurveInterpolationChange} item>
        <MultilineChart
          style={{
            background:
              props.curveInterpolation === CurveEnum.Linear
                ? 'transparent'
                : 'rgba(20, 115, 230, 0.06)',
            cursor: 'pointer',
          }}
        />
      </Grid>
      <Grid onClick={props.onColorIndicatorChange} item>
        <ColorLens
          style={{
            background: !props.isVisibleColorIndicator
              ? 'transparent'
              : 'rgba(20, 115, 230, 0.06)',
            cursor: 'pointer',
          }}
        />
      </Grid>
      <div>
        <ControlPopover
          anchor={({ onAnchorClick }) => (
            <div onClick={onAnchorClick} className='Controls__anchor'>
              {/*TODO need to change icon */}
              <ShowChart />
            </div>
          )}
          component={
            <TooltipContentPopover
              selectOptions={props.selectOptions}
              selectedParams={props.tooltip.selectedParams}
              displayTooltip={props.tooltip.display}
              onChangeTooltip={props.onChangeTooltip}
            />
          }
        />
      </div>
    </Grid>
  );
}

export default Controls;
