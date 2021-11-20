import React from 'react';

import { Tooltip } from '@material-ui/core';

import ZoomInPopup from 'components/ZoomInPopover/ZoomInPopover';
import ZoomOutPopup from 'components/ZoomOutPopover/ZoomOutPopover';
import HighlightModePopup from 'components/HighlightModesPopover/HighlightModesPopover';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import AxesScalePopover from 'components/AxesScalePopover/AxesScalePopover';
import TooltipContentPopover from 'components/TooltipContentPopover/TooltipContentPopover';
import { Icon } from 'components/kit';

import { IControlProps } from 'types/pages/scatters/components/Controls/Controls';

import './Controls.scss';

function Controls(
  props: IControlProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='Controls__container ScrollBar__hidden'>
      <div>
        <ControlPopover
          title='Axes Scale'
          anchor={({ onAnchorClick, opened }) => (
            <Tooltip title='Axes Scale'>
              <div
                onClick={onAnchorClick}
                className={`Controls__anchor ${opened ? 'active' : ''}`}
              >
                <Icon
                  className={`Controls__icon ${opened ? 'active' : ''}`}
                  name='axes-scale'
                />
              </div>
            </Tooltip>
          )}
          component={
            <AxesScalePopover
              axesScaleType={props.axesScaleType}
              onAxesScaleTypeChange={props.onAxesScaleTypeChange}
            />
          }
        />
      </div>
      <Tooltip
        title={
          props.ignoreOutliers ? 'Outliers Are Ignored' : 'Ignore Outliers'
        }
      >
        <div
          className={`Controls__anchor ${
            props.ignoreOutliers ? 'active outlined' : ''
          }`}
          onClick={props.onIgnoreOutliersChange}
        >
          {props.ignoreOutliers ? (
            <Icon
              className={`Controls__icon ${
                props.ignoreOutliers ? 'active' : ''
              }`}
              name='ignore-outliers'
            />
          ) : (
            <Icon className='Controls__icon' name='ignore-outliers' />
          )}
        </div>
      </Tooltip>
      <div>
        <ControlPopover
          title='Highlight Modes'
          anchor={({ onAnchorClick, opened }) => (
            <Tooltip title='Highlight Modes'>
              <div
                className={`Controls__anchor ${opened ? 'active' : ''}`}
                onClick={onAnchorClick}
              >
                <Icon
                  className={`Controls__icon ${opened ? 'active' : ''}`}
                  name='highlight-mode'
                />
              </div>
            </Tooltip>
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
          title='Display In Tooltip'
          anchor={({ onAnchorClick, opened }) => (
            <Tooltip title='Tooltip Params'>
              <div
                onClick={onAnchorClick}
                className={`Controls__anchor ${opened ? 'active' : ''}`}
              >
                <Icon
                  className={`Controls__icon ${opened ? 'active' : ''}`}
                  name='cursor'
                />
              </div>
            </Tooltip>
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
          title='Select Zoom Mode'
          anchor={({ onAnchorClick, opened }) => (
            <Tooltip title='Zoom In'>
              <div
                className={`Controls__anchor ${
                  props.zoom?.active ? 'active' : ''
                }`}
                onClick={() => {
                  if (props.zoom) {
                    props.onZoomChange?.({ active: !props.zoom.active });
                  }
                }}
              >
                <span
                  className={`Controls__anchor__arrow ${
                    opened ? 'Controls__anchor__arrow__opened' : ''
                  }`}
                  onClick={onAnchorClick}
                >
                  <Icon name='arrow-left' />
                </span>
                <Icon
                  className={`Controls__icon ${
                    props.zoom?.active ? 'active' : ''
                  }`}
                  name='zoom-in'
                />
              </div>
            </Tooltip>
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
          title='Select Option To Zoom Out'
          open={!!props.zoom?.history.length}
          anchor={({ onAnchorClick, opened }) => (
            <Tooltip title='Zoom Out'>
              <div
                className={`Controls__anchor ${
                  props.zoom?.history.length ? '' : 'disabled'
                }`}
                onClick={() => {
                  if (props.zoom?.history.length) {
                    props.onZoomChange?.({
                      history: [...props.zoom.history].slice(0, -1),
                    });
                  }
                }}
              >
                {props.zoom?.history.length ? (
                  <span
                    className={`Controls__anchor__arrow ${
                      opened ? 'Controls__anchor__arrow__opened' : ''
                    }`}
                    onClick={onAnchorClick}
                  >
                    <Icon name='arrow-left' />
                  </span>
                ) : null}
                <Icon className='Controls__icon' name='zoom-out' />
              </div>
            </Tooltip>
          )}
          component={
            <ZoomOutPopup
              zoomHistory={props.zoom?.history}
              onChange={props.onZoomChange}
            />
          }
        />
      </div>
    </div>
  );
}

export default Controls;
