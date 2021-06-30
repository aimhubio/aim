import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import * as analytics from '../../../../../../../services/analytics';
import UI from '../../../../../../../ui';
import { classNames } from '../../../../../../../utils';
import * as storeUtils from '../../../../../../../storeUtils';
import * as classes from '../../../../../../../constants/classes';
import { HubMainScreenModel } from '../../../../models/HubMainScreenModel';

function ControlsSidebarAxesProperties(props) {
  let [opened, setOpened] = useState(false);

  const { xScale, yScale, xAlignment, pointsCount } = props.settings.persistent;

  let popupRef = useRef();
  let dropdownRef = useRef();
  let metricValue = useRef(Array.isArray(xAlignment) ? xAlignment[0] : '');

  const {
    setChartSettingsState,
    setChartPointsCount,
    setChartXAxisAlignment,
    setTraceList,
  } = HubMainScreenModel.emitters;

  const metrics =
    props.project?.metrics?.filter((m) => !m.startsWith('__system__')) ?? [];

  function changeAxisScaleOption(axis, option) {
    setChartSettingsState(
      {
        ...props.settings,
        zoomMode: false,
        zoomHistory: [],
        persistent: {
          ...props.settings.persistent,
          zoom: null,
          [axis]: option,
        },
      },
      setTraceList,
    );
  }

  useEffect(() => {
    if (opened && popupRef.current) {
      popupRef.current.focus();
      const { top } = popupRef.current.getBoundingClientRect();
      popupRef.current.style.maxHeight = `${window.innerHeight - top - 10}px`;
    }
  }, [opened]);

  return (
    <div className='ControlsSidebar__item__wrapper'>
      <UI.Tooltip tooltip='Axes properties'>
        <div
          className={classNames({
            ControlsSidebar__item: true,
            active: opened,
          })}
          onClick={(evt) => setOpened(!opened)}
        >
          <UI.Icon i='tune' scale={1.5} />
        </div>
      </UI.Tooltip>
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
              }, 200);
            }
          }}
        >
          <div className='ControlsSidebar__item__popup__header'>
            <UI.Text overline bold>
              Axes properties
            </UI.Text>
          </div>
          <div>
            <UI.Text
              className='ControlsSidebar__item__popup__overline ControlsSidebar__item__popup__overline--align'
              type='primary'
              overline
              bold
            >
              Select axes scale:
            </UI.Text>
            <div className='ControlsSidebar__item__popup__option__switchContainer'>
              <UI.Text type='primary' small>
                X-axis scale
              </UI.Text>
              <div className='ControlsSidebar__item__popup__option__switch'>
                <span
                  className={classNames({
                    ControlsSidebar__item__popup__option__switch__item: true,
                    active: (xScale || 0) === 0,
                  })}
                  onClick={
                    (xScale || 0) === 0
                      ? null
                      : () => {
                        changeAxisScaleOption('xScale', 0);
                        analytics.trackEvent(
                          '[Explore] [LineChart] Set X axis scale to "linear"',
                        );
                      }
                  }
                >
                  <UI.Text small>linear</UI.Text>
                </span>
                <span
                  className={classNames({
                    ControlsSidebar__item__popup__option__switch__item: true,
                    active: xScale === 1,
                  })}
                  onClick={
                    xScale === 1
                      ? null
                      : () => {
                        changeAxisScaleOption('xScale', 1);
                        analytics.trackEvent(
                          '[Explore] [LineChart] Set X axis scale to "log"',
                        );
                      }
                  }
                >
                  <UI.Text small>log</UI.Text>
                </span>
              </div>
            </div>
            <div className='ControlsSidebar__item__popup__option__switchContainer'>
              <UI.Text type='primary' small>
                Y-axis scale
              </UI.Text>
              <div className='ControlsSidebar__item__popup__option__switch'>
                <span
                  className={classNames({
                    ControlsSidebar__item__popup__option__switch__item: true,
                    active: (yScale || 0) === 0,
                  })}
                  onClick={
                    (yScale || 'linear') === 0
                      ? null
                      : () => {
                        changeAxisScaleOption('yScale', 0);
                        analytics.trackEvent(
                          '[Explore] [LineChart] Set Y axis scale to "linear"',
                        );
                      }
                  }
                >
                  <UI.Text small>linear</UI.Text>
                </span>
                <span
                  className={classNames({
                    ControlsSidebar__item__popup__option__switch__item: true,
                    active: yScale === 1,
                  })}
                  onClick={
                    yScale === 1
                      ? null
                      : () => {
                        changeAxisScaleOption('yScale', 1);
                        analytics.trackEvent(
                          '[Explore] [LineChart] Set Y axis scale to "log"',
                        );
                      }
                  }
                >
                  <UI.Text small>log</UI.Text>
                </span>
              </div>
            </div>
          </div>
          <UI.Line />
          <div>
            <UI.Text
              className='ControlsSidebar__item__popup__overline ControlsSidebar__item__popup__overline--align'
              type='primary'
              overline
              bold
            >
              Align X-axis by:
            </UI.Text>
            <div className='ControlsSidebar__item__popup__list'>
              {['step', 'epoch', 'relative_time', 'absolute_time'].map(
                (type) => (
                  <div
                    key={type}
                    className={classNames({
                      ControlsSidebar__item__popup__list__item: true,
                      active: (xAlignment || 'step') === type,
                    })}
                    onClick={() => {
                      if ((xAlignment || 'step') === type) {
                        return;
                      }
                      metricValue.current = null;
                      setChartXAxisAlignment(type);
                      analytics.trackEvent(
                        `[Explore] [LineChart] Set X axis alignment to "${type}"`,
                      );
                    }}
                  >
                    <UI.Text small>{type.replace('_', ' ')}</UI.Text>
                  </div>
                ),
              )}
              <div
                className={classNames({
                  ControlsSidebar__item__popup__list__item: true,
                  active: Array.isArray(xAlignment),
                  select: true,
                })}
                onClick={() => {
                  if (Array.isArray(xAlignment)) {
                    return;
                  }
                  if (!metricValue.current) {
                    dropdownRef.current?.selectRef?.current?.focus();
                  } else {
                    setChartXAxisAlignment([metricValue.current]);
                    analytics.trackEvent(
                      '[Explore] [LineChart] Set X axis alignment to "custom metric"',
                    );
                  }
                }}
              >
                <UI.Text small>Metric: </UI.Text>
                <div onClick={(evt) => evt.stopPropagation()}>
                  <UI.Dropdown
                    key={`${metricValue.current}`}
                    ref={dropdownRef}
                    className='ControlsSidebar__item__popup__list__item__select'
                    width={170}
                    options={metrics.map((val) => ({
                      value: val,
                      label: `${val}`,
                    }))}
                    defaultValue={
                      metricValue.current
                        ? {
                          value: metricValue.current,
                          label: metricValue.current,
                        }
                        : undefined
                    }
                    onChange={(data) => {
                      metricValue.current = data.value;
                      setChartXAxisAlignment([data.value]);
                      analytics.trackEvent(
                        '[Explore] [LineChart] Set X axis alignment to "custom metric"',
                      );
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <UI.Line />
          <div>
            <UI.Text
              className='ControlsSidebar__item__popup__overline'
              type='primary'
              overline
              bold
            >
              Number of steps:
            </UI.Text>
            <div className='ControlsSidebar__item__popup__range__wrapper'>
              <UI.RangeSlider
                min={10}
                max={500}
                value={pointsCount ?? 50}
                onChange={setChartPointsCount}
                ticks={{
                  10: 10,
                  100: 100,
                  200: 200,
                  300: 300,
                  400: 400,
                  500: 500,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ControlsSidebarAxesProperties.propTypes = {
  settings: PropTypes.object,
  disabled: PropTypes.bool,
};

export default storeUtils.getWithState(
  classes.EXPLORE_PARAMS_SELECT_INPUT,
  ControlsSidebarAxesProperties,
);
