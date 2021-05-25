import './CommitNavigation.less';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { buildUrl, classNames } from '../../../utils';
import Truncate from 'react-truncate';
import { Link } from 'react-router-dom';
import moment from 'moment';

import UI from '../../../ui';
import { HUB_PROJECT_EXPERIMENT } from '../../../constants/screens';

class CommitNavigation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      overflowHide: true,
    };

    this.navbarRef = React.createRef();
    this.headerWidth = 70;
    this.xMargin = 5;
    this.width = 230;

    /*
    this.height = 0;
    this.left = 0;
    this.topGap = 90;
    this.marginTop = 40;
    this.scrollable = false;
     */
  }

  componentDidMount() {
    this.init();
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  init = () => {
    this.width = this.navbarRef.current.offsetWidth;

    this.handleResize();
  };

  handleResize = () => {
    if (!this.props.contentWidth) {
      setTimeout(() => this.handleResize(), 20);
      return;
    }

    const left =
      (window.innerWidth - this.headerWidth - this.props.contentWidth) / 2 -
      this.width -
      this.xMargin;

    if (left >= this.xMargin) {
      this.setLeft(left);
      this.navbarRef.current.style.display = 'block';
    } else {
      this.navbarRef.current.style.display = 'none';
    }
  };

  /*
  // Disable sticking to the top

  init = () => {
    this.height = this.navbarRef.current.offsetHeight;
    this.width = this.navbarRef.current.offsetWidth;

    this.navbarRef.current.style.display = 'none';

    this.handleResize();
    this.handleScroll();
  };

  handleResize = () => {
    if (!this.props.contentWidth) {
      setTimeout(() => this.handleResize(), 50);
      return;
    }

    if (document.documentElement.offsetHeight > 1.7 * this.height) {
      this.scrollable = true;
    }

    this.left = (window.innerWidth - this.headerWidth - this.props.contentWidth)
      / 2 + this.headerWidth - this.width - this.xMargin;

    if (this.left >= this.xMargin) {
      this.setLeft(this.left);
      this.navbarRef.current.style.display = 'block';
    } else {
      this.navbarRef.current.style.display = 'none';
    }
  };

  handleScroll = () => {
    if (!this.scrollable) {
      return;
    }

    const scrollTop = window.pageYOffset;
    this.navbarRef.current.style.maxHeight = '100vh';
    this.navbarRef.current.style.marginTop = '0';

    if (scrollTop > this.topGap) {
      this.navbarRef.current.style.position = 'fixed';
      this.setScrollTop(scrollTop - (this.topGap));
      this.setTop(0);
    } else {
      this.navbarRef.current.style.position = 'absolute';
      this.setScrollTop(0);
      this.setTop(this.topGap + this.marginTop);
    }
  };

  setTop = (top) => {
    this.navbarRef.current.style.top = `${top}px`;
  };

  setScrollTop = (scrollTop) => {
    this.navbarRef.current.scrollTop = scrollTop;
  };
   */

  setLeft = (left) => {
    this.navbarRef.current.style.left = `${left}px`;
  };

  handleShowMoreClick = () => {
    this.setState(
      {
        overflowHide: false,
      },
      () => this.init(),
    );
  };

  commitsCompare = (a, b) => {
    if (a.date > b.date) {
      return -1;
    }
    if (a.date < b.date) {
      return 1;
    }
    return 0;
  };

  formatCommitMsg = (msg) => {
    if (Number.isInteger(msg) && `${msg}`.length === 10) {
      return moment.unix(msg).format('HH:mm · D MMM, YY');
    }
    return msg;
  };

  _renderCommit = (commit) => {
    return (
      <>
        <Link
          to={buildUrl(HUB_PROJECT_EXPERIMENT, {
            experiment_name: this.props.experimentName,
            commit_id: commit.hash,
          })}
        >
          <div className='CommitNavigation__item__short'>
            {!!commit.process && commit.process.finish === false && (
              <div className='CommitNavigation__item__indicator' />
            )}
            <Truncate lines={1}>
              <UI.Text small>{this.formatCommitMsg(commit.message)}</UI.Text>
            </Truncate>
          </div>
          <div className='CommitNavigation__item__full'>
            {!!commit.process && commit.process.finish === false && (
              <div className='CommitNavigation__item__indicator' />
            )}
            <Truncate lines={4}>
              <UI.Text small>{this.formatCommitMsg(commit.message)}</UI.Text>
            </Truncate>
          </div>
        </Link>
      </>
    );
  };

  _renderCommits = () => {
    const maxAmount = 12;

    let commits = this.props.commits;
    commits = commits.filter((c) => !c.archived);
    commits.sort(this.commitsCompare);

    return (
      <>
        {commits.slice(0, maxAmount).map((commit, key) => (
          <UI.MenuItem
            className='CommitNavigation__item'
            key={key}
            active={this.props.active === commit.hash}
          >
            {this._renderCommit(commit)}
          </UI.MenuItem>
        ))}
        {commits.slice(maxAmount, 50).map((commit, key) => (
          <UI.MenuItem
            className={classNames({
              CommitNavigation__item: true,
              hidden: this.state.overflowHide,
            })}
            key={key}
            active={this.props.active === commit.hash}
          >
            {this._renderCommit(commit)}
          </UI.MenuItem>
        ))}
        {commits.length > maxAmount && this.state.overflowHide && (
          <UI.Text center spacingTop>
            <UI.Button
              size='tiny'
              type='primary'
              ghost
              onClick={() => this.handleShowMoreClick()}
            >
              Show more
            </UI.Button>
          </UI.Text>
        )}
      </>
    );
  };

  _renderIndex = () => {
    return (
      <div
        key='current'
        className={classNames({
          CommitNavigation__current: true,
          active: this.props.active === 'index',
        })}
      >
        <Link
          to={buildUrl(HUB_PROJECT_EXPERIMENT, {
            experiment_name: this.props.experimentName,
            commit_id: 'index',
          })}
        >
          <UI.Text className='CommitNavigation__current__title' small>
            Index
          </UI.Text>
        </Link>
      </div>
    );
  };

  render() {
    const className = classNames({
      CommitNavigation: true,
    });

    return (
      <div className={className} ref={this.navbarRef}>
        {this.props.commits.filter((c) => !c.archived).length > 0 && (
          <UI.Menu
            className='CommitNavigation__nav'
            outline={false}
            header='Runs:'
          >
            {this._renderCommits()}
          </UI.Menu>
        )}
      </div>
    );
  }
}

CommitNavigation.defaultProps = {
  commits: [],
};

CommitNavigation.propTypes = {
  commits: PropTypes.array,
  contentWidth: PropTypes.number,
  active: PropTypes.string,
  experimentName: PropTypes.string,
};

export default CommitNavigation;
