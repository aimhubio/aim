import './Container.less';

import React from 'react';
import PropTypes from 'prop-types';

import { classNames } from '../../utils';

class Container extends React.Component {
  constructor(props) {
    super(props);

    this.containerRef = React.createRef();
  }

  render() {
    const className = classNames({
      Container: true,
      [this.props.size]: true,
    });

    return (
      <div className={className} ref={this.containerRef}>
        {this.props.children}
      </div>
    );
  }
}

Container.defaultProps = {
  size: 'standard',
};

Container.propTypes = {
  size: PropTypes.oneOf(['standard', 'small', 'fluid']),
};

export default React.memo(Container);
