import './CurrentRunIndicator.less';

import React, { PureComponent } from 'react';
import UI from '../../../ui';

class CurrentRunIndicator extends PureComponent {
  render() {
    return (
      <div className='CurrentRunIndicator__current'>
        <div className='CurrentRunIndicator__current__indicator'>
          <div className='CurrentRunIndicator__current__indicator__anim' />
        </div>
        {/*<UI.Text>Experiment index</UI.Text>*/}
      </div>
    );
  }
}

CurrentRunIndicator.propTypes = {};

export default CurrentRunIndicator;
