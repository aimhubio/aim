import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import * as analytics from '../../../../../../../services/analytics';
import UI from '../../../../../../../ui';
import { classNames } from '../../../../../../../utils';
import { HubMainScreenModel } from '../../../../models/HubMainScreenModel';

function ControlsSidebarSmoothingOptions(props) {
  let [opened, setOpened] = useState(false);

  let popupRef = useRef();

  const { setChartSettingsState, setTraceList } = HubMainScreenModel.emitters;
  const { interpolate, smoothingAlgorithm, smoothFactor } =
    props.settings.persistent;

  function toggleCurveInterpolation(interpolate) {
    setChartSettingsState({
      ...props.settings,
      persistent: {
        ...props.settings.persistent,
        interpolate,
      },
    });
  }

  function changeSmoothingAlgorithm(algorithm) {
    setChartSettingsState(
      {
        ...props.settings,
        persistent: {
          ...props.settings.persistent,
          smoothingAlgorithm: algorithm,
          smoothFactor: algorithm === 'ema' ? 0 : 1,
        },
      },
      setTraceList,
    );
  }

  function changeSmoothFactor(factor) {
    setChartSettingsState(
      {
        ...props.settings,
        persistent: {
          ...props.settings.persistent,
          smoothFactor: +factor,
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
      <UI.Tooltip tooltip='Chart smoothing options'>
        <div
          className={classNames({
            ControlsSidebar__item: true,
            active: opened,
          })}
          onClick={(evt) => setOpened(!opened)}
        >
          <UI.Icon i='multiline_chart' scale={1.7} />
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
              Chart smoothing options
            </UI.Text>
          </div>
          {!props.smoothingDisabled && (
            <>
              <div>
                <UI.Text
                  className='ControlsSidebar__item__popup__overline ControlsSidebar__item__popup__overline--align'
                  type='primary'
                  overline
                  bold
                >
                  Chart smoothing:
                </UI.Text>
                <div className='ControlsSidebar__item__popup__range__wrapper'>
                  <UI.RangeSlider
                    key={smoothingAlgorithm || 'ema'}
                    min={(smoothingAlgorithm || 'ema') === 'ema' ? 0 : 1}
                    max={(smoothingAlgorithm || 'ema') === 'ema' ? 0.99 : 99}
                    value={
                      smoothFactor ??
                      ((smoothingAlgorithm || 'ema') === 'ema' ? 0 : 1)
                    }
                    step={(smoothingAlgorithm || 'ema') === 'ema' ? 0.01 : 2}
                    onChange={changeSmoothFactor}
                    ticks={
                      (smoothingAlgorithm || 'ema') === 'ema'
                        ? {
                          0: 0,
                          0.25: 0.25,
                          0.5: 0.5,
                          0.75: 0.75,
                          0.99: 0.99,
                        }
                        : {
                          1: 1,
                          25: 25,
                          51: 51,
                          75: 75,
                          99: 99,
                        }
                    }
                  />
                </div>
                <div className='ControlsSidebar__item__popup__list'>
                  {[
                    { key: 'ema', name: 'Exponential Moving Average' },
                    { key: 'cma', name: 'Central Moving Average' },
                  ].map((algorithm) => (
                    <div
                      key={algorithm.key}
                      className={classNames({
                        ControlsSidebar__item__popup__list__item: true,
                        active: (smoothingAlgorithm || 'ema') === algorithm.key,
                      })}
                      onClick={
                        (smoothingAlgorithm || 'ema') === algorithm.key
                          ? null
                          : (evt) => {
                            changeSmoothingAlgorithm(algorithm.key);
                            analytics.trackEvent(
                                `[Explore] [LineChart] Set smoothening algorithm to "${algorithm.key}"`,
                            );
                          }
                      }
                    >
                      <UI.Text small>{algorithm.name}</UI.Text>
                    </div>
                  ))}
                </div>
              </div>
              <UI.Line />
            </>
          )}
          <div className='ControlsSidebar__item__popup__container'>
            <UI.Text
              className={classNames({
                ControlsSidebar__item__popup__overline: true,
                'ControlsSidebar__item__popup__overline--align':
                  props.smoothingDisabled,
              })}
              type='primary'
              overline
              bold
            >
              Curve interpolation method:
            </UI.Text>
            <div className='ControlsSidebar__item__popup__option__switchContainer'>
              <UI.Text type='primary' small>
                Select method:
              </UI.Text>
              <div
                className={classNames({
                  ControlsSidebar__item__popup__option__switch: true,
                  disabled: props.interpolationDisabled,
                })}
              >
                <span
                  className={classNames({
                    ControlsSidebar__item__popup__option__switch__item: true,
                    active: !interpolate,
                  })}
                  onClick={
                    !interpolate
                      ? null
                      : () => {
                        toggleCurveInterpolation(false);
                        analytics.trackEvent(
                          '[Explore] [LineChart] Set interpolation method to "linear"',
                        );
                      }
                  }
                >
                  <UI.Text small>linear</UI.Text>
                </span>
                <span
                  className={classNames({
                    ControlsSidebar__item__popup__option__switch__item: true,
                    active: interpolate,
                  })}
                  onClick={
                    interpolate
                      ? null
                      : () => {
                        toggleCurveInterpolation(true);
                        analytics.trackEvent(
                          '[Explore] [LineChart] Set interpolation method to "cubic"',
                        );
                      }
                  }
                >
                  <UI.Text small>cubic</UI.Text>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ControlsSidebarSmoothingOptions.propTypes = {
  settings: PropTypes.object,
  interpolationDisabled: PropTypes.bool,
  smoothingDisabled: PropTypes.bool,
};

export default ControlsSidebarSmoothingOptions;
