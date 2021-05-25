import './BarRowHeightSelect.less';

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import UI from '../../../../../ui';
import { classNames } from '../../../../../utils';
import * as analytics from '../../../../../services/analytics';

function BarRowHeightSelect({ rowHeightMode, setRowHeightMode }) {
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
          className='ContextTableBar__item__popup BarRowHeightSelect'
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
          <div className='BarRowHeightSelect__header'>
            <UI.Text overline bold>
              Select table row height
            </UI.Text>
          </div>
          <div className='BarRowHeightSelect__body'>
            <div
              className={classNames({
                BarRowHeightSelect__item: true,
                active: rowHeightMode === 'short',
              })}
              onClick={() => {
                setRowHeightMode('short');
                analytics.trackEvent('[Table] Set table row height to "short"');
              }}
            >
              <UI.Text small>Short</UI.Text>
            </div>
            <div
              className={classNames({
                BarRowHeightSelect__item: true,
                active: rowHeightMode === 'medium',
              })}
              onClick={() => {
                setRowHeightMode('medium');
                analytics.trackEvent(
                  '[Table] Set table row height to "medium"',
                );
              }}
            >
              <UI.Text small>Medium</UI.Text>
            </div>
            <div
              className={classNames({
                BarRowHeightSelect__item: true,
                active: rowHeightMode === 'tall',
              })}
              onClick={() => {
                setRowHeightMode('tall');
                analytics.trackEvent('[Table] Set table row height to "tall"');
              }}
            >
              <UI.Text small>Tall</UI.Text>
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
        <UI.Icon i='format_line_spacing' scale={1.2} />
        <span className='ContextTableBar__item__label__text'>Row Height</span>
      </div>
    </div>
  );
}

export default BarRowHeightSelect;
