import './Img.less';

import React from 'react';
import PropTypes from 'prop-types';

import { classNames } from '../../utils';

function Img({ className, rounded, cover, src }) {
  const imgClassName = classNames({
    Img: true,
    [className]: true,
    cover: !!cover,
    rounded: !!rounded,
  });

  return (
    <div
      className={imgClassName}
      style={{ backgroundImage: `url('${src}')` }}
    ></div>
  );
}

Img.defaultProps = {
  rounded: false,
  cover: false,
};

Img.propTypes = {
  rounded: PropTypes.bool,
  cover: PropTypes.bool,
};

export default React.memo(Img);
