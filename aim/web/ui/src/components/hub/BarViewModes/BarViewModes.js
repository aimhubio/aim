import './BarViewModes.less';

import React from 'react';
import PropTypes from 'prop-types';

import * as analytics from '../../../services/analytics';
import { classNames } from '../../../utils';
import UI from '../../../ui';

function BarViewModes({ viewMode, setViewMode }) {
  return (
    <div className='BarViewModes'>
      <ViewMode
        size='sm'
        active={viewMode === 'panel'}
        onClick={() => {
          setViewMode('panel');
          analytics.trackEvent('[Table] Set table view mode to "panel"');
        }}
      />
      <ViewMode
        size='md'
        active={viewMode === 'resizable'}
        onClick={() => {
          setViewMode('resizable');
          analytics.trackEvent('[Table] Set table view mode to "resizable"');
        }}
      />
      <ViewMode
        size='lg'
        active={viewMode === 'context'}
        onClick={() => {
          setViewMode('context');
          analytics.trackEvent('[Table] Set table view mode to "context"');
        }}
      />
    </div>
  );
}

function ViewMode({ size, active, onClick }) {
  return (
    <div className='BarViewMode'>
      <div
        className={classNames({
          BarViewMode: true,
          active: active,
        })}
      >
        <UI.Tooltip
          tooltip={
            size === 'sm'
              ? 'Hide table'
              : size === 'md'
                ? 'Resizable table'
                : 'Maximize table'
          }
        >
          <div
            className={classNames({
              BarViewMode__icon: true,
              [`BarViewMode__icon--${size}`]: true,
            })}
            onClick={onClick}
          />
        </UI.Tooltip>
      </div>
    </div>
  );
}

BarViewModes.propTypes = {
  viewMode: PropTypes.string,
  setViewMode: PropTypes.func,
};

export default BarViewModes;
