import React from 'react';

import PropTypes from 'prop-types';
import UI from '../../../../../../../ui';
import { classNames } from '../../../../../../../utils';
import { HubMainScreenModel } from '../../../../models/HubMainScreenModel';
import * as analytics from '../../../../../../../services/analytics';

function ToggleParPlotIndicator(props) {
  const { setChartSettingsState } = HubMainScreenModel.emitters;
  return (
    <UI.Tooltip
      tooltip={
        props.disabled
          ? ''
          : `${
              props.settings.persistent.indicator ? 'Hide' : 'Show'
            } parameter indicator`
      }
    >
      <div
        className={classNames({
          ControlsSidebar__item: true,
          disabled: props.disabled,
          active: props.settings.persistent.indicator,
        })}
        onClick={(evt) => {
          if (!props.disabled) {
            analytics.trackEvent(
              `[Explore] [ParPlot] ${
                props.settings.persistent.indicator ? 'Hide' : 'Show'
              } indicator`,
            );
            setChartSettingsState({
              ...props.settings,
              persistent: {
                ...props.settings.persistent,
                indicator: !props.settings.persistent.indicator,
              },
            });
          }
        }}
      >
        <UI.Icon i='straighten' scale={1.7} rotate={90} />
      </div>
    </UI.Tooltip>
  );
}

ToggleParPlotIndicator.propTypes = {
  settings: PropTypes.object,
  disabled: PropTypes.bool,
};

export default ToggleParPlotIndicator;
