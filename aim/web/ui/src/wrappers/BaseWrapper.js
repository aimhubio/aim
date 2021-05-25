import React from 'react';
import * as storeUtils from '../storeUtils';
import * as classes from '../constants/classes';

class BaseWrapper extends React.Component {
  loadBarFocus = true;

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  componentWillUnmount() {
    this.loadBarFocus = false;
  }

  render() {
    return <>{this.props.children}</>;
  }
}

export default storeUtils.getWithState(classes.BASE_WRAPPER, BaseWrapper);
