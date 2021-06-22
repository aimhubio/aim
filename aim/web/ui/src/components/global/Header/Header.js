import './Header.less';

import React from 'react';
import { NavLink, withRouter } from 'react-router-dom';

import { classNames } from '../../../utils';
import UI from '../../../ui';
import * as storeUtils from '../../../storeUtils';
import * as classes from '../../../constants/classes';
import * as screens from '../../../constants/screens';
import ReactSVG from 'react-svg';
import { getItem } from '../../../services/storage';
import { USER_LAST_EXPLORE_CONFIG } from '../../../config';

class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div className='Header'>
        <div className='Header__cont'>
          <div className='Header__items top'>
            <div className='Header__item__wrapper'>
              <div className='Header__item'>
                <div className='Header__item__img' />
              </div>
            </div>
            <div className='Header__item__wrapper'>
              <NavLink
                to={screens.HUB_PROJECT_EXPERIMENT_DASHBOARD}
                className={classNames({
                  active: window.location.pathname === 'dashboard',
                })}
              >
                <div className='Header__item'>
                  <UI.Icon i='table_chart' className='Header__item__icon' />
                  <UI.Text className='Header__item__title'>Dashboard</UI.Text>
                </div>
              </NavLink>
            </div>
            <div className='Header__item__wrapper'>
              <NavLink
                exact
                to={getItem(USER_LAST_EXPLORE_CONFIG) ?? screens.EXPLORE}
              >
                <div className='Header__item'>
                  <UI.Icon i='timeline' className='Header__item__icon' />
                  <UI.Text className='Header__item__title'>Explore</UI.Text>
                </div>
              </NavLink>
            </div>
            <div className='Header__item__wrapper'>
              <NavLink
                to={screens.HUB_BOOKMARKS}
                className={classNames({
                  active: window.location.pathname.startsWith('/bookmarks'),
                })}
              >
                <div className='Header__item'>
                  <UI.Icon i='bookmarks' className='Header__item__icon' />
                  <UI.Text className='Header__item__title'>Bookmarks</UI.Text>
                </div>
              </NavLink>
            </div>
            <div className='Header__item__wrapper'>
              <NavLink
                to={screens.HUB_PROJECT_TAGS}
                className={classNames({
                  active: window.location.pathname.startsWith('/tag'),
                })}
              >
                <div className='Header__item'>
                  <UI.Icon i='flag' className='Header__item__icon' />
                  <UI.Text className='Header__item__title'>Tags</UI.Text>
                </div>
              </NavLink>
            </div>
            <div className='Header__item__wrapper hidden'>
              <NavLink
                to={screens.HUB_PROJECT_EXECUTABLES}
                className={classNames({
                  active: window.location.pathname.startsWith('/process'),
                })}
              >
                <div className='Header__item'>
                  <UI.Icon i='archive' className='Header__item__icon' />
                  <UI.Text className='Header__item__title'>Processes</UI.Text>
                </div>
              </NavLink>
            </div>
            {this.props.project.tf_enabled && (
              <div className='Header__item__wrapper'>
                <NavLink
                  to={screens.HUB_TF_SUMMARY_LIST}
                  className={classNames({
                    active: window.location.pathname.startsWith('/tf'),
                  })}
                >
                  <div className='Header__item'>
                    <ReactSVG
                      className='Header__item__icon__svg'
                      src={require('../../../asset/icons/tensorflow-2.svg')}
                    />
                    <UI.Text className='Header__item__title'>TF logs</UI.Text>
                  </div>
                </NavLink>
              </div>
            )}
          </div>
          <div className='Header__items bottom'>
            <div className='Header__item__wrapper'>
              <a
                className='link'
                href='https://github.com/aimhubio/aim#overview'
                target='_blank'
                rel='noreferrer noopener'
              >
                <div className='Header__item'>
                  <UI.Icon i='description' className='Header__item__icon' />
                  <UI.Text className='Header__item__title'>Docs</UI.Text>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(storeUtils.getWithState(classes.HEADER, Header));
