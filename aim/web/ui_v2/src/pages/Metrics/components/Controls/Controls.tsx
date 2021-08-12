import React from 'react';
import { Box, Grid } from '@material-ui/core';
import {
  BlurCircular,
  BlurOn,
  CenterFocusWeak,
  GroupWorkOutlined,
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
import AxesScalePopover from 'components/AxesScalePopover/AxesScalePopover';

function Controls(
  props: IControlProps,
): React.FunctionComponentElement<React.ReactNode> {
  const classes = useStyles();

  return (
    <Grid
      container
      direction='column'
      justifyContent='center'
      spacing={1}
      alignItems='center'
    >
      <Grid onClick={props.onDisplayOutliersChange} item>
        {props.displayOutliers ? (
          <BlurOn className={classes.anchor} />
        ) : (
          <BlurCircular color='primary' className={classes.anchor} />
        )}
      </Grid>
      <Grid item>
        <ControlPopover
          anchor={({ onAnchorClick }) => (
            <Box onClick={onAnchorClick} className={classes.anchor}>
              <ShowChart />
            </Box>
          )}
          component={
            <AxesScalePopover
              axesScaleType={props.axesScaleType}
              onAxesScaleTypeChange={props.onAxesScaleTypeChange}
            />
          }
        />
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
            <SmootheningPopup
              onSmoothingChange={props.onSmoothingChange}
              smoothingAlgorithm={props.smoothingAlgorithm}
              curveInterpolation={props.curveInterpolation}
              smoothingFactor={props.smoothingFactor}
            />
          }
        />
      </Grid>
      <Grid item>
        <ControlPopover
          anchor={({ onAnchorClick }) => (
            <Box className={classes.anchor} onClick={onAnchorClick}>
              <CenterFocusWeak />
            </Box>
          )}
          component={
            <HighlightModePopup
              mode={props.highlightMode}
              onChange={props.onChangeHighlightMode}
            />
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
                onClick={props.onZoomModeChange}
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
              <ZoomOut onClick={props.onZoomModeChange} />
            </Box>
          )}
          component={<ZoomOutPopup />}
        />
      </Grid>
    </Grid>
  );
}

export default Controls;
