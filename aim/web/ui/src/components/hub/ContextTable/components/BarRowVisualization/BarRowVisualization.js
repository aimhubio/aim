import './BarRowVisualization.less';

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import * as analytics from '../../../../../services/analytics';
import UI from '../../../../../ui';
import { classNames } from '../../../../../utils';

function BarRowVisualization({ hiddenMetrics, setHiddenMetrics }) {
  let [opened, setOpened] = useState(false);

  let popupRef = useRef();

  useEffect(() => {
    if (opened) {
      popupRef.current?.focus();
    }
  }, [opened]);

  return (
    <div className='ContextTableBar__item__wrapper'>
      {opened && (
        <div
          className='ContextTableBar__item__popup BarRowVisualization'
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
          <div className='BarRowVisualization__body'>
            <div
              className='BarRowVisualization__item'
              onClick={() => {
                setHiddenMetrics('show_all_metrics');
                analytics.trackEvent('[Table] Visualize all table rows');
              }}
            >
              <UI.Text small>Visualize all rows</UI.Text>
            </div>
            <div
              className='BarRowVisualization__item'
              onClick={() => {
                setHiddenMetrics('hide_all_metrics');
                analytics.trackEvent('[Table] Hide all table rows');
              }}
            >
              <UI.Text small>Hide all rows</UI.Text>
            </div>
          </div>
        </div>
      )}
      <div
        className={classNames({
          ContextTableBar__item__label: true,
          active: opened,
        })}
        onClick={() => setOpened(!opened)}
      >
        <UI.Icon i='visibility_off' scale={1.2} />
        <span className='ContextTableBar__item__label__text'>
          {!!hiddenMetrics?.length ? (
            <>
              {hiddenMetrics.length} hidden row
              {hiddenMetrics.length > 1 ? 's' : ''}
            </>
          ) : (
            'Hide Rows'
          )}
        </span>
      </div>
    </div>
  );
}

export default BarRowVisualization;
