import React, { Component } from 'react';

import UI from '../../../ui';

class IncompatibleVersion extends Component {
  render() {
    return (
      <div className='IncompatibleVersionScreen__heading'>
        <UI.Text size={1} type='primary' spacingTop center>
          503
        </UI.Text>
        <UI.Text size={4} type='grey-light' center>
          Error. Incompatible version
        </UI.Text>
      </div>
    );
  }
}

IncompatibleVersion.propTypes = {};

export default IncompatibleVersion;
