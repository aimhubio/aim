import './ProjectWrapper.less';

import React from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink, Redirect } from 'react-router-dom';

import * as screens from '../../../constants/screens';
import * as classes from '../../../constants/classes';
import UI from '../../../ui';
import HubWrapper from '../HubWrapper/HubWrapper';
import * as storeUtils from '../../../storeUtils';
import { buildUrl, classNames } from '../../../utils';

class ProjectWrapper extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      notFound: false,
      isLoading: true,
    };

    this.projectWrapperHeaderRef = React.createRef();
  }

  componentDidMount() {
    this.props
      .getProjectData()
      .then((data) => {
        this.props.getProjectParams();
        this.props.incProgress();
      })
      .catch(() => {
        this.setState({
          notFound: true,
        });
      });

    this.setState((prevState) => ({
      ...prevState,
      isLoading: false,
    }));
  }

  getHeaderHeight = () => {
    // if (!this.state.isLoading && this.projectWrapperHeaderRef.current) {
    //   return this.projectWrapperHeaderRef.current.clientHeight;
    // }
    // return null;
    return 0;
  };

  _renderNav = () => {
    if (!this.props.nav.length) {
      return null;
    }

    return (
      <nav className='ProjectWrapper__navbar'>
        {this.props.nav.map((i, iKey) => (
          <div
            className={classNames({
              ProjectWrapper__navbar__item: true,
              active: i.active,
            })}
            key={iKey}
            onClick={() => i.onClick || {}}
          >
            {i.icon}
            {i.title}
          </div>
        ))}
      </nav>
    );
  };

  _renderHeader = () => {
    return null;

    return (
      <UI.Container size={this.props.size}>
        <div className='ProjectWrapper__header__cont'>
          <div className='ProjectWrapper__breadcrumb'>
            <UI.Icon
              className='ProjectWrapper__breadcrumb__icon'
              i='link'
              scale={1}
              spacingRight
            />
            <Link to={screens.HUB_PROJECT_EXPERIMENT_DASHBOARD}>
              <UI.Text>{project.path}</UI.Text>
            </Link>
          </div>
        </div>
        <div className='ProjectWrapper__navbar__wrapper'>
          {this._renderNav()}
        </div>
      </UI.Container>
    );
  };

  _renderContent = () => {
    let project = this.props.project;

    if (this.props.isUpdating) {
      return null;
    }

    return (
      <div
        className={classNames({
          ProjectWrapper: true,
          gap: this.props.gap,
        })}
      >
        <div
          className='ProjectWrapper__header'
          ref={this.projectWrapperHeaderRef}
        >
          {this._renderHeader()}
        </div>
        <div className='ProjectWrapper__body'>
          {!!this.props.navigation && (
            <div className='ProjectWrapper__navigation'>
              {React.cloneElement(this.props.navigation, {
                contentWidth: this.props.contentWidth,
              })}
            </div>
          )}
          <div className='ProjectWrapper__cont' ref={this.contentRef}>
            {this.props.children}
          </div>
        </div>
      </div>
    );
  };

  render() {
    if (this.props.isLoading) {
      return null;
    }

    if (this.state.notFound) {
      return <Redirect to={screens.NOT_FOUND} />;
    }

    return <HubWrapper gap={false}>{this._renderContent()}</HubWrapper>;
  }
}

ProjectWrapper.defaultProps = {
  nav: [],
  gap: true,
  size: 'fluid',
};

ProjectWrapper.propTypes = {
  experimentName: PropTypes.string,
  navigation: PropTypes.node,
  contentWidth: PropTypes.number,
  size: PropTypes.oneOf(['small', 'standard', 'fluid']),
  nav: PropTypes.array,
  gap: PropTypes.bool,
};

export default storeUtils.getWithState(
  classes.HUB_PROJECT_WRAPPER,
  ProjectWrapper,
);
