import './ExperimentCell.less';

import React from 'react';
import PropTypes from 'prop-types';

import { classNames } from '../../../utils';
import UI from '../../../ui';

function ExperimentCell({
  children,
  className,
  height,
  width,
  footerTitle,
  footerLabels,
  header,
}) {
  const compClassName = classNames({
    ExperimentCell: true,
    [className]: !!className,
    [`height_${height}`]: true,
    [`width_${width}`]: true,
  });

  return (
    <div className={compClassName}>
      <div className='ExperimentCell__body'>{children}</div>
      <div className='ExperimentCell__footer'>
        {!!header && (
          <UI.Text overline bold type='primary'>
            {header}
          </UI.Text>
        )}
        {!!footerLabels?.length && (
          <div className='ExperimentCell__footer__labels'>
            {footerLabels.map((label, labelKey) => (
              <UI.Label
                className='ExperimentCell__footer__label'
                key={labelKey}
              >
                {label}
              </UI.Label>
            ))}
          </div>
        )}
        {!!footerTitle && (
          <UI.Text
            className='ExperimentCell__footer__title'
            type='grey-dark'
            caption
            inline
          >
            {footerTitle}
          </UI.Text>
        )}
      </div>
    </div>
  );
}

ExperimentCell.defaultProps = {
  footerTitle: '',
  footerLabels: [],
  height: 'static',
  width: 1,
};

ExperimentCell.propTypes = {
  header: PropTypes.string,
  footerTitle: PropTypes.string,
  footerLabels: PropTypes.array,
  height: PropTypes.oneOf(['static', 'auto']),
  width: PropTypes.number,
};

export default React.memo(ExperimentCell);
