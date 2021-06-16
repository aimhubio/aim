import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import * as analytics from '../../../../../../../services/analytics';
import UI from '../../../../../../../ui';
import { classNames } from '../../../../../../../utils';
import { HubMainScreenModel } from '../../../../models/HubMainScreenModel';
import { setItem } from '../../../../../../../services/storage';
import { EXPLORE_METRIC_HIGHLIGHT_MODE } from '../../../../../../../config';

function ControlsSidebarHighlightMode(props) {
  let [opened, setOpened] = useState(false);
  let popupRef = useRef();

  const { setChartSettingsState } = HubMainScreenModel.emitters;
  const { highlightMode } = props.settings;

  function selectHighlightMode(mode) {
    setChartSettingsState({
      ...props.settings,
      highlightMode: mode,
    });
    if (HubMainScreenModel.getState().viewKey === null) {
      setItem(EXPLORE_METRIC_HIGHLIGHT_MODE, mode);
    }
    setOpened(false);
    analytics.trackEvent(
      `[Explore] [LineChart] Set highlight mode to "${mode}"`,
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
    <>
      <div className='ControlsSidebar__item__wrapper'>
        <UI.Tooltip tooltip='Highlight modes'>
          <div
            className={classNames({
              ControlsSidebar__item: true,
              disabled: props.disabled,
              active: opened,
            })}
            onClick={(evt) => setOpened(!opened)}
          >
            <UI.Icon i='center_focus_weak' scale={1.7} />
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
                }, 100);
              }
            }}
          >
            <div className='ControlsSidebar__item__popup__header'>
              <UI.Text overline bold>
                Highlight modes
              </UI.Text>
            </div>
            <div
              className={classNames({
                ControlsSidebar__item__popup__list__item: true,
                active: highlightMode === 'default',
              })}
              onClick={(evt) => selectHighlightMode('default')}
            >
              <UI.Text small>Highlight off</UI.Text>
            </div>
            <div
              className={classNames({
                ControlsSidebar__item__popup__list__item: true,
                active: highlightMode === 'metric',
              })}
              onClick={(evt) => selectHighlightMode('metric')}
            >
              <UI.Text small>Highlight metric on hover</UI.Text>
            </div>
            <div
              className={classNames({
                ControlsSidebar__item__popup__list__item: true,
                active: highlightMode === 'run',
              })}
              onClick={(evt) => selectHighlightMode('run')}
            >
              <UI.Text small>Highlight run on hover</UI.Text>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

ControlsSidebarHighlightMode.propTypes = {
  settings: PropTypes.object,
};

export default ControlsSidebarHighlightMode;
