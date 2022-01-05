import React from 'react';

import { Tooltip } from '@material-ui/core';

import ControlPopover from 'components/ControlPopover/ControlPopover';
import TooltipContentPopover from 'components/TooltipContentPopover/TooltipContentPopover';
import { Icon } from 'components/kit';

import { CONTROLS_DEFAULT_CONFIG } from 'config/controls/controlsDefaultConfig';

import { IControlProps } from 'types/pages/params/components/Controls/Controls';

import { CurveEnum } from 'utils/d3';

import './Controls.scss';

function Controls(
  props: IControlProps,
): React.FunctionComponentElement<React.ReactNode> {
  const tooltipChanged: boolean = React.useMemo(() => {
    return (
      props.tooltip.display !==
        CONTROLS_DEFAULT_CONFIG.params.tooltip.display ||
      props.tooltip.selectedParams.length !==
        CONTROLS_DEFAULT_CONFIG.params.tooltip.selectedParams.length
    );
  }, [props.tooltip]);
  return (
    <div className='Params__Controls__container ScrollBar__hidden'>
      <Tooltip title='Curve Interpolation'>
        <div
          className={`Params__Controls__anchor ${
            props.curveInterpolation === CurveEnum.Linear
              ? ''
              : 'active outlined'
          }`}
          onClick={props.onCurveInterpolationChange}
        >
          <Icon
            name='smoothing'
            className={`Params__Controls__icon ${
              props.curveInterpolation === CurveEnum.Linear ? '' : 'active'
            } `}
          />
        </div>
      </Tooltip>
      <Tooltip title='Color Indicator'>
        <div
          className={`Params__Controls__anchor ${
            props.isVisibleColorIndicator ? 'active outlined' : ''
          }`}
          onClick={props.onColorIndicatorChange}
        >
          <Icon
            name='indicator'
            className={`Params__Controls__icon ${
              props.isVisibleColorIndicator ? 'active' : ''
            } `}
          />
        </div>
      </Tooltip>
      <div>
        <ControlPopover
          title='Display in Tooltip'
          anchor={({ onAnchorClick, opened }) => (
            <Tooltip title='Tooltip Params'>
              <div
                onClick={onAnchorClick}
                className={`Params__Controls__anchor ${
                  opened ? 'active' : tooltipChanged ? 'active outlined' : ''
                } `}
              >
                {/*TODO need to change icon */}
                <Icon
                  className={`Params__Controls__icon ${
                    opened || tooltipChanged ? 'active' : ''
                  } `}
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
