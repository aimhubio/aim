import React from 'react';
import { Box, Grid, makeStyles } from '@material-ui/core';

import Popup from 'components/Popup/Popup';
import AggregationPopup from 'components/AggregationPopup/AggregationPopup';
import SmootheningPopup from 'components/SmootheningPopup/SmootheningPopup';
import StepsDensityPopup from 'components/StepsDensityPopup/StepsDensityPopup';
import {
  BlurOn,
  CenterFocusWeak,
  GroupWorkOutlined,
  ImportExportOutlined,
  MultilineChart,
  ScatterPlot,
  ShowChart,
  ZoomIn,
  ZoomOut,
} from '@material-ui/icons';
import ZoomInPopup from 'components/ZoomInPopup/ZoomInPopup';
import ZoomOutPopup from 'components/ZoomOutPopup/ZoomOutPopup';
import HighlightModePopup from 'components/HighlightModesPopup/HighlightModePopup';

const useStyles = makeStyles(() => ({
  anchorIcon: {
    cursor: 'pointer',
  },
}));
function Controls(): React.FunctionComponentElement<React.ReactNode> {
  const classes = useStyles();
  return (
    <Grid
      container
      direction='column'
      justify='center'
      spacing={1}
      alignItems='center'
    >
      <Grid item>
        <BlurOn className={classes.anchorIcon} />
      </Grid>
      <Grid item>
        <Box className={classes.anchorIcon}>
          <ShowChart />
        </Box>
      </Grid>
      <Grid item>
        <Popup
          anchor={({ handleClick }) => (
            <Box onClick={handleClick} className={classes.anchorIcon}>
              <GroupWorkOutlined />
            </Box>
          )}
          component={<AggregationPopup />}
        />
      </Grid>
      <Grid item>
        <Popup
          anchor={({ handleClick }) => (
            <Box onClick={handleClick} className={classes.anchorIcon}>
              <ScatterPlot />
            </Box>
          )}
          component={<StepsDensityPopup />}
        />
      </Grid>
      <Grid item>
        <Popup
          anchor={({ handleClick }) => (
            <Box onClick={handleClick} className={classes.anchorIcon}>
              <MultilineChart />
            </Box>
          )}
          component={<SmootheningPopup />}
        />
      </Grid>
      <Grid item>
        <Popup
          anchor={({ handleClick }) => (
            <Box className={classes.anchorIcon} onClick={handleClick}>
              <ZoomIn />
            </Box>
          )}
          component={<ZoomInPopup />}
        />
      </Grid>
      <Grid item>
        <Popup
          anchor={({ handleClick }) => (
            <Box className={classes.anchorIcon} onClick={handleClick}>
              <ZoomOut />
            </Box>
          )}
          component={<ZoomOutPopup />}
        />
      </Grid>
      <Grid item>
        <Popup
          anchor={({ handleClick }) => (
            <Box className={classes.anchorIcon} onClick={handleClick}>
              <CenterFocusWeak />
            </Box>
          )}
          component={<HighlightModePopup />}
        />
      </Grid>
      <Grid item>
        <ImportExportOutlined />
      </Grid>
    </Grid>
  );
}

export default Controls;
