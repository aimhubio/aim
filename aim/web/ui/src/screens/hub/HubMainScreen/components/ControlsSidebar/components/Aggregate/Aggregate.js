import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import * as analytics from '../../../../../../../services/analytics';
import UI from '../../../../../../../ui';
import { classNames } from '../../../../../../../ui/utils';
import { HubMainScreenModel } from '../../../../models/HubMainScreenModel';

function Aggregate(props) {
  let [opened, setOpened] = useState(false);
  let popupRef = useRef();

  const { settings, aggregatedArea, aggregatedLine, disabled } = props;

  const { setContextFilter, setChartSettingsState } =
    HubMainScreenModel.emitters;

  useEffect(() => {
    if (opened && popupRef.current) {
      popupRef.current.focus();
      const { top } = popupRef.current.getBoundingClientRect();
      popupRef.current.style.maxHeight = `${window.innerHeight - top - 10}px`;
    }
  }, [opened]);

  useEffect(() => {
    if (disabled) {
      setOpened(false);
    }
  }, [disabled]);

  return (
    <div className='ControlsSidebar__item__wrapper'>
      <UI.Tooltip
        tooltip={
          settings.persistent.aggregated
            ? 'Deaggregate metrics'
            : 'Aggregate metrics'
        }
      >
        <div
          className={classNames({
            ControlsSidebar__item: true,
            active: settings.persistent.aggregated,
            disabled: disabled,
          })}
          onClick={(evt) => {
            analytics.trackEvent(
              settings.persistent.aggregated
                ? '[Explore] [LineChart] Deaggregate metrics'
                : '[Explore] [LineChart] Aggregate metrics',
            );

            setChartSettingsState({
              ...settings,
              persistent: {
                ...settings.persistent,
                aggregated: !settings.persistent.aggregated,
              },
            });
          }}
        >
          <UI.Icon i='group_work' scale={1.7} />
        </div>
      </UI.Tooltip>
      {!disabled && (
        <div
          className={classNames({
            ControlsSidebar__item__popup__opener: true,
            active: opened,
          })}
          onClick={(evt) => setOpened(!opened)}
        >
          <UI.Icon i='chevron_left' />
        </div>
      )}
      {opened && (
        <div
          className='ControlsSidebar__item__popup list'
          tabIndex={0}
          ref={popupRef}
          onBlur={(evt) => {
            const currentTarget = evt.currentTarget;
            if (opened) {
              window.setTimeout(() => {
                if (!currentTarget.contains(document.activeElement)) {
                  setOpened(false);
                }
              }, 100);
            }
          }}
        >
          <div className='ControlsSidebar__item__popup__header'>
            <UI.Text overline bold>
              Select aggregation method
            </UI.Text>
          </div>
          <div>
            <UI.Text
              overline
              bold
              type='primary'
              className='ControlsSidebar__item__popup__overline ControlsSidebar__item__popup__overline--align'
            >
              Select line:
            </UI.Text>
            <div className='ControlsSidebar__item__popup__list'>
              {[
                { key: 'avg', name: 'Mean' },
                { key: 'median', name: 'Median' },
                { key: 'min', name: 'Min' },
                { key: 'max', name: 'Max' },
              ].map((method) => (
                <div
                  key={method.key}
                  className={classNames({
                    ControlsSidebar__item__popup__list__item: true,
                    active: (aggregatedLine || 'avg') === method.key,
                  })}
                  onClick={(evt) => {
                    setContextFilter({
                      aggregatedLine: method.key,
                    });
                    analytics.trackEvent(
                      `[Explore] [LineChart] Set aggregated line to "${method.key}"`,
                    );
                  }}
                >
                  <UI.Text small>{method.name}</UI.Text>
                </div>
              ))}
            </div>
            <UI.Line />
            <UI.Text
              overline
              bold
              type='primary'
              className='ControlsSidebar__item__popup__overline'
            >
              Select area:
            </UI.Text>
            <div className='ControlsSidebar__item__popup__list'>
              {[
                { key: 'none', name: 'None' },
                { key: 'min_max', name: 'Min/Max' },
                { key: 'std_dev', name: 'Mean ± Standard Deviation' },
                { key: 'std_err', name: 'Mean ± Standard Error' },
                { key: 'conf_int', name: 'Confidence Interval (95%)' },
              ].map((method) => (
                <div
                  key={method.key}
                  className={classNames({
                    ControlsSidebar__item__popup__list__item: true,
                    active: (aggregatedArea || 'min_max') === method.key,
                  })}
                  onClick={(evt) => {
                    setContextFilter({
                      aggregatedArea: method.key,
                    });
                    analytics.trackEvent(
                      `[Explore] [LineChart] Set aggregated area to "${method.key}"`,
                    );
                  }}
                >
                  <UI.Text small>{method.name}</UI.Text>
                  {method.key === 'conf_int' && (
                    <span className='ControlsSidebar__item__popup__list__item__icon'>
                      <UI.Tooltip tooltip='Calculated with z-distribution'>
                        <UI.Icon i='help_outline' />
                      </UI.Tooltip>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Aggregate.propTypes = {
  settings: PropTypes.object,
  aggregatedArea: PropTypes.string,
  aggregatedLine: PropTypes.string,
  disabled: PropTypes.bool,
};

export default Aggregate;
