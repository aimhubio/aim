import React from 'react';

import { Tooltip } from '@material-ui/core';

import ControlPopover from 'components/ControlPopover/ControlPopover';
import TooltipContentPopover from 'components/TooltipContentPopover/TooltipContentPopover';
import { Icon } from 'components/kit';
import TrendlineOptionsPopover from 'components/TrendlineOptionsPopover';

import { CONTROLS_DEFAULT_CONFIG } from 'config/controls/controlsDefaultConfig';

import { IControlProps } from 'types/pages/scatters/components/Controls/Controls';

import './Controls.scss';

function Controls(
  props: IControlProps,
): React.FunctionComponentElement<React.ReactNode> {
  const tooltipChanged: boolean = React.useMemo(() => {
    return (
      props.tooltip.display !==
        CONTROLS_DEFAULT_CONFIG.scatters.tooltip.display ||
      props.tooltip.selectedParams.length !==
        CONTROLS_DEFAULT_CONFIG.scatters.tooltip.selectedParams.length
    );
  }, [props.tooltip]);
  return (
    <div className='Controls__container ScrollBar__hidden'>
      <div>
        <ControlPopover
          title='Select Trendline Options'
          anchor={({ onAnchorClick, opened }) => (
            <Tooltip
              title={
                props.trendlineOptions.isApplied
                  ? 'Hide trendline'
                  : 'Show trendline'
              }
            >
              <div
                className={`Controls__anchor ${
                  props.trendlineOptions.isApplied ? 'active outlined' : ''
                }`}
                onClick={() => {
                  props.onChangeTrendlineOptions({
                    isApplied: !props.trendlineOptions?.isApplied,
                  });
                }}
              >
                <span
                  className={`Controls__anchor__arrow ${
                    opened ? 'Controls__anchor__arrow--opened' : ''
                  }`}
                  onClick={onAnchorClick}
                >
                  <Icon name='arrow-left' onClick={onAnchorClick} />
                </span>
                <Icon
                  className={`Controls__icon ${
                    props.trendlineOptions.isApplied ? 'active' : ''
                  }`}
                  name='trendline'
                />
              </div>
            </Tooltip>
          )}
          component={
            <TrendlineOptionsPopover
              trendlineOptions={props.trendlineOptions}
              onChangeTrendlineOptions={props.onChangeTrendlineOptions}
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
                className={`Controls__anchor ${
                  opened ? 'active' : tooltipChanged ? 'active outlined' : ''
                }`}
              >
                <Icon
                  className={`Controls__icon ${
                    opened || tooltipChanged ? 'active' : ''
                  }`}
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
    </div>
  );
}

export default Controls;
