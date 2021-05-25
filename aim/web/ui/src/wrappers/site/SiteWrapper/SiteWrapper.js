import './SiteWrapper.less';

import React from 'react';

import BaseWrapper from '../../BaseWrapper';
import * as classes from '../../../constants/classes';
import * as storeUtils from '../../../storeUtils';

class SiteWrapper extends React.Component {
  constructor(props) {
    super(props);

    props.resetProgress();
  }

  componentDidMount() {
    setTimeout(() => this.props.completeProgress(), 300);
  }

  render() {
    return (
      <BaseWrapper>
        <div className='SiteWrapper'>{this.props.children}</div>
      </BaseWrapper>
    );
  }
}

export default storeUtils.getWithState(classes.SITE_WRAPPER, SiteWrapper);
