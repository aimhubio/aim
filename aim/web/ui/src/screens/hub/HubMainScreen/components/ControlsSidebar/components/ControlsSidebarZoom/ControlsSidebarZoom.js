import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import * as analytics from '../../../../../../../services/analytics';
import UI from '../../../../../../../ui';
import { classNames } from '../../../../../../../utils';
import * as _ from 'lodash';
import { HubMainScreenModel } from '../../../../models/HubMainScreenModel';
import { setItem } from '../../../../../../../services/storage';
import { EXPLORE_PANEL_SINGLE_ZOOM_MODE } from '../../../../../../../config';

function ControlsSidebarZoom(props) {
  let [openedZoomOptions, setOpenedZoomOptions] = useState(false);
  let [openedZoomOut, setOpenedZoomOut] = useState(false);
  let zoomOptionsPopupRef = useRef();
  let zoomOutPopupRef = useRef();

  const { setChartSettingsState } = HubMainScreenModel.emitters;

  const {
    persistent: { zoom },
    zoomHistory,
    zoomMode,
    singleZoomMode,
  } = props.settings;

  let zoomedChartIndices = Object.keys(zoom || {}).filter(
    (chartIndex) =>
      zoom?.[chartIndex] !== null && zoom?.[chartIndex] !== undefined,
  );

  useEffect(() => {
    if (openedZoomOptions && zoomOptionsPopupRef.current) {
      zoomOptionsPopupRef.current.focus();
      const { top } = zoomOptionsPopupRef.current.getBoundingClientRect();
      zoomOptionsPopupRef.current.style.maxHeight = `${
        window.innerHeight - top - 10
      }px`;
    }
    if (openedZoomOut && zoomOutPopupRef.current) {
      zoomOutPopupRef.current.focus();
      const { top } = zoomOutPopupRef.current.getBoundingClientRect();
      zoomOutPopupRef.current.style.maxHeight = `${
        window.innerHeight - top - 10
      }px`;
    }
  }, [openedZoomOptions, openedZoomOut]);

  useEffect(() => {
    if (zoomedChartIndices.length === 0) {
      setOpenedZoomOptions(false);
      setOpenedZoomOut(false);
    }
  }, [zoom]);

  return (
    <>
      <div className='ControlsSidebar__item__wrapper'>
        <UI.Tooltip tooltip='Zoom in'>
          <div
            className={classNames({
              ControlsSidebar__item: true,
              active: zoomMode,
            })}
            onClick={(evt) =>
              setChartSettingsState({
                ...props.settings,
                zoomMode: !zoomMode,
              })
            }
          >
            <UI.Icon i='zoom_in' scale={1.7} />
          </div>
        </UI.Tooltip>
        <div
          className={classNames({
            ControlsSidebar__item__popup__opener: true,
            active: openedZoomOptions,
          })}
          onClick={(evt) => setOpenedZoomOptions(!openedZoomOptions)}
        >
          <UI.Icon i='chevron_left' />
        </div>
        {openedZoomOptions && (
          <div
            className='ControlsSidebar__item__popup list'
            tabIndex={0}
            ref={zoomOptionsPopupRef}
            onBlur={(evt) => {
              const currentTarget = evt.currentTarget;
              if (openedZoomOptions) {
                window.setTimeout(() => {
                  if (!currentTarget.contains(document.activeElement)) {
                    setOpenedZoomOptions(false);
                  }
                }, 100);
              }
            }}
          >
            <div className='ControlsSidebar__item__popup__header'>
              <UI.Text overline bold>
                Select zoom mode
              </UI.Text>
            </div>
            <div className='ControlsSidebar__item__popup__list'>
              <div
                className={classNames({
                  ControlsSidebar__item__popup__list__item: true,
                  active: singleZoomMode,
                })}
                onClick={(evt) => {
                  setChartSettingsState({
                    ...props.settings,
                    zoomMode: true,
                    singleZoomMode: true,
                  });
                  if (HubMainScreenModel.getState().viewKey === null) {
                    setItem(EXPLORE_PANEL_SINGLE_ZOOM_MODE, true);
                  }
                  setOpenedZoomOptions(false);
                  analytics.trackEvent(
                    '[Explore] [LineChart] Set single zooming mode',
                  );
                }}
              >
                <UI.Text small>Single zooming</UI.Text>
                <span className='ControlsSidebar__item__popup__list__item__icon'>
                  <UI.Tooltip tooltip='Switches off after each zoom'>
                    <UI.Icon i='help_outline' />
                  </UI.Tooltip>
                </span>
              </div>
              <div
                className={classNames({
                  ControlsSidebar__item__popup__list__item: true,
                  active: !singleZoomMode,
                })}
                onClick={(evt) => {
                  setChartSettingsState({
                    ...props.settings,
                    zoomMode: true,
                    singleZoomMode: false,
                  });
                  if (HubMainScreenModel.getState().viewKey === null) {
                    setItem(EXPLORE_PANEL_SINGLE_ZOOM_MODE, false);
                  }
                  analytics.trackEvent(
                    '[Explore] [LineChart] Set multiple zooming mode',
                  );
                  setOpenedZoomOptions(false);
                }}
              >
                <UI.Text small>Multiple zooming</UI.Text>
                <span className='ControlsSidebar__item__popup__list__item__icon'>
                  <UI.Tooltip tooltip='Manually switch off'>
                    <UI.Icon i='help_outline' />
                  </UI.Tooltip>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className='ControlsSidebar__item__wrapper'>
        <UI.Tooltip tooltip='Zoom out'>
          <div
            className={classNames({
              ControlsSidebar__item: true,
              disabled: zoomedChartIndices.length === 0,
            })}
            onClick={(evt) => {
              if (zoom !== null) {
                setChartSettingsState({
                  ...props.settings,
                  zoomMode: false,
                  zoomHistory: zoomHistory.slice(1),
                  persistent: {
                    ...props.settings.persistent,
                    zoom:
                      zoomHistory[0] === null || zoomHistory[0] === undefined
                        ? null
                        : {
                          ...(zoom ?? {}),
                          [zoomHistory[0][0]]: zoomHistory[0][1],
                        },
                  },
                });
                setOpenedZoomOut(false);
                analytics.trackEvent(
                  '[Explore] [LineChart] Zoom out all charts',
                );
              }
            }}
          >
            <UI.Icon i='zoom_out' scale={1.7} />
          </div>
        </UI.Tooltip>
        {zoomHistory?.length > 0 && (
          <div
            className={classNames({
              ControlsSidebar__item__popup__opener: true,
              active: openedZoomOut,
            })}
            onClick={(evt) => setOpenedZoomOut(!openedZoomOut)}
          >
            <UI.Icon i='chevron_left' />
          </div>
        )}
        {openedZoomOut && (
          <div
            className='ControlsSidebar__item__popup list'
            tabIndex={0}
            ref={zoomOutPopupRef}
            onBlur={(evt) => {
              const currentTarget = evt.currentTarget;
              if (openedZoomOut) {
                window.setTimeout(() => {
                  if (!currentTarget.contains(document.activeElement)) {
                    setOpenedZoomOut(false);
                  }
                }, 100);
              }
            }}
          >
            <div className='ControlsSidebar__item__popup__header'>
              <UI.Text overline bold>
                Select option to zoom out
              </UI.Text>
            </div>
            <div className='ControlsSidebar__item__popup__list'>
              {zoomedChartIndices.map((chartIndex) => (
                <div
                  key={chartIndex}
                  className='ControlsSidebar__item__popup__list__item'
                  onClick={(evt) => {
                    let historyIndex = _.findIndex(
                      zoomHistory,
                      (item) => item[0] === +chartIndex,
                    );
                    setChartSettingsState({
                      ...props.settings,
                      zoomMode: false,
                      zoomHistory: zoomHistory.filter(
                        (item, index) => index !== historyIndex,
                      ),
                      persistent: {
                        ...props.settings.persistent,
                        zoom: {
                          ...(zoom ?? {}),
                          [chartIndex]: zoomHistory[historyIndex]?.[1] ?? null,
                        },
                      },
                    });
                    analytics.trackEvent(
                      '[Explore] [LineChart] Zoom out a specific chart',
                    );
                  }}
                >
                  <UI.Text small>Zoom out chart</UI.Text>
                  <div className='ContextBox__table__group-indicator__chart'>
                    <UI.Text>{+chartIndex + 1}</UI.Text>
                  </div>
                </div>
              ))}
              <div
                className='ControlsSidebar__item__popup__list__item'
                onClick={(evt) => {
                  setChartSettingsState({
                    ...props.settings,
                    zoomMode: false,
                    zoomHistory: [],
                    persistent: {
                      ...props.settings.persistent,
                      zoom: null,
                    },
                  });
                  setOpenedZoomOut(false);
                  analytics.trackEvent('[Explore] [LineChart] Reset zooming');
                }}
              >
                <UI.Text small>Reset zooming</UI.Text>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

ControlsSidebarZoom.propTypes = {
  settings: PropTypes.object,
};

export default ControlsSidebarZoom;
