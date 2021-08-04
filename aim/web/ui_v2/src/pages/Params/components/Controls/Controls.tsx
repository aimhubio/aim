import React from 'react';
import { Grid } from '@material-ui/core';
import { MultilineChart } from '@material-ui/icons';

import { CurveEnum } from 'utils/d3';
import { IControlProps } from 'types/pages/params/components/controls/Controls';

function Controls({
  onCurveInterpolationChange,
  curveInterpolation,
}: IControlProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Grid
      container
      direction='column'
      justify='center'
      spacing={1}
      alignItems='center'
    >
      <Grid onClick={onCurveInterpolationChange} item>
        <MultilineChart
          style={{
            background:
              curveInterpolation === CurveEnum.Linear
                ? 'transparent'
                : 'rgba(20, 115, 230, 0.06)',
            cursor: 'pointer',
          }}
        />
      </Grid>
    </Grid>
  );
}

export default Controls;
