import React from 'react';
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
import ZoomInPopup from 'components/ZoomInPopover/ZoomInPopover';
import ZoomOutPopup from 'components/ZoomOutPopover/ZoomOutPopover';
import HighlightModePopup from 'components/HighlightModesPopover/HighlightModesPopover';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import { IControlProps } from 'types/pages/metrics/components/Controls/Controls';
import AxesScalePopover from 'components/AxesScalePopover/AxesScalePopover';

import './Controls.scss';
import AlignmentPopover from 'components/AlignmentPopover/AlignmentPopover';
import TooltipContentPopover from 'components/TooltipContentPopover/TooltipContentPopover';

function Controls(
  props: IControlProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='Controls__container'>
      <div onClick={props.onDisplayOutliersChange}>
        {props.displayOutliers ? (
          <BlurOn className='Controls__anchor' />
        ) : (
          <BlurCircular color='primary' className='Controls__anchor' />
        )}
      </div>
      <div>
        <ControlPopover
          anchor={({ onAnchorClick }) => (
            <div onClick={onAnchorClick} className='Controls__anchor'>
              <ShowChart />
            </div>
          )}
          component={
            <AxesScalePopover
              axesScaleType={props.axesScaleType}
              onAxesScaleTypeChange={props.onAxesScaleTypeChange}
            />
          }
        />
      </div>
      <div>
        <ControlPopover
          anchor={({ onAnchorClick, opened }) => (
            <div
              className={`Controls__anchor ${
                props.aggregationConfig.isEnabled ? '' : 'disabled'
              }`}
            >
              {props.aggregationConfig.isEnabled ? (
                <span
                  className={`Controls__anchor__arrow ${
                    opened ? 'Controls__anchor__arrow__opened' : ''
                  }`}
                  onClick={onAnchorClick}
                >
                  <KeyboardArrowLeft className='arrowLeft' />
                </span>
              ) : null}
              <GroupWorkOutlined
                color={
                  props.aggregationConfig?.isApplied ? 'primary' : 'inherit'
                }
                onClick={() => {
                  if (props.aggregationConfig.isEnabled) {
                    props.onAggregationConfigChange({
                      isApplied: !props.aggregationConfig?.isApplied,
                    });
                  }
                }}
              />
            </div>
          )}
          component={
            props.aggregationConfig.isEnabled ? (
              <AggregationPopup
                aggregationConfig={props.aggregationConfig}
                onChange={props.onAggregationConfigChange}
              />
            ) : null
          }
        />
      </div>
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
      <div>
        <ControlPopover
          anchor={({ onAnchorClick }) => (
            <div onClick={onAnchorClick} className='Controls__anchor'>
              <ScatterPlot />
            </div>
          )}
          component={
            <AlignmentPopover
              alignmentConfig={props.alignmentConfig}
              onAlignmentMetricChange={props.onAlignmentMetricChange}
              onAlignmentTypeChange={props.onAlignmentTypeChange}
            />
          }
        />
      </div>
      <div>
        <ControlPopover
          anchor={({ onAnchorClick }) => (
            <div onClick={onAnchorClick} className='Controls__anchor'>
              <MultilineChart />
            </div>
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
      </div>
      <div>
        <ControlPopover
          anchor={({ onAnchorClick }) => (
            <div className='Controls__anchor' onClick={onAnchorClick}>
              <CenterFocusWeak />
            </div>
          )}
          component={
            <HighlightModePopup
              mode={props.highlightMode}
              onChange={props.onHighlightModeChange}
            />
          }
        />
      </div>
      <div>
        <ControlPopover
          anchor={({ onAnchorClick, opened }) => (
            <div className='Controls__anchor'>
              <span
                className={`Controls__anchor__arrow ${
                  opened ? 'Controls__anchor__arrow__opened' : ''
                }`}
                onClick={onAnchorClick}
              >
                <KeyboardArrowLeft className='arrowLeft' />
              </span>
              <ZoomIn
                color={props.zoom?.active ? 'primary' : 'inherit'}
                onClick={() => {
                  if (props.zoom) {
                    props.onZoomChange?.({ active: !props.zoom.active });
                  }
                }}
              />
            </div>
          )}
          component={
            <ZoomInPopup
              mode={props.zoom?.mode}
              onChange={props.onZoomChange}
            />
          }
        />
      </div>
      <div>
        <ControlPopover
          anchor={({ onAnchorClick, opened }) => (
            <div
              className={`Controls__anchor ${
                props.zoom?.history.length ? '' : 'disabled'
              }`}
            >
              {props.zoom?.history.length ? (
                <span
                  className={`Controls__anchor__arrow ${
                    opened ? 'Controls__anchor__arrow__opened' : ''
                  }`}
                  onClick={onAnchorClick}
                >
                  <KeyboardArrowLeft className='arrowLeft' />
                </span>
              ) : null}
              <ZoomOut
                onClick={() => {
                  if (props.zoom?.history.length) {
                    props.onZoomChange?.({
                      history: [...props.zoom.history].slice(0, -1),
                    });
                  }
                }}
              />
            </div>
          )}
          component={
            props.zoom?.history.length ? (
              <ZoomOutPopup
                zoomHistory={props.zoom?.history}
                onChange={props.onZoomChange}
              />
            ) : null
          }
        />
      </div>
    </div>
  );
}

export default Controls;
