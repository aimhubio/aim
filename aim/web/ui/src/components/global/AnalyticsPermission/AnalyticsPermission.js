import './AnalyticsPermission.less';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import UI from '../../../ui';
import { getCookie, setCookie } from '../../../services/cookie';
import { USER_ANALYTICS_COOKIE_NAME } from '../../../config';

class AnalyticsPermission extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cookieIsSet: getCookie(USER_ANALYTICS_COOKIE_NAME) !== undefined,
    };

    this.cookieExp = 365 * 24 * 3600;
  }

  setAnalyticsCookie = (val) => {
    setCookie(USER_ANALYTICS_COOKIE_NAME, val, {
      expires: this.cookieExp,
      path: '/',
    });
    this.setState({
      cookieIsSet: getCookie(USER_ANALYTICS_COOKIE_NAME) !== undefined,
    });
  };

  handleAcceptClick = () => {
    this.setAnalyticsCookie(1);
  };

  handleDeclineClick = () => {
    this.setAnalyticsCookie(0);
  };

  render() {
    if (this.state.cookieIsSet) {
      return null;
    }

    return (
      <div className='AnalyticsPermission'>
        <div className='AnalyticsPermission__body'>
          <UI.Text>
            Enable AimDE to collect your usage stats to build better and
            superior tool.
          </UI.Text>
          <UI.Buttons className='AnalyticsPermission__actions'>
            <UI.Button type='primary' onClick={() => this.handleAcceptClick()}>
              Enable
            </UI.Button>
            <UI.Button
              type='negative'
              onClick={() => this.handleDeclineClick()}
            >
              Disable
            </UI.Button>
          </UI.Buttons>
        </div>
      </div>
    );
  }
}

AnalyticsPermission.propTypes = {};

export default AnalyticsPermission;
