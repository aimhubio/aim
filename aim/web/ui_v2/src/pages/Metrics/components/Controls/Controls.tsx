import React from 'react';
import { Box, Grid } from '@material-ui/core';
import {
  BlurCircular,
  BlurOn,
  CenterFocusWeak,
  GroupWorkOutlined,
  ImportExportOutlined,
  KeyboardArrowLeft,
  MultilineChart,
  ScatterPlot,
  ShowChart,
  ZoomIn,
  ZoomOut,
} from '@material-ui/icons';

import AggregationPopup from 'components/AggregationPopover/AggregationPopover';
import SmootheningPopup from 'components/SmoothingPopover/SmoothingPopover';
import StepsDensityPopup from 'components/StepsDensityPopover/StepsDensityPopover';
import ZoomInPopup from 'components/ZoomInPopover/ZoomInPopover';
import ZoomOutPopup from 'components/ZoomOutPopover/ZoomOutPopover';
import HighlightModePopup from 'components/HighlightModesPopover/HighlightModesPopover';
import ControlPopover from 'components/ControlPopover/ControlPopover';

import { IControlProps } from 'types/pages/metrics/components/controls/Controls';

import useStyles from './controlsStyles';

function Controls(
  props: IControlProps,
): React.FunctionComponentElement<React.ReactNode> {
  const classes = useStyles();
  return (
    <Grid
      container
      direction='column'
      justify='center'
      spacing={1}
      alignItems='center'
    >
      <Grid onClick={props.toggleDisplayOutliers} item>
        {props.displayOutliers ? (
          <BlurOn className={classes.anchor} />
        ) : (
          <BlurCircular color='primary' className={classes.anchor} />
        )}
      </Grid>
      <Grid item>
        <Box className={classes.anchor}>
          <ShowChart />
        </Box>
      </Grid>
      <Grid item>
        <ControlPopover
          anchor={({ onAnchorClick }) => (
            <Box onClick={onAnchorClick} className={classes.anchor}>
              <GroupWorkOutlined />
            </Box>
          )}
          component={<AggregationPopup />}
        />
      </Grid>
      <Grid item>
        <ControlPopover
          anchor={({ onAnchorClick }) => (
            <Box onClick={onAnchorClick} className={classes.anchor}>
              <ScatterPlot />
            </Box>
          )}
          component={<StepsDensityPopup />}
        />
      </Grid>
      <Grid item>
        <ControlPopover
          anchor={({ onAnchorClick }) => (
            <Box onClick={onAnchorClick} className={classes.anchor}>
              <MultilineChart />
            </Box>
          )}
          component={
            <SmootheningPopup handleSmoothing={props.handleSmoothing} />
          }
        />
      </Grid>
      <Grid item>
        <ControlPopover
          anchor={({ onAnchorClick, opened }) => (
            <Box className={classes.anchor} position='relative'>
              <span
                className={`${classes.anchorArrow} ${opened ? 'opened' : ''}`}
                onClick={onAnchorClick}
              >
                <KeyboardArrowLeft className='arrowLeft' />
              </span>
              <ZoomIn
                color={props.zoomMode ? 'primary' : 'inherit'}
                onClick={props.toggleZoomMode}
              />
            </Box>
          )}
          component={<ZoomInPopup />}
        />
      </Grid>
      <Grid item>
        <ControlPopover
          anchor={({ onAnchorClick, opened }) => (
            <Box className={classes.anchor} position='relative'>
              <span
                className={`${classes.anchorArrow} ${opened ? 'opened' : ''}`}
                onClick={onAnchorClick}
              >
                <KeyboardArrowLeft className='arrowLeft' />
              </span>
              <ZoomOut onClick={props.toggleZoomMode} />
            </Box>
          )}
          component={<ZoomOutPopup />}
        />
      </Grid>
      <Grid item>
        <ControlPopover
          anchor={({ onAnchorClick }) => (
            <Box className={classes.anchor} onClick={onAnchorClick}>
              <CenterFocusWeak />
            </Box>
          )}
          component={<HighlightModePopup />}
        />
      </Grid>
      <Grid item>
        <Box className={classes.anchor}>
          <ImportExportOutlined />
        </Box>
      </Grid>
    </Grid>
  );
}

export default Controls;
